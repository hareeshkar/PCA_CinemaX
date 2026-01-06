import { Metadata } from "next";
import prisma from "@/lib/prisma";
import CreateShowForm from "./create-form";
import ShowList from "./show-list";
import { Clapperboard } from "lucide-react";

export const metadata: Metadata = {
  title: "Show Scheduler | PCA Cinemax",
  description: "Schedule movie screenings with collision detection",
};

export default async function SchedulePage() {
  try {
    // Fetch all required data in parallel
    const [movies, halls, shows] = await Promise.all([
      prisma.movie.findMany({
        where: { status: "Now Showing" },
        select: { id: true, title: true, durationMin: true },
        orderBy: { title: "asc" },
      }),
      prisma.hall.findMany({
        select: { id: true, name: true, type: true },
        orderBy: { name: "asc" },
      }),
      prisma.show.findMany({
        where: { startTime: { gte: new Date() } },
        include: {
          movie: { select: { title: true, durationMin: true } },
          hall: { select: { id: true, name: true, type: true } },
          bookings: { select: { id: true } },
        },
        orderBy: { startTime: "asc" },
      }),
    ]);

    // Convert to plain objects for client components
    const showsData = shows.map((show) => ({
      ...show,
      startTime:
        show.startTime instanceof Date
          ? show.startTime
          : new Date(show.startTime),
      endTime:
        show.endTime instanceof Date ? show.endTime : new Date(show.endTime),
      basePrice: Number(show.basePrice), // Convert Decimal to number
      movie: {
        ...show.movie,
        durationMin: Number(show.movie.durationMin),
      },
      hall: show.hall,
      bookings: show.bookings,
    }));

    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Clapperboard className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold tracking-tighter text-white font-mono">
              SHOWTIME <span className="text-red-600">SCHEDULER</span>
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Enterprise-grade collision detection prevents double-booking
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-600/10 to-blue-700/5 border border-blue-500/20 rounded-lg p-4">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Available Movies
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {movies.length}
            </div>
            <p className="text-xs text-blue-400/60 mt-1">Now Showing</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/10 to-green-700/5 border border-green-500/20 rounded-lg p-4">
            <div className="text-xs font-bold text-green-400 uppercase tracking-wider">
              Active Halls
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {halls.length}
            </div>
            <p className="text-xs text-green-400/60 mt-1">Screening Spaces</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/10 to-purple-700/5 border border-purple-500/20 rounded-lg p-4">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Scheduled Shows
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {shows.length}
            </div>
            <p className="text-xs text-purple-400/60 mt-1">Upcoming</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-1">
            <CreateShowForm movies={movies} halls={halls} />
          </div>

          {/* Right: Show List */}
          <div className="lg:col-span-2">
            <ShowList shows={showsData} />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-amber-600/10 to-red-600/10 border border-amber-500/20 rounded-lg p-6">
          <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
            ⚡ How Collision Detection Works
          </h3>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex gap-2">
              <span className="text-red-600 font-bold">1.</span>
              <span>
                Select a movie and the system calculates its end time (duration
                + 20min cleaning)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-600 font-bold">2.</span>
              <span>
                Before saving, the system checks if another show overlaps in the
                same hall
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-600 font-bold">3.</span>
              <span>
                If a conflict is detected, you'll see an error with the
                conflicting show's details
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-600 font-bold">4.</span>
              <span>
                Only collision-free shows are created, ensuring zero scheduling
                errors
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[SchedulePage] Error:", error);
    return (
      <div className="text-center space-y-4 py-20">
        <h1 className="text-2xl font-bold text-red-600">
          Error Loading Schedule
        </h1>
        <p className="text-gray-500">Please try refreshing the page</p>
      </div>
    );
  }
}
