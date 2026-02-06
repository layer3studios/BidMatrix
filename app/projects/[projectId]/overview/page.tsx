"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ProjectOverviewPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const packages = useProjectStore((s) => s.packages.filter((x) => x.projectId === projectId));

  if (!projectId) {
    return (
      <motion.div {...pageTransition} className="h-full overflow-auto p-6">
        <div className="text-sm font-semibold text-zinc-100">Invalid route</div>
        <div className="mt-1 text-sm text-zinc-400">Missing projectId parameter.</div>
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
    <motion.div {...pageTransition} className="h-full overflow-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">{project.name}</div>
          <div className="mt-1 text-sm text-zinc-400">
            {project.client} • {project.location} • <span className="text-zinc-500">{project.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/packages`)}>
            View Packages
          </Button>
          <Button variant="primary" size="sm">
            Export Summary
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4">
        <div className="col-span-8 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium">Packages</div>
          <div className="mt-2 text-[12px] text-zinc-500">{packages.length} packages in demo data</div>

          <div className="mt-3 space-y-2">
            {packages.slice(0, 6).map((pkg) => (
              <button
                key={pkg.id}
                className="w-full rounded-lg border border-zinc-900/70 bg-zinc-950/20 px-3 py-2 text-left hover:bg-zinc-900/30"
                onClick={() => router.push(`/projects/${projectId}/packages/${pkg.id}/leveling`)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-100">
                    {pkg.trade} — {pkg.package_name}
                  </div>
                  <div className="text-[12px] text-zinc-500">{pkg.status}</div>
                </div>
                <div className="mt-1 text-[12px] text-zinc-400">
                  Scope {pkg.scope_version} • {pkg.bid_count} bids • Est. $
                  {pkg.estimated_value.toLocaleString("en-US")}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-4 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
          <div className="text-sm font-medium">Risk summary</div>
          <div className="mt-2 h-64 rounded-lg border border-zinc-800/60 bg-zinc-900/30" />
        </div>
      </div>
    </motion.div>
  );
}
