import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_USER, User } from "@/data/mock-data";

type AuthState = {
  access: string | null;
  refresh: string | null;
  user: User | null;
  setToken: (access: string | null, refresh: string | null) => void;
  setUser: (user: User | null) => void;
  resetAuth: () => void;
};

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      access: "dummy-access-token",
      refresh: "dummy-refresh-token",
      user: MOCK_USER,
      setToken: (access, refresh) => set({ access, refresh }),
      setUser: (user) => set({ user }),
      resetAuth: () => set({ access: null, refresh: null, user: null }),
    }),
    {
      name: "homecell",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        access: state.access,
        refresh: state.refresh,
        user: state.user,
      }),
    },
  ),
);
