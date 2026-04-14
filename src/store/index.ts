import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DashboardSnapshot, User } from "@/types/models";

type AuthState = {
  access: string | null;
  refresh: string | null;
  user: User | null;
  dashboard: DashboardSnapshot | null;
  loginResponse: Record<string, unknown> | null;
  setToken: (access: string | null, refresh: string | null) => void;
  setUser: (user: User | null) => void;
  setDashboard: (dashboard: DashboardSnapshot | null) => void;
  setLoginResponse: (response: Record<string, unknown> | null) => void;
  resetAuth: () => void;
};

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      user: null,
      dashboard: null,
      loginResponse: null,
      setToken: (access, refresh) => set({ access, refresh }),
      setUser: (user) => set({ user }),
      setDashboard: (dashboard) => set({ dashboard }),
      setLoginResponse: (loginResponse) => set({ loginResponse }),
      resetAuth: () =>
        set({
          access: null,
          refresh: null,
          user: null,
          dashboard: null,
          loginResponse: null,
        }),
    }),
    {
      name: "homecell",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        access: state.access,
        refresh: state.refresh,
        user: state.user,
        dashboard: state.dashboard,
        loginResponse: state.loginResponse,
      }),
    },
  ),
);
