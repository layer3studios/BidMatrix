"use client";

import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Workspace } from "./Workspace";
import { useAppStore } from "@/store/app.store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  // close sidebar on route change via Escape UX (simple baseline)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSidebarOpen]);

  return (
    <div className="min-h-screen bg-zinc-950 bg-noise">
      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar variant="desktop" />
        </div>

        {/* Mobile off-canvas sidebar */}
        {sidebarOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-70">
              <Sidebar variant="mobile" />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <div className="min-h-0 flex-1">
            <Workspace>{children}</Workspace>
          </div>
        </div>
      </div>
    </div>
  );
}
