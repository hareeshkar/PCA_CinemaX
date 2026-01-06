"use client";

import { useState, useTransition } from "react";
import { searchMovies, importMovie } from "./actions";

export default function MovieSearchUI() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, startImport] = useTransition(); // React 19 Hook
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setNotice(null);
    const data = await searchMovies(query);
    setResults(data);
    setIsSearching(false);
  };

  const handleImport = (id: number) => {
    startImport(async () => {
      const res = await importMovie(id);
      if (res.success) {
        // Remove from search results after import
        setResults((prev) => prev.filter((m) => m.id !== id));
        setNotice({ type: "success", message: "Imported to local library." });
      } else {
        setNotice({ type: "error", message: res.error || "Import failed." });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH TMDB (e.g. OPPENHEIMER)..."
          className="flex-1 bg-[#0a0a0a] border border-[#333] p-4 text-xs tracking-widest text-white focus:outline-none focus:border-red-600 font-mono"
        />
        <button
          disabled={isSearching}
          className="bg-white text-black px-8 font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
        >
          {isSearching ? "..." : "Search"}
        </button>
      </form>

      {notice && (
        <div
          className={
            notice.type === "success"
              ? "text-[10px] uppercase tracking-widest text-green-500"
              : "text-[10px] uppercase tracking-widest text-red-500"
          }
        >
          {notice.message}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4">
          {results.map((movie) => (
            <div
              key={movie.id}
              className="bg-[#111] border border-[#222] p-2 space-y-3 group"
            >
              <div className="aspect-[2/3] overflow-hidden bg-black">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-700 text-center uppercase">
                    No Image
                  </div>
                )}
              </div>
              <div className="px-1">
                <h4 className="text-[10px] font-bold text-white uppercase truncate">
                  {movie.title}
                </h4>
                <p className="text-[8px] text-gray-500 mb-2">
                  {movie.release_date?.split("-")[0]}
                </p>
                <button
                  onClick={() => handleImport(movie.id)}
                  disabled={isImporting}
                  className="w-full bg-red-600/10 border border-red-600/30 text-red-500 text-[8px] font-bold py-2 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                >
                  {isImporting ? "Syncing..." : "Import"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
