"use client";

import React from "react";

export function Workspace({ children }: { children: React.ReactNode }) {
  // Placeholder for future resizable split panes (filters | main | drawer).
  return (
    <main className="relative h-full min-h-0">
      <div className="h-full min-h-0 overflow-hidden">{children}</div>
    </main>
  );
}
