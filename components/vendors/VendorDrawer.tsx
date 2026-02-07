"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useProjectStore } from "@/store/project.store";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import type { Vendor } from "@/lib/data/models";

const tabs = ["Overview", "Compliance", "Financials", "Projects"] as const;

export function VendorDrawer({ vendorId, onClose }: { vendorId: string | null; onClose: () => void }) {
  const vendor = useProjectStore((s) => s.vendors.find((v) => v.id === vendorId));
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Overview");

  return (
    <AnimatePresence>
      {vendorId && vendor ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-125 border-l border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-zinc-800 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-bold text-zinc-100">{vendor.name}</div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span>{vendor.id}</span>
                    <span>•</span>
                    <span>{vendor.regions.join(", ")}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                    tierStyle(vendor.tier)
                )}>
                    {vendor.tier} Vendor
                </span>
                {vendor.safety_emr > 1.0 && (
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
                        High EMR: {vendor.safety_emr}
                    </span>
                )}
              </div>

              <div className="flex gap-1 border-b border-zinc-800/50">
                  {tabs.map(t => (
                      <button 
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={cn(
                            "px-3 py-2 text-sm font-medium transition-colors border-b-2",
                            activeTab === t ? "border-teal-500 text-teal-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                          {t}
                      </button>
                  ))}
              </div>
            </div>

            {/* Body */}
            <div className="h-[calc(100vh-200px)] overflow-y-auto p-6">
                {activeTab === "Overview" && <OverviewTab vendor={vendor} />}
                {activeTab === "Compliance" && <ComplianceTab vendor={vendor} />}
                {activeTab === "Financials" && <FinancialsTab vendor={vendor} />}
                {activeTab === "Projects" && <ProjectsTab />}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function OverviewTab({ vendor }: { vendor: Vendor }) {
    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-3">Risk Assessment</h4>
                <div className="space-y-3">
                    {vendor.risk_flags.length > 0 ? (
                        vendor.risk_flags.map((flag, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-rose-300">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                {flag}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-emerald-400 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            No active risk flags.
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                    <div className="text-[10px] uppercase text-zinc-500">Bonding Rate</div>
                    <div className="mt-1 text-lg font-mono text-zinc-200">1.2%</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                    <div className="text-[10px] uppercase text-zinc-500">Experience</div>
                    <div className="mt-1 text-lg text-zinc-200">12 Yrs</div>
                </div>
            </div>
        </div>
    )
}

function ComplianceTab({ vendor }: { vendor: Vendor }) {
    const isExpired = new Date(vendor.insurance_expiry) < new Date();
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                <div>
                    <div className="text-sm font-medium text-zinc-200">General Liability</div>
                    <div className="text-xs text-zinc-500">Policy #GL-994-22</div>
                </div>
                <div className={cn("text-xs px-2 py-1 rounded", isExpired ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400")}>
                    {isExpired ? "Expired" : "Active"}
                </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                <div>
                    <div className="text-sm font-medium text-zinc-200">Workers Comp</div>
                    <div className="text-xs text-zinc-500">Policy #WC-112-00</div>
                </div>
                <div className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">Active</div>
            </div>
        </div>
    )
}

function FinancialsTab({ vendor }: { vendor: Vendor }) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="text-xs text-zinc-500">Single Project Limit</div>
                <div className="text-2xl font-mono text-zinc-100">${(vendor.bonding_limit / 1000000).toFixed(1)}M</div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-2">
                    <div className="h-1.5 bg-teal-500 rounded-full" style={{ width: "65%" }} />
                </div>
                <div className="text-[10px] text-zinc-500 text-right mt-1">65% Utilized</div>
            </div>
            
            <div className="space-y-1">
                <div className="text-xs text-zinc-500">Aggregate Limit</div>
                <div className="text-2xl font-mono text-zinc-100">${(vendor.bonding_limit * 2.5 / 1000000).toFixed(1)}M</div>
            </div>
        </div>
    )
}

function ProjectsTab() {
    return (
        <div className="space-y-3">
            {[1,2,3].map(i => (
                <div key={i} className="rounded-lg border border-zinc-800 p-3">
                    <div className="flex justify-between">
                        <div className="text-sm font-medium text-zinc-200">Skyline Tower A</div>
                        <div className="text-xs text-zinc-500">2024</div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">$1.2M • HVAC • Completed</div>
                </div>
            ))}
        </div>
    )
}

function tierStyle(t: string) {
    switch (t) {
        case "Preferred": return "bg-teal-500/10 text-teal-400 ring-teal-500/30";
        case "Approved": return "bg-sky-500/10 text-sky-400 ring-sky-500/30";
        case "New": return "bg-indigo-500/10 text-indigo-400 ring-indigo-500/30";
        case "Watch": return "bg-amber-500/10 text-amber-400 ring-amber-500/30";
        default: return "bg-zinc-500/10 text-zinc-400 ring-zinc-500/30";
    }
}