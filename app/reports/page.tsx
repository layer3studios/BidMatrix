"use client";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";

export default function ReportsPage() {
  return (
    <motion.div {...pageTransition} className="h-full overflow-auto p-6">
      <div className="text-xl font-semibold">Report Center</div>
      <div className="mt-2 text-sm text-zinc-400">Template gallery + preview canvas + smooth scroll (next).</div>
    </motion.div>
  );
}
