import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DrawerTab = "bidder" | "scope" | "variance" | "docs" | "audit";
export type MobilePane = "filters" | "matrix" | "drawer";
export type MatrixDensity = "compact" | "comfortable" | "spacious";

// --- EXISTING TYPES ---
export type SavedView = {
  id: string;
  name: string;
  config: {
    heatmapEnabled: boolean;
    showGapsOnly: boolean;
    includeOnly: boolean;
    density: MatrixDensity;
  };
};

export type NormalizationRule = {
  id: string;
  label: string;
  type: "markup" | "plug";
  value: number;
  active: boolean;
  applyTo: "all" | "gaps";
};

// --- NEW: Scenario Types ---
export type Scenario = {
  id: string;
  name: string;
  // Map: ScopeRowID -> BidderID
  selections: Record<string, string>; 
};
// ---------------------------

export type AuditAction =
  | "CLARIFICATION_CREATED"
  | "NOTE_ADDED"
  | "RISK_FLAGGED"
  | "POPOVER_PINNED"
  | "POPOVER_UNPINNED"
  | "VIEW_SAVED"
  | "COLUMNS_CHANGED"
  | "RULE_TOGGLED"
  | "SCENARIO_CREATED" // New
  | "BID_SELECTED";    // New

export type AuditEvent = {
  id: string;
  ts: string;
  actor: string;
  action: AuditAction;
  projectId?: string;
  packageId?: string;
  bidderId?: string;
  scopeId?: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

export type Toast = {
  id: string;
  title: string;
  detail?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  ts: number;
};

type LevelingState = {
  // layout
  leftWidth: number;
  rightWidth: number;
  density: MatrixDensity;
  setLeftWidth: (w: number) => void;
  setRightWidth: (w: number) => void;
  setDensity: (d: MatrixDensity) => void;

  // columns
  hiddenBidderIds: string[];
  toggleBidderVisibility: (id: string) => void;
  showAllBidders: () => void;

  // rules
  rules: NormalizationRule[];
  toggleRule: (id: string) => void;
  updateRuleValue: (id: string, value: number) => void;
  addRule: (rule: Omit<NormalizationRule, "id">) => void;

  // scenarios (NEW)
  scenarios: Scenario[];
  activeScenarioId: string;
  createScenario: (name: string) => void;
  setActiveScenario: (id: string) => void;
  selectBidderForScope: (scopeId: string, bidderId: string) => void;

  // saved views
  savedViews: SavedView[];
  saveView: (name: string, config: SavedView["config"]) => void;
  deleteView: (id: string) => void;

  // drawer
  drawerOpen: boolean;
  activeTab: DrawerTab;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
  setTab: (tab: DrawerTab) => void;

  // mobile
  mobilePane: MobilePane;
  setMobilePane: (p: MobilePane) => void;

  // selection
  selectedBidderId?: string;
  selectedScopeId?: string;
  setSelection: (bidderId?: string, scopeId?: string) => void;

  // audit
  auditEvents: AuditEvent[];
  addAuditEvent: (e: Omit<AuditEvent, "id" | "ts" | "actor"> & { actor?: string }) => void;
  clearAudit: () => void;

  // toasts
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id" | "ts">) => string;
  dismissToast: (id: string) => void;
};

const rid = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;

export const useLevelingStore = create<LevelingState>()(
  persist(
    (set, get) => ({
      leftWidth: 340,
      rightWidth: 420,
      density: "comfortable",
      setLeftWidth: (w) => set({ leftWidth: w }),
      setRightWidth: (w) => set({ rightWidth: w }),
      setDensity: (density) => set({ density }),

      hiddenBidderIds: [],
      toggleBidderVisibility: (id) =>
        set((s) => ({
          hiddenBidderIds: s.hiddenBidderIds.includes(id)
            ? s.hiddenBidderIds.filter((x) => x !== id)
            : [...s.hiddenBidderIds, id],
        })),
      showAllBidders: () => set({ hiddenBidderIds: [] }),

      rules: [
        { id: "r1", label: "Safety & Insurance", type: "markup", value: 3.5, active: false, applyTo: "all" },
        { id: "r2", label: "Plug Scope Gaps", type: "plug", value: 5000, active: true, applyTo: "gaps" },
        { id: "r3", label: "Inflation Buffer", type: "markup", value: 2.0, active: false, applyTo: "all" },
      ],
      toggleRule: (id) => set((s) => ({ rules: s.rules.map(r => r.id === id ? { ...r, active: !r.active } : r) })),
      updateRuleValue: (id, val) => set((s) => ({ rules: s.rules.map(r => r.id === id ? { ...r, value: val } : r) })),
      addRule: (r) => set((s) => ({ rules: [...s.rules, { ...r, id: rid("RULE") }] })),

      // --- SCENARIO LOGIC ---
      scenarios: [
        { id: "scn-1", name: "Base Recommendation", selections: {} }, // Default
      ],
      activeScenarioId: "scn-1",
      createScenario: (name) => {
        const id = rid("SCN");
        // Clone selections from current active scenario
        const currentSelections = get().scenarios.find(s => s.id === get().activeScenarioId)?.selections || {};
        
        set((s) => ({
            scenarios: [...s.scenarios, { id, name, selections: { ...currentSelections } }], // Deep copy selections
            activeScenarioId: id
        }));
        get().addAuditEvent({ action: "SCENARIO_CREATED", meta: { name } });
      },
      setActiveScenario: (id) => set({ activeScenarioId: id }),
      selectBidderForScope: (scopeId, bidderId) => {
          set((s) => ({
              scenarios: s.scenarios.map(scn => 
                  scn.id === s.activeScenarioId 
                  ? { ...scn, selections: { ...scn.selections, [scopeId]: bidderId } }
                  : scn
              )
          }));
          get().addAuditEvent({ action: "BID_SELECTED", bidderId, scopeId });
      },
      // ----------------------

      savedViews: [
        { id: "def-1", name: "Standard View", config: { heatmapEnabled: true, showGapsOnly: false, includeOnly: false, density: "comfortable" } },
        { id: "def-2", name: "Executive Summary", config: { heatmapEnabled: true, showGapsOnly: false, includeOnly: true, density: "spacious" } },
        { id: "def-3", name: "Scope Gaps", config: { heatmapEnabled: false, showGapsOnly: true, includeOnly: false, density: "compact" } },
      ],
      saveView: (name, config) =>
        set((s) => ({
          savedViews: [...s.savedViews, { id: rid("VIEW"), name, config }],
        })),
      deleteView: (id) =>
        set((s) => ({
          savedViews: s.savedViews.filter((v) => v.id !== id),
        })),

      drawerOpen: true,
      activeTab: "bidder",
      openDrawer: (tab) =>
        set((s) => ({
          drawerOpen: true,
          activeTab: tab ?? s.activeTab ?? "bidder",
        })),
      closeDrawer: () => set({ drawerOpen: false }),
      setTab: (tab) => set({ activeTab: tab }),

      mobilePane: "matrix",
      setMobilePane: (p) => set({ mobilePane: p }),

      selectedBidderId: undefined,
      selectedScopeId: undefined,
      setSelection: (bidderId, scopeId) => set({ selectedBidderId: bidderId, selectedScopeId: scopeId }),

      auditEvents: [],
      addAuditEvent: (e) => {
        const ev: AuditEvent = {
          id: rid("AUD"),
          ts: new Date().toISOString(),
          actor: e.actor ?? "Ashish (Demo)",
          action: e.action,
          projectId: e.projectId,
          packageId: e.packageId,
          bidderId: e.bidderId,
          scopeId: e.scopeId,
          meta: e.meta,
        };

        set((s) => ({
          auditEvents: [ev, ...s.auditEvents].slice(0, 500),
        }));
      },
      clearAudit: () => set({ auditEvents: [] }),

      toasts: [],
      pushToast: (t) => {
        const id = rid("TST");
        const toast: Toast = {
          id,
          title: t.title,
          detail: t.detail,
          tone: t.tone ?? "neutral",
          ts: Date.now(),
        };
        set((s) => ({ toasts: [toast, ...s.toasts].slice(0, 6) }));
        return id;
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
    }),
    {
      name: "bidmatrix.leveling",
      version: 5, // Bumped
      migrate: (persistedState: any) => persistedState as LevelingState,
      partialize: (s: LevelingState) => ({
        leftWidth: s.leftWidth,
        rightWidth: s.rightWidth,
        density: s.density,
        hiddenBidderIds: s.hiddenBidderIds,
        rules: s.rules,
        scenarios: s.scenarios, // Persist Scenarios
        activeScenarioId: s.activeScenarioId, // Persist Active
        savedViews: s.savedViews,
        drawerOpen: s.drawerOpen,
        activeTab: s.activeTab,
        mobilePane: s.mobilePane,
        selectedBidderId: s.selectedBidderId,
        selectedScopeId: s.selectedScopeId,
        auditEvents: s.auditEvents,
      } as LevelingState),
    },
  ),
);