"use client";

import { useState, useCallback } from "react";
// Ensure you have react-dropzone or use native input
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useImportStore } from "@/store/import.store";
import { useProjectStore } from "@/store/project.store";
import { Button } from "@/components/ui/Button";

// FIELDS WE WANT TO MAP
const REQUIRED_FIELDS = [
  { id: "trade", label: "Trade", required: true },
  { id: "package_name", label: "Package Name", required: true },
  { id: "estimated_value", label: "Budget/Estimate", required: false },
  { id: "bid_due_date", label: "Due Date", required: false },
];

export function ImportWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeStep, setStep, resetImport } = useImportStore();

  const handleClose = () => {
    resetImport();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl h-150 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Import Data</h2>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <StepIndicator step={0} current={activeStep} label="Upload" />
                  <div className="w-4 h-px bg-zinc-800" />
                  <StepIndicator step={1} current={activeStep} label="Map Columns" />
                  <div className="w-4 h-px bg-zinc-800" />
                  <StepIndicator step={2} current={activeStep} label="Review" />
                </div>
              </div>
              <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-200">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-hidden relative">
              {activeStep === 0 && <UploadStep />}
              {activeStep === 1 && <MappingStep />}
              {activeStep === 2 && <ReviewStep onClose={handleClose} />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StepIndicator({ step, current, label }: any) {
  const isActive = current === step;
  const isDone = current > step;
  return (
    <div className={cn("flex items-center gap-2", isActive ? "text-teal-400" : isDone ? "text-zinc-300" : "text-zinc-600")}>
      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border", 
        isActive ? "border-teal-500 bg-teal-500/10" : isDone ? "border-zinc-500 bg-zinc-800" : "border-zinc-700"
      )}>
        {isDone ? "✓" : step + 1}
      </div>
      <span>{label}</span>
    </div>
  );
}

// --- STEP 1: UPLOAD ---
function UploadStep() {
  const { setFile, setHeaders, setPreviewData, setStep } = useImportStore();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Array of arrays

        if (data.length < 2) throw new Error("File is empty or missing headers");

        const headers = data[0] as string[];
        const rows = data.slice(1).map((r: any) => {
            // Convert array row to object based on headers
            const obj: any = {};
            headers.forEach((h, i) => { obj[h] = r[i]; });
            return obj;
        });

        setFile(file);
        setHeaders(headers);
        setPreviewData(rows);
        setStep(1);
      } catch (err) {
        setError("Could not parse file. Please ensure it is a valid Excel or CSV.");
      }
    };
    reader.readAsBinaryString(file);
  }, [setFile, setHeaders, setPreviewData, setStep]);

  // Use simple input for now to avoid react-dropzone dependency if you don't have it installed
  // But standard pattern is drag-drop area
  return (
    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors relative">
        <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            onChange={(e) => { if(e.target.files) onDrop([e.target.files[0]]) }}
            className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
            <span className="text-3xl">📄</span>
        </div>
        <div className="text-lg font-medium text-zinc-200">Click or drag file to this area to upload</div>
        <div className="text-sm text-zinc-500 mt-2">Support for .xlsx, .xls, .csv</div>
        {error && <div className="mt-4 text-rose-400 text-sm">{error}</div>}
    </div>
  );
}

// --- STEP 2: MAPPING ---
function MappingStep() {
  const { headers, mappedColumns, mapColumn, setStep } = useImportStore();

  // Auto-map on mount (simple fuzzy match)
  useState(() => {
      REQUIRED_FIELDS.forEach(field => {
          const match = headers.find(h => h.toLowerCase().includes(field.label.toLowerCase()) || h.toLowerCase().includes(field.id));
          if (match) mapColumn(field.id, match);
      });
  });

  return (
    <div className="h-full flex flex-col">
        <div className="mb-4 text-sm text-zinc-400">
            Match columns from your file to BidMatrix fields.
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3">
            {REQUIRED_FIELDS.map(field => (
                <div key={field.id} className="grid grid-cols-2 gap-8 items-center border-b border-zinc-800/50 pb-3">
                    <div>
                        <div className="text-sm font-medium text-zinc-200">
                            {field.label} {field.required && <span className="text-rose-400">*</span>}
                        </div>
                        <div className="text-xs text-zinc-500">Target Field</div>
                    </div>
                    <select 
                        value={mappedColumns[field.id] || ""} 
                        onChange={(e) => mapColumn(field.id, e.target.value)}
                        className="h-10 rounded border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-200 focus:border-teal-500 outline-none"
                    >
                        <option value="">Select column...</option>
                        {headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button 
                variant="primary" 
                onClick={() => setStep(2)}
                disabled={!mappedColumns["package_name"]} // Simple validation
            >
                Next: Review
            </Button>
        </div>
    </div>
  );
}

// --- STEP 3: REVIEW ---
function ReviewStep({ onClose }: { onClose: () => void }) {
  const { previewData, mappedColumns, setStep } = useImportStore();
  const { selectedProjectId } = useProjectStore(); // Import into CURRENT project
  const addPackagesFromImport = useProjectStore((s) => s.regenerate); // Hack: we need a real addPackage action

  // Actually, we need to add a REAL action to project.store.ts to accept bulk packages.
  // For this MVP step, we will assume we update the store to handle this.
  
  // Real implementation of commit:
  const handleImport = () => {
      // Logic to transform previewData -> BidPackage[] using mappedColumns
      // Then call store action
      // For now, we simulate success
      onClose();
  };

  return (
    <div className="h-full flex flex-col">
        <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-zinc-400">Ready to import <span className="text-zinc-100 font-bold">{previewData.length}</span> rows.</div>
        </div>

        <div className="flex-1 overflow-auto border border-zinc-800 rounded-lg">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase text-zinc-500 sticky top-0">
                    <tr>
                        <th className="px-4 py-2">Trade</th>
                        <th className="px-4 py-2">Package Name</th>
                        <th className="px-4 py-2 text-right">Est. Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {previewData.slice(0, 50).map((row) => (
                        <tr key={row.id}>
                            <td className="px-4 py-2">{row.data[mappedColumns["trade"]] || "—"}</td>
                            <td className="px-4 py-2">{row.data[mappedColumns["package_name"]] || "—"}</td>
                            <td className="px-4 py-2 text-right">{row.data[mappedColumns["estimated_value"]] || "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" onClick={handleImport}>Complete Import</Button>
        </div>
    </div>
  );
}