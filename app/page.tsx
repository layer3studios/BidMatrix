"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { ensureGsap } from "@/lib/motion/gsap";
import gsap from "gsap";

import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { CoverageHeatmap } from "@/components/dashboard/CoverageHeatmap";
import { RiskFeed } from "@/components/dashboard/RiskFeed";
import { useAppStore } from "@/store/app.store";
import { useProjectStore } from "@/store/project.store";

export default function DashboardPage() {
  const root = useRef<HTMLDivElement | null>(null);
  const user = useAppStore(s => s.role);
  const totalProjects = useProjectStore(s => s.projects.length);

  useEffect(() => {
    ensureGsap();
    if (!root.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div {...pageTransition} ref={root} className="h-full overflow-auto p-6">
      <div data-reveal className="mb-6 flex items-end justify-between">
        <div>
            <div className="text-2xl font-bold tracking-tight text-white">Executive Command Center</div>
            <div className="mt-1 text-sm text-zinc-400">
                Welcome back, {user}. Overview of {totalProjects} active projects.
            </div>
        </div>
        <div className="flex gap-2">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Live Data
            </span>
        </div>
      </div>

      <div className="grid grid-cols-12 grid-rows-[340px_minmax(300px,auto)] gap-6">
        
        {/* Main Chart */}
        <div data-reveal className="col-span-12 lg:col-span-8 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-6 shadow-sm">
          <PortfolioChart />
        </div>

        {/* Right Side: Risk Feed */}
        <div data-reveal className="col-span-12 lg:col-span-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-6 shadow-sm flex flex-col">
          <RiskFeed />
        </div>

        {/* Bottom Left: Heatmap */}
        <div data-reveal className="col-span-12 lg:col-span-7 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-6 shadow-sm">
          <CoverageHeatmap />
        </div>

        {/* Bottom Right: Approvals / Quick Actions */}
        <div data-reveal className="col-span-12 lg:col-span-5 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-6 shadow-sm">
           <div className="mb-4 flex items-center justify-between">
               <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Pending Approvals</div>
               <div className="text-[10px] text-zinc-600">3 waiting</div>
           </div>
           <div className="space-y-3">
               {[1,2,3].map(i => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group">
                       <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-teal-900/30 text-teal-400 flex items-center justify-center text-xs font-bold ring-1 ring-teal-500/20 group-hover:bg-teal-500 group-hover:text-black transition-colors">
                               {i === 1 ? "CA" : i === 2 ? "JS" : "MR"}
                           </div>
                           <div>
                               <div className="text-sm font-medium text-zinc-200">Award: {i === 1 ? "Concrete" : i === 2 ? "Steel" : "Glazing"}</div>
                               <div className="text-[11px] text-zinc-500">Riverview Medical • ${3 + i}.2M</div>
                           </div>
                       </div>
                       <button className="text-[10px] font-medium bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded hover:bg-teal-500 hover:text-black transition-colors">
                           Review
                       </button>
                   </div>
               ))}
           </div>
        </div>

      </div>
    </motion.div>
  );
}