import { create } from "zustand";

export type ImportedRow = {
  id: string;
  data: Record<string, any>;
  errors: string[];
  selected: boolean;
};

type ImportState = {
  activeStep: number; // 0: Upload, 1: Map, 2: Review
  rawFile: File | null;
  headers: string[];
  mappedColumns: Record<string, string>; // { "dbField": "csvHeader" }
  previewData: ImportedRow[];
  
  setFile: (f: File) => void;
  setHeaders: (h: string[]) => void;
  setPreviewData: (d: any[]) => void;
  mapColumn: (dbField: string, csvHeader: string) => void;
  setStep: (s: number) => void;
  resetImport: () => void;
};

export const useImportStore = create<ImportState>((set) => ({
  activeStep: 0,
  rawFile: null,
  headers: [],
  mappedColumns: {},
  previewData: [],

  setFile: (f) => set({ rawFile: f }),
  setHeaders: (h) => set({ headers: h }),
  setPreviewData: (d) => set({ 
    previewData: d.map((row, i) => ({ 
      id: `row-${i}`, 
      data: row, 
      errors: [], 
      selected: true 
    })) 
  }),
  mapColumn: (db, csv) => set((s) => ({ 
    mappedColumns: { ...s.mappedColumns, [db]: csv } 
  })),
  setStep: (s) => set({ activeStep: s }),
  resetImport: () => set({ activeStep: 0, rawFile: null, headers: [], mappedColumns: {}, previewData: [] }),
}));