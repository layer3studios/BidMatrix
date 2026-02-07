"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { SettingsWorkspace } from "@/components/settings/SettingsWorkspace";

export default function SettingsPage() {
  return (
    <motion.div {...pageTransition} className="h-full min-h-0 overflow-hidden">
      <SettingsWorkspace />
    </motion.div>
  );
}