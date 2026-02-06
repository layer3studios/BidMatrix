"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { useDemoStore } from "@/store/demo.store";
import { PackagesTable } from "@/components/tables/PackagesTable";
import { useParams } from "next/navigation";

export default function PackagesPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;

  const slow = useDemoStore((s) => s.slowNetwork);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const packagesAll = useProjectStore((s) => s.packages);

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

    t = window.setTimeout(() => setLoading(false), slow ? 850 : 140);
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [slow, projectId]);

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
        <div className="mt-1 text-sm text-zinc-400">{projectId}</div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="h-full overflow-auto p-6">
      <div className="mb-4">
        <div className="text-xl font-semibold tracking-tight">Bid Packages</div>
        <div className="text-sm text-zinc-400">
          {project.name} • <span className="text-zinc-500">{project.id}</span>
        </div>
      </div>

      <PackagesTable projectId={projectId} packages={packages} loading={loading} error={error} />
    </motion.div>
  );
}
