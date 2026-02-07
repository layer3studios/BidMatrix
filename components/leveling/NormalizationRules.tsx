"use client";

import { useLevelingStore } from "@/store/leveling.store";
import { cn } from "@/lib/utils/cn";

export function NormalizationRules() {
  const rules = useLevelingStore((s) => s.rules);
  const toggleRule = useLevelingStore((s) => s.toggleRule);
  const updateRuleValue = useLevelingStore((s) => s.updateRuleValue);
  const addAudit = useLevelingStore((s) => s.addAuditEvent);

  const handleToggle = (id: string, active: boolean) => {
    toggleRule(id);
    if (!active) { // if turning ON
        addAudit({ action: "RULE_TOGGLED", meta: { ruleId: id, state: "active" } });
    }
  };

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={cn(
            "rounded-lg border p-3 transition-colors",
            rule.active
              ? "border-teal-500/30 bg-teal-500/5"
              : "border-zinc-800 bg-zinc-900/20"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rule.active}
                onChange={() => handleToggle(rule.id, rule.active)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 accent-teal-500 focus:ring-teal-500/30"
              />
              <span className={cn("text-sm font-medium", rule.active ? "text-zinc-100" : "text-zinc-400")}>
                {rule.label}
              </span>
            </div>
            {rule.active && (
                <span className="text-[10px] uppercase text-teal-400 font-semibold tracking-wider">
                    ON
                </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-[11px] text-zinc-500">
                {rule.type === "markup" ? "Apply % Markup" : "Add Flat Value"}
                <div className="text-zinc-600">
                    {rule.applyTo === "gaps" ? "(If status ≠ Included)" : "(All cells)"}
                </div>
            </div>
            
            <div className="relative w-24">
                <input
                    type="number"
                    value={rule.value}
                    onChange={(e) => updateRuleValue(rule.id, parseFloat(e.target.value) || 0)}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-2 py-1 text-right text-xs text-zinc-100 focus:border-teal-500/50 focus:outline-none"
                />
                <span className="absolute right-7 top-1 text-xs text-zinc-500 pointer-events-none">
                    {rule.type === "markup" ? "%" : ""}
                </span>
            </div>
          </div>
        </div>
      ))}
      
      <button className="w-full rounded border border-dashed border-zinc-800 py-2 text-[11px] text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900/30 hover:text-zinc-300">
          + Add Custom Rule
      </button>
    </div>
  );
}