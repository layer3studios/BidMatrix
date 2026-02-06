"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils/cn";

export type MatrixBidder = { id: string; label: string };
export type MatrixScopeRow = { id: string; label: string; group?: string };

export function LevelingMatrix({
  bidders,
  scopeRows,
  selectedBidderId,
  selectedScopeId,
  onSelectCell,
  onEnterCell,
}: {
  bidders: MatrixBidder[];
  scopeRows: MatrixScopeRow[];
  selectedBidderId?: string;
  selectedScopeId?: string;
  onSelectCell: (bidderId?: string, scopeId?: string) => void;
  onEnterCell?: (bidderId?: string, scopeId?: string) => void;
}) {
  // Build a consistent column order: [Scope column] + bidder columns
  const colIds = useMemo(() => ["__scope__", ...bidders.map((b) => b.id)], [bidders]);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: scopeRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  // Determine active indices from selected ids (for keyboard nav)
  const activeRowIndex = useMemo(() => {
    if (!selectedScopeId) return 0;
    const idx = scopeRows.findIndex((r) => r.id === selectedScopeId);
    return idx >= 0 ? idx : 0;
  }, [selectedScopeId, scopeRows]);

  const activeColIndex = useMemo(() => {
    if (!selectedBidderId) return 1; // first bidder col by default
    const idx = colIds.indexOf(selectedBidderId);
    return idx >= 1 ? idx : 1;
  }, [selectedBidderId, colIds]);

  // Keep active row in view when selection changes
  useEffect(() => {
    rowVirtualizer.scrollToIndex(activeRowIndex, { align: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRowIndex]);

  // Responsive widths via CSS vars (no layout thrash)
  // scope: wider; bidder cols: standard; tighten on small screens.
  const scopeW = 280;
  const colW = 180;

  const scopeWsm = 220;
  const colWsm = 148;

  const totalWidthDesktop = scopeW + bidders.length * colW;
  const totalWidthMobile = scopeWsm + bidders.length * colWsm;

  return (
    <div className="h-full min-h-0">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-zinc-800/70 bg-zinc-950/55 backdrop-blur">
        <div className="overflow-x-auto">
          <div
            className="flex"
            style={{
              width: `max(${totalWidthMobile}px, 100%)`,
            }}
          >
            {/* Scope header */}
            <div
              className={cn(
                "shrink-0 border-r border-zinc-800/70 px-3 py-2",
                "sticky left-0 z-30 bg-zinc-950/75 backdrop-blur",
              )}
              style={{
                width: scopeWsm,
              }}
            >
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Scope
              </div>
              <div className="text-[12px] text-zinc-400">CSI / item</div>
            </div>

            {/* Bidder headers */}
            {bidders.map((b) => (
              <div
                key={b.id}
                className="shrink-0 border-r border-zinc-900/60 px-3 py-2"
                style={{ width: colWsm }}
              >
                <div className="truncate text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Bidder
                </div>
                <div className="truncate text-[13px] text-zinc-200">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body: single scroll container (x + y) */}
      <div
        ref={parentRef}
        className="h-[calc(100%-52px)] overflow-auto"
        role="grid"
        aria-label="Bid leveling matrix"
        tabIndex={0}
        onKeyDown={(e) => {
          if (scopeRows.length === 0 || bidders.length === 0) return;

          const maxRow = scopeRows.length - 1;
          const maxCol = colIds.length - 1; // includes __scope__

          let nextRow = activeRowIndex;
          let nextCol = activeColIndex;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            nextRow = Math.min(maxRow, activeRowIndex + 1);
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            nextRow = Math.max(0, activeRowIndex - 1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            nextCol = Math.min(maxCol, activeColIndex + 1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            nextCol = Math.max(1, activeColIndex - 1); // never go to scope col
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const r = scopeRows[activeRowIndex];
            const bidderId = colIds[activeColIndex];
            onEnterCell?.(bidderId, r?.id);
            return;
          }

          // Commit selection based on next indices
          const r = scopeRows[nextRow];
          const bidderId = colIds[nextCol];
          onSelectCell(bidderId, r?.id);

          rowVirtualizer.scrollToIndex(nextRow, { align: "auto" });
        }}
      >
        <div className="overflow-x-auto">
          <div
            className="relative"
            style={{
              height: rowVirtualizer.getTotalSize(),
              width: `max(${totalWidthMobile}px, 100%)`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const r = scopeRows[vRow.index];
              const isActiveRow = r.id === selectedScopeId;

              return (
                <div
                  key={r.id}
                  ref={rowVirtualizer.measureElement}
                  className="absolute left-0 right-0"
                  style={{ transform: `translateY(${vRow.start}px)` }}
                  role="row"
                  aria-rowindex={vRow.index + 1}
                >
                  <div className="flex border-b border-zinc-900/60">
                    {/* Scope cell (sticky) */}
                    <div
                      className={cn(
                        "sticky left-0 z-10 shrink-0 border-r border-zinc-800/70 bg-zinc-950/60 backdrop-blur",
                        "px-3 py-2",
                        isActiveRow && "bg-teal-500/5",
                      )}
                      style={{ width: scopeWsm }}
                      onClick={() => onSelectCell(selectedBidderId ?? bidders[0]?.id, r.id)}
                      role="gridcell"
                    >
                      <div className="truncate text-[13px] font-medium text-zinc-100">
                        {r.label}
                      </div>
                      <div className="truncate text-[11px] text-zinc-500">{r.id}</div>
                    </div>

                    {/* Bidder cells */}
                    {bidders.map((b) => {
                      const selected = selectedBidderId === b.id && selectedScopeId === r.id;

                      // demo cell state (cheap realism): coverage status & money-ish value
                      const status = demoStatus(b.id, r.id);
                      const money = demoMoney(b.id, r.id);

                      return (
                        <button
                          key={b.id}
                          type="button"
                          className={cn(
                            "shrink-0 border-r border-zinc-900/60 px-3 py-2 text-left",
                            "hover:bg-zinc-900/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/35",
                            selected ? "bg-teal-500/8 ring-1 ring-inset ring-teal-400/25" : "bg-transparent",
                          )}
                          style={{ width: colWsm }}
                          onClick={() => onSelectCell(b.id, r.id)}
                          role="gridcell"
                          aria-selected={selected}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-[11px] uppercase tracking-wider", statusPill(status))}>
                              {status}
                            </span>
                            <span className="text-[11px] text-zinc-500">v3</span>
                          </div>

                          <div className="mt-1 font-mono text-[13px] tabular-nums text-zinc-200">
                            {money}
                          </div>

                          <div className="mt-1 truncate text-[11px] text-zinc-500">
                            {status === "Excluded" ? "Exclusion noted" : status === "Clarify" ? "Needs RFI" : "Included"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop width override (no JS listeners) */}
        <style jsx>{`
          @media (min-width: 768px) {
            .sticky-header-wrap {
              width: max(${totalWidthDesktop}px, 100%);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

type DemoStatus = "Included" | "Excluded" | "Clarify" | "Alternate";

function demoStatus(bidderId: string, scopeId: string): DemoStatus {
  // deterministic "hash" without Math.random() to avoid hydration mismatch
  const n = hash(`${bidderId}::${scopeId}`) % 100;
  if (n < 62) return "Included";
  if (n < 78) return "Clarify";
  if (n < 92) return "Excluded";
  return "Alternate";
}

function demoMoney(bidderId: string, scopeId: string): string {
  const n = hash(`${scopeId}::${bidderId}`) % 9000;
  const base = 12000 + n * 7; // 12k–75k-ish
  return `$${base.toLocaleString("en-US")}`;
}

function statusPill(s: DemoStatus) {
  const map: Record<DemoStatus, string> = {
    Included: "text-emerald-200",
    Clarify: "text-amber-200",
    Excluded: "text-rose-200",
    Alternate: "text-sky-200",
  };
  return map[s];
}

// fast deterministic hash
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) as number;
}
