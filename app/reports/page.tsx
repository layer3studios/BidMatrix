"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion/framer";
import { useProjectStore } from "@/store/project.store";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { BudgetSummaryTemplate } from "@/components/reports/templates/BudgetSummaryTemplate";
import { BidderActivityTemplate } from "@/components/reports/templates/BidderActivityTemplate";

export default function ReportsPage() {
  const projects = useProjectStore((s) => s.projects);
  // Default to first project if available
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || "");
  const [reportType, setReportType] = useState<"budget" | "activity">("budget");

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
      // In a real implementation, we'd use react-to-print here
      // For this UI-only demo, we'll trigger window print logic or simple alert
      const content = printRef.current;
      if (content) {
          const w = window.open("", "_blank");
          if(w) {
              w.document.write(`
                <html>
                    <head>
                        <title>BidMatrix Report</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body>${content.innerHTML}</body>
                </html>
              `);
              w.document.close();
              w.focus();
              setTimeout(() => w.print(), 500);
          }
      }
  };

  return (
    <motion.div {...pageTransition} className="h-full min-h-0 flex overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-80 shrink-0 h-full">
        <ReportBuilder 
            selectedReport={reportType} 
            onSelectReport={setReportType}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onPrint={handlePrint}
        />
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-zinc-900/50 overflow-y-auto p-8 flex justify-center">
        <div className="shadow-2xl">
            {/* We render the template inside a div that forces A4 aspect ratio 
               A4 is roughly 210mm x 297mm. 
               In pixels at 96 DPI ~ 794px x 1123px.
            */}
            <div 
                ref={printRef}
                className="w-198.5 min-h-280.75 bg-white origin-top transition-transform duration-200"
                style={{ transform: "scale(0.85)" }} // Scale down slightly to fit on laptop screens nicely
            >
                {reportType === "budget" && <BudgetSummaryTemplate projectId={selectedProject} />}
                {reportType === "activity" && <BidderActivityTemplate projectId={selectedProject} />}
            </div>
        </div>
      </div>
    </motion.div>
  );
}