"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/store/project.store";
import { cn } from "@/lib/utils/cn";

export function VendorStats() {
  const vendors = useProjectStore((s) => s.vendors);

  const stats = useMemo(() => {
    const total = vendors.length;
    const highRisk = vendors.filter(v => v.risk_flags.length > 0).length;
    const preferred = vendors.filter(v => v.tier === "Preferred").length;
    const avgEmr = vendors.reduce((acc, v) => acc + v.safety_emr, 0) / total;

    return { total, highRisk, preferred, avgEmr: avgEmr.toFixed(2) };
  }, [vendors]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Vendors" value={stats.total.toString()} trend="+3 this month" />
      <StatCard 
        label="Compliance Risks" 
        value={stats.highRisk.toString()} 
        trend="Requires attention" 
        trendColor="text-rose-400" 
        valueColor="text-rose-100"
      />
      <StatCard label="Preferred Partners" value={stats.preferred.toString()} trend={`${Math.round(stats.preferred/stats.total*100)}% of database`} />
      <StatCard 
        label="Avg Safety EMR" 
        value={stats.avgEmr} 
        trend="Industry avg: 1.0" 
        valueColor={Number(stats.avgEmr) < 1.0 ? "text-emerald-400" : "text-amber-400"}
      />
    </div>
  );
}

function StatCard({ label, value, trend, trendColor = "text-zinc-500", valueColor = "text-zinc-100" }: any) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold", valueColor)}>{value}</div>
      <div className={cn("mt-1 text-[11px]", trendColor)}>{trend}</div>
    </div>
  );
}