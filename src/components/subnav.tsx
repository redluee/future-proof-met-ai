"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, ListChecks, Users, Settings, Upload } from "lucide-react";
import { t } from "@/lib/lang";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/sprints", label: "Sprints", icon: Layers, exact: false },
  { href: "/stories", label: "User Stories", icon: ListChecks, exact: false },
  { href: "/peer-help", label: "Kennisdeling", icon: Users, exact: false },
  { href: "/settings", label: "Instellingen", icon: Settings, exact: false },
  { href: "/export", label: "Exporteren", icon: Upload, exact: false },
];

export function MinorSubnav() {
  const pathname = usePathname();

  // If on login page, don't show subnav
  if (pathname === "/login") return null;

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto px-4 sm:px-6 py-2 border-b border-white/10 bg-zinc-950/60 backdrop-blur-sm scrollbar-none">
      <div className="max-w-7xl mx-auto w-full flex items-center gap-1.5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#00e3a4]/15 border border-[#00e3a4]/30 text-[#00e3a4]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Icon className="size-4 sm:size-3.5 shrink-0" />
              <span>{t(label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
