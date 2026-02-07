"use client";

import { useProjectStore } from "@/store/project.store";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

export function RiskFeed() {
  const router = useRouter();
  const vendors = useProjectStore((s) => s.vendors);
  const packages = useProjectStore((s) => s.packages);
  
  // 1. Vendor Risks: Expired Insurance or High EMR
  const vendorRisks = vendors
    .filter(v => v.risk_flags.length > 0 || v.safety_emr > 1.2)
    .map(v => ({
        type: "vendor",
        id: v.id,
        title: `Vendor Risk: ${v.name}`,
        desc: v.risk_flags[0] || `Safety EMR High (${v.safety_emr})`,
        severity: "high",
        link: "/vendors" // Ideally deep link, but page link works for now
    }));

  // 2. Project Risks: Low Coverage packages
  const packageRisks = packages
    .filter(p => p.bid_count < 3 && p.status === "Leveling")
    .map(p => ({
        type: "coverage",
        id: p.id,
        title: `Low Coverage: ${p.trade}`,
        desc: `Only ${p.bid_count} bids received. Due soon.`,
        severity: "medium",
        link: `/projects/${p.projectId}/packages/${p.id}/leveling`
    }));

  // Combined Feed
  const feed = [...vendorRisks, ...packageRisks].sort(() => Math.random() - 0.5);

  return (
    <div className="h-full flex flex-col">
        <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Critical Alerts</div>
            <div className="text-[10px] text-rose-400 animate-pulse">{feed.length} Issues</div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {feed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                    <span className="text-xl mb-2">✅</span>
                    All systems normal
                </div>
            ) : (
                feed.map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => router.push(item.link)}
                        className="w-full text-left flex gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors group"
                    >
                        <div className={cn(
                            "mt-1 h-2 w-2 rounded-full shrink-0",
                            item.severity === "high" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-amber-500"
                        )} />
                        <div>
                            <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{item.title}</div>
                            <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">{item.desc}</div>
                        </div>
                    </button>
                ))
            )}
        </div>
    </div>
  );
}