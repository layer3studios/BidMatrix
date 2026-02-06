"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { BidPackage } from "@/lib/data/models";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app.store";
import { can } from "@/lib/permissions/roles";

type PackageStatus = BidPackage["status"];

function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
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
}: {
  projectId: string;
  packages: BidPackage[];
  loading?: boolean;
  error?: string | null;
}) {
  const router = useRouter();
  const role = useAppStore((s) => s.role);

  // Permissions: estimator/executive/viewer can all view; only estimator can "edit" later.
  const canView = can(role, "exports.generate");
  if (!canView) {
    return (
      <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-5">
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
        // enterprise-ish default: prioritize "work in progress"
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
    estimateSize: () => 64,
    overscan: 10,
  });

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-5">
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
    <section className="rounded-xl border border-zinc-800/70 bg-zinc-950/40">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-zinc-800/70 p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-100">Packages</div>
          <div className="text-[12px] text-zinc-500">
            Filter by trade/status/type. Enter opens the package workspace.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search trade, name, scope version, ID…"
            className="h-9 w-75 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            aria-label="Search packages"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-9 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none"
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
            className="h-9 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none"
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
        </div>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-12 gap-0 border-b border-zinc-800/70 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        <div className="col-span-5">Package</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Bid Type</div>
        <div className="col-span-1 text-right">Bids</div>
        <div className="col-span-2 text-right">Est. Value</div>
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="h-130 overflow-auto"
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
                  className="grid grid-cols-12 gap-3 rounded-lg border border-zinc-900/70 bg-zinc-950/20 p-3"
                >
                  <Skeleton className="col-span-5 h-11" />
                  <Skeleton className="col-span-2 h-11" />
                  <Skeleton className="col-span-2 h-11" />
                  <Skeleton className="col-span-1 h-11" />
                  <Skeleton className="col-span-2 h-11" />
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
                  className={cn("absolute left-0 right-0 px-4", selected && "bg-teal-500/5")}
                  style={{ transform: `translateY(${v.start}px)` }}
                >
                  <button
                    type="button"
                    className={cn(
                      "group my-1 w-full rounded-lg border border-zinc-900/70 bg-zinc-950/20 p-3 text-left",
                      "hover:bg-zinc-900/30 hover:ring-1 hover:ring-zinc-800/70",
                      selected && "ring-1 ring-teal-400/25",
                    )}
                    onMouseEnter={() => setActiveRow(v.index)}
                    onClick={() => router.push(`/projects/${projectId}/packages/${pkg.id}/leveling`)}
                  >
                    <div className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-5 min-w-0">
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

                      <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-zinc-200">
                        {fmtMoney(pkg.estimated_value)}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[11px] text-zinc-500">
                        Press{" "}
                        <span className="rounded border border-zinc-800/70 bg-zinc-950/60 px-1.5 py-0.5 text-zinc-400">
                          Enter
                        </span>{" "}
                        to open • Use{" "}
                        <span className="rounded border border-zinc-800/70 bg-zinc-950/60 px-1.5 py-0.5 text-zinc-400">
                          ↑
                        </span>{" "}
                        <span className="rounded border border-zinc-800/70 bg-zinc-950/60 px-1.5 py-0.5 text-zinc-400">
                          ↓
                        </span>{" "}
                        to navigate
                      </div>
                      <div className="text-[11px] text-zinc-500 opacity-0 transition group-hover:opacity-100">
                        Open leveling →
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800/70 px-4 py-3 text-[12px] text-zinc-500">
        <div>
          Showing <span className="text-zinc-300">{data.length}</span> of{" "}
          <span className="text-zinc-300">{packages.length}</span>
        </div>
        <div className="hidden md:block">Virtualized rows • Keyboard operable</div>
      </div>
    </section>
  );
}
