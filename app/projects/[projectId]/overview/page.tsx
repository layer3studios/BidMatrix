"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";

export default function ProjectOverviewPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;

  // ✅ IMPORTANT: select stable references only (no filter/find inside selector)
  const projects = useProjectStore((s) => s.projects);
  const packages = useProjectStore((s) => s.packages);

  const project = useMemo(() => {
    if (!projectId) return undefined;
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const projectPackages = useMemo(() => {
    if (!projectId) return [];
    return packages.filter((x) => x.projectId === projectId);
  }, [packages, projectId]);

  if (!projectId) {
    return (
      <motion.div {...pageTransition} className="h-full overflow-auto p-6">
        <div className="text-sm font-semibold text-zinc-100">Invalid route</div>
        <div className="mt-1 text-sm text-zinc-400">Missing projectId.</div>
      </motion.div>
    );
  }

  if (!project) {
    return (
      <motion.div {...pageTransition} className="h-full overflow-auto p-6">
        <div className="text-sm font-semibold text-zinc-100">Project not found</div>
        <div className="mt-1 text-sm text-zinc-400">
          No demo project matches <span className="text-zinc-200">{projectId}</span>.
        </div>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => router.push("/projects")}>
            Back to Projects
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="h-full min-h-0 overflow-hidden">
      <div className="border-b border-zinc-800/70 bg-zinc-950/30 px-4 py-4 md:px-6">
        <div className="text-lg font-semibold tracking-tight text-zinc-100">{project.name}</div>
        <div className="mt-1 text-sm text-zinc-400">
          {project.client} • {project.location} • <span className="text-zinc-500">{project.id}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/packages`)}>
            View Packages
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
            Back
          </Button>
        </div>
      </div>

      <div className="h-[calc(100%-80px)] overflow-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <OverviewCard label="Delivery" value={project.delivery_method} />
          <OverviewCard label="Bid Due" value={project.bid_due_date} />
          <OverviewCard label="Budget Target" value={`$${Math.round(project.budget_target).toLocaleString("en-US")}`} />
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800/70 bg-zinc-950/30">
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Bid Packages</div>
              <div className="mt-1 text-[12px] text-zinc-500">
                {projectPackages.length} package{projectPackages.length === 1 ? "" : "s"} linked to this project
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/packages`)}>
              Open Packages
            </Button>
          </div>

          <div className="p-4">
            {projectPackages.length === 0 ? (
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
                <div className="text-sm font-semibold text-zinc-100">No packages yet</div>
                <div className="mt-1 text-sm text-zinc-400">
                  Demo data has no bid packages for this project.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {projectPackages.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-zinc-800/70 bg-zinc-950/35 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-100">
                          {p.trade} — {p.package_name}
                        </div>
                        <div className="mt-1 text-[12px] text-zinc-500">
                          {p.id} • {p.status} • Scope {p.scope_version}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/projects/${projectId}/packages/${p.id}/leveling`)}
                      >
                        Open Leveling
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}
