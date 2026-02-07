"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export function PaneResizer({
  onDrag,
  className,
  ariaLabel,
}: {
  onDrag: (deltaX: number) => void;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="separator"
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        "group relative w-3 cursor-col-resize select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40",
        className,
      )}
      onMouseDown={(e) => {
        e.preventDefault();

        // Prevent selection during drag
        const prevUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = "none";

        const startX = e.clientX;

        const onMove = (ev: MouseEvent) => {
          onDrag(ev.clientX - startX);
        };

        const onUp = () => {
          document.body.style.userSelect = prevUserSelect;
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onDrag(-10);
        if (e.key === "ArrowRight") onDrag(10);
      }}
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-800/70 group-hover:bg-teal-400/40" />
      <div className="absolute inset-0 rounded-md group-hover:bg-teal-500/5" />
    </div>
  );
}
