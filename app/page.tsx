import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export const revalidate = 0; // Always fresh data

export default async function HomePage() {
  // 1. Fetch Data (Relaxed Query - No strict showtime requirement)
  const [nowShowing, comingSoon] = await Promise.all([
    prisma.movie.findMany({
      where: { status: "Now Showing" },
      orderBy: { createdAt: "desc" },
      include: {
        shows: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
          take: 3,
          include: { hall: true }
        }
      }
    }),
    prisma.movie.findMany({
      where: { status: "Coming Soon" },
      orderBy: { releaseDate: "asc" },
      take: 4
    })
  ]);

  const heroMovie = nowShowing[0] || comingSoon[0];

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden font-sans">

      {/* 1. IMMERSIVE HERO STAGE (Ported from PHP) */}
      <header className="relative h-screen w-full overflow-hidden flex items-end pb-20">

        {/* Dynamic Background */}
        {heroMovie ? (
          <div className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center animate-slow-breath z-0 opacity-60"
               style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie.backdropPath})` }} />
        ) : (
          <div className="absolute inset-0 bg-[#111]" />
        )}

        {/* Cinematic Vignette & Grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] z-10 pointer-events-none" />

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-20">
          {heroMovie ? (
            <div className="max-w-4xl space-y-6 animate-fade-up">
              <div className="flex items-center gap-4 text-[#e50914] text-xs font-bold uppercase tracking-[0.3em] font-mono">
                <span className="w-10 h-[2px] bg-[#e50914]"></span>
                <span>Premiering Now</span>
              </div>

              {/* Title Stack */}
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] font-oswald text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                {heroMovie.title}
              </h1>

              <div className="flex flex-wrap gap-3 text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                <span>{heroMovie.durationMin} MIN</span>
                <span className="text-[#e50914]">•</span>
                <span>{heroMovie.genres[0]}</span>
                <span className="text-[#e50914]">•</span>
                <span className="text-yellow-500">★ {heroMovie.rating?.toFixed(1)}</span>
              </div>

              <p className="text-gray-300 max-w-xl text-base md:text-lg leading-relaxed line-clamp-3 font-light">
                {heroMovie.overview}
              </p>

              <div className="pt-6 flex gap-4">
                <Link
                  href={`/movie/${heroMovie.id}`}
                  className="bg-[#e50914] text-white px-10 py-4 font-bold font-oswald uppercase tracking-widest hover:bg-white hover:text-black transition-all transform hover:-translate-y-1 shadow-[0_10px_30px_rgba(229,9,20,0.4)]"
                >
                  Get Tickets
                </Link>
                <button className="border border-white/20 text-white px-8 py-4 font-bold font-oswald uppercase tracking-widest hover:bg-white/10 transition-all">
                  Watch Trailer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center w-full">
              <h1 className="text-6xl font-black uppercase tracking-tighter text-gray-800 font-oswald">No Signals</h1>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 right-10 hidden md:block z-20">
          <div className="flex flex-col items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] font-oswald" style={{ writingMode: 'vertical-rl' }}>
            Scroll to Explore
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>
          </div>
        </div>
      </header>

      {/* 2. KINETIC TICKER (The Red Band) */}
      <div className="bg-[#e50914] text-white py-4 overflow-hidden border-y-2 border-white relative z-30 -rotate-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02]">
        <div className="flex gap-16 animate-marquee whitespace-nowrap font-oswald font-bold text-2xl uppercase tracking-widest">
          <span>• 4K Laser Projection</span>
          <span>• Dolby Atmos Surround</span>
          <span>• Luxury Recliners</span>
          <span>• Immersive Audio</span>
          <span>• 4K Laser Projection</span>
          <span>• Dolby Atmos Surround</span>
          <span>• Luxury Recliners</span>
          <span>• Immersive Audio</span>
          <span>• 4K Laser Projection</span>
          <span>• Dolby Atmos Surround</span>
        </div>
      </div>

      {/* 3. NOW SHOWING (Grid System) */}
      <section className="py-32 bg-[#020202] relative z-20">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h4 className="text-[#e50914] font-bold uppercase tracking-[0.2em] mb-2 font-mono text-sm">On The Big Screen</h4>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white font-oswald">In Theaters</h2>
            </div>
            <div className="hidden md:block text-right">
              <span className="text-4xl font-bold font-oswald text-[#333]">{nowShowing.length.toString().padStart(2, '0')}</span>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Titles Active</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {nowShowing.map((movie) => (
              <div key={movie.id} className="group cursor-pointer">
                {/* Poster Container */}
                <div className="relative aspect-[2/3] bg-[#111] mb-6 overflow-hidden border border-white/5 group-hover:border-[#e50914]/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />

                  {/* Image */}
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                    alt={movie.title}
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Link
                      href={`/movie/${movie.id}`}
                      className="w-full bg-white text-black py-4 text-center font-bold font-oswald uppercase tracking-widest hover:bg-[#e50914] hover:text-white transition-colors"
                    >
                      Book Seats
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-xl font-bold font-oswald uppercase text-white truncate group-hover:text-[#e50914] transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                    <span>{movie.durationMin} MIN</span>
                    <span>/</span>
                    <span>{movie.genres[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {nowShowing.length === 0 && (
             <div className="border border-dashed border-[#333] p-20 text-center">
                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Database Syncing...</p>
             </div>
          )}
        </div>
      </section>

      {/* 4. COMING SOON (Secondary List) */}
      {comingSoon.length > 0 && (
        <section className="py-20 border-t border-white/5">
           <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold font-oswald uppercase tracking-widest mb-10 text-gray-400">Coming Soon</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {comingSoon.map(movie => (
                    <div key={movie.id} className="opacity-50 hover:opacity-100 transition-opacity">
                       <h3 className="text-sm font-bold uppercase tracking-wider mb-2">{movie.title}</h3>
                       <p className="text-[10px] text-[#e50914] font-mono">
                          {movie.releaseDate ? format(new Date(movie.releaseDate), "MMMM yyyy") : "TBA"}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}

    </div>
  );
}
