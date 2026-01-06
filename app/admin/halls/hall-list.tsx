"use client";

import Link from "next/link";
import { deleteHall } from "./actions";
import { toast } from "sonner";

type Hall = {
  id: string;
  name: string;
  type: string;
  totalRows: number;
  totalCols: number;
  _count: { seats: number };
};

export default function HallList({ halls }: { halls: Hall[] }) {
  const handleDelete = async (id: string) => {
    toast.promise(deleteHall(id), {
      loading: "Deleting hall...",
      success: "Hall deleted successfully",
      error: (err) =>
        err?.error || "Failed to delete hall. It may have active shows.",
    });
  };

  if (halls.length === 0) {
    return (
      <div className="h-64 border-2 border-dashed border-[#222] flex items-center justify-center text-gray-600 uppercase text-xs tracking-widest">
        No structures defined
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {halls.map((hall) => (
        <div
          key={hall.id}
          className="bg-[#111] border border-[#222] p-5 flex justify-between items-center group hover:border-white/20 transition-all"
        >
          <div>
            <h3 className="text-white font-bold uppercase tracking-wide font-mono text-lg flex items-center gap-3">
              {hall.name}
              <span className="text-[10px] bg-[#222] text-gray-400 px-2 py-1 rounded-sm border border-[#333]">
                {hall.type}
              </span>
            </h3>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">
              {hall.totalRows} Rows × {hall.totalCols} Cols •{" "}
              {hall._count.seats} Total Seats
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href={`/admin/halls/${hall.id}`}
              className="text-xs font-bold text-gray-500 hover:text-white uppercase transition-colors"
            >
              Edit Layout
            </Link>
            <button
              onClick={() => handleDelete(hall.id)}
              className="text-xs font-bold text-red-900 hover:text-red-500 uppercase transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
