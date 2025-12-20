/**
 * Clean Store Exports
 * 
 * This file provides the 3 unified stores for the Cluj Bus App:
 * - useConfigStore: Configuration, theme, agencies, and favorites management
 * - useVehicleStore: Unified vehicle data management (live + scheduled)
 * - useLocationStore: GPS and geolocation services
 * 
 * All legacy stores have been consolidated into these 3 focused stores.
 * No backward compatibility aliases are provided for a clean architecture.
 */

/**
 * Configuration Store
 * 
 * Manages all application configuration including:
 * - User settings (API key, refresh rate, locations)
 * - Theme management (light/dark mode with system preference detection)
 * - Agency data and API validation
 * - Favorites management (routes and stations)
 * 
 * Replaces: appStore, configStore, agencyStore, themeStore, favoritesStore
 */
export { useConfigStore } from './configStore';

/**
 * Vehicle Store
 * 
 * Unified vehicle data management including:
 * - Live vehicle tracking with GPS positions
 * - Schedule data from GTFS feeds
 * - Enhanced vehicle information with direction classification
 * - Auto-refresh with configurable intervals
 * - Cache management and offline support
 * 
 * Replaces: busStore, busDataStore, enhancedBusStore, offlineStore
 */
export { useVehicleStore } from './vehicleStore';

/**
 * Location Store
 * 
 * GPS and geolocation services including:
 * - Current location detection with permission handling
 * - Distance calculations using Haversine formula
 * - Location watching with error handling
 * - Coordinate validation and bounds checking
 * 
 * This store was well-designed and is kept as-is.
 */
export { useLocationStore } from './locationStore';

// Export shared utilities for advanced use cases
export { StoreEventManager, StoreEvents } from './shared/storeEvents';
export { autoRefreshManager } from './shared/autoRefresh';
export { StoreErrorHandler } from './shared/errorHandler';
// Legacy cache manager removed - use unifiedCache from hooks/shared/cache/instance

// Export types for TypeScript consumers
export type {
  ConfigStore,
  VehicleStore,
  LocationStore,
  RefreshOptions,
  CacheStats,
  ErrorState,
  ThemeMode,
  UserConfig,
  FavoriteRoute,

  Station,
  Coordinates,
} from '../types';