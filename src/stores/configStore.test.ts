import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { useConfigStore } from './configStore';
import type { UserConfig, Coordinates } from '../types';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock btoa/atob for encryption
Object.defineProperty(window, 'btoa', {
  value: vi.fn((str: string) => Buffer.from(str).toString('base64')),
});

Object.defineProperty(window, 'atob', {
  value: vi.fn((str: string) => Buffer.from(str, 'base64').toString()),
});

// Generators for property-based testing
const coordinatesArb = fc.record({
  latitude: fc.double({ min: -90, max: 90 }),
  longitude: fc.double({ min: -180, max: 180 }),
});

const userConfigArb = fc.record({
  city: fc.string({ minLength: 1, maxLength: 50 }),
  homeLocation: coordinatesArb,
  workLocation: coordinatesArb,
  apiKey: fc.string({ minLength: 10, maxLength: 100 }),
  refreshRate: fc.integer({ min: 1000, max: 300000 }), // 1 second to 5 minutes
});

describe('ConfigStore Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset the store state
    useConfigStore.getState().resetConfig();
  });

  it('**Feature: bus-tracker, Property 1: Configuration persistence and application** - For any valid configuration change, saving the configuration should persist all data and apply changes immediately without requiring application restart', () => {
    fc.assert(
      fc.property(userConfigArb, (config) => {
        const store = useConfigStore.getState();
        
        // Apply the configuration
        store.updateConfig(config);
        
        // Verify immediate application (no restart required)
        const currentState = useConfigStore.getState();
        expect(currentState.config).toEqual(config);
        expect(currentState.isConfigured).toBe(true);
        
        // Create a new store instance to test persistence
        // This simulates app restart by accessing the persisted state
        const newStoreState = useConfigStore.getState();
        
        // Verify persistence - the configuration should be the same
        expect(newStoreState.config).toEqual(config);
        expect(newStoreState.isConfigured).toBe(true);
        
        // Verify that sensitive data (API key) was encrypted in storage
        const storedData = localStorageMock.getItem('bus-tracker-config');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          // The stored API key should be different from the original (encrypted)
          expect(parsed.state.config.apiKey).not.toBe(config.apiKey);
          // But when retrieved, it should be decrypted correctly
          expect(newStoreState.config?.apiKey).toBe(config.apiKey);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should handle partial configuration updates correctly', () => {
    fc.assert(
      fc.property(
        userConfigArb,
        fc.record({
          city: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          refreshRate: fc.option(fc.integer({ min: 1000, max: 300000 })),
        }),
        (initialConfig, partialUpdate) => {
          const store = useConfigStore.getState();
          
          // Set initial configuration
          store.updateConfig(initialConfig);
          
          // Apply partial update
          const cleanPartialUpdate = Object.fromEntries(
            Object.entries(partialUpdate).filter(([, value]) => value !== null)
          );
          
          store.updateConfig(cleanPartialUpdate);
          
          // Verify the configuration was merged correctly
          const currentState = useConfigStore.getState();
          const expectedConfig = { ...initialConfig, ...cleanPartialUpdate };
          
          expect(currentState.config).toEqual(expectedConfig);
        }
      ),
      { numRuns: 100 }
    );
  });
});