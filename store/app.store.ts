import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Role } from "@/lib/data/models";

type ThemeMode = "dark" | "light";

type AppState = {
  role: Role;
  theme: ThemeMode;
  lastProjectId?: string;
  lastPackageId?: string;

  // responsive shell
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  setRole: (role: Role) => void;
  setTheme: (theme: ThemeMode) => void;
  setLastContext: (projectId?: string, packageId?: string) => void;
  resetApp: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "Estimator",
      theme: "dark",
      lastProjectId: undefined,
      lastPackageId: undefined,

      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setRole: (role) => set({ role }),
      setTheme: (theme) => set({ theme }),
      setLastContext: (lastProjectId, lastPackageId) => set({ lastProjectId, lastPackageId }),

      resetApp: () =>
        set({
          role: "Estimator",
          theme: "dark",
          lastProjectId: undefined,
          lastPackageId: undefined,
          sidebarOpen: false,
        }),
    }),
    {
      name: "bidmatrix.app",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // migration logic if needed
        }
        return persistedState as AppState;
      },
    },
  ),
);