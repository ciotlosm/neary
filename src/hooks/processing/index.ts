// Processing layer hooks for the Cluj Bus App
// These hooks provide focused business logic processing without data fetching

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
export type { 
  DirectionStatus, 
  ConfidenceLevel, 
  DirectionAnalysisResult 
} from './useDirectionAnalysis';

export { useProximityCalculation } from './useProximityCalculation';
export type { ProximityResult } from './useProximityCalculation';