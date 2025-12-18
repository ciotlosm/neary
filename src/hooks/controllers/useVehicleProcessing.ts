/**
 * Main useVehicleProcessing hook - now exports the new composition implementation
 * 
 * This file has been updated to export the new composition hook that provides:
 * - Simple composition of data and processing hooks
 * - Exact backward compatibility with the original API
 * - Performance improvements through elimination of complex orchestration
 * - Clean error handling and loading state management
 * 
 * The original 1,113-line orchestration implementation has been removed.
 */

// Re-export the new composition hook as the main useVehicleProcessing
export {
  useVehicleDisplay as useVehicleProcessing,
  type UseVehicleDisplayOptions as VehicleProcessingOptions,
  type UseVehicleDisplayResult as VehicleProcessingResult
} from './useVehicleDisplay';