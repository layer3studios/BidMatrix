"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { useDemoStore } from "@/store/demo.store";
import { ProjectsTable } from "@/components/tables/ProjectsTable";

export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const slow = useDemoStore((s) => s.slowNetwork);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let t: number | undefined;

    // Simulated fetch lifecycle (UI-only)
    setError(null);
    setLoading(true);

    t = window.setTimeout(() => {
      // You can flip this to simulate errors via demo toolbar later
      setLoading(false);
    }, slow ? 900 : 150);

    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [slow]);

  return (
    <motion.div {...pageTransition} className="h-full overflow-auto p-6">
      <ProjectsTable projects={projects} loading={loading} error={error} />
    </motion.div>
  );
}
