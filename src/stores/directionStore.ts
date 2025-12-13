import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BusInfo, UserConfig } from '../types';
import { 
  classifyBuses, 
  integrateStationMetadata,
  type StationMetadata,
  type DirectionClassification 
} from '../utils/directionIntelligence';

export interface ManualDirectionOverride {
  routeId: string;
  stationId: string;
  direction: DirectionClassification;
  timestamp: Date;
}

export interface DirectionStore {
  // Manual overrides for specific route-station combinations
  manualOverrides: ManualDirectionOverride[];
  
  // Station metadata cache
  stationMetadata: Map<string, StationMetadata>;
  
  // Actions
  setManualOverride: (routeId: string, stationId: string, direction: DirectionClassification) => void;
  removeManualOverride: (routeId: string, stationId: string) => void;
  clearAllOverrides: () => void;
  
  setStationMetadata: (stationId: string, metadata: StationMetadata) => void;
  getStationMetadata: (stationId: string) => StationMetadata | undefined;
  
  classifyBusesWithIntelligence: (
    buses: BusInfo[], 
    userConfig: UserConfig,
    calculateDistance: (from: any, to: any) => number
  ) => BusInfo[];
  
  getManualOverride: (routeId: string, stationId: string) => DirectionClassification | undefined;
}

export const useDirectionStore = create<DirectionStore>()(
  persist(
    (set, get) => ({
      manualOverrides: [],
      stationMetadata: new Map(),

      setManualOverride: (routeId: string, stationId: string, direction: DirectionClassification) => {
        const overrides = get().manualOverrides;
        const existingIndex = overrides.findIndex(
          override => override.routeId === routeId && override.stationId === stationId
        );

        const newOverride: ManualDirectionOverride = {
          routeId,
          stationId,
          direction,
          timestamp: new Date(),
        };

        if (existingIndex >= 0) {
          // Update existing override
          const updatedOverrides = [...overrides];
          updatedOverrides[existingIndex] = newOverride;
          set({ manualOverrides: updatedOverrides });
        } else {
          // Add new override
          set({ manualOverrides: [...overrides, newOverride] });
        }
      },

      removeManualOverride: (routeId: string, stationId: string) => {
        const overrides = get().manualOverrides;
        const filteredOverrides = overrides.filter(
          override => !(override.routeId === routeId && override.stationId === stationId)
        );
        set({ manualOverrides: filteredOverrides });
      },

      clearAllOverrides: () => {
        set({ manualOverrides: [] });
      },

      setStationMetadata: (stationId: string, metadata: StationMetadata) => {
        const currentMetadata = get().stationMetadata;
        const newMetadata = new Map(currentMetadata);
        newMetadata.set(stationId, metadata);
        set({ stationMetadata: newMetadata });
      },

      getStationMetadata: (stationId: string) => {
        return get().stationMetadata.get(stationId);
      },

      getManualOverride: (routeId: string, stationId: string) => {
        const overrides = get().manualOverrides;
        const override = overrides.find(
          o => o.routeId === routeId && o.stationId === stationId
        );
        return override?.direction;
      },

      classifyBusesWithIntelligence: (
        buses: BusInfo[], 
        userConfig: UserConfig,
        calculateDistance: (from: any, to: any) => number
      ) => {
        const { manualOverrides, stationMetadata } = get();
        
        return buses.map(bus => {
          // Check for manual override first
          const manualDirection = manualOverrides.find(
            override => override.routeId === bus.route && override.stationId === bus.station.id
          )?.direction;

          if (manualDirection) {
            return { ...bus, direction: manualDirection };
          }

          // Use station metadata if available
          const metadata = stationMetadata.get(bus.station.id);
          if (metadata) {
            const direction = integrateStationMetadata(bus, userConfig, metadata, calculateDistance);
            return { ...bus, direction };
          }

          // Fallback to basic classification
          const classifiedBuses = classifyBuses([bus], userConfig, calculateDistance);
          return classifiedBuses[0];
        });
      },
    }),
    {
      name: 'bus-tracker-direction',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          
          try {
            const parsed = JSON.parse(item);
            if (parsed.state?.stationMetadata && Array.isArray(parsed.state.stationMetadata)) {
              parsed.state.stationMetadata = new Map(parsed.state.stationMetadata);
            }
            return JSON.stringify(parsed);
          } catch {
            return item;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            const parsed = JSON.parse(value);
            if (parsed.state?.stationMetadata instanceof Map) {
              parsed.state.stationMetadata = Array.from(parsed.state.stationMetadata.entries());
            }
            localStorage.setItem(name, JSON.stringify(parsed));
          } catch {
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      })),
    }
  )
);