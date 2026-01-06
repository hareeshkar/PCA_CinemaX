"use client";

import { useActionState } from "react";
import { signup } from "@/app/auth/actions";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      return signup(formData);
    },
    null
  );

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-widest font-mono">
            PCA <span className="text-[#e50914]">CINEMAX</span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
            Join the Club
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#333] p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                className="w-full bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-[#e50914] transition-colors placeholder:text-gray-700"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-[#e50914] transition-colors placeholder:text-gray-700"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                Set Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-[#e50914] transition-colors placeholder:text-gray-700"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-500 text-xs text-center font-bold">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="p-3 bg-green-900/20 border border-green-900/50 text-green-500 text-xs text-center font-bold">
                {state.message}
              </div>
            )}

            <button
              disabled={isPending}
              className="w-full bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest text-sm transition-all disabled:opacity-50"
            >
              {isPending ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[#222] pt-4">
            <p className="text-xs text-gray-500">
              Already have an ID?{" "}
              <Link
                href="/login"
                className="text-white hover:text-[#e50914] underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
