import React from 'react';
import type { ErrorState } from '../../../types';
import { formatTime24 } from '../../../utils/timeFormat';

interface ErrorDisplayProps {
  error: ErrorState;
  onRetry?: () => void;
}

const getErrorStyles = (type: ErrorState['type']): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    backgroundColor: 'var(--mui-palette-error-main, #FFB4AB)',
    borderLeftColor: 'var(--mui-palette-error-dark, #FF897D)',
    color: 'var(--mui-palette-error-contrastText, #690005)',
    opacity: 0.9
  };

  switch (type) {
    case 'network':
    case 'authentication':
      return {
        ...baseStyles,
        backgroundColor: 'rgba(255, 180, 171, 0.1)', // error with transparency
        borderLeftColor: 'var(--mui-palette-error-main, #FFB4AB)',
        color: 'var(--mui-palette-error-main, #FFB4AB)'
      };
    case 'parsing':
      return {
        ...baseStyles,
        backgroundColor: 'rgba(255, 185, 81, 0.1)', // warning with transparency
        borderLeftColor: 'var(--mui-palette-warning-main, #FFB951)',
        color: 'var(--mui-palette-warning-main, #FFB951)'
      };
    case 'partial':
      return {
        ...baseStyles,
        backgroundColor: 'rgba(168, 199, 250, 0.1)', // info with transparency
        borderLeftColor: 'var(--mui-palette-info-main, #A8C7FA)',
        color: 'var(--mui-palette-info-main, #A8C7FA)'
      };
    case 'noData':
      return {
        ...baseStyles,
        backgroundColor: 'rgba(202, 196, 208, 0.1)', // text secondary with transparency
        borderLeftColor: 'var(--mui-palette-text-secondary, #CAC4D0)',
        color: 'var(--mui-palette-text-secondary, #CAC4D0)'
      };
    default:
      return {
        ...baseStyles,
        backgroundColor: 'rgba(255, 180, 171, 0.1)',
        borderLeftColor: 'var(--mui-palette-error-main, #FFB4AB)',
        color: 'var(--mui-palette-error-main, #FFB4AB)'
      };
  }
};

const getErrorIcon = (type: ErrorState['type']): string => {
  switch (type) {
    case 'network':
      return '🌐';
    case 'authentication':
      return '🔐';
    case 'parsing':
      return '⚠️';
    case 'partial':
      return '📊';
    case 'noData':
      return '📭';
    default:
      return '❌';
  }
};

const getErrorTitle = (type: ErrorState['type']): string => {
  switch (type) {
    case 'network':
      return 'Network Error';
    case 'authentication':
      return 'Authentication Error';
    case 'parsing':
      return 'Data Format Error';
    case 'partial':
      return 'Incomplete Data';
    case 'noData':
      return 'No Data Available';
    default:
      return 'Error';
  }
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const errorStyles = getErrorStyles(error.type);
  const icon = getErrorIcon(error.type);
  const title = getErrorTitle(error.type);

  return (
    <div 
      style={{
        ...errorStyles,
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
        padding: '16px',
        marginBottom: '16px',
        borderRadius: '0 8px 8px 0'
      }}
      data-error-type={error.type}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}>
          <span 
            style={{ fontSize: '1.25rem' }} 
            role="img" 
            aria-label={`${error.type} error`}
          >
            {icon}
          </span>
        </div>
        <div style={{ marginLeft: '12px', flex: 1 }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500',
            margin: 0,
            marginBottom: '8px'
          }}>
            {title}
          </h3>
          <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
            <p style={{ margin: 0 }}>{error.message}</p>
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            opacity: 0.75,
            marginBottom: error.retryable && onRetry ? '12px' : 0
          }}>
            {formatTime24(error.timestamp)}
          </div>
          {error.retryable && onRetry && (
            <div>
              <button
                onClick={onRetry}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  color: 'inherit',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};