"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useLevelingStore } from "@/store/leveling.store";

export function ToastHost() {
  const toasts = useLevelingStore((s) => s.toasts);
  const dismiss = useLevelingStore((s) => s.dismissToast);

  // Auto-dismiss (client-only)
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismiss(t.id), 3200),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts.length]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-100 w-[92vw] max-w-90 space-y-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.14 } }}
            exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.12 } }}
            className={cn(
              "pointer-events-auto rounded-xl border border-zinc-800/70 bg-zinc-950/85 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur",
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5 h-2.5 w-2.5 rounded-full", toneDot(t.tone))} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-zinc-100">{t.title}</div>
                {t.detail ? <div className="mt-0.5 text-[12px] text-zinc-400">{t.detail}</div> : null}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md px-2 py-1 text-[12px] text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function toneDot(tone?: "neutral" | "success" | "warning" | "danger") {
  switch (tone) {
    case "success":
      return "bg-emerald-400/80";
    case "warning":
      return "bg-amber-400/80";
    case "danger":
      return "bg-rose-400/80";
    default:
      return "bg-teal-400/70";
  }
}
