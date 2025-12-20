/**
 * Shared Hooks
 * 
 * Reusable utility hooks that can be used across the application.
 * These hooks provide common functionality like async operations, error handling,
 * form management, theming, and system-level operations.
 */

// Async and error handling
export { useAsyncOperation } from './useAsyncOperation';
export { useErrorHandler } from './useErrorHandler';
export { 
  useCentralizedErrorHandler,
  withCentralizedErrorHandling,
  type ErrorHandlingConfig,
  type ErrorRecoveryAction,
  type CentralizedErrorState,
  type UseCentralizedErrorHandlerReturn
} from './useCentralizedErrorHandler';
export {
  ErrorHandlingConfigs,
  useApiErrorHandler,
  useFormErrorHandler,
  useComponentErrorHandler,
  useProcessingErrorHandler,
  useAuthErrorHandler,
  executeWithErrorHandling,
  RecoveryActions,
  shouldShowNotification,
  getErrorContext,
  mergeErrorHandlers
} from './errorHandlingUtils';

// Form utilities
export { useFormHandler, useApiKeyForm } from './useFormHandler';
export { useFormValidation } from './useFormValidation';

// UI utilities
export { 
  useMuiUtils,
  useCardStyles,
  useButtonStyles,
  useFormFieldStyles,
  useNavigationStyles,
  useDataDisplayStyles,
  useFeedbackStyles
} from './useMuiUtils';
export { 
  useThemeUtils,
  useStatusColors,
  useBackgroundColors,
  useSemanticColors,
  useSpacing,
  useAnimationStyles,
  useLayoutStyles,
  useTypographyStyles
} from './useThemeUtils';
export { 
  useComponentStyles,
  useButtonVariantStyles,
  useCardVariantStyles,
  useInputVariantStyles,
  useVariantStyles,
  useComponentStateStyles,
  useCompositionStyles,
  useAccessibilityStyles
} from './useComponentStyles';
export { 
  useComposition,
  withComposition,
  useComposableComponent,
  createCardComposition,
  createModalComposition,
  createFormComposition,
  createListComposition
} from './useComposition';

// Configuration and system
export { useApiConfig } from './useApiConfig';
export { useConfigurationManager } from './useConfigurationManager';
export { useLocationPicker } from './useLocationPicker';
export { useAppInitialization } from './useAppInitialization';
export { 
  useRouteFilteringConfig, 
  useRouteFilteringConfigValue,
  type UseRouteFilteringConfigReturn 
} from './useRouteFilteringConfig';

// Cache and refresh management
export { useUnifiedCacheManager } from './useUnifiedCacheManager';
export { useRefreshSystem } from './useRefreshSystem';
export { useCacheRefreshIndicator } from './useCacheRefreshIndicator';

// Unified cache system
export { unifiedCache, cacheManager, globalCache } from './cache/instance';
export { UnifiedCacheManager } from './cache/UnifiedCacheManager';
export { createCacheKey, CACHE_CONFIGS } from './cache/utils';
export { 
  createDependencyTracker,
  type DependencyTracker,
  type DependencyStats
} from './dependencyTracker';

// Generic store data hook (replaces 4 duplicated hooks)
export { 
  useStoreData,
  useVehicleData,
  useStationData,
  useRouteData,
  useStopTimesData,
  type UseStoreDataConfig,
  type StoreDataResult,
  type DataTypeMap,
  type StoreMethodMap
} from './useStoreData';

// Store subscription hooks (reactive data access) - DEPRECATED: Use useStoreData instead
// Legacy hooks removed: useVehicleStoreData, useStationStoreData, useRouteStoreData, useStopTimesStoreData

// Unified input validation library
export {
  InputValidator,
  validateArray,
  validateVehicleArray,
  validateStationArray,
  validateCoordinates,
  validateBounds,
  createSafeDefaults
} from './validation';
export type {
  ValidationResult,
  ValidationError,
  CoordinateBounds,
  SafeDefaultsConfig
} from './validation';

// Standardized error handling system
export {
  ErrorType,
  ErrorHandler,
  withRetry,
  createRetryWrapper,
  RetryManager,
  createError,
  fromError,
  getUserMessage,
  shouldRetry,
  getSeverity
} from './errors';
export type {
  StandardError,
  RetryConfig,
  ErrorSeverity
} from './errors';

// Shared vehicle processing utilities
export {
  analyzeVehicleDirection,
  createVehicleTransformationPipeline
} from './processing';
export type {
  DirectionAnalysisResult,
  VehicleEnhancementResult,
  VehicleTransformationOptions,
  VehicleTransformationPipeline,
  EnhancedVehicleWithDirection
} from './processing';

// Shared pattern utilities
export { 
  useStatusPatterns,
  useStatusDot,
  useStatusChip,
  useDataFreshness
} from './useStatusPatterns';
export { 
  useInteractivePatterns,
  useHoverEffects,
  useFocusStyles,
  useAccessibleHandlers
} from './useInteractivePatterns';
export { 
  useLayoutPatterns,
  useFlexLayout,
  useStackLayout,
  useResponsiveStyles
} from './useLayoutPatterns';
export { 
  useEventPatterns,
  useClickHandler,
  useChangeHandler,
  useAccessibleHandler
} from './useEventPatterns';
export { 
  useAnimationPatterns,
  useFadeAnimation,
  useHoverAnimation,
  useEntranceAnimation
} from './useAnimationPatterns';