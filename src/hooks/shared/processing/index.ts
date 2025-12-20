/**
 * Shared vehicle processing utilities
 * 
 * This module provides reusable vehicle processing functions that can be shared
 * across different hooks and components. These utilities are extracted from
 * useVehicleDisplay to eliminate code duplication and improve maintainability.
 * 
 * Note: enhanceVehicleWithRoute has been removed in favor of the new
 * VehicleTransformationService architecture.
 */

export { analyzeVehicleDirection } from './vehicleDirectionAnalysis';
export { createVehicleTransformationPipeline } from './vehicleTransformationPipeline';

export type {
  DirectionAnalysisResult,
  EnhancedVehicleWithDirection,
  VehicleEnhancementResult,
  VehicleTransformationOptions,
  VehicleTransformationPipeline
} from './types';