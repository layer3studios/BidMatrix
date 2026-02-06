"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { Project, ProjectStatus } from "@/lib/data/models";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app.store";
import { can } from "@/lib/permissions/roles";

function fmtMoney(n: number) {
  // UI-only: simple, fast, readable
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function statusPill(status: ProjectStatus) {
  const map: Record<ProjectStatus, string> = {
    Bidding: "bg-sky-500/10 text-sky-100 ring-sky-400/25",
    Leveling: "bg-teal-500/10 text-teal-100 ring-teal-400/25",
    Awarding: "bg-amber-500/10 text-amber-100 ring-amber-400/25",
    Complete: "bg-zinc-500/10 text-zinc-100 ring-zinc-400/25",
  };
  return map[status];
}

type Props = {
  projects: Project[];
  loading?: boolean;
  error?: string | null;
};

export function ProjectsTable({ projects, loading, error }: Props) {
  const router = useRouter();
  const role = useAppStore((s) => s.role);

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [sorting, setSorting] = useState<SortingState>([{ id: "last_updated", desc: true }]);

  const data = useMemo(() => {
    const s = globalFilter.trim().toLowerCase();
    return projects
      .filter((p) => (statusFilter === "All" ? true : p.status === statusFilter))
      .filter((p) => {
        if (!s) return true;
        return (
          p.name.toLowerCase().includes(s) ||
          p.client.toLowerCase().includes(s) ||
          p.location.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s)
        );
      });
  }, [projects, globalFilter, statusFilter]);

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-100">{p.name}</div>
              <div className="truncate text-[12px] text-zinc-400">
                {p.client} • {p.location}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 140,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-3 text-[12px] ring-1 ring-inset",
                statusPill(s),
              )}
            >
              {s}
            </span>
          );
        },
      },
      {
        accessorKey: "delivery_method",
        header: "Delivery",
        size: 140,
        cell: ({ row }) => (
          <span className="text-[13px] text-zinc-200">{row.original.delivery_method}</span>
        ),
      },
      {
        accessorKey: "bid_due_date",
        header: "Bid Due",
        size: 140,
        cell: ({ row }) => <span className="text-[13px] text-zinc-200">{row.original.bid_due_date}</span>,
      },
      {
        accessorKey: "budget_target",
        header: "Budget Target",
        size: 170,
        cell: ({ row }) => (
          <span className="font-mono text-[13px] tabular-nums text-zinc-200">
            {fmtMoney(row.original.budget_target)}
          </span>
        ),
      },
      {
        accessorKey: "last_updated",
        header: "Last Updated",
        size: 170,
        cell: ({ row }) => (
          <span className="text-[13px] text-zinc-300">{new Date(row.original.last_updated).toISOString().slice(0, 10)}</span>
        ),
        sortingFn: "alphanumeric",
      },
      {
        id: "actions",
        header: "",
        size: 120,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Link
                href={`/projects/${p.id}/overview`}
                className="rounded-md px-2 py-1 text-[12px] text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100"
              >
                Open
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: false,
  });

  // Virtualization
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rows = table.getRowModel().rows;

