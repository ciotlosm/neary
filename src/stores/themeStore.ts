import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Default to dark theme (fallback to system preference if needed)
const getDefaultTheme = (): ThemeMode => {
  // Always default to dark mode for better error handling visibility
  return 'dark';
};

// Detect system theme preference (kept for reference but not used as default)
const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark'; // Changed from 'light' to 'dark' as fallback
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: getDefaultTheme(),
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
      initialTheme = parsed.state?.mode || getDefaultTheme();
    } catch {
      initialTheme = getDefaultTheme();
    }
  } else {
    initialTheme = getDefaultTheme();
  }
  
  // Apply theme immediately to prevent flash
  document.documentElement.setAttribute('data-theme', initialTheme);
  
  // Listen for system theme changes (but maintain dark mode preference)
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-update if user hasn't manually set a preference AND system goes to dark
      const currentStored = localStorage.getItem('cluj-bus-theme');
      if (!currentStored && e.matches) {
        // Only follow system if it's going to dark mode (our preferred default)
        const newTheme = 'dark';
        useThemeStore.getState().setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    });
  }
}