import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { useFavoritesStore } from './favoritesStore';
import { useBusStore } from './busStore';
import type { BusInfo, Station, Coordinates } from '../types';

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

// Generators for property-based testing
const coordinatesArb = fc.record({
  latitude: fc.double({ min: -90, max: 90 }),
  longitude: fc.double({ min: -180, max: 180 }),
});

const stationArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  coordinates: coordinatesArb,
  isFavorite: fc.boolean(),
});

const busInfoArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  route: fc.string({ minLength: 1, maxLength: 10 }),
  destination: fc.string({ minLength: 1, maxLength: 50 }),
  arrivalTime: fc.date(),
  isLive: fc.boolean(),
  minutesAway: fc.integer({ min: 0, max: 60 }),
  station: stationArb,
  direction: fc.constantFrom('work', 'home', 'unknown'),
});

const routeIdArb = fc.string({ minLength: 1, maxLength: 10 });
const stationIdArb = fc.string({ minLength: 1, maxLength: 20 });

describe('FavoritesStore Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset both stores
    useFavoritesStore.setState({
      favorites: { buses: [], stations: [] }
    });
    useBusStore.setState({
      buses: [],
      stations: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
    });
  });

  it('**Feature: bus-tracker, Property 2: Favorite bus station filtering** - For any set of favorite buses, the filtered station results should only contain stations where at least one favorite bus stops', () => {
    fc.assert(
      fc.property(
        fc.array(stationArb, { minLength: 1, maxLength: 10 }),
        fc.array(busInfoArb, { minLength: 1, maxLength: 20 }),
        fc.array(routeIdArb, { minLength: 1, maxLength: 5 }),
        (stations, buses, favoriteBusRoutes) => {
          // Set up state in bus store
          useBusStore.setState({
            stations,
            buses,
            lastUpdate: new Date(),
            isLoading: false,
            error: null,
          });

          // Set up favorite buses
          useFavoritesStore.setState({
            favorites: { buses: favoriteBusRoutes, stations: [] }
          });

          const favoritesStore = useFavoritesStore.getState();
          const filteredStations = favoritesStore.getFilteredStations();

          // Verify that every filtered station has at least one favorite bus stopping at it
          filteredStations.forEach(station => {
            const busesAtStation = buses.filter(bus => bus.station.id === station.id);
            const hasFavoriteBus = busesAtStation.some(bus => favoriteBusRoutes.includes(bus.route));
            expect(hasFavoriteBus).toBe(true);
          });

          // Verify that all stations with favorite buses are included in filtered results
          const stationsWithFavoriteBuses = stations.filter(station => {
            const busesAtStation = buses.filter(bus => bus.station.id === station.id);
            return busesAtStation.some(bus => favoriteBusRoutes.includes(bus.route));
          });

          stationsWithFavoriteBuses.forEach(station => {
            expect(filteredStations.some(s => s.id === station.id)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('**Feature: bus-tracker, Property 3: Immediate favorites view updates** - For any modification to favorites (adding or removing), the filtered views should update immediately to reflect the changes', () => {
    fc.assert(
      fc.property(
        fc.array(stationArb, { minLength: 1, maxLength: 10 }),
        fc.array(busInfoArb, { minLength: 1, maxLength: 20 }),
        fc.array(routeIdArb, { minLength: 0, maxLength: 5 }),
        (stations, buses, initialFavoriteBuses) => {
          // Set up initial state in bus store
          useBusStore.setState({
            stations,
            buses,
            lastUpdate: new Date(),
            isLoading: false,
            error: null,
          });

          // Set up initial favorites
          useFavoritesStore.setState({
            favorites: { buses: initialFavoriteBuses, stations: [] }
          });

          const favoritesStore = useFavoritesStore.getState();
          
          // Get initial filtered stations
          const initialFilteredStations = favoritesStore.getFilteredStations();
          
          // Pick a random bus route to add/remove
          const availableRoutes = buses.map(bus => bus.route);
          if (availableRoutes.length > 0) {
            const randomRoute = availableRoutes[Math.floor(Math.random() * availableRoutes.length)];
            
            // Test adding a favorite bus
            const wasAlreadyFavorite = initialFavoriteBuses.includes(randomRoute);
            
            if (!wasAlreadyFavorite) {
              // Add the bus to favorites
              favoritesStore.addFavoriteBus(randomRoute);
              
              // Verify immediate update - favorites should now include this route
              const updatedState = useFavoritesStore.getState();
              expect(updatedState.favorites.buses).toContain(randomRoute);
              
              // Verify filtered view updates immediately
              const newFilteredStations = updatedState.getFilteredStations();
              
              // The filtered stations should now include stations where this bus stops
              const stationsWithThisBus = stations.filter(station =>
                buses.some(bus => bus.route === randomRoute && bus.station.id === station.id)
              );
              
              stationsWithThisBus.forEach(station => {
                expect(newFilteredStations.some(s => s.id === station.id)).toBe(true);
              });
            } else {
              // Remove the bus from favorites
              favoritesStore.removeFavoriteBus(randomRoute);
              
              // Verify immediate update - favorites should no longer include this route
              const updatedState = useFavoritesStore.getState();
              expect(updatedState.favorites.buses).not.toContain(randomRoute);
              
              // Verify filtered view updates immediately
              const newFilteredStations = updatedState.getFilteredStations();
              
              // If no other favorite buses stop at certain stations, they should be filtered out
              if (updatedState.favorites.buses.length === 0) {
                // If no favorite buses, should show all stations
                expect(newFilteredStations).toEqual(stations);
              }
            }
          }
          
          // Test station favorites for immediate updates
          if (stations.length > 0) {
            const randomStation = stations[Math.floor(Math.random() * stations.length)];
            
            // Add station to favorites
            favoritesStore.addFavoriteStation(randomStation.id);
            
            // Verify immediate update
            const updatedState = useFavoritesStore.getState();
            expect(updatedState.favorites.stations).toContain(randomStation.id);
            
            // Remove station from favorites
            favoritesStore.removeFavoriteStation(randomStation.id);
            
            // Verify immediate update
            const finalState = useFavoritesStore.getState();
            expect(finalState.favorites.stations).not.toContain(randomStation.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle duplicate favorite additions correctly', () => {
    fc.assert(
      fc.property(routeIdArb, (routeId) => {
        const store = useFavoritesStore.getState();
        
        // Add the same route multiple times
        store.addFavoriteBus(routeId);
        store.addFavoriteBus(routeId);
        store.addFavoriteBus(routeId);
        
        // Should only appear once in favorites
        const state = useFavoritesStore.getState();
        const occurrences = state.favorites.buses.filter(id => id === routeId).length;
        expect(occurrences).toBe(1);
      }),
      { numRuns: 100 }
    );
  });
});