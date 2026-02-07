"use client";

import { useProjectStore } from "@/store/project.store";
import { useMemo } from "react";

export function BidderActivityTemplate({ projectId }: { projectId: string }) {
  // FIX: Select stable full lists
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const allPackages = useProjectStore((s) => s.packages);
  const vendors = useProjectStore((s) => s.vendors);

  // FIX: Filter in useMemo
  const packages = useMemo(() => {
    return allPackages.filter((p) => p.projectId === projectId);
  }, [allPackages, projectId]);

  if (!project) return null;

  return (
    <div className="w-full bg-white text-zinc-900 p-10 min-h-250 text-sm font-serif">
       <div className="text-center mb-10">
           <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
           <div className="text-zinc-500 uppercase tracking-widest text-xs">Bidder Activity Report</div>
       </div>

       <div className="space-y-8">
           {packages.map(pkg => (
               <div key={pkg.id} className="break-inside-avoid">
                   <div className="flex items-baseline justify-between border-b-2 border-zinc-100 pb-2 mb-3">
                       <h3 className="font-bold text-lg font-sans">{pkg.trade} <span className="font-normal text-zinc-400">/ {pkg.package_name}</span></h3>
                       <div className="text-xs font-mono text-zinc-500">{pkg.id}</div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <div className="bg-zinc-50 p-3 rounded">
                           <div className="text-[10px] uppercase text-zinc-400 font-sans font-bold">Scope Version</div>
                           <div className="font-mono">{pkg.scope_version}</div>
                       </div>
                       <div className="bg-zinc-50 p-3 rounded">
                           <div className="text-[10px] uppercase text-zinc-400 font-sans font-bold">Coverage</div>
                           <div className={`font-bold ${pkg.bid_count < 3 ? "text-red-600" : "text-green-700"}`}>
                               {pkg.bid_count} Bids Received
                           </div>
                       </div>
                   </div>

                   <div className="mt-3">
                       <div className="text-[10px] uppercase text-zinc-400 font-sans font-bold mb-2">Invited Bidders</div>
                       <div className="space-y-1">
                           {vendors.slice(0, pkg.bid_count + 1).map((v, i) => (
                               <div key={v.id} className="flex justify-between items-center text-xs py-1 border-b border-zinc-50 last:border-0">
                                   <span className="font-medium">{v.name}</span>
                                   <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${i < pkg.bid_count ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-500"}`}>
                                       {i < pkg.bid_count ? "Submitted" : "No Response"}
                                   </span>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
}