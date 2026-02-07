"use client";

import { useProjectStore } from "@/store/project.store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

type ReportType = "budget" | "activity";

export function ReportBuilder({
  selectedReport,
  onSelectReport,
  selectedProject,
  onSelectProject,
  onPrint
}: {
  selectedReport: ReportType;
  onSelectReport: (t: ReportType) => void;
  selectedProject: string;
  onSelectProject: (id: string) => void;
  onPrint: () => void;
}) {
  const projects = useProjectStore((s) => s.projects);

  return (
    <div className="h-full flex flex-col p-6 border-r border-zinc-800/70 bg-zinc-950/30">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-100">Report Center</h2>
        <p className="text-sm text-zinc-500">Generate PDF deliverables.</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* 1. Select Template */}
        <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">1. Report Template</label>
            <div className="grid gap-2">
                <button
                    onClick={() => onSelectReport("budget")}
                    className={cn(
                        "text-left p-3 rounded-lg border transition-all",
                        selectedReport === "budget" 
                            ? "bg-teal-500/10 border-teal-500/50 text-teal-100" 
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                    )}
                >
                    <div className="font-medium text-sm">Budget Summary</div>
                    <div className="text-[11px] opacity-70">Executive high-level financial overview.</div>
                </button>
                <button
                    onClick={() => onSelectReport("activity")}
                    className={cn(
                        "text-left p-3 rounded-lg border transition-all",
                        selectedReport === "activity" 
                            ? "bg-teal-500/10 border-teal-500/50 text-teal-100" 
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                    )}
                >
                    <div className="font-medium text-sm">Bidder Activity</div>
                    <div className="text-[11px] opacity-70">Coverage tracking and response rates.</div>
                </button>
            </div>
        </div>

        {/* 2. Context */}
        <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">2. Select Project</label>
            <select 
                value={selectedProject}
                onChange={(e) => onSelectProject(e.target.value)}
                className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 focus:border-teal-500 outline-none"
            >
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-800">
          <Button variant="primary" className="w-full" onClick={onPrint}>
              Download / Print PDF
          </Button>
      </div>
    </div>
  );
}