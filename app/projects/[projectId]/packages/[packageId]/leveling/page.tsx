"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { useLevelingStore, type DrawerTab, type MatrixDensity } from "@/store/leveling.store";
import { Button } from "@/components/ui/Button";
import { PaneResizer } from "@/components/shell/PaneResizer";
import { RightDrawer } from "@/components/leveling/RightDrawer";
import { LevelingMatrix } from "@/components/leveling/LevelingMatrix";
import { SavedViewsMenu } from "@/components/leveling/SavedViewsMenu";
import { ColumnMenu } from "@/components/leveling/ColumnMenu";
import { ToastHost } from "@/components/ui/ToastHost";
import { NormalizationRules } from "@/components/leveling/NormalizationRules";
import { ScenarioBar } from "@/components/leveling/ScenarioBar";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

const TAB_SET = new Set<DrawerTab>(["bidder", "scope", "variance", "docs", "audit"]);

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function LevelingPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string; packageId: string }>();
  const sp = useSearchParams();

  const projectId = params?.projectId;
  const packageId = params?.packageId;

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const pkg = useProjectStore((s) => s.packages.find((x) => x.id === packageId));

  const leftWidth = useLevelingStore((s) => s.leftWidth);
  const rightWidth = useLevelingStore((s) => s.rightWidth);
  const setLeftWidth = useLevelingStore((s) => s.setLeftWidth);
  const setRightWidth = useLevelingStore((s) => s.setRightWidth);

  // Density & Columns
  const density = useLevelingStore((s) => s.density);
  const setDensity = useLevelingStore((s) => s.setDensity);
  const hiddenBidderIds = useLevelingStore((s) => s.hiddenBidderIds);

  const drawerOpen = useLevelingStore((s) => s.drawerOpen);
  const openDrawer = useLevelingStore((s) => s.openDrawer);
  const closeDrawer = useLevelingStore((s) => s.closeDrawer);
  const activeTab = useLevelingStore((s) => s.activeTab);
  const setTab = useLevelingStore((s) => s.setTab);
  const selectedBidderId = useLevelingStore((s) => s.selectedBidderId);
  const selectedScopeId = useLevelingStore((s) => s.selectedScopeId);
  const setSelection = useLevelingStore((s) => s.setSelection);

  // Heatmap + filter UI state
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [showGapsOnly, setShowGapsOnly] = useState(false);
  const [includeOnly, setIncludeOnly] = useState(false);

  // Bundle state for Saved Views
  const currentConfig = useMemo(() => ({
    heatmapEnabled,
    showGapsOnly,
    includeOnly,
    density,
  }), [heatmapEnabled, showGapsOnly, includeOnly, density]);

  const handleApplyView = (config: typeof currentConfig) => {
    setHeatmapEnabled(config.heatmapEnabled);
    setShowGapsOnly(config.showGapsOnly);
    setIncludeOnly(config.includeOnly);
    setDensity(config.density);
  };

  // URL -> store sync
  useEffect(() => {
    const tabQ = sp.get("tab");
    const bidderQ = sp.get("bidder");
    const scopeQ = sp.get("scope");

    const tab: DrawerTab | null = tabQ && TAB_SET.has(tabQ as DrawerTab) ? (tabQ as DrawerTab) : null;
    if (tab) setTab(tab);
    setSelection(bidderQ ?? undefined, scopeQ ?? undefined);
    if (tab || bidderQ || scopeQ) openDrawer(tab ?? undefined);
  }, [sp, setTab, setSelection, openDrawer]);

  // Demo lists (Full List)
  const allBidders = useMemo(() => ["VND-044", "VND-012", "VND-028", "VND-006", "VND-019"], []);
  
  // Filtered List based on Hidden Columns (Passed to Matrix)
  const visibleBidders = useMemo(() => {
    return allBidders.filter(b => !hiddenBidderIds.includes(b));
  }, [allBidders, hiddenBidderIds]);

  const scopes = useMemo(() => Array.from({length: 40}).map((_,i) => `CSI-23-${String(900+i*10).padStart(4,'0')}`), []);

  const setQuery = (next: { tab?: DrawerTab; bidder?: string; scope?: string }) => {
    const url = new URL(window.location.href);
    const qp = url.searchParams;
    if (next.tab) qp.set("tab", next.tab); else qp.delete("tab");
    if (next.bidder) qp.set("bidder", next.bidder); else qp.delete("bidder");
    if (next.scope) qp.set("scope", next.scope); else qp.delete("scope");
    router.replace(`${url.pathname}?${qp.toString()}`);
  };

  if (!projectId || !packageId) return null;

  return (
    <motion.div {...pageTransition} className="h-full min-h-0 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-800/70 bg-zinc-950/30 px-4 py-3 md:flex-row md:items-start md:justify-between md:px-6 md:py-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold tracking-tight">Bid Leveling Workspace</div>
          <div className="mt-1 text-sm text-zinc-400">
             {pkg ? `${pkg.trade} — ${pkg.package_name}` : packageId} <span className="text-zinc-600">/</span> {projectId}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            
            {/* Column Menu */}
            <ColumnMenu allBidders={allBidders} />

            {/* Saved Views */}
            <SavedViewsMenu currentConfig={currentConfig} onApply={handleApplyView} />
            
            <div className="mx-1 h-4 w-px bg-zinc-800" />

            {/* Density Controls */}
            <div className="mr-2 flex items-center rounded-md border border-zinc-800 bg-zinc-900/50 p-0.5">
                {(["compact", "comfortable", "spacious"] as MatrixDensity[]).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDensity(d)}
                        title={d}
                        className={cn(
                            "rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors",
                            density === d ? "bg-teal-500/20 text-teal-100" : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {!drawerOpen ? (
                <Button variant="secondary" size="sm" onClick={() => openDrawer("bidder")}>Open Drawer</Button>
            ) : (
                <Button variant="ghost" size="sm" onClick={() => closeDrawer()}>Close Drawer</Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/packages`)}>Back</Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Pane (Filters & Rules) */}
        <div className={cn("hidden h-full border-r border-zinc-800/70 bg-zinc-950/25 md:block")} style={{ width: leftWidth }}>
           <div className="p-4 h-full overflow-auto">
                <div className="mb-6">
                    <div className="text-sm font-semibold text-zinc-100 mb-4">Normalization Rules</div>
                    <NormalizationRules />
                </div>
                
                <div className="border-t border-zinc-800 pt-6">
                    <LeftPaneFilters 
                      bidders={allBidders} 
                      scopes={scopes.slice(0, 10)} 
                      selectedBidderId={selectedBidderId} 
                      selectedScopeId={selectedScopeId} 
                      onPick={(b, s) => { setQuery({ tab: "bidder", bidder: b, scope: s }); openDrawer("bidder"); }} 
                    />
                </div>
           </div>
        </div>
        <PaneResizer ariaLabel="Resize filters" onDrag={(dx) => setLeftWidth(clamp(leftWidth + dx, 220, 480))} className="hidden md:block" />

        {/* Center Matrix */}
        <div className="flex-1 min-w-0 flex flex-col bg-zinc-950/15">
            <div className="flex items-center gap-2 border-b border-zinc-800/70 px-4 py-2">
                <Chip active={heatmapEnabled} onClick={() => setHeatmapEnabled(!heatmapEnabled)} label="Heatmap" />
                <Chip active={showGapsOnly} onClick={() => { setShowGapsOnly(!showGapsOnly); setIncludeOnly(false); }} label="Gaps" />
                <Chip active={includeOnly} onClick={() => { setIncludeOnly(!includeOnly); setShowGapsOnly(false); }} label="Included" />
            </div>
            <div className="flex-1 min-h-0">
                <LevelingMatrix
                  bidders={visibleBidders.map((id) => ({ id, label: id }))}
                  scopeRows={scopes.map((id) => ({ id, label: `Scope Item ${id}`, group: "General" }))}
                  selectedBidderId={selectedBidderId}
                  selectedScopeId={selectedScopeId}
                  heatmapEnabled={heatmapEnabled}
                  showGapsOnly={showGapsOnly}
                  includeOnly={includeOnly}
                  onSelectCell={(b, s) => { setQuery({ tab: "bidder", bidder: b, scope: s }); openDrawer("bidder"); }}
                />
            </div>
        </div>

        <ScenarioBar scopeIds={scopes} />

        {/* Right Drawer */}
        {drawerOpen && (
            <>
                <PaneResizer ariaLabel="Resize drawer" onDrag={(dx) => setRightWidth(clamp(rightWidth - dx, 300, 600))} className="hidden md:block" />
                <div className="hidden md:block h-full" style={{ width: rightWidth }}>
                    <RightDrawer />
                </div>
            </>
        )}
      </div>
      <ToastHost />
    </motion.div>
  );
}

// UI Components
function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-[11px] font-medium transition",
        active ? "bg-teal-500/10 text-teal-100 ring-1 ring-teal-400/25" : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
      )}
    >
      {label}
    </button>
  );
}

// --- FIXED TYPE DEFINITION ---
type LeftPaneFiltersProps = {
  bidders: string[];
  scopes: string[];
  selectedBidderId?: string;
  selectedScopeId?: string;
  onPick: (bidder?: string, scope?: string) => void;
};

function LeftPaneFilters({ bidders, scopes, selectedBidderId, selectedScopeId, onPick }: LeftPaneFiltersProps) {
  return (
    <div className="space-y-4">
         <div>
             <div className="text-[10px] uppercase text-zinc-500 mb-2">Bidders</div>
             <div className="flex flex-wrap gap-1">
                 {bidders.map((b) => (
                     <button key={b} onClick={() => onPick(b, selectedScopeId)} className={cn("px-2 py-1 rounded text-[11px]", selectedBidderId === b ? "bg-teal-500/20 text-teal-100" : "bg-zinc-900 text-zinc-400")}>{b}</button>
                 ))}
             </div>
         </div>
         <div>
             <div className="text-[10px] uppercase text-zinc-500 mb-2">Scopes</div>
             <div className="flex flex-col gap-1">
                 {scopes.map((s) => (
                     <button key={s} onClick={() => onPick(selectedBidderId, s)} className={cn("px-2 py-1 rounded text-[11px] text-left truncate", selectedScopeId === s ? "bg-teal-500/20 text-teal-100" : "text-zinc-400 hover:bg-zinc-900")}>{s}</button>
                 ))}
             </div>
         </div>
    </div>
  )
}