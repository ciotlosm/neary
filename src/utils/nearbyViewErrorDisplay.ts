/**
 * Nearby View Error Display Utilities
 * 
 * Utilities for displaying error messages and recovery actions in the UI
 * for nearby view errors. Provides consistent error presentation across
 * different components.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5 - Appropriate user messages for each error scenario
 */

import type { NearbyViewError } from '../controllers/nearbyViewController';
import { NearbyViewErrorType } from '../controllers/nearbyViewController';
import type { ErrorContext } from './nearbyViewErrorHandler';
import { 
  classifyNearbyViewError,
  getUserFriendlyErrorMessage,
  getActionableInstructions
} from './nearbyViewErrorHandler';

// ============================================================================
// ERROR DISPLAY INTERFACES
// ============================================================================

/**
 * Error display configuration
 */
export interface ErrorDisplayConfig {
  showTechnicalDetails?: boolean;
  showRetryButton?: boolean;
  showActionButtons?: boolean;
  compactMode?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Error display data for UI components
 */
export interface ErrorDisplayData {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  actions: Array<{
    label: string;
    action: 'retry' | 'settings' | 'refresh' | 'dismiss';
    primary?: boolean;
  }>;
  details?: {
    technicalMessage?: string;
    errorCode?: string;
    timestamp: string;
    retryCount?: number;
  };
  canRetry: boolean;
  autoRetry?: {
    enabled: boolean;
    delay: number;
    maxAttempts: number;
  };
}

// ============================================================================
// ERROR DISPLAY GENERATION
// ============================================================================

/**
 * Generate error display data for UI components
 * 
 * @param error - Nearby view error
 * @param context - Error context
 * @param config - Display configuration
 * @returns Error display data for UI rendering
 */
export const generateErrorDisplayData = (
  error: NearbyViewError,
  context: ErrorContext,
  config: ErrorDisplayConfig = {}
): ErrorDisplayData => {
  const plan = classifyNearbyViewError(error, context);
  const userMessage = getUserFriendlyErrorMessage(error, context);
  const instructions = getActionableInstructions(error, context);

  // Generate title based on error type
  const title = getErrorTitle(error.type);
  
  // Generate icon based on error type and severity
  const icon = getErrorIcon(error.type, plan.severity);
  
  // Generate actions based on error type and recovery plan
  const actions = generateErrorActions(error, plan, instructions);
  
  // Generate auto-retry configuration
  const autoRetry = plan.retryable && plan.retryDelay ? {
    enabled: true,
    delay: plan.retryDelay,
    maxAttempts: 3
  } : undefined;

  const displayData: ErrorDisplayData = {
    title,
    message: userMessage,
    severity: plan.severity,
    icon,
    actions,
    canRetry: plan.retryable,
    autoRetry
  };

  // Add technical details if requested
  if (config.showTechnicalDetails) {
    displayData.details = {
      technicalMessage: plan.technicalMessage,
      errorCode: error.type,
      timestamp: context.timestamp.toISOString(),
      retryCount: context.retryCount
    };
  }

  return displayData;
};

/**
 * Get user-friendly title for error type
 * 
 * @param errorType - Nearby view error type
 * @returns User-friendly error title
 */
const getErrorTitle = (errorType: NearbyViewErrorType): string => {
  switch (errorType) {
    case NearbyViewErrorType.NO_GPS_LOCATION:
      return 'Location Required';
    
    case NearbyViewErrorType.NO_STATIONS_IN_RANGE:
      return 'No Nearby Stations';
    
    case NearbyViewErrorType.NO_ROUTES_AVAILABLE:
      return 'No Active Routes';
    
    case NearbyViewErrorType.STATION_SELECTION_FAILED:
      return 'Station Selection Failed';
    
    case NearbyViewErrorType.VEHICLE_PROCESSING_FAILED:
      return 'Live Data Unavailable';
    
    case NearbyViewErrorType.DATA_LOADING_ERROR:
      return 'Loading Failed';
    
    case NearbyViewErrorType.CONFIGURATION_ERROR:
      return 'Setup Required';
    
    case NearbyViewErrorType.OFFLINE_MODE:
      return 'Offline Mode';
    
    case NearbyViewErrorType.CACHE_UNAVAILABLE:
      return 'Cache Unavailable';
    
    default:
      return 'Something Went Wrong';
  }
};

/**
 * Get appropriate icon for error type and severity
 * 
 * @param errorType - Nearby view error type
 * @param severity - Error severity level
 * @returns Icon identifier for UI rendering
 */
const getErrorIcon = (errorType: NearbyViewErrorType, severity: string): string => {
  switch (errorType) {
    case NearbyViewErrorType.NO_GPS_LOCATION:
      return 'location_off';
    
    case NearbyViewErrorType.NO_STATIONS_IN_RANGE:
      return 'location_searching';
    
    case NearbyViewErrorType.NO_ROUTES_AVAILABLE:
      return 'directions_bus_filled';
    
    case NearbyViewErrorType.STATION_SELECTION_FAILED:
      return 'error_outline';
    
    case NearbyViewErrorType.VEHICLE_PROCESSING_FAILED:
      return 'warning';
    
    case NearbyViewErrorType.DATA_LOADING_ERROR:
      return 'cloud_off';
    
    case NearbyViewErrorType.CONFIGURATION_ERROR:
      return 'settings';
    
    case NearbyViewErrorType.OFFLINE_MODE:
      return 'wifi_off';
    
    case NearbyViewErrorType.CACHE_UNAVAILABLE:
      return 'storage';
    
    default:
      return severity === 'critical' ? 'error' : 'warning';
  }
};

/**
 * Generate action buttons based on error type and recovery plan
 * 
 * @param error - Nearby view error
 * @param plan - Error recovery plan
 * @param instructions - User instructions
 * @returns Array of action button configurations
 */
const generateErrorActions = (
  error: NearbyViewError,
  plan: any,
  instructions: string[]
): Array<{ label: string; action: 'retry' | 'settings' | 'refresh' | 'dismiss'; primary?: boolean }> => {
  const actions: Array<{ label: string; action: 'retry' | 'settings' | 'refresh' | 'dismiss'; primary?: boolean }> = [];

  // Add retry action if retryable
  if (plan.retryable) {
    actions.push({
      label: 'Try Again',
      action: 'retry',
      primary: true
    });
  }

  // Add settings action for configuration errors
  if (error.type === NearbyViewErrorType.CONFIGURATION_ERROR || 
      error.type === NearbyViewErrorType.NO_GPS_LOCATION) {
    actions.push({
      label: 'Open Settings',
      action: 'settings',
      primary: !plan.retryable
    });
  }

  // Add refresh action for data loading errors
  if (error.type === NearbyViewErrorType.DATA_LOADING_ERROR ||
      error.type === NearbyViewErrorType.CACHE_UNAVAILABLE) {
    actions.push({
      label: 'Refresh',
      action: 'refresh',
      primary: !plan.retryable
    });
  }

  // Always add dismiss action
  actions.push({
    label: 'Dismiss',
    action: 'dismiss'
  });

  return actions;
};

// ============================================================================
// ERROR MESSAGE FORMATTING
// ============================================================================

/**
 * Format error message for different display contexts
 * 
 * @param error - Nearby view error
 * @param context - Error context
 * @param format - Display format
 * @returns Formatted error message
 */
export const formatErrorMessage = (
  error: NearbyViewError,
  context: ErrorContext,
  format: 'toast' | 'banner' | 'modal' | 'inline' = 'inline'
): string => {
  const baseMessage = getUserFriendlyErrorMessage(error, context);
  
  switch (format) {
    case 'toast':
      // Short message for toast notifications
      return getShortErrorMessage(error.type);
    
    case 'banner':
      // Medium length for banner displays
      return baseMessage;
    
    case 'modal':
      // Detailed message for modal dialogs
      const instructions = getActionableInstructions(error, context);
      return instructions.length > 0 
        ? `${baseMessage}\n\n${instructions.join('\n')}`
        : baseMessage;
    
    case 'inline':
    default:
      return baseMessage;
  }
};

/**
 * Get short error message for toast notifications
 * 
 * @param errorType - Nearby view error type
 * @returns Short error message
 */
const getShortErrorMessage = (errorType: NearbyViewErrorType): string => {
  switch (errorType) {
    case NearbyViewErrorType.NO_GPS_LOCATION:
      return 'Location access required';
    
    case NearbyViewErrorType.NO_STATIONS_IN_RANGE:
      return 'No nearby stations found';
    
    case NearbyViewErrorType.NO_ROUTES_AVAILABLE:
      return 'No active routes';
    
    case NearbyViewErrorType.STATION_SELECTION_FAILED:
      return 'Station selection failed';
    
    case NearbyViewErrorType.VEHICLE_PROCESSING_FAILED:
      return 'Live data unavailable';
    
    case NearbyViewErrorType.DATA_LOADING_ERROR:
      return 'Loading failed';
    
    case NearbyViewErrorType.CONFIGURATION_ERROR:
      return 'Setup required';
    
    case NearbyViewErrorType.OFFLINE_MODE:
      return 'Offline mode active';
    
    case NearbyViewErrorType.CACHE_UNAVAILABLE:
      return 'Cache unavailable';
    
    default:
      return 'Something went wrong';
  }
};

// ============================================================================
// ERROR RECOVERY HELPERS
// ============================================================================

/**
 * Check if error should be displayed to user or handled silently
 * 
 * @param error - Nearby view error
 * @param context - Error context
 * @returns True if error should be displayed
 */
export const shouldDisplayError = (
  error: NearbyViewError,
  context: ErrorContext
): boolean => {
  // Don't display vehicle processing failures if we have station data
  if (error.type === NearbyViewErrorType.VEHICLE_PROCESSING_FAILED) {
    return false; // Handle gracefully without user notification
  }
  
  // Don't display cache unavailable errors
  if (error.type === NearbyViewErrorType.CACHE_UNAVAILABLE) {
    return false; // Handle silently
  }
  
  // Display all other errors
  return true;
};

/**
 * Get error display priority for multiple errors
 * 
 * @param errorType - Nearby view error type
 * @returns Priority number (higher = more important)
 */
export const getErrorDisplayPriority = (errorType: NearbyViewErrorType): number => {
  switch (errorType) {
    case NearbyViewErrorType.CONFIGURATION_ERROR:
      return 100; // Highest priority
    
    case NearbyViewErrorType.NO_GPS_LOCATION:
      return 90;
    
    case NearbyViewErrorType.DATA_LOADING_ERROR:
      return 80;
    
    case NearbyViewErrorType.NO_STATIONS_IN_RANGE:
      return 70;
    
    case NearbyViewErrorType.NO_ROUTES_AVAILABLE:
      return 60;
    
    case NearbyViewErrorType.STATION_SELECTION_FAILED:
      return 50;
    
    case NearbyViewErrorType.OFFLINE_MODE:
      return 40;
    
    case NearbyViewErrorType.VEHICLE_PROCESSING_FAILED:
      return 20;
    
    case NearbyViewErrorType.CACHE_UNAVAILABLE:
      return 10; // Lowest priority
    
    default:
      return 30;
  }
};

/**
 * Determine if error should trigger automatic retry
 * 
 * @param error - Nearby view error
 * @param context - Error context
 * @returns True if should auto-retry
 */
export const shouldAutoRetry = (
  error: NearbyViewError,
  context: ErrorContext
): boolean => {
  const retryCount = context.retryCount || 0;
  const maxRetries = 3;
  
  // Don't auto-retry if max attempts reached
  if (retryCount >= maxRetries) {
    return false;
  }
  
  // Don't auto-retry configuration errors
  if (error.type === NearbyViewErrorType.CONFIGURATION_ERROR) {
    return false;
  }
  
  // Don't auto-retry location errors
  if (error.type === NearbyViewErrorType.NO_GPS_LOCATION) {
    return false;
  }
  
  // Auto-retry data loading and selection errors
  const autoRetryTypes = [
    NearbyViewErrorType.DATA_LOADING_ERROR,
    NearbyViewErrorType.STATION_SELECTION_FAILED,
    NearbyViewErrorType.CACHE_UNAVAILABLE
  ];
  
  return autoRetryTypes.includes(error.type);
};