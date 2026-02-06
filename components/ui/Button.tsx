"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export function Button({
  className,
  variant = "secondary",
  size = "md",
  loading,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary:
      "bg-teal-500/15 text-teal-100 ring-1 ring-teal-400/30 hover:bg-teal-500/20 hover:ring-teal-300/40",
    secondary:
      "bg-zinc-900/60 text-zinc-100 ring-1 ring-zinc-800/70 hover:bg-zinc-900/80",
    ghost: "text-zinc-200 hover:bg-zinc-900/60",
    danger:
      "bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/30 hover:bg-rose-500/20",
  };

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border border-zinc-300/30 border-t-zinc-200" />
          <span>Working…</span>
        </span>
      ) : (
        props.children
      )}
    </button>
  );
}
