"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLevelingStore, type SavedView, type MatrixDensity } from "@/store/leveling.store";
import { cn } from "@/lib/utils/cn";
import { Portal } from "@/components/ui/Portal"; // Using existing Portal

type Props = {
  currentConfig: SavedView["config"];
  onApply: (config: SavedView["config"]) => void;
};

export function SavedViewsMenu({ currentConfig, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  
  // Store
  const savedViews = useLevelingStore((s) => s.savedViews);
  const saveView = useLevelingStore((s) => s.saveView);
  const deleteView = useLevelingStore((s) => s.deleteView);
  const addAudit = useLevelingStore((s) => s.addAuditEvent);

  // Toggle dropdown logic (simple)
  const toggle = () => setOpen(!open);

  const handleSave = () => {
    if (!name.trim()) return;
    saveView(name, currentConfig);
    addAudit({ action: "VIEW_SAVED", meta: { name } });
    setName("");
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
          open ? "border-teal-500/50 bg-teal-500/10 text-teal-100" : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-zinc-100"
        )}
      >
        <span>Views</span>
        <span className="text-[10px] opacity-60">▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop to close */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl ring-1 ring-black/50"
            >
              <div className="mb-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Saved Layouts
              </div>
              
              <div className="max-h-50 overflow-y-auto space-y-0.5">
                {savedViews.map((view) => (
                  <div key={view.id} className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-zinc-900">
                    <button
                      onClick={() => {
                        onApply(view.config);
                        setOpen(false);
                      }}
                      className="flex flex-col items-start text-left"
                    >
                      <span className="text-[12px] font-medium text-zinc-200">{view.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {view.config.density} • {view.config.heatmapEnabled ? "Heatmap" : "No Heatmap"}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteView(view.id);
                      }}
                      className="hidden text-[10px] text-zinc-600 hover:text-rose-400 group-hover:block"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t border-zinc-800 pt-2 px-2 pb-1">
                <div className="text-[10px] text-zinc-500 mb-1.5">Save current state</div>
                <div className="flex gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="View name..."
                    className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  />
                  <button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="rounded-md bg-teal-500/10 px-2 py-1 text-[11px] font-medium text-teal-400 hover:bg-teal-500/20 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}