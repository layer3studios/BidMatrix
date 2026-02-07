"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLevelingStore } from "@/store/leveling.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  allBidders: string[];
};

export function ColumnMenu({ allBidders }: Props) {
  const [open, setOpen] = useState(false);
  const hiddenBidderIds = useLevelingStore((s) => s.hiddenBidderIds);
  const toggleVisibility = useLevelingStore((s) => s.toggleBidderVisibility);
  const showAll = useLevelingStore((s) => s.showAllBidders);

  const toggle = () => setOpen(!open);

  const visibleCount = allBidders.length - hiddenBidderIds.length;

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
          open
            ? "border-teal-500/50 bg-teal-500/10 text-teal-100"
            : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-zinc-100",
        )}
      >
        <span>Columns</span>
        {hiddenBidderIds.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500/20 text-[9px] text-teal-300">
            {visibleCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl ring-1 ring-black/50"
            >
              <div className="flex items-center justify-between px-2 py-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Visible Bidders
                </div>
                {hiddenBidderIds.length > 0 && (
                  <button
                    onClick={showAll}
                    className="text-[10px] text-teal-400 hover:text-teal-300 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="mt-1 max-h-60 overflow-y-auto space-y-0.5">
                {allBidders.map((bidderId) => {
                  const isHidden = hiddenBidderIds.includes(bidderId);
                  return (
                    <button
                      key={bidderId}
                      onClick={() => toggleVisibility(bidderId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
                        isHidden ? "bg-transparent text-zinc-500 hover:bg-zinc-900" : "bg-zinc-900/40 text-zinc-200 hover:bg-zinc-800",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          isHidden
                            ? "border-zinc-700 bg-transparent"
                            : "border-teal-500 bg-teal-500/20 text-teal-400",
                        )}
                      >
                        {!isHidden && <span className="text-[9px] font-bold">✓</span>}
                      </div>
                      <span className={cn("truncate text-[11px] font-medium", isHidden && "line-through opacity-60")}>
                        {bidderId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}