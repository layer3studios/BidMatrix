"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useLevelingStore, type DrawerTab } from "@/store/leveling.store";
import { Button } from "@/components/ui/Button";

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
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0, transition: { type: "spring", stiffness: 420, damping: 34 } }}
          exit={{ opacity: 0, x: 14, transition: { duration: 0.12 } }}
          className="h-full border-l border-zinc-800/70 bg-zinc-950/35"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-3 py-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-100">Context</div>
              <div className="mt-0.5 text-[11px] text-zinc-500">
                Bidder: <span className="text-zinc-300">{selectedBidderId ?? "—"}</span> • Scope:{" "}
                <span className="text-zinc-300">{selectedScopeId ?? "—"}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={closeDrawer}>
              Close
            </Button>
          </div>

          <div className="border-b border-zinc-800/70 px-2 py-2">
            <div className="flex flex-wrap gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[12px] transition",
                    activeTab === t.id
                      ? "bg-teal-500/10 text-teal-100 ring-1 ring-teal-400/25"
                      : "text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[calc(100%-92px)] overflow-auto p-3">
            <DrawerBody tab={activeTab} />
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function DrawerBody({ tab }: { tab: DrawerTab }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/40 p-3">
        <div className="text-[11px] uppercase tracking-wider text-zinc-500">Active tab</div>
        <div className="mt-1 text-sm text-zinc-100">{tab}</div>
        <div className="mt-1 text-sm text-zinc-400">
          Next: bind real bidder/scope modules, diff viewer, attachments, and audit deep-links.
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/40 p-3">
        <div className="text-sm font-medium text-zinc-100">Auditability hook</div>
        <div className="mt-1 text-sm text-zinc-400">
          Drawer interactions will write audit events (UI-only, persisted).
        </div>
      </div>
    </div>
  );
}
