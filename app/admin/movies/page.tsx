import prisma from "@/lib/prisma";
import MovieSearchUI from "./search-ui";
import MovieRow from "./movie-row";
import { Toaster } from "sonner";

export default async function MoviesPage() {
  const localMovies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "#0a0a0a",
            border: "1px solid #1f1f1f",
            color: "#fff",
          },
        }}
      />

      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#222] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white font-mono">
              MOVIE <span className="text-red-600">MANAGER</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1">
              Import & Schedule
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white font-mono">
              {localMovies.length}
            </span>
            <p className="text-[8px] text-gray-500 uppercase font-bold">
              Total Titles
            </p>
          </div>
        </div>

        {/* SEARCH SECTION */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Database Import
          </h2>
          <MovieSearchUI />
        </div>

        {/* LIBRARY TABLE (Row Style) */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] text-[10px] uppercase tracking-widest text-gray-500">
                <th className="p-4 font-bold">Poster</th>
                <th className="p-4 font-bold">Film Details</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Controls</th>
              </tr>
            </thead>
            <tbody>
              {localMovies.map((movie) => (
                <MovieRow key={movie.id} movie={movie} />
              ))}

              {localMovies.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-600 text-xs uppercase tracking-widest border-b border-[#222]"
                  >
                    Library is empty. Import movies above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
