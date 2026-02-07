"use client";

import React, { useMemo, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useProjectStore } from "@/store/project.store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import type { Vendor, VendorTier } from "@/lib/data/models";
// Import new components
import { VendorDrawer } from "./VendorDrawer";
import { AddVendorModal } from "./AddVendorModal";

const fmtMoney = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const tierStyle = (t: VendorTier) => {
  switch (t) {
    case "Preferred": return "bg-teal-500/10 text-teal-400 ring-teal-500/30";
    case "Approved": return "bg-sky-500/10 text-sky-400 ring-sky-500/30";
    case "New": return "bg-indigo-500/10 text-indigo-400 ring-indigo-500/30";
    case "Watch": return "bg-amber-500/10 text-amber-400 ring-amber-500/30";
  }
};

export function VendorsTable() {
  const vendors = useProjectStore((s) => s.vendors);
  
  // Interactive State
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filters
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState<VendorTier | "All">("All");
  const [riskFilter, setRiskFilter] = useState(false);

  // Sorting
  const [sortCol, setSortCol] = useState<keyof Vendor | "risk">("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & Sort Logic
  const data = useMemo(() => {
    let d = vendors.filter(v => 
        (tierFilter === "All" || v.tier === tierFilter) &&
        (!riskFilter || v.risk_flags.length > 0) &&
        (v.name.toLowerCase().includes(q.toLowerCase()) || v.id.toLowerCase().includes(q.toLowerCase()))
    );

    return d.sort((a, b) => {
        let valA: any = a[sortCol as keyof Vendor];
        let valB: any = b[sortCol as keyof Vendor];

        if (sortCol === "risk") {
            valA = a.risk_flags.length;
            valB = b.risk_flags.length;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });
  }, [vendors, q, tierFilter, riskFilter, sortCol, sortAsc]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const handleSort = (col: keyof Vendor | "risk") => {
      if (sortCol === col) setSortAsc(!sortAsc);
      else { setSortCol(col); setSortAsc(true); }
  };

  return (
    <>
    <div className="flex h-full flex-col rounded-xl border border-zinc-800/70 bg-zinc-950/40">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/70 p-4">
        <div className="flex items-center gap-3">
            <input 
                value={q} onChange={e => setQ(e.target.value)} 
                placeholder="Search vendors..." 
                className="h-9 w-64 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <div className="h-6 w-px bg-zinc-800" />
            <div className="flex gap-2">
                {(["All", "Preferred", "Approved", "Watch"] as const).map(t => (
                    <button 
                        key={t} 
                        onClick={() => setTierFilter(t)}
                        className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                            tierFilter === t ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer hover:text-zinc-200">
                <input type="checkbox" checked={riskFilter} onChange={e => setRiskFilter(e.target.checked)} className="rounded border-zinc-800 bg-zinc-900 accent-rose-500" />
                Show Risk Only
            </label>
            {/* Opens Modal */}
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>+ Add Vendor</Button>
        </div>
      </div>

      {/* Header */}
      <div className="grid shrink-0 grid-cols-12 gap-4 border-b border-zinc-800/70 bg-zinc-950/50 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        <div className="col-span-4 cursor-pointer hover:text-zinc-300" onClick={() => handleSort("name")}>Company / ID</div>
        <div className="col-span-2 cursor-pointer hover:text-zinc-300" onClick={() => handleSort("tier")}>Tier</div>
        <div className="col-span-2 text-right cursor-pointer hover:text-zinc-300" onClick={() => handleSort("safety_emr")}>Safety EMR</div>
        <div className="col-span-2 text-right cursor-pointer hover:text-zinc-300" onClick={() => handleSort("bonding_limit")}>Bonding Cap</div>
        <div className="col-span-2 text-right cursor-pointer hover:text-zinc-300" onClick={() => handleSort("risk")}>Risk Signals</div>
      </div>

      {/* Rows */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
            {rowVirtualizer.getVirtualItems().map((vRow) => {
                const v = data[vRow.index];
                return (
                    <div 
                        key={v.id} 
                        style={{ transform: `translateY(${vRow.start}px)`, height: vRow.size }} 
                        onClick={() => setSelectedVendorId(v.id)} // OPENS DRAWER
                        className="absolute left-0 right-0 grid grid-cols-12 gap-4 border-b border-zinc-800/40 px-6 py-3 transition-colors hover:bg-zinc-900/60 cursor-pointer"
                    >
                        {/* Company Info */}
                        <div className="col-span-4 min-w-0">
                            <div className="truncate text-sm font-medium text-zinc-200">{v.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono text-zinc-500">{v.id}</span>
                                <span className="text-[11px] text-zinc-600">•</span>
                                <span className="truncate text-[11px] text-zinc-500">{v.regions.join(", ")}</span>
                            </div>
                        </div>

                        {/* Tier */}
                        <div className="col-span-2 flex items-center">
                            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset", tierStyle(v.tier))}>
                                {v.tier}
                            </span>
                        </div>

                        {/* Safety EMR */}
                        <div className="col-span-2 flex flex-col justify-center text-right">
                            <div className={cn("text-sm font-mono", v.safety_emr > 1.0 ? "text-amber-400" : "text-zinc-300")}>
                                {v.safety_emr.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-zinc-600">Target: &lt;1.0</div>
                        </div>

                        {/* Bonding */}
                        <div className="col-span-2 flex flex-col justify-center text-right">
                            <div className="text-sm font-mono text-zinc-300">{fmtMoney(v.bonding_limit)}</div>
                            <div className="text-[10px] text-zinc-600">Single Limit</div>
                        </div>

                        {/* Risk Flags */}
                        <div className="col-span-2 flex flex-col items-end justify-center gap-1">
                            {v.risk_flags.length > 0 ? (
                                v.risk_flags.slice(0, 2).map((flag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 rounded bg-rose-950/30 px-1.5 py-0.5 text-[10px] text-rose-300 ring-1 ring-rose-900/50">
                                        ⚠️ {flag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[11px] text-zinc-600">No flags</span>
                            )}
                            {v.risk_flags.length > 2 && (
                                <span className="text-[9px] text-zinc-500">+{v.risk_flags.length - 2} more</span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>

    {/* DIALOGS */}
    <VendorDrawer vendorId={selectedVendorId} onClose={() => setSelectedVendorId(null)} />
    <AddVendorModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
}