const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 95, // closer to reality
  overscan: 10,
});


  // Keyboard focus/selection
  const [activeRow, setActiveRow] = useState<number>(0);

  useEffect(() => {
    if (activeRow >= rows.length) setActiveRow(Math.max(0, rows.length - 1));
  }, [rows.length, activeRow]);

  const permissionToOpen = can(role, "exports.generate"); // any permission is fine for demo gating
  if (!permissionToOpen) {
    return (
      <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-5">
        <div className="text-sm font-semibold text-zinc-100">Permission denied</div>
        <div className="mt-1 text-sm text-zinc-400">
          Your current role can’t access the Projects workspace.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-5">
        <div className="text-sm font-semibold text-zinc-100">Unable to load projects</div>
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
          <div className="text-sm font-semibold text-zinc-100">Projects</div>
          <div className="text-[12px] text-zinc-500">
            Portfolio-level view. Dense data, sortable, keyboard operable.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search name, client, location, ID…"
            className="h-9 w-70 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            aria-label="Search projects"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Bidding">Bidding</option>
            <option value="Leveling">Leveling</option>
            <option value="Awarding">Awarding</option>
            <option value="Complete">Complete</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGlobalFilter("");
              setStatusFilter("All");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="relative">
        <div className="grid grid-cols-12 gap-0 border-b border-zinc-800/70 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          <div className="col-span-5">Project</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Delivery</div>
          <div className="col-span-1">Bid Due</div>
          <div className="col-span-2 text-right">Budget Target</div>
          <div className="col-span-1 text-right">Updated</div>
        </div>

        <div
          ref={parentRef}
          className="h-130 overflow-auto"
          tabIndex={0}
          role="grid"
          aria-label="Projects table"
          onKeyDown={(e) => {
            if (loading) return;
            if (rows.length === 0) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveRow((v) => Math.min(rows.length - 1, v + 1));
              rowVirtualizer.scrollToIndex(Math.min(rows.length - 1, activeRow + 1), { align: "auto" });
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveRow((v) => Math.max(0, v - 1));
              rowVirtualizer.scrollToIndex(Math.max(0, activeRow - 1), { align: "auto" });
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const p = rows[activeRow]?.original;
              if (p) router.push(`/projects/${p.id}/overview`);
            }
          }}
        >
          {loading ? (
            <div className="p-4">
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 rounded-lg border border-zinc-900/70 bg-zinc-950/20 p-3">
                    <Skeleton className="col-span-5 h-10" />
                    <Skeleton className="col-span-2 h-10" />
                    <Skeleton className="col-span-1 h-10" />
                    <Skeleton className="col-span-1 h-10" />
                    <Skeleton className="col-span-2 h-10" />
                    <Skeleton className="col-span-1 h-10" />
                  </div>
                ))}
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <div className="text-sm font-semibold text-zinc-100">No projects match your filters</div>
              <div className="mt-1 text-sm text-zinc-400">
                Clear filters or broaden the search. In a real system, you’d request access or import projects.
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setGlobalFilter(""); setStatusFilter("All"); }}>
                  Reset filters
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{ height: rowVirtualizer.getTotalSize() }}
              className="relative"
            >
             {rowVirtualizer.getVirtualItems().map((virtualRow) => {
  const row = rows[virtualRow.index];
  const p = row.original;
  const selected = virtualRow.index === activeRow;

  return (
    <div
      key={row.id}
      ref={rowVirtualizer.measureElement}
      role="row"
      aria-rowindex={virtualRow.index + 1}
      className="absolute left-0 right-0 px-4"
      style={{
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      {/* spacing belongs OUTSIDE the button, not via margins */}
      <div className="py-1.5">
        <button
          type="button"
          className={cn(
            "group w-full rounded-lg border border-zinc-900/70 bg-zinc-950/20 p-3 text-left",
            "hover:bg-zinc-900/30 hover:ring-1 hover:ring-zinc-800/70",
            selected && "ring-1 ring-teal-400/25 bg-teal-500/5",
          )}
          onMouseEnter={() => setActiveRow(virtualRow.index)}
          onClick={() => router.push(`/projects/${p.id}/overview`)}
        >
          <div className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-5 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", selected ? "bg-teal-400/80" : "bg-zinc-700")} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-100">{p.name}</div>
                  <div className="truncate text-[12px] text-zinc-400">
                    {p.client} • {p.location} • <span className="text-zinc-500">{p.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <span className={cn("inline-flex items-center rounded-full -mx-3  px-2.5 py-1 text-[12px] ring-1 ring-inset", statusPill(p.status))}>
                {p.status}
              </span>
            </div>

            <div className="col-span-1 text-[13px] text-zinc-200">{p.delivery_method}</div>
            <div className="col-span-1 text-[13px] text-zinc-200">{p.bid_due_date}</div>

            <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-zinc-200">
              {fmtMoney(p.budget_target)}
            </div>

            <div className="col-span-1 text-right text-[12px] text-zinc-400">
              {new Date(p.last_updated).toISOString().slice(0, 10)}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-zinc-500">
              Press <span className="rounded border border-zinc-800/70 bg-zinc-950/60 px-1.5 py-0.5 text-zinc-400">Enter</span> to open •
              Use <span className="rounded border border-zinc-800/70 bg-zinc-950/60 px-1.5 py-0.5 text-zinc-400">↑</span>
              <span className="mx-1 rounded border border-zinc-800/70 bg-zinc-950/60 px-1.5 py-0.5 text-zinc-400">↓</span>
              to navigate
            </div>
            <div className="text-[11px] text-zinc-500 opacity-0 transition group-hover:opacity-100">
              Open overview →
            </div>
          </div>
        </button>
      </div>
    </div>
  );
})}

            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800/70 px-4 py-3 text-[12px] text-zinc-500">
        <div>
          Showing <span className="text-zinc-300">{data.length}</span> of{" "}
          <span className="text-zinc-300">{projects.length}</span>
        </div>
        <div className="hidden md:block">
          Sorting enabled • Virtualized rows • No backend
        </div>
      </div>
    </section>
  );
}
