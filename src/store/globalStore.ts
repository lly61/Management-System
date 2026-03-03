import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "../locales/i18n";

export type Lang = "zh" | "en";

interface GlobalState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const STORAGE_KEY = "global-store";

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      lang: "zh",
      setLang: (lang) => {
        set({ lang });
        i18n.changeLanguage(lang);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ lang: state.lang }),
    }
  )
);
