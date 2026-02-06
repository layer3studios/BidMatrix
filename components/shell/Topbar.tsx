"use client";

import { useAppStore } from "@/store/app.store";
import { useProjectStore } from "@/store/project.store";
import { useDemoStore } from "@/store/demo.store";
import { Button } from "@/components/ui/Button";

export function Topbar() {
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProject = useProjectStore((s) => s.setSelectedProject);

  const slowNetwork = useDemoStore((s) => s.slowNetwork);
  const setSlowNetwork = useDemoStore((s) => s.setSlowNetwork);

  return (
    <header className="flex min-h-14 items-center justify-between gap-3 border-b border-zinc-800/70 bg-zinc-950/40 px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {/* Mobile hamburger */}
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800/70 bg-zinc-950 text-zinc-200 hover:bg-zinc-900/60 md:hidden"
          onClick={toggleSidebar}
          aria-label="Open navigation"
        >
          <span className="text-lg leading-none">≡</span>
        </button>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="h-9 w-55-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none md:w-90"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="hidden items-center gap-2 md:flex">
          <div className="text-[11px] text-zinc-500">Role</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="h-9 rounded-md border border-zinc-800/70 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none"
          >
            <option value="Estimator">Estimator</option>
            <option value="Executive">Executive</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <label className="hidden items-center gap-2 text-sm text-zinc-300 md:flex">
          <input
            type="checkbox"
            checked={slowNetwork}
            onChange={(e) => setSlowNetwork(e.target.checked)}
            className="h-4 w-4 accent-teal-400"
          />
          <span className="text-[12px] text-zinc-400">Slow mode</span>
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="sm">
          Alerts
        </Button>
        <Button variant="primary" size="sm">
          Export
        </Button>
      </div>
    </header>
  );
}
