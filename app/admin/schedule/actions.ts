"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  calculateShowEndTime,
  doTimeRangesOverlap,
  formatConflictMessage,
} from "@/utils/scheduling";

/**
 * Response type for server actions
 */
interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Create a new show with collision detection
 * Enterprise-grade scheduling with conflict prevention
 */
export async function createShow(formData: FormData): Promise<ActionResponse> {
  try {
    const movieId = formData.get("movieId") as string;
    const hallId = formData.get("hallId") as string;
    const startTimeRaw = formData.get("startTime") as string;
    const basePrice = formData.get("basePrice") as string;

    // === VALIDATION ===
    if (!movieId?.trim()) {
      return { success: false, error: "Movie selection is required" };
    }
    if (!hallId?.trim()) {
      return { success: false, error: "Hall selection is required" };
    }
    if (!startTimeRaw?.trim()) {
      return { success: false, error: "Start time is required" };
    }
    if (!basePrice?.trim()) {
      return { success: false, error: "Base price is required" };
    }

    const startTime = new Date(startTimeRaw);
    const price = parseFloat(basePrice);

    // Validate start time is in the future
    if (startTime <= new Date()) {
      return { success: false, error: "Show start time must be in the future" };
    }

    // Validate price
    if (isNaN(price) || price <= 0) {
      return { success: false, error: "Base price must be a positive number" };
    }
    if (price > 10000) {
      return {
        success: false,
        error: "Base price exceeds maximum limit (LKR 10,000)",
      };
    }

    // === FETCH REQUIRED DATA ===
    const [movie, hall] = await Promise.all([
      prisma.movie.findUnique({
        where: { id: movieId },
        select: { id: true, title: true, durationMin: true, status: true },
      }),
      prisma.hall.findUnique({
        where: { id: hallId },
        select: { id: true, name: true },
      }),
    ]);

    if (!movie) {
      return { success: false, error: "Selected movie not found" };
    }
    if (!hall) {
      return { success: false, error: "Selected hall not found" };
    }

    // Only schedule movies that are "Now Showing"
    if (movie.status !== "Now Showing") {
      return {
        success: false,
        error: `Cannot schedule "${movie.title}" - status is ${movie.status}`,
      };
    }

    // === CALCULATE END TIME ===
    const endTime = calculateShowEndTime(startTime, movie.durationMin);

    // === COLLISION DETECTION ===
    // Find any overlapping shows in the same hall
    const conflictingShow = await prisma.show.findFirst({
      where: {
        hallId: hallId,
        AND: [
          { startTime: { lt: endTime } }, // New show starts before existing ends
          { endTime: { gt: startTime } }, // New show ends after existing starts
        ],
      },
      include: {
        movie: {
          select: { title: true },
        },
      },
    });

    if (conflictingShow) {
      const conflictMessage = formatConflictMessage(
        conflictingShow.movie.title,
        conflictingShow.endTime
      );
      return { success: false, error: conflictMessage };
    }

    // === CREATE SHOW ===
    const newShow = await prisma.show.create({
      data: {
        movieId,
        hallId,
        startTime,
        endTime,
        basePrice: price,
      },
      include: {
        movie: { select: { id: true, title: true, durationMin: true } },
        hall: { select: { id: true, name: true, type: true } },
      },
    });

    revalidatePath("/admin/schedule");

    return {
      success: true,
      message: `Show "${
        newShow.movie.title
      }" scheduled successfully at ${newShow.startTime.toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: false }
      )}`,
      data: {
        id: newShow.id,
        movieId: newShow.movieId,
        hallId: newShow.hallId,
        startTime: newShow.startTime,
        endTime: newShow.endTime,
        basePrice: Number(newShow.basePrice),
        movie: {
          id: newShow.movie.id,
          title: newShow.movie.title,
          durationMin: Number(newShow.movie.durationMin),
        },
        hall: {
          id: newShow.hall.id,
          name: newShow.hall.name,
          type: newShow.hall.type,
        },
      },
    };
  } catch (error: any) {
    console.error("[createShow] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to create show",
    };
  }
}

/**
 * Delete a show
 */
