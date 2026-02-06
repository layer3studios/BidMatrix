import { create } from "zustand";
import { persist } from "zustand/middleware";
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

  regenerate: (seed?: number) => void;
  resetAll: () => void;
};

function build(seed: number) {
  return generateSeedData(seed);
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => {
      const seed = 20260206;
      const data = build(seed);

      return {
        seed,
        ...data,
        selectedProjectId: data.projects[0]?.id,
        selectedPackageId: undefined,

        setSelectedProject: (id) => set({ selectedProjectId: id, selectedPackageId: undefined }),
        setSelectedPackage: (id) => set({ selectedPackageId: id }),

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
          const s = 20260206;
          const d = build(s);
          set({
            seed: s,
            ...d,
            selectedProjectId: d.projects[0]?.id,
            selectedPackageId: undefined,
          });
        },
      };
    },
    { name: "bidmatrix.data" },
  ),
);
