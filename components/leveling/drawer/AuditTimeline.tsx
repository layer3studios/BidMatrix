"use client";

import { useLevelingStore } from "@/store/leveling.store";
import { cn } from "@/lib/utils/cn";

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function AuditTimeline() {
  const events = useLevelingStore((s) => s.auditEvents);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-8 w-8 rounded-full bg-zinc-800/50 p-2 text-zinc-500">
           {/* Simple icon */}
           <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="mt-3 text-sm font-medium text-zinc-300">No events yet</div>
        <div className="mt-1 max-w-50 text-[12px] text-zinc-500">
          Interactions with the matrix (pinning, notes, clarifications) will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="relative border-l border-zinc-800/50 ml-3 space-y-6 py-2">
      {events.map((ev) => (
        <div key={ev.id} className="relative pl-6">
          {/* Dot */}
          <div className={cn(
            "absolute -left-1.25 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950",
            ev.action.includes("RISK") ? "bg-rose-500" : "bg-teal-500"
          )} />
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{timeAgo(ev.ts)}</span>
              <span className="font-medium text-zinc-400">{ev.actor}</span>
            </div>
            
            <div className="text-[13px] font-medium text-zinc-200">
              {formatAction(ev.action)}
            </div>
            
            {(ev.bidderId || ev.scopeId) && (
              <div className="mt-1 flex gap-2">
                {ev.bidderId && (
                  <span className="rounded bg-zinc-800/50 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                    {ev.bidderId}
                  </span>
                )}
                {ev.scopeId && (
                  <span className="rounded bg-zinc-800/50 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                    #{ev.scopeId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatAction(action: string) {
  switch (action) {
    case "POPOVER_PINNED": return "Pinned analysis view";
    case "POPOVER_UNPINNED": return "Unpinned view";
    case "NOTE_ADDED": return "Added internal note";
    case "CLARIFICATION_CREATED": return "Created clarification request";
    case "RISK_FLAGGED": return "Flagged for risk review";
    default: return action.replace(/_/g, " ").toLowerCase();
  }
}