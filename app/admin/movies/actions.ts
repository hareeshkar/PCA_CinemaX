"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function searchMovies(query: string) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&include_adult=false`
    );
    const data = await res.json();
    return data.results?.slice(0, 10) || [];
  } catch (e) {
    return [];
  }
}

export async function importMovie(tmdbId: number) {
  try {
    console.log("🎬 [IMPORT] Starting import for TMDB ID:", tmdbId);

    // Fetch full details (Runtime is only in the Detail API, not Search API)
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    const movie = await res.json();
    console.log(
      "🎬 [TMDB API] Fetched movie data:",
      JSON.stringify(movie, null, 2)
    );

    if (!movie.title) {
      console.error("❌ [VALIDATION] Movie title missing from TMDB response");
      throw new Error("Invalid movie data from TMDB - no title");
    }

    console.log("🎬 [PRISMA] Attempting upsert with data:", {
      tmdbId: movie.id,
      title: movie.title,
      durationMin: movie.runtime || 120,
      releaseDate: movie.release_date,
      genres: movie.genres?.map((g: any) => g.name) || [],
    });

    // Robust Upsert: Prisma requires a non-empty `update` object.
    // We intentionally do NOT overwrite `status` (admin-controlled).
    // Note: status field has a default value, so we don't need to set it explicitly.
    const result = await prisma.movie.upsert({
      where: { tmdbId: movie.id },
      update: {
        title: movie.title,
        overview: movie.overview || null,
        posterPath: movie.poster_path || null,
        backdropPath: movie.backdrop_path || null,
        durationMin: movie.runtime || 120,
        releaseDate: movie.release_date ? new Date(movie.release_date) : null,
        genres: movie.genres?.map((g: any) => g.name) || [],
        rating:
          typeof movie.vote_average === "number" ? movie.vote_average : null,
      },
      create: {
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview || null,
        posterPath: movie.poster_path || null,
        backdropPath: movie.backdrop_path || null,
        durationMin: movie.runtime || 120,
        releaseDate: movie.release_date ? new Date(movie.release_date) : null,
        genres: movie.genres?.map((g: any) => g.name) || [],
        rating:
          typeof movie.vote_average === "number" ? movie.vote_average : null,
        // status defaults to "Coming Soon" automatically
      },
    });

    console.log("✅ [SUCCESS] Movie imported successfully:", result.id);
    revalidatePath("/admin/movies");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("❌ [FATAL ERROR]", {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return {
      success: false,
      error: `Import failed: ${error.message}`,
    };
  }
}

export async function toggleMovieStatus(id: string) {
  try {
    console.log("🎬 [TOGGLE] Fetching current status for movie ID:", id);

    // 1. Fetch current status from DB (Single Source of Truth)
    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!movie) {
      console.error("❌ [TOGGLE] Movie not found:", id);
      throw new Error("Movie not found");
    }

    // 2. Determine next status
    const newStatus =
      movie.status === "Now Showing" ? "Coming Soon" : "Now Showing";
    console.log("🎬 [TOGGLE] Current:", movie.status, "→ New:", newStatus);

    // 3. Update
    await prisma.movie.update({
      where: { id },
      data: { status: newStatus },
    });

    console.log("✅ [TOGGLE] Status updated successfully");

    // 4. Refresh Cache
    revalidatePath("/admin/movies");
    revalidatePath("/admin/dashboard");

    return { success: true, newStatus };
  } catch (e: any) {
    console.error("❌ [TOGGLE ERROR]:", e);
    return { success: false, error: e?.message || String(e) };
  }
}

export async function deleteMovie(id: string) {
  try {
    console.log("🎬 [DELETE] Deleting movie ID:", id);

    await prisma.movie.delete({ where: { id } });

    console.log("✅ [SUCCESS] Movie deleted successfully");
    revalidatePath("/admin/movies");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("❌ [DELETE ERROR]", error.message);
    return { success: false, error: "Failed to delete movie" };
  }
}
