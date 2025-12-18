/**
 * Controller Hooks
 * 
 * High-level business logic hooks that orchestrate data and processing layers.
 * These hooks implement the main application workflows and user interactions.
 */

// Main vehicle processing (now using composition pattern)
export { useVehicleDisplay as useVehicleProcessing, type UseVehicleDisplayOptions as VehicleProcessingOptions, type UseVehicleDisplayResult as VehicleProcessingResult } from './useVehicleDisplay';

// Simple composition hook (new architecture)
export { useVehicleDisplay, type UseVehicleDisplayOptions, type UseVehicleDisplayResult } from './useVehicleDisplay';

// View controllers
export { useNearbyViewController } from './useNearbyViewController';

// Business logic managers
export { useRouteManager } from './useRouteManager';