import { create } from "zustand";

type UIStore = {
  isSidebarCollapsed: boolean;
  isMobileDrawerOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  isSidebarCollapsed: false,
  isMobileDrawerOpen: false,
  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
  },
  setMobileDrawerOpen: (open) => {
    set({ isMobileDrawerOpen: open });
  },
}));
