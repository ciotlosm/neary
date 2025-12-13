import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FavoritesStore, Favorites, Station } from '../types';
import { useBusStore } from './busStore';

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: {
        buses: [],
        stations: [],
      },

      addFavoriteBus: (routeShortName: string) => {
        const currentFavorites = get().favorites;
        if (!currentFavorites.buses.some(bus => typeof bus === 'string' ? bus === routeShortName : bus.shortName === routeShortName)) {
          set({
            favorites: {
              ...currentFavorites,
              buses: [...currentFavorites.buses, routeShortName as any],
            },
          });
        }
      },

      removeFavoriteBus: (routeShortName: string) => {
        const currentFavorites = get().favorites;
        set({
          favorites: {
            ...currentFavorites,
            buses: currentFavorites.buses.filter(bus => typeof bus === 'string' ? bus !== routeShortName : bus.shortName !== routeShortName),
          },
        });
      },

      addFavoriteStation: (stationId: string) => {
        const currentFavorites = get().favorites;
        if (!currentFavorites.stations.includes(stationId)) {
          set({
            favorites: {
              ...currentFavorites,
              stations: [...currentFavorites.stations, stationId],
            },
          });
        }
      },

      removeFavoriteStation: (stationId: string) => {
        const currentFavorites = get().favorites;
        set({
          favorites: {
            ...currentFavorites,
            stations: currentFavorites.stations.filter(id => id !== stationId),
          },
        });
      },

      getFilteredStations: (): Station[] => {
        const { favorites } = get();
        const { stations, buses } = useBusStore.getState();
        
        if (favorites.buses.length === 0) {
          return stations;
        }

        // Filter stations to only show those where favorite buses stop
        return stations.filter(station => {
          // Check if any bus at this station is in favorites
          const stationBuses = buses.filter(bus => bus.station.id === station.id);
          // Note: bus.route should now contain route short names
          return stationBuses.some(bus => favorites.buses.some(favBus => typeof favBus === 'string' ? favBus === bus.route : favBus.shortName === bus.route));
        });
      },
    }),
    {
      name: 'bus-tracker-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
);