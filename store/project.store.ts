import { create } from "zustand";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import type { BidPackage, Project, Vendor } from "@/lib/data/models";
import { generateSeedData } from "@/lib/data/seed";

type ProjectState = {
  seed: number;
  projects: Project[];
  packages: BidPackage[];
  vendors: Vendor[];

  selectedProjectId?: string;
  selectedPackageId?: string;

  setSelectedProject: (id: string) => void;
  setSelectedPackage: (id: string) => void;

  // Vendor CRUD (NEW)
  addVendor: (vendor: Omit<Vendor, "id">) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  getProjectById: (id?: string) => Project | undefined;
  getPackagesByProjectId: (projectId?: string) => BidPackage[];

  regenerate: (seed?: number) => void;
  resetAll: () => void;
};

function build(seed: number) {
  return generateSeedData(seed);
}

const BASE_SEED = 20260206;
const rid = () => Math.random().toString(36).substring(2, 7).toUpperCase();

export const useProjectStore = create<ProjectState>()(
  subscribeWithSelector(
    persist(
      (set, get) => {
        const seed = BASE_SEED;
        const data = build(seed);

        return {
          seed,
          ...data,
          selectedProjectId: data.projects[0]?.id,
          selectedPackageId: undefined,

          setSelectedProject: (id) => set({ selectedProjectId: id, selectedPackageId: undefined }),
          setSelectedPackage: (id) => set({ selectedPackageId: id }),

          // --- VENDOR ACTIONS ---
          addVendor: (v) => set((s) => ({
            vendors: [{ ...v, id: `VND-${rid()}` }, ...s.vendors]
          })),
          updateVendor: (id, updates) => set((s) => ({
            vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v))
          })),
          deleteVendor: (id) => set((s) => ({
            vendors: s.vendors.filter((v) => v.id !== id)
          })),
          // ----------------------

          getProjectById: (id) => {
            if (!id) return undefined;
            return get().projects.find((p) => p.id === id);
          },

          getPackagesByProjectId: (projectId) => {
            if (!projectId) return [];
            return get().packages.filter((p) => p.projectId === projectId);
          },

          regenerate: (nextSeed) => {
            const s = nextSeed ?? (get().seed + 1);
            const d = build(s);
            set({
              seed: s,
              ...d,
              selectedProjectId: d.projects[0]?.id,
              selectedPackageId: undefined,
            });
          },

          resetAll: () => {
            const d = build(BASE_SEED);
            set({
              seed: BASE_SEED,
              ...d,
              selectedProjectId: d.projects[0]?.id,
              selectedPackageId: undefined,
            });
          },
        };
      },
      {
        name: "bidmatrix.data",
        storage: createJSONStorage(() => localStorage),
        version: 2, // Increment for new vendor actions
      },
    ),
  ),
);