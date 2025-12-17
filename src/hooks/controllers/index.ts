/**
 * Controller Hooks
 * 
 * High-level business logic hooks that orchestrate data and processing layers.
 * These hooks implement the main application workflows and user interactions.
 */

// Main vehicle processing orchestration
export { useVehicleProcessing, type VehicleProcessingOptions, type VehicleProcessingResult } from './useVehicleProcessingOrchestration';

// View controllers
export { useNearbyViewController } from './useNearbyViewController';
export { useStationDisplayIntegration } from './useStationDisplayIntegration';

// Business logic managers
export { useRouteManager } from './useRouteManager';