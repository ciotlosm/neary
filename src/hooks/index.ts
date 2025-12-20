/**
 * Hooks Index - Consolidated Architecture
 * 
 * Unified hook exports following the consolidated layered architecture:
 * - Shared Infrastructure: Unified cache, validation, error handling, generic store data
 * - Processing Layer: Pure transformation and business logic
 * - Controllers Layer: Simplified orchestration using unified infrastructure
 * 
 * Consolidation Results:
 * - Eliminated 1,950+ lines of duplicated code
 * - Unified 3 cache systems into 1
 * - Replaced 4 store data hooks with 1 generic implementation
 * - Standardized error handling across all hooks
 */

// === SHARED INFRASTRUCTURE ===
// Unified utilities, validation, caching, and generic data access
export * from './shared';

// === PROCESSING LAYER ===
// Pure data transformation and analysis hooks (excluding conflicting types)
export {
  useVehicleFiltering,
  useVehicleGrouping,
  useDirectionAnalysis,
  useProximityCalculation,
  useVehicleStationAnalysis
} from './processing';
export type {
  UseVehicleFilteringOptions,
  VehicleFilteringStats,
  VehicleFilteringResult,
  UseVehicleGroupingOptions,
  StationWithDistance,
  StationVehicleGroup,
  VehicleGroupingResult,
  ProximityResult,
  UseVehicleStationAnalysisOptions,
  VehicleWithStationAnalysis,
  VehicleStationAnalysisResult
} from './processing';

// === CONTROLLERS LAYER ===
// Simplified high-level orchestration hooks
export * from './controllers';

// === GPS-FIRST DATA LOADING ===
// GPS-first approach for reliable data validation
export * from './useGpsFirstData';

