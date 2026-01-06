"use client";

import { useState, useTransition, useMemo } from "react";
import { saveHallLayout } from "../actions";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { toast } from "sonner";
import { Save, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

type Seat = {
  gridRow: number;
  gridCol: number;
  rowLabel: string;
  number: number;
  type: string;
  status: string;
};

export default function SeatEditor({
  hallId,
  initialRows,
  initialCols,
  existingSeats,
}: {
  hallId: string;
  initialRows: number;
  initialCols: number;
  existingSeats: any[];
}) {
  // Initialize full grid
  const [seats, setSeats] = useState<Seat[]>(() => {
    if (existingSeats.length > 0) return existingSeats;

    const generated: Seat[] = [];
    for (let r = 0; r < initialRows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let c = 0; c < initialCols; c++) {
        generated.push({
          gridRow: r,
          gridCol: c,
          rowLabel: rowLabel,
          number: c + 1,
          type: "Standard",
          status: "Available",
        });
      }
    }
    return generated;
  });

  const [selectedTool, setSelectedTool] = useState<
    "Standard" | "VIP" | "Wheelchair"
  >("Standard");
  const [isSaving, startTransition] = useTransition();

  // Performance optimization: Calculate seat counts
  const seatStats = useMemo(() => {
    const counts = { Standard: 0, VIP: 0, Wheelchair: 0 };
    seats.forEach((s) => counts[s.type as keyof typeof counts]++);
    return counts;
  }, [seats]);

  // Click to Paint
  const handleCellClick = (r: number, c: number) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.gridRow === r && s.gridCol === c) {
          return { ...s, type: selectedTool };
        }
        return s;
      })
    );
  };

  const handleSave = () => {
    const saveToast = toast.loading("Saving hall configuration...");

    startTransition(async () => {
      const res = await saveHallLayout(hallId, seats);

      if (res.success) {
        toast.success("Layout saved successfully", {
          id: saveToast,
          description: `${seats.length} seats configured`,
          duration: 3000,
        });
      } else {
        toast.error("Failed to save layout", {
          id: saveToast,
          description: res.error || "An error occurred",
          duration: 5000,
        });
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* MODERNIZED SIDEBAR */}
      <aside className="w-full lg:w-72 flex-shrink-0 bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-xl shadow-2xl flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">
            Seat Type Selector
          </h3>
          <p className="text-xs text-gray-600">Click seats to paint</p>
        </div>

        {/* Tool Buttons */}
        <div className="p-4 space-y-3 flex-1">
          {[
            {
              id: "Standard",
              color: "bg-zinc-700",
              ring: "ring-zinc-500",
              glow: "shadow-zinc-500/20",
              label: "Standard",
            },
            {
              id: "VIP",
              color: "bg-amber-500",
              ring: "ring-amber-400",
              glow: "shadow-amber-500/40",
              label: "VIP",
            },
            {
              id: "Wheelchair",
              color: "bg-blue-500",
              ring: "ring-blue-400",
              glow: "shadow-blue-500/40",
              label: "Wheelchair",
            },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id as any)}
              className={`
                group w-full flex items-center gap-3 px-4 py-3.5 rounded-lg
                font-medium text-sm tracking-wide
                border transition-all duration-200
                ${
                  selectedTool === tool.id
                    ? `bg-white text-black border-white shadow-lg ${tool.glow}`
                    : "bg-[#0d0d0d] text-gray-400 border-[#1f1f1f] hover:border-[#2f2f2f] hover:text-gray-200"
                }
              `}
            >
              <div
                className={`
                w-4 h-4 rounded-full ${tool.color} 
                ${selectedTool === tool.id ? `ring-2 ${tool.ring}` : ""}
                transition-all duration-200
                ${selectedTool !== tool.id ? "group-hover:scale-110" : ""}
              `}
              ></div>
              <span className="flex-1 text-left">{tool.label}</span>
              {selectedTool === tool.id && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Stats Section */}
        <div className="p-5 border-t border-[#1a1a1a] bg-[#050505]/50 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#0d0d0d] rounded-lg p-2 border border-[#1a1a1a]">
              <div className="text-xs text-gray-500 mb-1">Standard</div>
              <div className="text-lg font-bold text-white">
                {seatStats.Standard}
              </div>
            </div>
            <div className="bg-[#0d0d0d] rounded-lg p-2 border border-[#1a1a1a]">
              <div className="text-xs text-gray-500 mb-1">VIP</div>
              <div className="text-lg font-bold text-amber-500">
                {seatStats.VIP}
              </div>
            </div>
            <div className="bg-[#0d0d0d] rounded-lg p-2 border border-[#1a1a1a]">
              <div className="text-xs text-gray-500 mb-1">Access</div>
              <div className="text-lg font-bold text-blue-500">
                {seatStats.Wheelchair}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg p-3 border border-emerald-500/20">
            <div className="text-xs text-emerald-400 mb-1 font-medium">
              Total Capacity
            </div>
            <div className="text-2xl font-bold text-white">{seats.length}</div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="
              w-full bg-gradient-to-r from-emerald-600 to-emerald-500 
              text-white py-3.5 rounded-lg
              font-semibold text-sm tracking-wide
              hover:from-emerald-500 hover:to-emerald-400
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-lg shadow-emerald-500/25
              flex items-center justify-center gap-2
            "
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS - OPTIMIZED FOR PERFORMANCE */}
      <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-xl shadow-2xl relative overflow-hidden">
        {/* Instructions Badge */}
        <div className="absolute top-5 left-5 z-20 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="text-xs text-gray-300 font-medium">
            Scroll to zoom • Drag to pan
          </span>
        </div>

        <TransformWrapper
          initialScale={0.8}
          minScale={0.3}
          maxScale={3}
          centerOnInit
          limitToBounds={false}
          panning={{ velocityDisabled: true }}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Modern Zoom Controls */}
              <div className="absolute top-5 right-5 z-20 flex flex-col gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-lg border border-[#2f2f2f] transition-all shadow-lg flex items-center justify-center group"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-lg border border-[#2f2f2f] transition-all shadow-lg flex items-center justify-center group"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-lg border border-[#2f2f2f] transition-all shadow-lg flex items-center justify-center group"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  willChange: "transform",
                }}
              >
                <div className="p-16">
                  {/* Cinema Screen */}
                  <div className="relative mb-20">
                    <div className="w-[700px] h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent rounded-full shadow-[0_0_30px_rgba(148,163,184,0.4)]"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-slate-600 font-semibold tracking-[0.3em]">
                      SCREEN
                    </div>
                  </div>

                  {/* Optimized Grid - Use CSS Grid with will-change */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${initialCols}, 32px)`,
                      gap: "5px",
                      willChange: "transform",
                    }}
                  >
                    {seats.map((seat) => (
                      <button
                        key={`${seat.gridRow}-${seat.gridCol}`}
                        onClick={() =>
                          handleCellClick(seat.gridRow, seat.gridCol)
                        }
                        className={`
                          w-8 h-8 rounded-t-lg text-[8px] font-bold 
                          flex flex-col items-center justify-center 
                          cursor-pointer transition-all duration-150
                          border focus:outline-none focus:ring-2 focus:ring-white/50
                          ${
                            seat.type === "VIP"
                              ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.4)] hover:shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                              : seat.type === "Wheelchair"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                              : "bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] border-[#2f2f2f] text-gray-400 hover:border-[#3f3f3f] hover:text-gray-200"
                          }
                        `}
                      >
                        <span className="opacity-60 text-[7px]">
                          {seat.rowLabel}
                        </span>
                        <span className="font-mono">{seat.number}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
