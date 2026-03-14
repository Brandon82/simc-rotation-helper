import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
}

function getInitialTheme(): boolean {
  try {
    return localStorage.getItem('theme') !== 'light';
  } catch {
    return true;
  }
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: getInitialTheme(),
  toggle: () =>
    set((state) => {
      const next = !state.isDark;
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
      } catch {}
      document.documentElement.classList.toggle('dark', next);
      return { isDark: next };
    }),
}));
