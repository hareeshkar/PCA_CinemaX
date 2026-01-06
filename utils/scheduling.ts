/**
 * Scheduling & Collision Detection Utilities
 * Enterprise-grade scheduling logic for cinema shows
 */

const CLEANING_BUFFER_MINUTES = 20;

/**
 * Calculate end time for a show based on movie duration + cleaning buffer
 */
export function calculateShowEndTime(
  startTime: Date,
  durationMinutes: number
): Date {
  const totalMinutes = durationMinutes + CLEANING_BUFFER_MINUTES;
  return new Date(startTime.getTime() + totalMinutes * 60000);
}

/**
 * Check if two time ranges overlap
 * Ranges: [startTime1, endTime1] and [startTime2, endTime2]
 * Returns true if there's any overlap
 */
export function doTimeRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  // Ranges overlap if: start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Format a date for display in scheduling UI
 */
export function formatShowTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format date and time for display
 */
export function formatShowDateTime(date: Date): string {
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = formatShowTime(date);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Get duration of a show (including cleaning buffer)
 */
export function getShowDuration(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
}

/**
 * Validate form inputs for creating a show
 */
export interface ShowFormValidation {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateShowForm(
  movieId: string,
  hallId: string,
  startTime: Date,
  basePrice: number,
  movieDuration: number,
  futureShowsOnly: boolean = true
): ShowFormValidation {
  const errors: Record<string, string> = {};

  if (!movieId || movieId.trim() === "") {
    errors.movieId = "Movie is required";
  }

  if (!hallId || hallId.trim() === "") {
    errors.hallId = "Hall is required";
  }

  if (!startTime) {
    errors.startTime = "Start time is required";
  } else if (futureShowsOnly && startTime <= new Date()) {
    errors.startTime = "Start time must be in the future";
  }

  if (!basePrice || basePrice <= 0) {
    errors.basePrice = "Price must be greater than 0";
  } else if (basePrice > 10000) {
    errors.basePrice = "Price seems unreasonably high (max 10000)";
  }

  if (!movieDuration || movieDuration <= 0) {
    errors.movieDuration = "Invalid movie duration";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format a conflict message for user display
 */
export function formatConflictMessage(
  conflictTitle: string,
  conflictEndTime: Date
): string {
  return `Conflict! "${conflictTitle}" is showing in this hall until ${formatShowTime(
    conflictEndTime
  )} (including ${CLEANING_BUFFER_MINUTES}min cleaning)`;
}

/**
 * Get a human-readable duration string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get available time slots for a hall on a given date
 * (To be used for future features like "suggest available slots")
 */
export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export function getAvailableSlots(
  date: Date,
  hallShows: Array<{ startTime: Date; endTime: Date }>,
  operatingHours: { open: number; close: number } = { open: 9, close: 23 }
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];

  const dayStart = new Date(date);
  dayStart.setHours(operatingHours.open, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(operatingHours.close, 0, 0, 0);

  // Sort shows by start time
  const sortedShows = [...hallShows].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  let currentTime = dayStart;

  for (const show of sortedShows) {
    if (show.startTime > currentTime) {
      slots.push({
        startTime: currentTime,
        endTime: show.startTime,
        durationMinutes: Math.floor(
          (show.startTime.getTime() - currentTime.getTime()) / 60000
        ),
      });
    }
    currentTime = show.endTime;
  }

  // Add final slot if there's time left
  if (currentTime < dayEnd) {
    slots.push({
      startTime: currentTime,
      endTime: dayEnd,
      durationMinutes: Math.floor(
        (dayEnd.getTime() - currentTime.getTime()) / 60000
      ),
    });
  }

  return slots;
}
