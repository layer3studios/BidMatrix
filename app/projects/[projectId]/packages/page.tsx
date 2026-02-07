"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { useDemoStore } from "@/store/demo.store";
import { PackagesTable } from "@/components/tables/PackagesTable";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function PackagesPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;

  const slow = useDemoStore((s) => s.slowNetwork);

  // ✅ stable refs only
  const projects = useProjectStore((s) => s.projects);
  const packagesAll = useProjectStore((s) => s.packages);

  const project = useMemo(() => {
    if (!projectId) return undefined;
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const packages = useMemo(() => {
    if (!projectId) return [];
    return packagesAll.filter((x) => x.projectId === projectId);
  }, [packagesAll, projectId]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let t: number | undefined;
    setError(null);
    setLoading(true);

    // simulate slow mode
    t = window.setTimeout(() => setLoading(false), slow ? 850 : 140);

    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [slow, projectId]);

  if (!projectId) {
    return (
      <motion.div {...pageTransition} className="h-full overflow-auto p-4 md:p-6">
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4">
          <div className="text-sm font-semibold text-zinc-100">Invalid route</div>
          <div className="mt-1 text-sm text-zinc-400">Missing projectId parameter.</div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!project) {
    return (
      <motion.div {...pageTransition} className="h-full overflow-auto p-4 md:p-6">
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4">
          <div className="text-sm font-semibold text-zinc-100">Project not found</div>
          <div className="mt-1 text-sm text-zinc-400">
            No demo project matches <span className="text-zinc-200">{projectId}</span>.
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="h-full min-h-0 overflow-hidden">
      {/* Sticky header (dense, enterprise) */}
      <div className="sticky top-0 z-20 border-b border-zinc-800/70 bg-zinc-950/55 backdrop-blur">
        <div className="px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="text-lg font-semibold tracking-tight text-zinc-100">Bid Packages</div>
              <div className="mt-1 text-sm text-zinc-400">
                {project.name} • <span className="text-zinc-500">{project.id}</span>
              </div>
              <div className="mt-1 text-[12px] text-zinc-500">
                Filter by trade/status/type. <span className="text-zinc-400">Enter</span> opens leveling workspace.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/overview`)}>
                Overview
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-84px)] min-h-0 overflow-auto px-4 py-4 md:px-6">
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30">
          <div className="border-b border-zinc-800/70 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-100">Packages</div>
                <div className="mt-1 text-[12px] text-zinc-500">
                  Showing <span className="text-zinc-300">{packages.length}</span>{" "}
                  package{packages.length === 1 ? "" : "s"} •{" "}
                  <span className="text-zinc-400">{slow ? "Slow mode" : "Normal mode"}</span>
                </div>
              </div>

              <div className="hidden text-[11px] text-zinc-500 md:block">
                Virtualized rows • Keyboard operable • UI-only
              </div>
            </div>
          </div>

          <div className="p-2 md:p-3">
            <PackagesTable projectId={projectId} packages={packages} loading={loading} error={error} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
