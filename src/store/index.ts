import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/models";

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
      access: null,
      refresh: null,
      user: null,
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
