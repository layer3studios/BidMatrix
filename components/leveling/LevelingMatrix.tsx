"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useLevelingStore, type MatrixDensity, type NormalizationRule } from "@/store/leveling.store";
import { Portal } from "@/components/ui/Portal";

// --- Types ---
export type MatrixBidder = { id: string; label: string };
export type MatrixScopeRow = { id: string; label: string; group?: string };
export type DemoStatus = "Included" | "Excluded" | "Clarify" | "Alternate";

type CellKey = { bidderId: string; scopeId: string };

type PopoverState = {
  cell: CellKey;
  bidderLabel: string;
  scopeLabel: string;
  status: DemoStatus;
  rawNum: number;
  normalizedNum: number;
  median: number;
  deltaPct: number;
  notesCount: number;
};

// --- Config ---
const SCOPE_COL_WIDTH = 280;
const BIDDER_COL_WIDTH = 160; 

const DENSITY_CONFIG: Record<MatrixDensity, { rowHeight: number; fontSize: string; padding: string }> = {
  compact: { rowHeight: 40, fontSize: "text-[11px]", padding: "py-1" },
  comfortable: { rowHeight: 52, fontSize: "text-[12px]", padding: "py-2" },
  spacious: { rowHeight: 88, fontSize: "text-[13px]", padding: "py-3" },
};

