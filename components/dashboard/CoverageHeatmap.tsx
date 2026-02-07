"use client";

import { useProjectStore } from "@/store/project.store";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

export function CoverageHeatmap() {
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);
  const packages = useProjectStore((s) => s.packages);

  // We limit to top 5 most recent projects for the dashboard view
  const activeProjects = projects.slice(0, 5);
  
  // The trades we want to monitor
  const trades = ["Concrete", "Steel", "MEP", "Drywall", "Finishes"];

  return (
    <div className="h-full flex flex-col">
        <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Bid Coverage Map</div>
            <div className="text-[10px] text-zinc-500">Live bid counts</div>
        </div>
        
        <div className="flex-1 grid" style={{ gridTemplateColumns: `auto repeat(${activeProjects.length}, 1fr)` }}>
            {/* Header Row */}
            <div />
            {activeProjects.map(p => (
                <div key={p.id} className="text-[10px] font-medium text-zinc-400 text-center truncate px-1 border-b border-zinc-800 pb-2">
                    {p.name.split(" ")[0]}
                </div>
            ))}

            {/* Data Rows */}
            {trades.map(trade => (
                <div key={trade} className="contents group">
                    <div className="text-[11px] font-medium text-zinc-500 py-2 border-b border-zinc-800/50 flex items-center">
                        {trade}
                    </div>
                    {activeProjects.map(p => {
                        // ACTUAL DATA LOOKUP: Find a package matching this project & trade
                        const pkg = packages.find(pk => pk.projectId === p.id && pk.trade.includes(trade));
                        
                        // If no package exists for this trade, it's a "Gap" (0)
                        // If package exists, use its real bid_count
                        const count = pkg ? pkg.bid_count : 0;
                        
                        return (
                            <div key={`${p.id}-${trade}`} className="border-b border-zinc-800/50 p-1">
                                <button 
                                    onClick={() => {
                                        if (pkg) router.push(`/projects/${p.id}/packages/${pkg.id}/leveling`);
                                        else router.push(`/projects/${p.id}/packages`); // Go to list if no package yet
                                    }}
                                    className={cn(
                                        "h-full w-full rounded flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 active:scale-95",
                                        count === 0 ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" :
                                        count < 3 ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" :
                                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                    )}
                                    title={pkg ? `${pkg.package_name}: ${count} bids` : "No package created yet"}
                                >
                                    {count === 0 ? "!" : count}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    </div>
  );
}