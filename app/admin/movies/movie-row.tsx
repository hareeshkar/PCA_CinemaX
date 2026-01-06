"use client";

import { useOptimistic, startTransition, useState } from "react";
import { toggleMovieStatus, deleteMovie } from "./actions";
import { toast } from "sonner";

type Movie = {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: Date | null;
  status: string;
  durationMin: number;
};

export default function MovieRow({ movie }: { movie: Movie }) {
  // 1. Optimistic UI State
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    movie.status ?? "UNKNOWN",
    (state, newStatus: string) => newStatus
  );

  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    // Capture previous state so we can revert if needed
    const prevStatus = optimisticStatus;
    const nextStatus =
      prevStatus === "Now Showing" ? "Coming Soon" : "Now Showing";

    // Optimistically update UI
    startTransition(() => {
      setOptimisticStatus(nextStatus);
      setError(null);
    });

    // Call Server (passes only ID, server determines next status)
    const result = await toggleMovieStatus(movie.id);

    if (!result.success) {
      // Revert optimistic UI and show error within a transition
      startTransition(() => {
        setOptimisticStatus(prevStatus);
        setError("Failed to update status");
      });
      console.error("Toggle failed:", result.error);
    }
  };

  const handleDelete = async () => {
    toast.promise(deleteMovie(movie.id), {
      loading: "Deleting movie...",
      success: "Movie deleted successfully",
      error: (err) => err?.error || "Failed to delete movie",
    });
  };

  const isLive = optimisticStatus === "Now Showing";

  return (
    <tr className="border-b border-[#222] hover:bg-white/5 transition-colors group">
      {/* Poster */}
      <td className="p-4 w-[80px]">
        <div className="w-[50px] h-[75px] bg-[#111] overflow-hidden border border-[#333] rounded-sm relative shadow-sm">
          {movie.posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">
              NO IMG
            </div>
          )}
        </div>
      </td>

      {/* Details */}
      <td className="p-4">
        <div className="font-bold text-white uppercase font-mono tracking-wide text-sm">
          {movie.title}
        </div>
        <div className="text-[10px] text-gray-500 uppercase mt-1 tracking-wider">
          {movie.durationMin} MIN •{" "}
          {movie.releaseDate
            ? new Date(movie.releaseDate).getFullYear()
            : "N/A"}
        </div>
      </td>

      {/* Status Badge (ORANGE for Coming Soon, GREEN for Now Showing) */}
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <span
            className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border w-fit
            ${
              isLive
                ? "bg-green-900/20 text-green-500 border-green-500/30"
                : "bg-orange-900/20 text-orange-500 border-orange-500/30"
            }
          `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLive ? "bg-green-500 animate-pulse" : "bg-orange-500"
              }`}
            />
            {optimisticStatus || "UNKNOWN"}
          </span>
          {error && (
            <span className="text-[8px] text-red-500 uppercase font-bold tracking-wider">
              {error}
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={handleToggle}
            className="px-4 py-2 bg-[#111] border border-[#333] hover:border-white text-[10px] font-bold uppercase text-white transition-all flex items-center gap-2 tracking-wider"
          >
            {isLive ? "⏸ Pause" : "▶ Publish"}
          </button>

          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-900/10 border border-red-900/30 hover:bg-red-900/30 text-red-500 transition-all rounded-sm"
            title="Delete"
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}