export function LevelingMatrix({
  bidders,
  scopeRows,
  selectedBidderId,
  selectedScopeId,
  onSelectCell,
  onEnterCell,
  heatmapEnabled,
  showGapsOnly,
  includeOnly,
}: {
  bidders: MatrixBidder[];
  scopeRows: MatrixScopeRow[];
  selectedBidderId?: string;
  selectedScopeId?: string;
  onSelectCell: (bidderId?: string, scopeId?: string) => void;
  onEnterCell?: (bidderId?: string, scopeId?: string) => void;
  heatmapEnabled: boolean;
  showGapsOnly: boolean;
  includeOnly: boolean;
}) {
  const density = useLevelingStore((s) => s.density);
  const rules = useLevelingStore((s) => s.rules);
  // SCENARIO STORE CONNECTION
  const activeScenarioId = useLevelingStore((s) => s.activeScenarioId);
  const scenarios = useLevelingStore((s) => s.scenarios);
  const selectBidderForScope = useLevelingStore((s) => s.selectBidderForScope);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  const selections = activeScenario?.selections || {};

  const cfg = DENSITY_CONFIG[density];
  const colIds = useMemo(() => ["__scope__", ...bidders.map((b) => b.id)], [bidders]);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const headerHRef = useRef<HTMLDivElement | null>(null);
  const bodyHRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: scopeRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cfg.rowHeight,
    overscan: 12,
  });

  const [hovered, setHovered] = useState<PopoverState | null>(null);
  const [pinned, setPinned] = useState<PopoverState | null>(null);
  const activePopover = pinned ?? hovered;
  const [popPos, setPopPos] = useState<{ left: number; top: number; visible: boolean }>({ left: 0, top: 0, visible: false });

  // Popover Anchor Loop
  useEffect(() => {
    if (!activePopover) return;
    let frameId: number;
    const updatePosition = () => {
      const cellId = `cell-${activePopover.cell.bidderId}-${activePopover.cell.scopeId}`;
      const el = document.getElementById(cellId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
           setPopPos((prev) => ({ ...prev, visible: false }));
        } else {
           const POP_W = 340;
           const POP_H = 250;
           let left = rect.left;
           let top = rect.bottom;
           if (left + POP_W > window.innerWidth - 20) left = rect.right - POP_W;
           if (top + POP_H > window.innerHeight - 20) top = rect.top - POP_H;
           setPopPos({ left, top, visible: true });
        }
      } else {
        setPopPos((prev) => ({ ...prev, visible: false }));
      }
      frameId = requestAnimationFrame(updatePosition);
    };
    frameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frameId);
  }, [activePopover]);

  const syncHeaderFromBody = (left: number) => { if (headerHRef.current) headerHRef.current.scrollLeft = left; };
  const syncBodyFromHeader = (left: number) => { if (bodyHRef.current) bodyHRef.current.scrollLeft = left; };

  const addAuditEvent = useLevelingStore((s) => s.addAuditEvent);
  const pushToast = useLevelingStore((s) => s.pushToast);
  const dismissToast = useLevelingStore((s) => s.dismissToast);
  const fireToast = (title: string, detail?: string, tone?: "neutral" | "success" | "warning" | "danger") => {
    const id = pushToast({ title, detail, tone });
    window.setTimeout(() => dismissToast(id), 3200);
  };

  const totalWidth = SCOPE_COL_WIDTH + bidders.length * BIDDER_COL_WIDTH;

  const isCellVisible = (status: DemoStatus) => {
    if (includeOnly) return status === "Included";
    if (showGapsOnly) return status !== "Included";
    return true;
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <div className="relative z-30 shrink-0 border-b border-zinc-800 bg-zinc-950 shadow-sm">
        <div ref={headerHRef} className="overflow-hidden" onScroll={(e) => syncBodyFromHeader((e.currentTarget as HTMLDivElement).scrollLeft)}>
          <div className="flex" style={{ width: totalWidth }}>
            <div className="sticky left-0 z-40 flex shrink-0 flex-col justify-end border-r border-zinc-800 bg-zinc-950 px-4 py-2" style={{ width: SCOPE_COL_WIDTH }}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Scope Item</div>
            </div>
            {bidders.map((b) => (
              <div key={b.id} className="flex shrink-0 flex-col justify-end border-r border-zinc-800/50 bg-zinc-950 px-4 py-2 text-right" style={{ width: BIDDER_COL_WIDTH }}>
                <div className="truncate text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bidder</div>
                <div className="mt-0.5 truncate text-[12px] font-medium text-zinc-200" title={b.label}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
        {heatmapEnabled && (
          <div className="border-t border-zinc-800 px-4 py-1.5">
            <HeatmapLegend />
          </div>
        )}
      </div>

      {/* Body */}
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]" role="grid">
        <div ref={bodyHRef} className="overflow-x-auto" onScroll={(e) => syncHeaderFromBody((e.currentTarget as HTMLDivElement).scrollLeft)}>
          <div className="relative" style={{ height: rowVirtualizer.getTotalSize(), width: totalWidth }}>
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const r = scopeRows[vRow.index];
              const isActiveRow = r.id === selectedScopeId;
              
              const rowValues = bidders.map((b) => {
                  const s = demoStatus(b.id, r.id);
                  return calculateAdjustedValue(b.id, r.id, s, rules);
              });
              const median = rowMedian(rowValues);

              return (
                <div key={r.id} style={{ transform: `translateY(${vRow.start}px)`, height: vRow.size }} className={cn("absolute left-0 right-0 flex border-b border-zinc-800/60 transition-colors", isActiveRow ? "bg-teal-500/3" : "hover:bg-zinc-900/20")}>
                  {/* Scope Label */}
                  <button
                    className={cn("sticky left-0 z-20 flex shrink-0 flex-col justify-center border-r border-zinc-800 bg-zinc-950 px-4 text-left", isActiveRow && "bg-teal-950/20 backdrop-blur-sm")}
                    style={{ width: SCOPE_COL_WIDTH }}
                    onClick={() => onSelectCell(selectedBidderId ?? bidders[0]?.id, r.id)}
                  >
                    <div className={cn("line-clamp-2 font-medium leading-tight", cfg.fontSize, isActiveRow ? "text-teal-50" : "text-zinc-200")}>{r.label}</div>
                    {density !== "compact" && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500">#{r.id}</span>
                        {r.group && <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">{r.group}</span>}
                      </div>
                    )}
                  </button>

                  {/* Bidders */}
                  {bidders.map((b) => {
                    const status = demoStatus(b.id, r.id);
                    const visible = isCellVisible(status);
                    const isSelected = selectedBidderId === b.id && selectedScopeId === r.id;
                    
                    const rawNum = demoRawMoneyNum(b.id, r.id);
                    const normalizedNum = calculateAdjustedValue(b.id, r.id, status, rules);
                    const deltaPct = pctDelta(normalizedNum, median);
                    const outlier = Number.isFinite(deltaPct) && Math.abs(deltaPct) >= 0.25 && visible;
                    const notesCount = demoNotesCount(b.id, r.id);
                    const isPinned = pinned?.cell.bidderId === b.id && pinned?.cell.scopeId === r.id;
                    const cellId = `cell-${b.id}-${r.id}`;

                    // --- SCENARIO SELECTION CHECK ---
                    const isScenarioSelected = selections[r.id] === b.id;

                    return (
                      <button
                        key={b.id}
                        id={cellId}
                        style={{ width: BIDDER_COL_WIDTH }}
                        className={cn(
                          "relative shrink-0 border-r border-zinc-800/50 px-3 text-right transition-colors",
                          cfg.padding,
                          "flex flex-col justify-between group",
                          // HIGHLIGHT SELECTED BID FOR SCENARIO
                          isScenarioSelected && "bg-teal-500/10 ring-1 ring-inset ring-teal-400 z-10",
                          isSelected && !isScenarioSelected && "bg-zinc-800 ring-1 ring-inset ring-zinc-600",
                          !visible && "opacity-40 grayscale",
                          !isSelected && !isScenarioSelected && heatmapEnabled && heatmapBg(status),
                          !isSelected && !isScenarioSelected && !heatmapEnabled && "hover:bg-zinc-800/30"
                        )}
                        onClick={() => {
                            onSelectCell(b.id, r.id);
                            // Single click selects cell for inspection
                            // To select for AWARD, we might want a modifier key or a specific button
                            // For this UX, let's make it so you click to inspect, but DOUBLE CLICK to "Pin/Select"
                            // Or add a button inside the cell that appears on hover
                        }}
                        onDoubleClick={() => {
                           setPinned({ cell: { bidderId: b.id, scopeId: r.id }, bidderLabel: b.label, scopeLabel: r.label, status, rawNum, normalizedNum, median, deltaPct, notesCount });
                           addAuditEvent({ action: "POPOVER_PINNED", bidderId: b.id, scopeId: r.id });
                        }}
                        onMouseEnter={() => !pinned && setHovered({ cell: { bidderId: b.id, scopeId: r.id }, bidderLabel: b.label, scopeLabel: r.label, status, rawNum, normalizedNum, median, deltaPct, notesCount })}
                        onMouseLeave={() => !pinned && setHovered(null)}
                      >
                         <div className="flex w-full items-start justify-between gap-2">
                             <div className="flex shrink-0">
                                 {isScenarioSelected ? (
                                     <span className="inline-flex items-center rounded-sm bg-teal-500 px-1 py-0.5 text-[9px] font-bold text-black shadow-sm">
                                         SELECTED
                                     </span>
                                 ) : visible && (
                                     <span className={cn("inline-flex items-center rounded-sm px-1 py-0.5 text-[9px] font-medium uppercase", statusPill(status))}>
                                        {status === "Included" ? "INC" : status.substring(0,4)}
                                     </span>
                                 )}
                             </div>
                             <div className="flex shrink-0 gap-1 items-center">
                                 {/* Select Button on Hover */}
                                 {!isScenarioSelected && (
                                     <div 
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectBidderForScope(r.id, b.id);
                                        }}
                                        className="hidden group-hover:flex h-3 w-3 items-center justify-center rounded-full border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-black transition-colors"
                                        title="Select for Scenario"
                                     >
                                         <span className="text-[8px]">+</span>
                                     </div>
                                 )}
                                 
                                 {isPinned && <span className="flex h-3 w-3 items-center justify-center rounded-full bg-teal-500 text-[8px] text-zinc-950">P</span>}
                                 {notesCount > 0 && <span className="h-3 w-3 rounded bg-zinc-800 text-[8px] text-zinc-300">{notesCount}</span>}
                                 {outlier && <span className={cn("h-3 rounded px-1 text-[8px] font-bold text-white", deltaPct > 0 ? "bg-rose-500" : "bg-emerald-500")}>!</span>}
                             </div>
                         </div>
                         <div className={cn("flex-1 flex items-center justify-end font-mono tracking-tight tabular-nums", cfg.fontSize, visible ? "text-zinc-100" : "text-zinc-600")}>
                             {visible ? fmtMoney(normalizedNum) : "—"}
                         </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popover (Same as before, abbreviated for space) */}
      <Portal>
        <AnimatePresence>
          {activePopover && popPos.visible ? (
            <motion.div
              key={`${activePopover.cell.bidderId}:${activePopover.cell.scopeId}`}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.08 }}
              className={cn("fixed z-9999 w-85 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl ring-1 ring-black/50")}
              style={{ left: popPos.left, top: popPos.top }}
              onMouseEnter={() => !pinned && setHovered(activePopover)} onMouseLeave={() => !pinned && setHovered(null)}
            >
               {/* Content matches previous implementation, just re-rendered */}
               <div className="border-b border-zinc-800 bg-zinc-950/50 px-4 py-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-zinc-500">{activePopover.cell.bidderId}</div>
                            <div className="text-sm font-semibold text-zinc-100">{activePopover.bidderLabel}</div>
                        </div>
                        <span className={cn("rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", statusPill(activePopover.status))}>{activePopover.status}</span>
                    </div>
               </div>
               <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 rounded-md bg-zinc-950/30 p-3 ring-1 ring-zinc-800">
                    <div><div className="text-[10px] text-zinc-500">Raw Value</div><div className="font-mono text-sm text-zinc-300">{fmtMoney(activePopover.rawNum)}</div></div>
                    <div className="text-right"><div className="text-[10px] text-teal-500">Leveled Value</div><div className="font-mono text-lg font-medium text-white">{fmtMoney(activePopover.normalizedNum)}</div></div>
                  </div>
                  
                  {/* Select Action in Popover */}
                  <button 
                    onClick={() => {
                        selectBidderForScope(activePopover.cell.scopeId, activePopover.cell.bidderId);
                        setPinned(null);
                    }}
                    className="mt-3 w-full rounded bg-teal-500/10 py-1.5 text-center text-xs font-semibold text-teal-400 hover:bg-teal-500/20 border border-teal-500/30"
                  >
                      Select This Bid
                  </button>

                  <div className="mt-3 flex gap-2 border-t border-zinc-800 pt-3">
                      <QuickAction label="Add Note" onClick={() => fireToast("Note Added")} tone="neutral" />
                      <div className="flex-1" />
                      <button onClick={() => setPinned(null)} className="text-[11px] text-zinc-400 underline decoration-zinc-700 hover:text-zinc-200">Unpin</button>
                  </div>
               </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

// Reuse existing helpers and math functions (copied from previous response for completeness)
export function calculateAdjustedValue(bidderId: string, scopeId: string, status: DemoStatus, rules: NormalizationRule[]): number {
    let val = demoRawMoneyNum(bidderId, scopeId);
    const tweak = (hash(`${bidderId}::norm::${scopeId}`) % 500) / 1000;
    const statusFactor = status === "Included" ? 1.0 : status === "Clarify" ? 1.06 : status === "Excluded" ? 1.12 : 1.03;
    val = Math.round(val * (1 + tweak) * statusFactor);
    rules.filter(r => r.active && r.type === "plug").forEach(r => {
        if (r.applyTo === "all" || (r.applyTo === "gaps" && status !== "Included")) val += r.value;
    });
    let totalMarkup = 0;
    rules.filter(r => r.active && r.type === "markup").forEach(r => {
        if (r.applyTo === "all" || (r.applyTo === "gaps" && status !== "Included")) totalMarkup += r.value;
    });
    return Math.round(val * (1 + totalMarkup / 100));
}
export function demoStatus(bidderId: string, scopeId: string): DemoStatus { const n = hash(`${bidderId}::${scopeId}`) % 100; if (n < 62) return "Included"; if (n < 78) return "Clarify"; if (n < 92) return "Excluded"; return "Alternate"; }
export function demoRawMoneyNum(bidderId: string, scopeId: string): number { const n = hash(`${scopeId}::${bidderId}`) % 9000; return 12000 + n * 7; }
function demoNotesCount(bidderId: string, scopeId: string): number { const n = hash(`note::${bidderId}::${scopeId}`) % 10; return n < 6 ? 0 : n < 8 ? 1 : n < 9 ? 2 : 3; }
function rowMedian(nums: number[]) { const arr = [...nums].sort((a, b) => a - b); if (arr.length === 0) return 0; const mid = Math.floor(arr.length / 2); return arr.length % 2 === 1 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2); }
function pctDelta(value: number, baseline: number) { return !baseline ? Number.NaN : (value - baseline) / baseline; }
function fmtMoney(n: number) { return `$${Math.round(n).toLocaleString("en-US")}`; }
export function hash(input: string): number { let h = 2166136261; for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }

// UI Helpers
function QuickAction({ label, onClick, tone }: { label: string; onClick: () => void; tone: "neutral" | "warning" | "danger" }) {
  const styles = { neutral: "bg-zinc-800 text-zinc-300 hover:bg-zinc-700", warning: "bg-amber-950/40 text-amber-200 ring-1 ring-amber-900/50 hover:bg-amber-900/40", danger: "bg-rose-950/40 text-rose-200 ring-1 ring-rose-900/50 hover:bg-rose-900/40" }
  return <button onClick={onClick} className={cn("rounded px-3 py-1.5 text-[11px] font-medium transition-colors", styles[tone])}>{label}</button>;
}
function HeatmapLegend() { return (<div className="flex items-center gap-3 text-[11px]"><span className="font-semibold text-zinc-500">LEGEND</span><div className="flex gap-2"><LegendItem color="bg-emerald-500/20 text-emerald-100" label="Included" /><LegendItem color="bg-amber-500/20 text-amber-100" label="Clarify" /><LegendItem color="bg-rose-500/20 text-rose-100" label="Excluded" /></div></div>); }
function LegendItem({color, label}: {color: string, label: string}) { return <span className={cn("rounded px-2 py-0.5", color)}>{label}</span> }
function heatmapBg(s: DemoStatus) { switch (s) { case "Included": return "bg-emerald-500/[0.06]"; case "Clarify": return "bg-amber-500/[0.08]"; case "Excluded": return "bg-rose-500/[0.08]"; case "Alternate": return "bg-sky-500/[0.08]"; } }
function statusPill(s: DemoStatus) { switch (s) { case "Included": return "bg-emerald-500/10 text-emerald-400"; case "Clarify": return "bg-amber-500/10 text-amber-400"; case "Excluded": return "bg-rose-500/10 text-rose-400"; case "Alternate": return "bg-sky-500/10 text-sky-400"; } }