export async function deleteShow(showId: string): Promise<ActionResponse> {
  try {
    if (!showId?.trim()) {
      return { success: false, error: "Show ID is required" };
    }

    // Check if show exists and has no active bookings
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        bookings: {
          where: { status: { in: ["CONFIRMED", "PENDING"] } },
          select: { id: true },
        },
        movie: { select: { title: true } },
      },
    });

    if (!show) {
      return { success: false, error: "Show not found" };
    }

    if (show.bookings.length > 0) {
      return {
        success: false,
        error: `Cannot delete show - it has ${show.bookings.length} active booking(s)`,
      };
    }

    await prisma.show.delete({ where: { id: showId } });

    revalidatePath("/admin/schedule");

    return {
      success: true,
      message: `Show "${show.movie.title}" deleted successfully`,
    };
  } catch (error: any) {
    console.error("[deleteShow] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete show",
    };
  }
}

/**
 * Update show details (price, start time, etc.)
 * This also validates for conflicts after update
 */
export async function updateShow(
  showId: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    if (!showId?.trim()) {
      return { success: false, error: "Show ID is required" };
    }

    const startTimeRaw = formData.get("startTime") as string;
    const basePrice = formData.get("basePrice") as string;

    // Validate inputs
    if (!startTimeRaw?.trim() || !basePrice?.trim()) {
      return { success: false, error: "All fields are required" };
    }

    const startTime = new Date(startTimeRaw);
    const price = parseFloat(basePrice);

    if (startTime <= new Date()) {
      return { success: false, error: "Show start time must be in the future" };
    }

    if (isNaN(price) || price <= 0) {
      return { success: false, error: "Price must be positive" };
    }

    // Fetch current show
    const currentShow = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: { select: { id: true, durationMin: true, title: true } },
        hall: { select: { id: true, name: true, type: true } },
      },
    });

    if (!currentShow) {
      return { success: false, error: "Show not found" };
    }

    // Calculate new end time
    const newEndTime = calculateShowEndTime(
      startTime,
      currentShow.movie.durationMin
    );

    // Check for conflicts (excluding current show)
    const conflict = await prisma.show.findFirst({
      where: {
        hallId: currentShow.hallId,
        id: { not: showId },
        AND: [
          { startTime: { lt: newEndTime } },
          { endTime: { gt: startTime } },
        ],
      },
      include: {
        movie: { select: { title: true } },
      },
    });

    if (conflict) {
      return {
        success: false,
        error: `Conflict! "${conflict.movie.title}" occupies this hall at that time`,
      };
    }

    // Update show
    const updated = await prisma.show.update({
      where: { id: showId },
      data: {
        startTime,
        endTime: newEndTime,
        basePrice: price,
      },
      include: {
        movie: { select: { id: true, title: true, durationMin: true } },
        hall: { select: { id: true, name: true, type: true } },
      },
    });

    revalidatePath("/admin/schedule");

    return {
      success: true,
      message: `Show "${updated.movie.title}" updated successfully`,
      data: {
        id: updated.id,
        movieId: updated.movieId,
        hallId: updated.hallId,
        startTime: updated.startTime,
        endTime: updated.endTime,
        basePrice: Number(updated.basePrice),
        movie: {
          id: updated.movie.id,
          title: updated.movie.title,
          durationMin: Number(updated.movie.durationMin),
        },
        hall: {
          id: updated.hall.id,
          name: updated.hall.name,
          type: updated.hall.type,
        },
      },
    };
  } catch (error: any) {
    console.error("[updateShow] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to update show",
    };
  }
}

/**
 * Fetch all upcoming shows with filtering
 */
export async function getShows(options?: {
  hallId?: string;
  movieId?: string;
  upcomingOnly?: boolean;
}) {
  try {
    const where: any = {};

    if (options?.hallId) where.hallId = options.hallId;
    if (options?.movieId) where.movieId = options.movieId;
    if (options?.upcomingOnly !== false) {
      where.startTime = { gte: new Date() };
    }

    const shows = await prisma.show.findMany({
      where,
      include: {
        movie: true,
        hall: true,
        bookings: { select: { id: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return { success: true, data: shows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
