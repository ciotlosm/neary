// Unified input validation library exports
export { InputValidator } from './InputValidator';
export { 
  validateArray, 
  validateVehicleArray, 
  validateStationArray 
} from './arrayValidators';
export { 
  validateCoordinates, 
  validateBounds 
} from './coordinateValidators';
export { createSafeDefaults } from './safeDefaults';

// Re-export types for convenience
export type {
  ValidationResult,
  ValidationError,
  CoordinateBounds,
  SafeDefaultsConfig
} from './types';