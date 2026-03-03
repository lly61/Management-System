import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "../locales/i18n";

export type Lang = "zh" | "en";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface GlobalState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

const STORAGE_KEY = "global-store";

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      lang: "zh",
      token: null,
      user: null,
      setLang: (lang) => {
        set({ lang });
        i18n.changeLanguage(lang);
      },
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        lang: state.lang,
        token: state.token,
        user: state.user,
      }),
    }
  )
);
