"use client";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";

export default function VendorsPage() {
  return (
    <motion.div {...pageTransition} className="h-full overflow-auto p-6">
      <div className="text-xl font-semibold">Vendors</div>
      <div className="mt-2 text-sm text-zinc-400">Directory with risk flags + compliance signals (next).</div>
    </motion.div>
  );
}
