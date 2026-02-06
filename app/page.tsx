"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { ensureGsap } from "@/lib/motion/gsap";
import gsap from "gsap";

export default function DashboardPage() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureGsap();
    if (!root.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div {...pageTransition} ref={root} className="h-full overflow-auto p-6">
      <div data-reveal className="mb-4">
        <div className="text-xl font-semibold tracking-tight">Executive Dashboard</div>
        <div className="text-sm text-zinc-400">
          Portfolio KPIs, coverage progress, risk feed, packages needing attention.
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div data-reveal className="col-span-12 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium">Budget vs Leveled Total</div>
          <div className="mt-2 h-28 rounded-lg border border-zinc-800/60 bg-zinc-900/30" />
        </div>

        <div data-reveal className="col-span-7 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium">Coverage Progress by Trade</div>
          <div className="mt-2 h-64 rounded-lg border border-zinc-800/60 bg-zinc-900/30" />
        </div>

        <div data-reveal className="col-span-5 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium">Risk & Activity Feed</div>
          <div className="mt-2 h-64 rounded-lg border border-zinc-800/60 bg-zinc-900/30" />
        </div>
      </div>
    </motion.div>
  );
}
