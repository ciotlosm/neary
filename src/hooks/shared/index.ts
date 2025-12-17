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

// Form utilities
export { useFormHandler, useApiKeyForm } from './useFormHandler';
export { useFormValidation } from './useFormValidation';

// UI utilities
export { useMuiUtils } from './useMuiUtils';
export { useThemeUtils } from './useThemeUtils';

// Configuration and system
export { useApiConfig } from './useApiConfig';
export { useConfigurationManager } from './useConfigurationManager';
export { useLocationPicker } from './useLocationPicker';
export { useAppInitialization } from './useAppInitialization';

// Cache and refresh management
export { useModernCacheManager } from './useModernCacheManager';
export { useModernRefreshSystem } from './useModernRefreshSystem';
export { useCacheRefreshIndicator } from './useCacheRefreshIndicator';

// Cache management utilities
export { globalCache, CacheManager, createCacheKey } from './cacheManager';
export { 
  createDependencyTracker, 
  useDependencyTracker, 
  useSelectiveMemo, 
  useSelectiveCallback, 
  usePerformanceMonitor,
  type DependencyTracker,
  type DependencyStats,
  type PerformanceMetrics
} from './dependencyTracker';