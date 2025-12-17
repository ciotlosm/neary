import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ErrorDisplay } from './ErrorDisplay';
import type { ErrorState } from '../../../types';

// Generator for ErrorState
const errorStateArb = fc.record({
  type: fc.constantFrom('network', 'parsing', 'noData', 'partial', 'authentication'),
  message: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  timestamp: fc.date(),
  retryable: fc.boolean(),
});

describe('ErrorDisplay Property Tests', () => {
  it('**Feature: bus-tracker, Property 6: Error state management** - For any service call failure, parsing error, or partial data scenario, the system should display appropriate error indicators and provide retry options when applicable', () => {
    fc.assert(
      fc.property(errorStateArb, fc.boolean(), (error, hasOnRetry) => {
        const mockOnRetry = hasOnRetry ? vi.fn() : undefined;
        
        const { container, unmount } = render(
          <ErrorDisplay error={error} onRetry={mockOnRetry} />
        );
        
        // Verify error message is displayed
        expect(container.textContent).toContain(error.message);
        
        // Verify appropriate error type indicator is present
        const errorElement = container.querySelector(`[data-error-type="${error.type}"]`);
        expect(errorElement).toBeInTheDocument();
        
        // Verify retry button is present when error is retryable and onRetry is provided
        const retryButton = container.querySelector('button');
        if (error.retryable && hasOnRetry) {
          expect(retryButton).toBeInTheDocument();
          expect(retryButton?.textContent).toBe('Retry');
          
          // Test retry functionality
          if (retryButton && mockOnRetry) {
            fireEvent.click(retryButton);
            expect(mockOnRetry).toHaveBeenCalled();
          }
        } else {
          // Non-retryable errors or no onRetry callback should not have retry button
          expect(retryButton).not.toBeInTheDocument();
        }
        
        // Verify timestamp is displayed
        expect(container.textContent).toContain(error.timestamp.toLocaleTimeString());
        
        // Clean up to avoid interference between test runs
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('should handle different error types with appropriate visual indicators', () => {
    const errorTypes: Array<ErrorState['type']> = ['network', 'parsing', 'noData', 'partial', 'authentication'];
    
    errorTypes.forEach(type => {
      const error: ErrorState = {
        type,
        message: `Test ${type} error`,
        timestamp: new Date(),
        retryable: type === 'network' || type === 'authentication',
      };
      
      const { container } = render(<ErrorDisplay error={error} />);
      
      // Each error type should have its specific indicator
      const errorElement = container.querySelector(`[data-error-type="${type}"]`);
      expect(errorElement).toBeInTheDocument();
    });
  });
});