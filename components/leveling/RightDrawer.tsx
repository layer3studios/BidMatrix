"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useLevelingStore, type DrawerTab } from "@/store/leveling.store";
import { Button } from "@/components/ui/Button";

// Import "Real" components
import { AuditTimeline } from "./drawer/AuditTimeline";
import { BidderProfile } from "./drawer/BidderProfile";
import { ScopeDetail } from "./drawer/ScopeDetail";
import { DocumentCenter } from "./drawer/DocumentCenter"; // New import

const tabs: { id: DrawerTab; label: string }[] = [
  { id: "bidder", label: "Bidder 360" },
  { id: "scope", label: "Scope Item" },
  { id: "variance", label: "Variance" },
  { id: "docs", label: "Docs" },
  { id: "audit", label: "Audit" },
];

export function RightDrawer() {
  const drawerOpen = useLevelingStore((s) => s.drawerOpen);
  const activeTab = useLevelingStore((s) => s.activeTab);
  const setTab = useLevelingStore((s) => s.setTab);
  const closeDrawer = useLevelingStore((s) => s.closeDrawer);

  const selectedBidderId = useLevelingStore((s) => s.selectedBidderId);
  const selectedScopeId = useLevelingStore((s) => s.selectedScopeId);

  return (
    <AnimatePresence>
      {drawerOpen ? (
        <motion.aside
          key="drawer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { type: "spring", stiffness: 350, damping: 30 } }}
          exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
          className="h-full border-l border-zinc-800/70 bg-zinc-950/50 backdrop-blur-xl flex flex-col shadow-2xl z-50 relative"
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-zinc-800/70 px-4 py-3 bg-zinc-950/80">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-100">Inspector</div>
              <div className="mt-0.5 text-[11px] text-zinc-500 truncate pr-4">
                {selectedBidderId || "No Bidder"} • {selectedScopeId || "No Scope"}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={closeDrawer} className="h-7 w-7 p-0 rounded-full">
              ×
            </Button>
          </div>

          {/* Tabs */}
          <div className="shrink-0 border-b border-zinc-800/70 px-2 py-2 bg-zinc-950/40">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium transition-all",
                    activeTab === t.id
                      ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-950/20">
            <DrawerContent 
                tab={activeTab} 
                bidderId={selectedBidderId} 
                scopeId={selectedScopeId} 
            />
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function DrawerContent({ tab, bidderId, scopeId }: { tab: DrawerTab; bidderId?: string; scopeId?: string }) {
  // Empty states handling
  if (tab === "bidder" && !bidderId) return <EmptyState label="Select a bidder to view profile" />;
  if (tab === "scope" && !scopeId) return <EmptyState label="Select a scope row to view details" />;
  if (tab === "variance" && (!scopeId || !bidderId)) return <EmptyState label="Select a cell to view variance" />;

  switch (tab) {
    case "audit":
      return <AuditTimeline />;
    case "bidder":
      return <BidderProfile bidderId={bidderId!} />;
    case "scope":
    case "variance": 
      return <ScopeDetail scopeId={scopeId!} bidderId={bidderId} />;
    case "docs":
      return <DocumentCenter />; // Now using the component
    default:
      return null;
  }
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
            <div className="text-sm text-zinc-400">{label}</div>
        </div>
    )
}