/**
 * Processing Layer Hooks
 * 
 * These hooks provide focused business logic processing without data fetching.
 * They implement pure transformation functions that take data as input and
 * return processed results without side effects.
 * 
 * Architecture Boundary: Processing layer has no data fetching dependencies
 * Requirements: 11.1, 11.2
 */

export { useVehicleFiltering } from './useVehicleFiltering';
export type { 
  UseVehicleFilteringOptions, 
  VehicleFilteringStats, 
  VehicleFilteringResult 
} from './useVehicleFiltering';

export { useVehicleGrouping } from './useVehicleGrouping';
export type { 
  UseVehicleGroupingOptions, 
  StationWithDistance, 
  StationVehicleGroup, 
  VehicleGroupingResult 
} from './useVehicleGrouping';

export { useDirectionAnalysis } from './useDirectionAnalysis';

export { useProximityCalculation } from './useProximityCalculation';
export type { ProximityResult } from './useProximityCalculation';

export { useVehicleStationAnalysis } from './useVehicleStationAnalysis';
export type { 
  UseVehicleStationAnalysisOptions,
  VehicleWithStationAnalysis,
  VehicleStationAnalysisResult 
} from './useVehicleStationAnalysis';