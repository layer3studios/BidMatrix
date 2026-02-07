"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

function getMockScope(id: string) {
  // deterministic mock
  return {
    description: "Provide and install all HVAC ductwork as per sheet M-402 details 1-4. Includes hangers, sealing, and testing.",
    inclusions: [
       "Galvanized sheet metal per SMACNA",
       "Flexible duct connectors < 5ft",
       "Manual volume dampers"
    ],
    bidderNotes: id.includes("012") ? "Excluded seismic bracing." : id.includes("028") ? "Includes alternate for spiral duct." : "Per plans and specs.",
    variance: id.includes("012") ? "exclusion" : id.includes("028") ? "alternate" : "clean"
  };
}

export function ScopeDetail({ scopeId, bidderId }: { scopeId: string; bidderId?: string }) {
  const data = useMemo(() => getMockScope(bidderId || "base"), [bidderId]);

  return (
    <div className="space-y-6">
       <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
          <div className="text-[10px] uppercase text-zinc-500 mb-1">Base Scope Description</div>
          <div className="text-sm text-zinc-200 leading-relaxed">
             {data.description}
          </div>
       </div>

       {bidderId && (
           <div className={cn(
               "rounded-lg border p-3",
               data.variance === "exclusion" ? "border-rose-900/50 bg-rose-950/10" :
               data.variance === "alternate" ? "border-sky-900/50 bg-sky-950/10" : "border-zinc-800 bg-zinc-900/20"
           )}>
               <div className="flex items-center justify-between mb-1">
                   <div className="text-[10px] uppercase text-zinc-500">Bidder Note ({bidderId})</div>
                   {data.variance !== "clean" && (
                       <span className={cn(
                           "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                           data.variance === "exclusion" ? "bg-rose-500/20 text-rose-300" : "bg-sky-500/20 text-sky-300"
                       )}>
                           {data.variance}
                       </span>
                   )}
               </div>
               <div className="text-sm font-medium text-zinc-100">
                   "{data.bidderNotes}"
               </div>
           </div>
       )}

       <div>
           <div className="text-[10px] uppercase text-zinc-500 mb-2">Required Inclusions</div>
           <ul className="space-y-2">
               {data.inclusions.map((inc, i) => (
                   <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                       <span className="text-teal-500/50 mt-1">✓</span>
                       {inc}
                   </li>
               ))}
           </ul>
       </div>
    </div>
  );
}