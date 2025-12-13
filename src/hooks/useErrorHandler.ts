import { useState, useCallback } from 'react';
import type { ErrorState } from '../types';
import { withRetry, isRetryableError, RetryError } from '../utils/retryUtils';

export interface UseErrorHandlerReturn {
  error: ErrorState | null;
  isLoading: boolean;
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    options?: {
      retryOptions?: Parameters<typeof withRetry>[1];
      errorType?: ErrorState['type'];
      customErrorMessage?: string;
    }
  ) => Promise<T | null>;
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastOperation, setLastOperation] = useState<(() => Promise<any>) | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      retryOptions?: Parameters<typeof withRetry>[1];
      errorType?: ErrorState['type'];
      customErrorMessage?: string;
    } = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    setLastOperation(() => operation);

    try {
      const result = await withRetry(operation, options.retryOptions);
      setIsLoading(false);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Determine error type
      let errorType: ErrorState['type'] = options.errorType || 'network';
      
      if (error instanceof RetryError) {
        errorType = 'network';
      } else if (err.message.includes('JSON') || err.message.includes('parse')) {
        errorType = 'parsing';
      } else if (err.message.includes('Authentication') || err.message.includes('401')) {
        errorType = 'authentication';
      } else if (err.message.includes('partial') || err.message.includes('incomplete')) {
        errorType = 'partial';
      }

      const errorState: ErrorState = {
        type: errorType,
        message: options.customErrorMessage || err.message,
        timestamp: new Date(),
        retryable: isRetryableError(err),
      };

      setError(errorState);
      setIsLoading(false);
      return null;
    }
  }, []);

  const retryLastOperation = useCallback(async () => {
    if (lastOperation) {
      await executeWithErrorHandling(lastOperation);
    }
  }, [lastOperation, executeWithErrorHandling]);

  return {
    error,
    isLoading,
    executeWithErrorHandling,
    clearError,
    retryLastOperation,
  };
}