"use client";

import { useState } from "react";
import { deleteShow } from "./actions";
import { toast } from "sonner";
import {
  formatShowDateTime,
  formatShowTime,
  formatDuration,
  getShowDuration,
} from "@/utils/scheduling";
import {
  Trash2,
  Copy,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
} from "lucide-react";

interface ShowData {
  id: string;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  movie: {
    title: string;
    durationMin: number;
  };
  hall: {
    id: string;
    name: string;
    type: string;
  };
  bookings: { id: string }[];
}

export default function ShowList({ shows }: { shows: ShowData[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleDelete = async (showId: string) => {
    if (!confirm("Are you sure you want to delete this show?")) return;

    setIsDeleting(showId);
    const result = await deleteShow(showId);

    if (result.success) {
      toast.success("Show Deleted", {
        description: result.message,
        duration: 3000,
      });
    } else {
      toast.error("Failed to Delete", {
        description: result.error,
        duration: 4000,
      });
    }
    setIsDeleting(null);
  };

  const handleCopyShowId = (showId: string) => {
    navigator.clipboard.writeText(showId);
    toast.success("Copied", {
      description: "Show ID copied to clipboard",
      duration: 2000,
    });
  };

  if (shows.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-[#222] rounded-xl p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
        <h3 className="text-sm font-semibold text-gray-400 mb-2">
          No Upcoming Shows
        </h3>
        <p className="text-xs text-gray-600">
          Schedule your first screening using the form on the left
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Upcoming Screenings ({shows.length})
        </h2>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {shows.map((show) => {
          const hasBookings = show.bookings.length > 0;
          const duration = getShowDuration(show.startTime, show.endTime);
          const isSelected = showDetails === show.id;

          return (
            <div
              key={show.id}
              className={`bg-gradient-to-r from-[#111] to-[#0a0a0a] border rounded-lg p-4 transition-all duration-300 group ${
                isSelected
                  ? "border-red-600 shadow-lg shadow-red-600/20"
                  : "border-[#222] hover:border-red-600/50"
              }`}
            >
              {/* Main Content */}
              <div
                className="cursor-pointer"
                onClick={() => setShowDetails(isSelected ? null : show.id)}
              >
                <div className="flex gap-4 items-start">
                  {/* Date/Time Badge */}
                  <div className="bg-[#222] p-3 rounded-lg text-center min-w-[70px] flex-shrink-0 group-hover:bg-red-600/20 transition-colors">
                    <div className="text-[10px] text-gray-500 uppercase font-semibold">
                      {show.startTime.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {show.startTime.getDate()}
                    </div>
                    <div className="text-xs text-red-600 font-mono mt-1">
                      {formatShowTime(show.startTime)}
                    </div>
                  </div>

                  {/* Show Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate group-hover:text-red-600 transition-colors">
                      {show.movie.title}
                    </h3>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {show.hall.name} ({show.hall.type})
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        {formatDuration(duration)}
                      </span>
                      {hasBookings && (
                        <span className="flex items-center gap-1 text-blue-500">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          {show.bookings.length} booking
                          {show.bookings.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-2 text-sm font-semibold text-white">
                      LKR {Number(show.basePrice).toLocaleString("en-LK")}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleCopyShowId(show.id)}
                      className="p-2 rounded hover:bg-[#222] text-gray-500 hover:text-gray-300 transition-colors"
                      title="Copy Show ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(show.id)}
                      disabled={isDeleting === show.id || hasBookings}
                      className={`p-2 rounded transition-all ${
                        isDeleting === show.id
                          ? "bg-red-600/30 text-red-400 cursor-not-allowed opacity-50"
                          : hasBookings
                          ? "text-gray-600 cursor-not-allowed opacity-40"
                          : "text-gray-500 hover:bg-red-600/20 hover:text-red-500"
                      }`}
                      title={
                        hasBookings
                          ? "Cannot delete - has active bookings"
                          : "Delete show"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-[#222] space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Start Time</span>
                      <div className="text-white font-mono">
                        {show.startTime.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">End Time</span>
                      <div className="text-white font-mono">
                        {show.endTime.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Movie Duration</span>
                      <div className="text-white">
                        {formatDuration(show.movie.durationMin)} + 20m cleaning
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Hall</span>
                      <div className="text-white font-mono">{show.hall.id}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Show ID</span>
                      <div className="text-white font-mono text-[10px] break-all">
                        {show.id}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Bookings</span>
                      <div className="text-white">
                        {hasBookings ? (
                          <span className="text-blue-500">
                            {show.bookings.length} active
                          </span>
                        ) : (
                          <span className="text-gray-600">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {hasBookings && (
                    <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg flex gap-2 text-xs text-blue-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        This show has active bookings and cannot be deleted
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#222]">
        <div className="bg-[#111] rounded-lg p-3 text-center border border-[#222]">
          <div className="text-xs text-gray-600">Total Shows</div>
          <div className="text-lg font-bold text-white mt-1">
            {shows.length}
          </div>
        </div>
        <div className="bg-[#111] rounded-lg p-3 text-center border border-[#222]">
          <div className="text-xs text-gray-600">With Bookings</div>
          <div className="text-lg font-bold text-blue-500 mt-1">
            {shows.filter((s) => s.bookings.length > 0).length}
          </div>
        </div>
        <div className="bg-[#111] rounded-lg p-3 text-center border border-[#222]">
          <div className="text-xs text-gray-600">Total Bookings</div>
          <div className="text-lg font-bold text-green-500 mt-1">
            {shows.reduce((sum, s) => sum + s.bookings.length, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
