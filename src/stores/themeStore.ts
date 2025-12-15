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
      name: 'cluj-bus-theme',
      storage: createJSONStorage(() => localStorage),
      // Always persist the theme preference for PWA consistency
      partialize: (state) => ({ mode: state.mode }),
      // Force rehydration on every load to ensure PWA consistency
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme immediately to prevent flash
          document.documentElement.setAttribute('data-theme', state.mode);
        }
      },
    }
  )
);

// Initialize theme immediately to prevent flash
if (typeof window !== 'undefined') {
  // Check for stored theme preference first
  const stored = localStorage.getItem('cluj-bus-theme');
  let initialTheme: ThemeMode;
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      initialTheme = parsed.state?.mode || getSystemTheme();
    } catch {
      initialTheme = getSystemTheme();
    }
  } else {
    initialTheme = getSystemTheme();
  }
  
  // Apply theme immediately to prevent flash
  document.documentElement.setAttribute('data-theme', initialTheme);
  
  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-update if user hasn't manually set a preference
      const currentStored = localStorage.getItem('cluj-bus-theme');
      if (!currentStored) {
        const newTheme = e.matches ? 'dark' : 'light';
        useThemeStore.getState().setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    });
  }
}