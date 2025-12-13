import React from 'react';
import { useOfflineStore } from '../../../stores/offlineStore';

export interface OfflineIndicatorProps {
  className?: string;
  showCacheInfo?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  className = '',
  showCacheInfo = false,
}) => {
  const {
    isOnline,
    isOfflineCapable,
    isUsingCachedData,
    lastApiDataUpdate,
    cacheInfo,
    refreshCacheInfo,
    clearCache,
  } = useOfflineStore();

  const formatTimestamp = (date: Date | null): string => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = (): string => {
    if (!isOnline) return 'bg-red-500';
    if (isUsingCachedData) return 'bg-yellow-500';
    if (isOfflineCapable) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = (): string => {
    if (!isOnline) return 'Offline';
    if (isUsingCachedData) return 'Using cached data';
    if (isOfflineCapable) return 'Online (offline ready)';
    return 'Online';
  };

  const getStatusDescription = (): string => {
    if (!isOnline) {
      return isOfflineCapable 
        ? 'You\'re offline, but cached data is available'
        : 'You\'re offline and no cached data is available';
    }
    
    if (isUsingCachedData) {
      const timestamp = formatTimestamp(lastApiDataUpdate);
      return `Showing cached data from ${timestamp}`;
    }
    
    if (isOfflineCapable) {
      return 'Connected with offline support enabled';
    }
    
    return 'Connected but offline support is not available';
  };

  const handleClearCache = async () => {
    try {
      await clearCache('api');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleRefreshCacheInfo = async () => {
    try {
      await refreshCacheInfo();
    } catch (error) {
      console.error('Failed to refresh cache info:', error);
    }
  };

  return (
    <div className={`offline-indicator ${className}`}>
      {/* Status indicator */}
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div 
          className={`w-3 h-3 rounded-full ${getStatusColor()}`}
          title={getStatusDescription()}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getStatusText()}
        </span>
        
        {isUsingCachedData && lastApiDataUpdate && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({formatTimestamp(lastApiDataUpdate)})
          </span>
        )}
      </div>

      {/* Detailed cache information (optional) */}
      {showCacheInfo && (
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Cache Information
            </h4>
            <button
              onClick={handleRefreshCacheInfo}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Refresh
            </button>
          </div>
          
          {cacheInfo ? (
            <div className="space-y-2">
              {Object.entries(cacheInfo).map(([cacheName, info]) => (
                <div key={cacheName} className="text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {cacheName.replace('bus-tracker-', '').replace('-v1', '')}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {info.size} items
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleClearCache}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                >
                  Clear API Cache
                </button>
                <button
                  onClick={() => clearCache()}
                  className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  Clear All
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              No cache information available
            </div>
          )}
        </div>
      )}
    </div>
  );
};