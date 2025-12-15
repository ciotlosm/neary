import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Detect system theme preference
const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: getSystemTheme(),
      toggleTheme: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
      setTheme: (mode: ThemeMode) =>
        set({ mode }),
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => localStorage),
      // Only persist if user has manually changed theme
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // Only auto-update if user hasn't manually set a preference
    const stored = localStorage.getItem('theme-store');
    if (!stored) {
      useThemeStore.getState().setTheme(e.matches ? 'dark' : 'light');
    }
  });
}