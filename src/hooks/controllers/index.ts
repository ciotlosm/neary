/**
 * Controller Hooks
 * 
 * High-level business logic hooks that orchestrate data and processing layers.
 * These hooks implement the main application workflows and user interactions.
 * 
 * Simplified architecture after consolidation:
 * - Reduced useVehicleDisplay from 847 lines to under 200 lines
 * - Uses unified infrastructure (useStoreData, standardized error handling)
 * - Leverages shared processing utilities
 */

// Main vehicle processing (simplified with unified infrastructure)
export { useVehicleDisplay, type UseVehicleDisplayOptions, type UseVehicleDisplayResult } from './useVehicleDisplay';

// Business logic managers (updated to use unified patterns)
export { useRouteManager } from './useRouteManager';