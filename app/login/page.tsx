"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      return login(formData);
    },
    null
  );

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6 relative">
      {/* Subtle Texture Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-widest font-mono">
            PCA <span className="text-[#e50914]">CINEMAX</span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
            Member Sign In
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-[#333] p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
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
                Password
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

            <button
              disabled={isPending}
              className="w-full bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest text-sm transition-all disabled:opacity-50"
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[#222] pt-4">
            <p className="text-xs text-gray-500">
              New to PCA?{" "}
              <Link
                href="/register"
                className="text-white hover:text-[#e50914] underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
