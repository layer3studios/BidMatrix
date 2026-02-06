import { create } from "zustand";
import { persist } from "zustand/middleware";

type DemoState = {
  slowNetwork: boolean;
  injectAddendum: boolean;
  injectBidUpdate: boolean;

  setSlowNetwork: (v: boolean) => void;
  pulseAddendum: () => void;
  pulseBidUpdate: () => void;
  resetDemo: () => void;
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      slowNetwork: false,
      injectAddendum: false,
      injectBidUpdate: false,

      setSlowNetwork: (slowNetwork) => set({ slowNetwork }),

      pulseAddendum: () => {
        set({ injectAddendum: true });
        window.setTimeout(() => set({ injectAddendum: false }), 600);
      },

      pulseBidUpdate: () => {
        set({ injectBidUpdate: true });
        window.setTimeout(() => set({ injectBidUpdate: false }), 600);
      },

      resetDemo: () => set({ slowNetwork: false, injectAddendum: false, injectBidUpdate: false }),
    }),
    { name: "bidmatrix.demo" },
  ),
);
