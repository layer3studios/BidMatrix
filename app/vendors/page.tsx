"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { VendorStats } from "@/components/vendors/VendorStats";
import { VendorsTable } from "@/components/vendors/VendorsTable";

export default function VendorsPage() {
  return (
    <motion.div {...pageTransition} className="flex h-full flex-col gap-6 overflow-hidden p-6">
      {/* Page Header */}
      <div className="shrink-0">
        <div className="text-xl font-semibold tracking-tight text-zinc-100">Vendor Intelligence</div>
        <div className="text-sm text-zinc-400">
          Manage supply chain risk, compliance, and prequalification status.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="shrink-0">
        <VendorStats />
      </div>

      {/* Main Table */}
      <div className="min-h-0 flex-1">
        <VendorsTable />
      </div>
    </motion.div>
  );
}