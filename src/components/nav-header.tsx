"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { GraduationCap, LogOut, User } from "lucide-react";

export function NavHeader() {
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#00e3a4]/10 border border-[#00e3a4]/20 flex items-center justify-center text-[#00e3a4] group-hover:bg-[#00e3a4]/20 group-hover:border-[#00e3a4]/40 transition-all">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-tight group-hover:text-[#00e3a4] transition-colors">
              Minor Portfolio
            </div>
            <div className="text-xs text-zinc-400">Steven Heijn</div>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#00e3a4] animate-pulse" />
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium">{username || "Steven"}</span>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800/80 rounded-lg transition-all"
              title="Uitloggen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Uitloggen</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
