import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthState = {
  access: string | null;
  refresh: string | null;
  setToken: (access: string | null, refresh: string | null) => void;
  resetAuth: () => void;
};

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      setToken: (access, refresh) => set({ access, refresh }),
      resetAuth: () => set({ access: null, refresh: null }),
    }),
    {
      name: "homecell",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ access: state.access, refresh: state.refresh }),
    },
  ),
);

