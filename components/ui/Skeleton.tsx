"use client";

import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/50 ring-1 ring-inset ring-zinc-700/30",
        className,
      )}
      aria-hidden="true"
    />
  );
}
