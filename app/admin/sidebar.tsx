"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  signOutAction: () => Promise<void>;
}

export default function AdminSidebar({ signOutAction }: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "📊 Dashboard", href: "/admin/dashboard" },
    { name: "🎬 Movies", href: "/admin/movies" },
    { name: "🏛️ Halls & Seats", href: "/admin/halls" },
    { name: "📅 Scheduling", href: "/admin/schedule" },
    { name: "👥 Users & Staff", href: "/admin/users" },
    { name: "💰 Finance", href: "/admin/finance" },
  ];

  return (
    <nav className="w-64 min-h-screen bg-[#0a0a0a] border-r border-[#333] flex flex-col fixed top-0 left-0 z-50">
      {/* Brand */}
      <div className="p-6 text-center border-b border-[#333]">
        <h1 className="text-xl font-bold uppercase tracking-widest font-mono text-white">
          PCA <span className="text-[#e50914]">CINEMAX</span>
        </h1>
      </div>

      {/* Links */}
      <ul className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all rounded-md ${
                  isActive
                    ? "bg-[#e50914]/10 text-[#e50914] border-l-4 border-[#e50914]"
                    : "text-gray-400 hover:bg-[#111] hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="p-4 border-t border-[#333]">
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-900/10 rounded-md transition-all"
          >
            🔓 Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
