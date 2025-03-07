import { create } from 'zustand';

type Language = 'uz' | 'ru' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'uz',
  setLanguage: (lang) => set({ language: lang }),
}));