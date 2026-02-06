"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { useLevelingStore, type DrawerTab } from "@/store/leveling.store";
import { Button } from "@/components/ui/Button";
import { PaneResizer } from "@/components/shell/PaneResizer";
import { RightDrawer } from "@/components/leveling/RightDrawer";
import { LevelingMatrix } from "@/components/leveling/LevelingMatrix";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
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

  const drawerOpen = useLevelingStore((s) => s.drawerOpen);
  const openDrawer = useLevelingStore((s) => s.openDrawer);
  const closeDrawer = useLevelingStore((s) => s.closeDrawer);

  const activeTab = useLevelingStore((s) => s.activeTab);
  const setTab = useLevelingStore((s) => s.setTab);

  const mobilePane = useLevelingStore((s) => s.mobilePane);
  const setMobilePane = useLevelingStore((s) => s.setMobilePane);

  const selectedBidderId = useLevelingStore((s) => s.selectedBidderId);
  const selectedScopeId = useLevelingStore((s) => s.selectedScopeId);
  const setSelection = useLevelingStore((s) => s.setSelection);

  // --- URL -> store (single source of truth is the URL for sharable state)
  useEffect(() => {
    const tabQ = sp.get("tab");
    const bidderQ = sp.get("bidder");
    const scopeQ = sp.get("scope");

    const tab: DrawerTab | null =
      tabQ && TAB_SET.has(tabQ as DrawerTab) ? (tabQ as DrawerTab) : null;

    if (tab) setTab(tab);

    // selection (allow undefined)
    setSelection(bidderQ ?? undefined, scopeQ ?? undefined);

    // open drawer if tab is present (typical deep link)
    if (tab || bidderQ || scopeQ) {
      openDrawer(tab ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // --- store -> URL helpers
  const setQuery = (next: { tab?: DrawerTab; bidder?: string; scope?: string }) => {
    const url = new URL(window.location.href);
    const qp = url.searchParams;

    if (next.tab) qp.set("tab", next.tab);
    else qp.delete("tab");

    if (next.bidder) qp.set("bidder", next.bidder);
    else qp.delete("bidder");

    if (next.scope) qp.set("scope", next.scope);
    else qp.delete("scope");

    router.replace(url.pathname + "?" + qp.toString());
  };

  // Fake demo lists (until matrix exists)
  const bidders = useMemo(
    () => ["VND-044", "VND-012", "VND-028", "VND-006", "VND-019"],
    [],
  );
  const scopes = useMemo(
    () => ["CSI-23-0900", "CSI-23-3400", "CSI-23-3700", "CSI-23-7310", "CSI-23-0500"],
    [],
  );

  if (!projectId || !packageId) {
    return (
      <motion.div {...pageTransition} className="h-full overflow-auto p-6">
        <div className="text-sm font-semibold text-zinc-100">Invalid route</div>
        <div className="mt-1 text-sm text-zinc-400">Missing projectId or packageId.</div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-800/70 bg-zinc-950/30 px-4 py-3 md:flex-row md:items-start md:justify-between md:px-6 md:py-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold tracking-tight">Bid Leveling Workspace</div>
          <div className="mt-1 text-sm text-zinc-400">
            {project?.name ?? "Unknown Project"} • <span className="text-zinc-500">{projectId}</span>
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            Package:{" "}
            <span className="text-zinc-200">
              {pkg ? `${pkg.trade} — ${pkg.package_name}` : packageId}
            </span>{" "}
            <span className="text-zinc-500">({packageId})</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!drawerOpen ? (
            <Button variant="secondary" size="sm" onClick={() => openDrawer("bidder")}>
              Open Drawer
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => closeDrawer()}>
              Close Drawer
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/packages`)}>
            Back to Packages
          </Button>
          <Button variant="primary" size="sm">
            Export Snapshot
          </Button>
        </div>
      </div>

      {/* Mobile pane switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-800/70 bg-zinc-950/25 px-4 py-2 md:hidden">
        <PaneChip active={mobilePane === "filters"} onClick={() => setMobilePane("filters")}>
          Filters
        </PaneChip>
        <PaneChip active={mobilePane === "matrix"} onClick={() => setMobilePane("matrix")}>
          Matrix
        </PaneChip>
        <PaneChip
          active={mobilePane === "drawer"}
          onClick={() => {
            openDrawer(activeTab);
            setMobilePane("drawer");
          }}
        >
          Drawer
        </PaneChip>

        <div className="ml-auto text-[11px] text-zinc-500">
          Bidder: <span className="text-zinc-300">{selectedBidderId ?? "—"}</span>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex h-[calc(100%-108px)] min-h-0 md:h-[calc(100%-73px)]">
        {/* Left pane (Filters) - desktop */}
        <div
          className="hidden h-full border-r border-zinc-800/70 bg-zinc-950/25 md:block"
          style={{ width: leftWidth }}
        >
          <LeftPane
            bidders={bidders}
            scopes={scopes}
            selectedBidderId={selectedBidderId}
            selectedScopeId={selectedScopeId}
            onPick={(bidder, scope) => {
              setQuery({ tab: "bidder", bidder, scope });
              openDrawer("bidder");
            }}
          />
        </div>

        {/* Left pane (Filters) - mobile */}
        <div className={cn("h-full w-full bg-zinc-950/20 md:hidden", mobilePane !== "filters" && "hidden")}>
          <LeftPane
            bidders={bidders}
            scopes={scopes}
            selectedBidderId={selectedBidderId}
            selectedScopeId={selectedScopeId}
            onPick={(bidder, scope) => {
              setQuery({ tab: "bidder", bidder, scope });
              openDrawer("bidder");
              setMobilePane("drawer");
            }}
          />
        </div>

        {/* Desktop resizer */}
        <div className="hidden md:block">
          <PaneResizer
            ariaLabel="Resize left pane"
            onDrag={(dx) => setLeftWidth(clamp(leftWidth + dx, 260, 520))}
          />
        </div>

        {/* Center pane (Matrix) */}
        <div className={cn("min-w-0 flex-1 bg-zinc-950/15", "md:block", mobilePane !== "matrix" && "hidden md:block")}>
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Bid Leveling Matrix</div>
              <div className="mt-1 text-[12px] text-zinc-500">
                Next: virtualized matrix + heatmap overlay + keyboard grid.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery({ tab: "variance", bidder: selectedBidderId, scope: selectedScopeId });
                  openDrawer("variance");
                  setMobilePane("drawer");
                }}
              >
                Variance
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery({ tab: "audit", bidder: selectedBidderId, scope: selectedScopeId });
                  openDrawer("audit");
                  setMobilePane("drawer");
                }}
              >
                Audit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  openDrawer(activeTab);
                  setMobilePane("drawer");
                }}
              >
                Drawer
              </Button>
            </div>
          </div>

          <div className="h-[calc(100%-52px)] min-h-0 overflow-hidden">
            <LevelingMatrix
              bidders={bidders.map((id) => ({ id, label: id }))}
              scopeRows={scopes.map((id) => ({ id, label: id }))}
              selectedBidderId={selectedBidderId}
              selectedScopeId={selectedScopeId}
              onSelectCell={(bidderId, scopeId) => {
                setQuery({ tab: "bidder", bidder: bidderId, scope: scopeId });
                openDrawer("bidder");
                // on mobile, selection should bring context into view
                setMobilePane("drawer");
              }}
              onEnterCell={(bidderId, scopeId) => {
                setQuery({ tab: activeTab ?? "bidder", bidder: bidderId, scope: scopeId });
                openDrawer(activeTab ?? "bidder");
                setMobilePane("drawer");
              }}
            />
          </div>

        </div>

        {/* Right drawer - desktop */}
        {drawerOpen ? (
          <>
            <div className="hidden md:block">
              <PaneResizer
                ariaLabel="Resize right drawer"
                onDrag={(dx) => setRightWidth(clamp(rightWidth - dx, 340, 620))}
              />
            </div>
            <div className="hidden md:block" style={{ width: rightWidth }}>
              <RightDrawer />
            </div>
          </>
        ) : null}

        {/* Right drawer - mobile (full height panel) */}
        {drawerOpen ? (
          <div className={cn("h-full w-full md:hidden", mobilePane !== "drawer" && "hidden")}>
            <RightDrawer />
          </div>
        ) : (
          <div className={cn("h-full w-full bg-zinc-950/15 md:hidden", mobilePane !== "drawer" && "hidden")}>
            <div className="p-4">
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
                <div className="text-sm font-semibold text-zinc-100">Drawer closed</div>
                <div className="mt-1 text-sm text-zinc-400">
                  Pick a bidder/scope or open a tab to view context.
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openDrawer("bidder")}>
                    Open Drawer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobilePane("matrix")}
                  >
                    Back to Matrix
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PaneChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-[12px] transition",
        active
          ? "bg-teal-500/10 text-teal-100 ring-1 ring-teal-400/25"
          : "text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100",
      )}
    >
      {children}
    </button>
  );
}

function LeftPane({
  bidders,
  scopes,
  selectedBidderId,
  selectedScopeId,
  onPick,
}: {
  bidders: string[];
  scopes: string[];
  selectedBidderId?: string;
  selectedScopeId?: string;
  onPick: (bidder?: string, scope?: string) => void;
}) {
  return (
    <div className="h-full">
      <div className="border-b border-zinc-800/70 px-4 py-3">
        <div className="text-sm font-semibold text-zinc-100">Filters & Controls</div>
        <div className="mt-1 text-[12px] text-zinc-500">Saved views • Outliers • Coverage • Scenario</div>
      </div>

      <div className="h-[calc(100%-52px)] overflow-auto p-4">
        <div className="space-y-3">
          <ModuleCard title="Saved Views" desc="Persisted filter sets; apply with animation (next)." />
          <ModuleCard title="Normalization Rules" desc="Rule builder + toggles; preview deltas (next)." />
          <ModuleCard title="Scenario" desc="What-if switcher; alternates/allowances (next)." />

          {/* Selection scaffold that drives URL */}
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
            <div className="text-sm font-medium text-zinc-100">Context selection (scaffold)</div>
            <div className="mt-1 text-sm text-zinc-400">
              This simulates clicking matrix cells. It updates the URL and opens the drawer.
            </div>

            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-zinc-500">Bidders</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bidders.map((b) => (
                  <button
                    key={b}
                    onClick={() => onPick(b, selectedScopeId)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[12px] transition",
                      selectedBidderId === b
                        ? "bg-teal-500/10 text-teal-100 ring-1 ring-teal-400/25"
                        : "text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100",
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider text-zinc-500">Scope items</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scopes.map((s) => (
                  <button
                    key={s}
                    onClick={() => onPick(selectedBidderId, s)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[12px] transition",
                      selectedScopeId === s
                        ? "bg-teal-500/10 text-teal-100 ring-1 ring-teal-400/25"
                        : "text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => onPick(selectedBidderId, selectedScopeId)}>
                Open Drawer
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onPick(undefined, undefined)}>
                Clear Context
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
      <div className="text-sm font-medium text-zinc-100">{title}</div>
      <div className="mt-1 text-sm text-zinc-400">{desc}</div>
    </div>
  );
}
