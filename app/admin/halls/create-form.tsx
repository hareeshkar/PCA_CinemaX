"use client";

import { useActionState } from "react";
import { createHall } from "./actions";

export default function HallCreateForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      return createHall(formData);
    },
    null
  );

  return (
    <div className="bg-[#0a0a0a] border border-[#222] p-6 shadow-2xl">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-[#222] pb-2">
        Initialize New Hall
      </h2>

      <form action={formAction} className="space-y-5">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-500">
            Hall Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="Screen 1 (IMAX)"
            required
            className="w-full bg-[#111] border border-[#333] p-3 text-xs text-white focus:border-red-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Type */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-500">
            Experience Type
          </label>
          <select
            name="type"
            className="w-full bg-[#111] border border-[#333] p-3 text-xs text-white focus:border-red-600 focus:outline-none"
          >
            <option value="Standard">Standard 2D</option>
            <option value="IMAX">IMAX 3D</option>
            <option value="VIP">Gold Class VIP</option>
            <option value="Dolby">Dolby Atmos</option>
          </select>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500">
              Rows (A-Z)
            </label>
            <input
              name="rows"
              type="number"
              min="1"
              max="26"
              defaultValue="10"
              required
              className="w-full bg-[#111] border border-[#333] p-3 text-xs text-white focus:border-red-600 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500">
              Cols (1-50)
            </label>
            <input
              name="cols"
              type="number"
              min="1"
              max="50"
              defaultValue="12"
              required
              className="w-full bg-[#111] border border-[#333] p-3 text-xs text-white focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Feedback */}
        {state?.success && (
          <div className="p-3 bg-green-900/10 border border-green-900/30 text-green-500 text-[10px] font-bold uppercase tracking-widest text-center">
            {state.message}
          </div>
        )}
        {state?.error && (
          <div className="p-3 bg-red-900/10 border border-red-900/30 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
            {state.error}
          </div>
        )}

        <button
          disabled={isPending}
          className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
        >
          {isPending ? "Generating Matrix..." : "Create Structure"}
        </button>
      </form>
    </div>
  );
}
