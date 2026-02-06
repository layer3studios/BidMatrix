"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useProjectStore } from "@/store/project.store";
import { useAppStore } from "@/store/app.store";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/vendors", label: "Vendors" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);

  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  const onNav = () => {
    if (variant === "mobile") setSidebarOpen(false);
  };

  return (
    <aside className="h-full w-70 shrink-0 border-r border-zinc-800/70 bg-zinc-950/70 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="h-8 w-8 rounded-lg bg-teal-500/15 ring-1 ring-teal-400/30" />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">BidMatrix</div>
          <div className="text-[11px] text-zinc-400">Precon Leveling Workspace</div>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Navigation
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNav}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100",
                  active && "bg-zinc-900/70 text-zinc-100 ring-1 ring-zinc-800/70",
                )}
              >
                <span>{item.label}</span>
                {active ? <span className="h-2 w-2 rounded-full bg-teal-400/80" /> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Pinned Projects
          </div>
          <div className="text-[11px] text-zinc-500">{projects.length}</div>
        </div>

        <div className="space-y-1">
          {projects.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className={cn(
                "rounded-md border border-zinc-900/70 bg-zinc-950/30 px-3 py-2",
                p.id === selectedProjectId && "border-teal-500/30 bg-teal-500/5",
              )}
            >
              <div className="text-sm text-zinc-200">{p.name}</div>
              <div className="text-[11px] text-zinc-500">{p.location}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
