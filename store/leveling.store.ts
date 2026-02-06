import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DrawerTab = "bidder" | "scope" | "variance" | "audit" | "docs";
export type MobilePane = "filters" | "matrix" | "drawer";

type LevelingState = {
  // Layout
  leftWidth: number;   // px
  rightWidth: number;  // px
  drawerOpen: boolean;
  activeTab: DrawerTab;

  // Mobile UX
  mobilePane: MobilePane;

  // Context (selected items)
  selectedBidderId?: string;
  selectedScopeId?: string;

  setLeftWidth: (px: number) => void;
  setRightWidth: (px: number) => void;

  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
  setTab: (tab: DrawerTab) => void;

  setMobilePane: (pane: MobilePane) => void;

  setSelection: (bidderId?: string, scopeId?: string) => void;
  resetLeveling: () => void;
};

export const useLevelingStore = create<LevelingState>()(
  persist(
    (set) => ({
      leftWidth: 320,
      rightWidth: 420,
      drawerOpen: true,
      activeTab: "bidder",

      mobilePane: "matrix",

      selectedBidderId: undefined,
      selectedScopeId: undefined,

      setLeftWidth: (leftWidth) => set({ leftWidth }),
      setRightWidth: (rightWidth) => set({ rightWidth }),

      openDrawer: (tab) =>
        set((s) => ({
          drawerOpen: true,
          activeTab: tab ?? s.activeTab,
          mobilePane: "drawer",
        })),
      closeDrawer: () => set((s) => ({ drawerOpen: false, mobilePane: s.mobilePane === "drawer" ? "matrix" : s.mobilePane })),
      setTab: (activeTab) => set({ activeTab, drawerOpen: true, mobilePane: "drawer" }),

      setMobilePane: (mobilePane) => set({ mobilePane }),

      setSelection: (selectedBidderId, selectedScopeId) => set({ selectedBidderId, selectedScopeId }),

      resetLeveling: () =>
        set({
          leftWidth: 320,
          rightWidth: 420,
          drawerOpen: true,
          activeTab: "bidder",
          mobilePane: "matrix",
          selectedBidderId: undefined,
          selectedScopeId: undefined,
        }),
    }),
    { name: "bidmatrix.leveling" },
  ),
);
