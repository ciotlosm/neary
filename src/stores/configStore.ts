import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ConfigStore, UserConfig } from '../types';

// Simple encryption/decryption for sensitive data
const encryptData = (data: string): string => {
  // Simple base64 encoding for demo - in production use proper encryption
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

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      config: null,
      isConfigured: false,
      isFullyConfigured: false,

      updateConfig: (newConfig: Partial<UserConfig>) => {
        const currentConfig = get().config;
        const updatedConfig = currentConfig 
          ? { ...currentConfig, ...newConfig }
          : newConfig as UserConfig;
        
        const isConfigured = !!(
          updatedConfig.apiKey &&
          updatedConfig.refreshRate
        );
        
        const isFullyConfigured = !!(
          updatedConfig.city &&
          updatedConfig.agencyId &&
          updatedConfig.homeLocation &&
          updatedConfig.workLocation &&
          updatedConfig.apiKey &&
          updatedConfig.refreshRate
        );
        
        set({
          config: updatedConfig,
          isConfigured,
          isFullyConfigured,
        });
      },

      resetConfig: () => {
        set({
          config: null,
          isConfigured: false,
          isFullyConfigured: false,
        });
      },
    }),
    {
      name: 'bus-tracker-config',
      storage: createJSONStorage(() => createEncryptedStorage()),
      version: 2, // Increment version for migration
      migrate: (persistedState: any, version: number) => {
        // Migration for version 1 -> 2: Add agencyId field
        if (version < 2 && persistedState?.config) {
          // If user has a city but no agencyId, they need to reconfigure
          if (persistedState.config.city && !persistedState.config.agencyId) {
            return {
              ...persistedState,
              config: {
                ...persistedState.config,
                agencyId: '', // Will trigger reconfiguration
              },
              isFullyConfigured: false, // Force reconfiguration
            };
          }
        }
        return persistedState;
      },
    }
  )
);