"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

// We mock data deterministically based on ID to make it feel persistent
function getMockProfile(id: string) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tier = ["Preferred", "Approved", "Watchlist", "New"][hash % 4];
  const riskScore = 80 + (hash % 20); // 80-99
  const trades = ["HVAC", "Plumbing", "Electrical", "Concrete", "Steel"][hash % 5];
  
  return {
    name: `Vendor ${id.split("-")[1]} Construction`,
    contact: `estimating@vendor${id.split("-")[1]}.com`,
    phone: `(512) 555-0${hash % 100}`,
    tier,
    riskScore,
    trades,
    flags: hash % 3 === 0 ? ["Insurance Expiring < 30d", "High Project Load"] : [],
    capacity: hash % 2 === 0 ? "High" : "Limited",
  };
}

export function BidderProfile({ bidderId }: { bidderId: string }) {
  const profile = useMemo(() => getMockProfile(bidderId), [bidderId]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-zinc-100">{profile.name}</div>
            <div className="text-sm text-zinc-400">{profile.trades} • {profile.contact}</div>
          </div>
          <div className={cn(
            "rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wider",
            profile.tier === "Preferred" ? "bg-teal-500/20 text-teal-300" :
            profile.tier === "Watchlist" ? "bg-rose-500/20 text-rose-300" : "bg-zinc-700 text-zinc-300"
          )}>
            {profile.tier}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3">
           <div>
             <div className="text-[10px] uppercase text-zinc-500">Risk Score</div>
             <div className={cn("text-lg font-mono font-medium", profile.riskScore < 85 ? "text-amber-400" : "text-emerald-400")}>
               {profile.riskScore}
             </div>
           </div>
           <div>
             <div className="text-[10px] uppercase text-zinc-500">Capacity</div>
             <div className="text-sm text-zinc-200 mt-1">{profile.capacity}</div>
           </div>
           <div>
             <div className="text-[10px] uppercase text-zinc-500">Projects</div>
             <div className="text-sm text-zinc-200 mt-1">3 Active</div>
           </div>
        </div>
      </div>

      {/* Compliance / Flags */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Risk Signals</div>
        {profile.flags.length > 0 ? (
          <div className="space-y-2">
            {profile.flags.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-amber-900/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-200">
                <span className="text-amber-500">⚠️</span> {flag}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-zinc-800 bg-zinc-900/20 p-3 text-sm text-zinc-500">
            No active risk flags detected.
          </div>
        )}
      </div>

      {/* Recent Performance (Fake chart) */}
      <div>
         <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Bid History</div>
         <div className="h-24 w-full rounded border border-zinc-800 bg-zinc-900/40 p-2 flex items-end gap-1">
             {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                 <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-t bg-zinc-700 hover:bg-teal-500/50 transition-colors" />
             ))}
         </div>
         <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
             <span>Jan</span>
             <span>Current</span>
         </div>
      </div>
    </div>
  );
}