import React, { Component, type ReactNode } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import type { ErrorState } from '../../../types';
import { StoreErrorHandler } from '../../../stores/shared/errorHandler';
import { logger } from '../../../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: ErrorState, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: ErrorState | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Use standardized error handler to create consistent error state
    const errorState = StoreErrorHandler.createError(error, {
      storeName: 'ErrorBoundary',
      operation: 'componentRender',
      timestamp: new Date(),
      metadata: {
        errorName: error.name,
        componentStack: 'React component tree',
      },
    });

    return {
      hasError: true,
      error: errorState,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced logging with context
    logger.componentError('ErrorBoundary', error);
    logger.error('React Error Boundary Caught Error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
    }, 'REACT');

    // Log additional context
    logger.info('Error Boundary State', {
      hasError: this.state.hasError,
      errorType: this.state.error?.type,
      timestamp: new Date().toISOString(),
    }, 'REACT');
  }

  handleRetry = () => {
    logger.info('User triggered error boundary retry');
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: 'var(--mui-palette-background-default, #141218)', 
          color: 'var(--mui-palette-text-primary, #E6E1E5)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '16px' 
        }}>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: 'var(--mui-palette-text-primary, #E6E1E5)', 
                marginBottom: '8px' 
              }}>
                Something went wrong
              </h1>
              <p style={{ 
                color: 'var(--mui-palette-text-secondary, #CAC4D0)' 
              }}>
                The application encountered an unexpected error.
              </p>
            </div>
            
            <ErrorDisplay 
              error={this.state.error} 
              onRetry={this.state.error.retryable ? this.handleRetry : undefined}
            />
            
            {!this.state.error.retryable && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    color: 'var(--mui-palette-primary-main, #D0BCFF)',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'var(--mui-palette-primary-light, #EADDFF)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'var(--mui-palette-primary-main, #D0BCFF)';
                  }}
                >
                  Reload Page
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}