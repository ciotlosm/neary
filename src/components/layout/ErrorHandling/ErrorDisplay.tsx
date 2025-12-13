import React from 'react';
import type { ErrorState } from '../../../types';
import { formatTime24 } from '../../../utils/timeFormat';

interface ErrorDisplayProps {
  error: ErrorState;
  onRetry?: () => void;
}

const getErrorColor = (type: ErrorState['type']): string => {
  switch (type) {
    case 'network':
    case 'authentication':
      return 'bg-red-100 border-red-500 text-red-700';
    case 'parsing':
      return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    case 'partial':
      return 'bg-orange-100 border-orange-500 text-orange-700';
    case 'noData':
      return 'bg-gray-100 border-gray-500 text-gray-700';
    default:
      return 'bg-red-100 border-red-500 text-red-700';
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
  const colorClasses = getErrorColor(error.type);
  const icon = getErrorIcon(error.type);
  const title = getErrorTitle(error.type);

  return (
    <div 
      className={`border-l-4 p-4 mb-4 rounded-r-lg ${colorClasses}`}
      data-error-type={error.type}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl" role="img" aria-label={`${error.type} error`}>
            {icon}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {title}
          </h3>
          <div className="mt-2 text-sm">
            <p>{error.message}</p>
          </div>
          <div className="mt-2 text-xs opacity-75">
            {error.timestamp.toLocaleTimeString()}
          </div>
          {error.retryable && onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
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