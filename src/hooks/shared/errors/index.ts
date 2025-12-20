/**
 * Standardized Error Handling System
 * 
 * Exports for unified error handling across all hooks
 */

import { ErrorHandler } from './ErrorHandler';
import { ErrorType } from './types';
import type { StandardError } from './types';

export { ErrorType } from './types';
export type { StandardError, RetryConfig, ErrorSeverity } from './types';
export { ErrorHandler } from './ErrorHandler';
export { withRetry, createRetryWrapper, RetryManager } from './retryUtils';

// Re-export commonly used utilities as functions to avoid module loading issues
export const createError = (type: ErrorType, message: string, context?: Record<string, any>, originalError?: Error) => 
  ErrorHandler.createError(type, message, context, originalError);

export const fromError = (error: Error, context?: Record<string, any>) => 
  ErrorHandler.fromError(error, context);

export const getUserMessage = (error: StandardError) => 
  ErrorHandler.getUserMessage(error);

export const shouldRetry = (error: StandardError, retryCount: number) => 
  ErrorHandler.shouldRetry(error, retryCount);

export const getSeverity = (error: StandardError) => 
  ErrorHandler.getSeverity(error);