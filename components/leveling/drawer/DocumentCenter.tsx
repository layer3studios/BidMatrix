"use client";

import { cn } from "@/lib/utils/cn";

// Mock data generator
const docs = [
  { name: "Bid_Form_v2.pdf", type: "PDF", date: "2 days ago", size: "2.4 MB" },
  { name: "SOV_Breakdown.xlsx", type: "XLS", date: "5 days ago", size: "840 KB" },
  { name: "Insurance_Cert_2025.pdf", type: "PDF", date: "1 week ago", size: "1.1 MB" },
  { name: "Scope_Clarification_Email.msg", type: "MSG", date: "2 weeks ago", size: "120 KB" },
];

export function DocumentCenter() {
  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="rounded-lg border border-dashed border-zinc-700/50 bg-zinc-900/20 p-6 text-center transition-colors hover:bg-zinc-900/40">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/50 text-zinc-400">
          <span className="text-lg">↑</span>
        </div>
        <div className="mt-2 text-sm font-medium text-zinc-200">Upload bid documents</div>
        <div className="mt-1 text-xs text-zinc-500">Drag and drop or click to browse</div>
      </div>

      {/* File List */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Attached Files ({docs.length})
          </div>
          <button className="text-[10px] text-teal-400 hover:underline">Download All</button>
        </div>

        <div className="space-y-2">
          {docs.map((doc, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-2.5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
            >
              <FileIcon type={doc.type} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                  {doc.name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <span>{doc.date}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>
              <button className="hidden rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 group-hover:block">
                ↓
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  const styles: Record<string, string> = {
    PDF: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    XLS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MSG: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };

  const def = "bg-zinc-800 text-zinc-400 border-zinc-700";

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded border text-[9px] font-bold",
        styles[type] ?? def,
      )}
    >
      {type}
    </div>
  );
}