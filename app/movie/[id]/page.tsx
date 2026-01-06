import prisma from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Clock, Info } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MovieDetailsPage({ params }: Props) {
  const { id } = await params;
  
  // Enterprise Query: Deep nested fetch for movie + shows + hall info
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      shows: {
        where: { startTime: { gte: new Date() } }, // Only future shows
        orderBy: { startTime: "asc" },
        include: { hall: true }
      }
    }
  });

  if (!movie) notFound();

  // Logic: Group shows by Date (e.g., "Mon, Oct 24")
  const showsByDate = movie.shows.reduce((acc, show) => {
    const dateKey = format(new Date(show.startTime), "EEEE, MMMM d");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(show);
    return acc;
  }, {} as Record<string, typeof movie.shows>);

  const sortedDates = Object.keys(showsByDate);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      
      {/* 1. BACKDROP HEADER */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
        <img 
          src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
          alt={movie.title}
          className="w-full h-full object-cover opacity-50"
        />
        
        {/* Title Block */}
        <div className="absolute bottom-0 left-0 z-20 w-full container mx-auto px-6 pb-12 flex flex-col md:flex-row items-end gap-10">
          {/* Floating Poster */}
          <div className="w-64 aspect-[2/3] bg-[#111] rounded-lg overflow-hidden shadow-2xl border-4 border-white/5 hidden md:block transform translate-y-20">
            <img 
              src={`https://image.tmdb.org/t/p/w780${movie.posterPath}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {movie.genres.map(g => (
                <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider rounded-sm border border-white/10">
                  {g}
                </span>
              ))}
              <span className="px-3 py-1 bg-red-600/20 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-red-600/20">
                {movie.durationMin} Min
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter font-mono text-white">
              {movie.title}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="container mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Column: Synopsis & Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Synopsis
            </h3>
            <p className="text-xl leading-relaxed text-gray-300 font-light">
              {movie.overview}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-white/5 py-8">
             <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Release Date</span>
                <span className="text-lg font-mono">{movie.releaseDate ? format(movie.releaseDate, "yyyy") : "N/A"}</span>
             </div>
             <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Duration</span>
                <span className="text-lg font-mono">{movie.durationMin} Min</span>
             </div>
             <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">TMDB Rating</span>
                <span className="text-lg font-mono text-amber-500">★ {movie.rating?.toFixed(1)}</span>
             </div>
             <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Status</span>
                <span className="text-lg font-mono">{movie.status}</span>
             </div>
          </div>
        </div>

        {/* Right Column: SHOWTIME SELECTOR */}
        <div className="lg:col-span-1">
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden sticky top-8">
            <div className="p-6 border-b border-[#222] bg-[#151515]">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                Select Showtime
              </h3>
            </div>
            
            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {sortedDates.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs uppercase tracking-widest">
                  No upcoming shows scheduled.
                </div>
              ) : (
                sortedDates.map((date) => (
                  <div key={date} className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 sticky top-0 bg-[#111] py-2 z-10">
                      {date}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {showsByDate[date].map((show) => (
                        <Link 
                          key={show.id}
                          href={`/book/${show.id}`} // Links to Booking Engine
                          className="group relative flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-red-600 hover:bg-[#222] transition-all rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-[#050505] p-2 rounded text-center min-w-[60px] border border-[#333] group-hover:border-red-600/50 transition-colors">
                               <span className="block text-lg font-bold font-mono text-white">
                                 {format(new Date(show.startTime), "HH:mm")}
                               </span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-300 uppercase tracking-wider group-hover:text-white">
                                  {show.hall.type} Experience
                                </span>
                                <span className="block text-[10px] text-gray-600 uppercase mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {show.hall.name}
                                </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                             <span className="block text-sm font-bold text-red-500 group-hover:text-red-400 transition-colors">
                               LKR {Number(show.basePrice)}
                             </span>
                             <span className="text-[9px] text-gray-600 uppercase tracking-widest">Per Ticket</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
