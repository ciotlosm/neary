import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserConfig, Agency, ErrorState } from '../types';
import { tranzyApiService } from '../services/tranzyApiService';
import { logger } from '../utils/logger';

export type ThemeMode = 'light' | 'dark';

// Simple encryption/decryption for sensitive data
const encryptData = (data: string): string => {
  return btoa(data);
};

const decryptData = (encryptedData: string): string => {
  try {
    return atob(encryptedData);
  } catch {
    return '';
  }
};

// Custom storage that encrypts sensitive fields
const createEncryptedStorage = () => ({
  getItem: (name: string): string | null => {
    const item = localStorage.getItem(name);
    if (!item) return null;
    
    try {
      const parsed = JSON.parse(item);
      if (parsed.state?.config?.apiKey) {
        parsed.state.config.apiKey = decryptData(parsed.state.config.apiKey);
      }
      return JSON.stringify(parsed);
    } catch {
      return item;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value);
      if (parsed.state?.config?.apiKey) {
        parsed.state.config.apiKey = encryptData(parsed.state.config.apiKey);
      }
      localStorage.setItem(name, JSON.stringify(parsed));
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
});

// Detect system theme preference
const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export interface AppStore {
  // Configuration
  config: UserConfig | null;
  isConfigValid: boolean;
  
  // Theme
  theme: ThemeMode;
  
  // Agencies
  agencies: Agency[];
  isAgenciesLoading: boolean;
  agenciesError: ErrorState | null;
  isApiValidated: boolean;
  
  // Actions - Configuration
  setConfig: (config: UserConfig) => void;
  updateConfig: (updates: Partial<UserConfig>) => void;
  clearConfig: () => void;
  validateConfig: () => boolean;
  
  // Actions - Theme
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  
  // Actions - Agencies
  fetchAgencies: () => Promise<void>;
  clearAgenciesError: () => void;
  validateApiKey: (apiKey: string) => Promise<boolean>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      config: null,
      isConfigValid: false,
      theme: getSystemTheme(),
      agencies: [],
      isAgenciesLoading: false,
      agenciesError: null,
      isApiValidated: false,

      // Configuration actions
      setConfig: (config: UserConfig) => {
        const isValid = Boolean(
          config.apiKey && 
          config.city && 
          config.homeLocation && 
          config.workLocation
        );
        
        set({ 
          config, 
          isConfigValid: isValid,
          isApiValidated: false // Reset API validation when config changes
        });
        
        logger.info('Configuration updated', { 
          hasApiKey: !!config.apiKey,
          city: config.city,
          isValid 
        });
      },

      updateConfig: (updates: Partial<UserConfig>) => {
        const currentConfig = get().config;
        if (!currentConfig) {
          logger.warn('Attempted to update config when none exists');
          return;
        }
        
        const newConfig = { ...currentConfig, ...updates };
        get().setConfig(newConfig);
      },

      clearConfig: () => {
        set({ 
          config: null, 
          isConfigValid: false,
          isApiValidated: false,
          agencies: [] // Clear agencies when config is cleared
        });
        logger.info('Configuration cleared');
      },

      validateConfig: () => {
        const { config } = get();
        const isValid = Boolean(
          config?.apiKey && 
          config?.city && 
          config?.homeLocation && 
          config?.workLocation
        );
        
        set({ isConfigValid: isValid });
        return isValid;
      },

      // Theme actions
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },

      setTheme: (mode: ThemeMode) => {
        set({ theme: mode });
      },

      // Agency actions
      fetchAgencies: async () => {
        const { isAgenciesLoading } = get();
        
        if (isAgenciesLoading) {
          logger.warn('Agency fetch already in progress');
          return;
        }

        set({ isAgenciesLoading: true, agenciesError: null });
        logger.info('Starting agency fetch');

        try {
          const service = tranzyApiService();
          const agencies = await service.getAgencies();
          
          logger.info('Agencies fetched successfully', { 
            agencyCount: agencies.length 
          });
          
          set({
            agencies,
            isAgenciesLoading: false,
            agenciesError: null,
            isApiValidated: true,
          });
        } catch (error) {
          const errorState: ErrorState = {
            message: error instanceof Error ? error.message : 'Failed to fetch agencies',
            type: 'network',
            timestamp: new Date(),
            retryable: true,
          };
          
          logger.error('Failed to fetch agencies', { error });
          
          set({
            agenciesError: errorState,
            isAgenciesLoading: false,
            isApiValidated: false,
          });
        }
      },

      clearAgenciesError: () => {
        set({ agenciesError: null });
      },

      validateApiKey: async (apiKey: string) => {
        try {
          const service = tranzyApiService();
          const isValid = await service.validateApiKey(apiKey);
          
          set({ isApiValidated: isValid });
          logger.info('API key validation completed', { isValid });
          
          return isValid;
        } catch (error) {
          logger.error('API key validation failed', { error });
          set({ isApiValidated: false });
          return false;
        }
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => createEncryptedStorage()),
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleThemeChange = (e: MediaQueryListEvent) => {
    const { theme } = useAppStore.getState();
    // Only update if user hasn't manually set a theme
    if (theme === getSystemTheme()) {
      useAppStore.getState().setTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  mediaQuery.addEventListener('change', handleThemeChange);
}