"use client";

import { useState, useMemo } from "react";
import { useLevelingStore } from "@/store/leveling.store";
import { cn } from "@/lib/utils/cn";

// Removed conflicting import: 
// import { demoRawMoneyNum, demoStatus, hash } from "./LevelingMatrix"; 

// Helper to duplicate math locally if not exporting from Matrix (keeping it self-contained for speed)
function getAdjustedValue(bidderId: string, scopeId: string, rules: any[]) {
    // Replicating Matrix Logic
    let val = 12000 + (hash(`${scopeId}::${bidderId}`) % 9000) * 7;
    const statusN = hash(`${bidderId}::${scopeId}`) % 100;
    const status = statusN < 62 ? "Included" : statusN < 78 ? "Clarify" : statusN < 92 ? "Excluded" : "Alternate";
    
    const tweak = (hash(`${bidderId}::norm::${scopeId}`) % 500) / 1000;
    const statusFactor = status === "Included" ? 1.0 : status === "Clarify" ? 1.06 : status === "Excluded" ? 1.12 : 1.03;
    val = Math.round(val * (1 + tweak) * statusFactor);

    rules.filter((r: any) => r.active && r.type === "plug").forEach((r: any) => {
        if (r.applyTo === "all" || (r.applyTo === "gaps" && status !== "Included")) val += r.value;
    });
    let totalMarkup = 0;
    rules.filter((r: any) => r.active && r.type === "markup").forEach((r: any) => {
        if (r.applyTo === "all" || (r.applyTo === "gaps" && status !== "Included")) totalMarkup += r.value;
    });
    return Math.round(val * (1 + totalMarkup / 100));
}

// Local declaration of hash (no longer conflicts)
function hash(input: string): number { 
    let h = 2166136261; 
    for (let i = 0; i < input.length; i++) { 
        h ^= input.charCodeAt(i); 
        h = Math.imul(h, 16777619); 
    } 
    return (h >>> 0); 
}

export function ScenarioBar({ scopeIds }: { scopeIds: string[] }) {
  const scenarios = useLevelingStore((s) => s.scenarios);
  const activeId = useLevelingStore((s) => s.activeScenarioId);
  const setActive = useLevelingStore((s) => s.setActiveScenario);
  const createScenario = useLevelingStore((s) => s.createScenario);
  const rules = useLevelingStore((s) => s.rules);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const activeScenario = scenarios.find(s => s.id === activeId) || scenarios[0];

  // Calculate Total Value of Current Scenario
  const totalValue = useMemo(() => {
      if (!activeScenario) return 0;
      let sum = 0;
      scopeIds.forEach(scopeId => {
          const selectedBidder = activeScenario.selections[scopeId];
          if (selectedBidder) {
              sum += getAdjustedValue(selectedBidder, scopeId, rules);
          }
      });
      return sum;
  }, [activeScenario, scopeIds, rules]);

  // Calculate "Completeness"
  const completeness = useMemo(() => {
      if (!activeScenario || scopeIds.length === 0) return 0;
      const selectedCount = Object.keys(activeScenario.selections).filter(k => scopeIds.includes(k)).length;
      return Math.round((selectedCount / scopeIds.length) * 100);
  }, [activeScenario, scopeIds]);

  const handleCreate = () => {
      if (!newName) return;
      createScenario(newName);
      setNewName("");
      setIsCreating(false);
  };

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-950 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-40">
        
        {/* Left: Scenario Switcher */}
        <div className="flex items-center gap-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Active Scenario</div>
            <div className="relative group">
                <button className="flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-700">
                    <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></span>
                    {activeScenario?.name}
                    <span className="text-zinc-600 text-[10px] ml-1">▼</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all">
                    <div className="mb-2 px-2 text-[10px] uppercase text-zinc-500">Switch Scenario</div>
                    <div className="space-y-1">
                        {scenarios.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => setActive(s.id)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                    s.id === activeId ? "bg-teal-500/10 text-teal-300" : "hover:bg-zinc-900 text-zinc-300"
                                )}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-zinc-800 mt-2 pt-2">
                        {isCreating ? (
                            <div className="flex gap-2 px-1">
                                <input 
                                    autoFocus
                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-teal-500"
                                    placeholder="Name..."
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                                />
                                <button onClick={handleCreate} className="text-xs bg-teal-500 text-black px-2 rounded font-medium">Add</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsCreating(true)} className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
                                + Create New Scenario
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Center: Progress */}
        <div className="flex flex-col items-center w-64">
            <div className="flex justify-between w-full text-[10px] text-zinc-500 mb-1">
                <span>Selection Progress</span>
                <span>{completeness}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-linear-to-r from-teal-600 to-teal-400 transition-all duration-500" 
                    style={{ width: `${completeness}%` }}
                />
            </div>
        </div>

        {/* Right: Totals */}
        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Scenario Total</div>
                <div className="text-2xl font-mono font-medium text-zinc-100 tabular-nums">
                    ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
            </div>
            <button className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)] transition-all">
                Finalize Award
            </button>
        </div>
    </div>
  );
}