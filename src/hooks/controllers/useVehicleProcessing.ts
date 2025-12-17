/**
 * Main useVehicleProcessing hook - now exports the new orchestration implementation
 * 
 * This file has been updated to export the new orchestration hook that provides:
 * - Focused, composable sub-hooks for data and processing
 * - Exact backward compatibility with the original API
 * - Performance improvements through selective re-execution
 * - Comprehensive error handling and retry mechanisms
 * 
 * The original 829-line implementation has been archived to:
 * src/hooks/archive/useVehicleProcessing.legacy.ts
 */

// Re-export the new orchestration hook as the main useVehicleProcessing
export {
  useVehicleProcessing,
  type VehicleProcessingOptions,
  type VehicleProcessingResult
} from './useVehicleProcessingOrchestration';