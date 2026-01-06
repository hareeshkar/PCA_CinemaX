import prisma from "@/lib/prisma";
import HallCreateForm from "./create-form";
import HallList from "./hall-list";
import { Toaster } from "sonner";

export default async function HallsPage() {
  const halls = await prisma.hall.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { seats: true } },
    },
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

      <div className="space-y-10 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#222] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white font-mono">
              HALL <span className="text-red-600">ARCHITECT</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1">
              Auditorium & Seat Layouts
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white font-mono">
              {halls.length}
            </span>
            <p className="text-[8px] text-gray-500 uppercase font-bold">
              Total Screens
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Create Form */}
          <div className="lg:col-span-1">
            <HallCreateForm />
          </div>

          {/* RIGHT: List of Halls */}
          <div className="lg:col-span-2">
            <HallList halls={halls} />
          </div>
        </div>
      </div>
    </>
  );
}
