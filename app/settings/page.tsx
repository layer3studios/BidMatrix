"use client";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";

export default function SettingsPage() {
  return (
    <motion.div {...pageTransition} className="h-full overflow-auto p-6">
      <div className="text-xl font-semibold">Settings</div>
      <div className="mt-2 text-sm text-zinc-400">Role, theme, export defaults, audit retention (UI-only).</div>
    </motion.div>
  );
}
