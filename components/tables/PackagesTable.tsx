"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ImportWizard } from "@/components/import/ImportWizard"; // NEW: Import

import type { BidPackage } from "@/lib/data/models";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app.store";
import { can } from "@/lib/permissions/roles";

type PackageStatus = BidPackage["status"];

function fmtMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function statusStyle(s: PackageStatus) {
  const map: Record<PackageStatus, string> = {
    Intake: "bg-sky-500/10 text-sky-100 ring-sky-400/25",
    Leveling: "bg-teal-500/10 text-teal-100 ring-teal-400/25",
    Clarifications: "bg-amber-500/10 text-amber-100 ring-amber-400/25",
    Ready: "bg-emerald-500/10 text-emerald-100 ring-emerald-400/25",
    Awarded: "bg-zinc-500/10 text-zinc-100 ring-zinc-400/25",
  };
  return map[s];
}

export function PackagesTable({
  projectId,
  packages,
  loading,
  error,
  showHeader = true,
  className,
}: {
  projectId: string;
  packages: BidPackage[];
  loading?: boolean;
  error?: string | null;
  showHeader?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const role = useAppStore((s) => s.role);

  // NEW: State for Import Modal
  const [isImportOpen, setIsImportOpen] = useState(false);

  // permissions
  const canView = can(role, "exports.generate");
  if (!canView) {
    return (
      <div className={cn("rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-5", className)}>
        <div className="text-sm font-semibold text-zinc-100">Permission denied</div>
        <div className="mt-1 text-sm text-zinc-400">Your current role can’t access packages.</div>
      </div>
    );
  }

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PackageStatus | "All">("All");
  const [bidType, setBidType] = useState<BidPackage["bid_type"] | "All">("All");
  const [activeRow, setActiveRow] = useState(0);

  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    return packages
      .filter((p) => (status === "All" ? true : p.status === status))
      .filter((p) => (bidType === "All" ? true : p.bid_type === bidType))
      .filter((p) => {
        if (!s) return true;
        return (
          p.trade.toLowerCase().includes(s) ||
          p.package_name.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s) ||
          p.scope_version.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => {
        const rank: Record<PackageStatus, number> = {
          Leveling: 0,
          Clarifications: 1,
          Intake: 2,
          Ready: 3,
          Awarded: 4,
        };
        return rank[a.status] - rank[b.status];
      });
  }, [packages, q, status, bidType]);

  useEffect(() => {
    if (activeRow >= data.length) setActiveRow(Math.max(0, data.length - 1));
  }, [data.length, activeRow]);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  if (error) {
    return (
      <div className={cn("rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-5", className)}>
        <div className="text-sm font-semibold text-zinc-100">Unable to load packages</div>
        <div className="mt-1 text-sm text-zinc-400">{error}</div>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    // Updated: h-full min-h-0 and flex-col
    <section className={cn("flex flex-col h-full min-h-0 rounded-2xl border border-zinc-800/70 bg-zinc-950/40", className)}>
      {/* Toolbar (optional) */}
      {showHeader ? (
        <div className="shrink-0 flex flex-col gap-3 border-b border-zinc-800/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-100">Packages</div>
              <div className="mt-1 text-[12px] text-zinc-500">
                Filter by trade/status/type. <span className="text-zinc-400">Enter</span> opens the package workspace.
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search trade, name, scope version, ID…"
                className={cn(
                  "h-9 w-full sm:w-70 lg:w-[320px]",
                  "rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200",
                  "placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-400/20",
                )}
                aria-label="Search packages"
              />

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={cn(
                    "h-9 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200",
                    "focus:outline-none focus:ring-2 focus:ring-teal-400/20",
                  )}
                  aria-label="Filter by status"
                >
                  <option value="All">All statuses</option>
                  <option value="Intake">Intake</option>
                  <option value="Leveling">Leveling</option>
                  <option value="Clarifications">Clarifications</option>
                  <option value="Ready">Ready</option>
                  <option value="Awarded">Awarded</option>
                </select>

                <select
                  value={bidType}
                  onChange={(e) => setBidType(e.target.value as any)}
                  className={cn(
                    "h-9 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200",
                    "focus:outline-none focus:ring-2 focus:ring-teal-400/20",
                  )}
                  aria-label="Filter by bid type"
                >
                  <option value="All">All types</option>
                  <option value="Hard Bid">Hard Bid</option>
                  <option value="GMP">GMP</option>
                  <option value="Budget">Budget</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQ("");
                    setStatus("All");
                    setBidType("All");
                  }}
                >
                  Clear
                </Button>

                {/* NEW: Import Button */}
                <div className="mx-1 h-6 w-px bg-zinc-800" />
                <Button variant="secondary" size="sm" onClick={() => setIsImportOpen(true)}>
                    Import CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Column header row */}
      {/* Updated: shrink-0 */}
      <div className="shrink-0 grid grid-cols-12 gap-0 border-b border-zinc-800/70 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        <div className="col-span-6">Package</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Bid Type</div>
        <div className="col-span-1 text-right">Bids</div>
        <div className="col-span-1 text-right">Est.</div>
      </div>

      {/* Body */}
      {/* Updated: flex-1 min-h-0 */}
      <div
        ref={parentRef}
        className={cn(
          "flex-1 min-h-0 overflow-auto",
          "focus:outline-none focus:ring-2 focus:ring-teal-400/15",
        )}
        tabIndex={0}
        role="grid"
        aria-label="Packages table"
        onKeyDown={(e) => {
          if (loading) return;
          if (data.length === 0) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = Math.min(data.length - 1, activeRow + 1);
            setActiveRow(next);
            rowVirtualizer.scrollToIndex(next, { align: "auto" });
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            const next = Math.max(0, activeRow - 1);
            setActiveRow(next);
            rowVirtualizer.scrollToIndex(next, { align: "auto" });
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const pkg = data[activeRow];
            if (pkg) router.push(`/projects/${projectId}/packages/${pkg.id}/leveling`);
          }
        }}
      >
        {loading ? (
          <div className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-3 rounded-xl border border-zinc-900/70 bg-zinc-950/20 p-3"
                >
                  <Skeleton className="col-span-6 h-12" />
                  <Skeleton className="col-span-2 h-12" />
                  <Skeleton className="col-span-2 h-12" />
                  <Skeleton className="col-span-1 h-12" />
                  <Skeleton className="col-span-1 h-12" />
                </div>
              ))}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-6">
            <div className="text-sm font-semibold text-zinc-100">No packages match your filters</div>
            <div className="mt-1 text-sm text-zinc-400">
              In a live system you’d adjust scope version, request bids, or change trade filters.
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQ("");
                  setStatus("All");
                  setBidType("All");
                }}
              >
                Reset filters
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
            {rowVirtualizer.getVirtualItems().map((v) => {
              const pkg = data[v.index];
              const selected = v.index === activeRow;

              return (
                <div
                  key={pkg.id}
                  className="absolute left-0 right-0"
                  style={{
                    transform: `translateY(${v.start}px)`,
                    height: v.size,
                  }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActiveRow(v.index)}
                    onClick={() => router.push(`/projects/${projectId}/packages/${pkg.id}/leveling`)}
                    className={cn(
                      "relative flex h-full w-full items-center px-4 text-left",
                      "border-b border-zinc-900/70",
                      "hover:bg-zinc-900/20 focus:outline-none focus:ring-2 focus:ring-teal-400/15",
                      selected && "bg-teal-500/6",
                    )}
                  >
                    {/* left accent */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full w-075 transition",
                        selected ? "bg-teal-400/70" : "bg-transparent",
                      )}
                    />

                    {/* content grid */}
                    <div className="grid w-full grid-cols-12 items-center gap-3">
                      <div className="col-span-6 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", selected ? "bg-teal-400/80" : "bg-zinc-700")} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-zinc-100">
                              {pkg.trade} — {pkg.package_name}
                            </div>
                            <div className="truncate text-[12px] text-zinc-400">
                              {pkg.id} • Scope <span className="text-zinc-300">{pkg.scope_version}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] ring-1 ring-inset",
                            statusStyle(pkg.status),
                          )}
                        >
                          {pkg.status}
                        </span>
                      </div>

                      <div className="col-span-2 text-[13px] text-zinc-200">{pkg.bid_type}</div>

                      <div className="col-span-1 text-right font-mono text-[13px] tabular-nums text-zinc-200">
                        {pkg.bid_count}
                      </div>

                      <div className="col-span-1 text-right font-mono text-[13px] tabular-nums text-zinc-200">
                        {fmtMoney(pkg.estimated_value)}
                      </div>
                    </div>

                    {/* hint overlay (does NOT affect row height) */}
                    {selected ? (
                      <div className="pointer-events-none absolute bottom-2 left-4 flex items-center gap-2 text-[11px] text-zinc-500">
                        <span>Press</span>
                        <span className="rounded border border-zinc-800/70 bg-zinc-900/60 px-1.5 py-0.5 text-zinc-400">
                          Enter
                        </span>
                        <span>•</span>
                        <span className="rounded border border-zinc-800/70 bg-zinc-900/60 px-1.5 py-0.5 text-zinc-400">
                          ↑
                        </span>
                        <span className="rounded border border-zinc-800/70 bg-zinc-900/60 px-1.5 py-0.5 text-zinc-400">
                          ↓
                        </span>
                      </div>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* Updated: shrink-0 */}
      <div className="shrink-0 flex items-center justify-between border-t border-zinc-800/70 px-4 py-3 text-[12px] text-zinc-500">
        <div>
          Showing <span className="text-zinc-300">{data.length}</span> of{" "}
          <span className="text-zinc-300">{packages.length}</span>
        </div>
        <div className="hidden md:block">Virtualized rows • Keyboard operable</div>
      </div>

      {/* NEW: Import Modal */}
      <ImportWizard isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </section>
  );
}