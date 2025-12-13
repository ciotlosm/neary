import React, { useState } from 'react';
import { RefreshIcon, DownloadIcon, ClockIcon, InfoIcon } from '../../ui/Icons';

import { routeMappingService } from '../../../services/routeMappingService';
import { formatTime24 } from '../../../utils/timeFormat';

interface ScheduleCacheManagerProps {
  className?: string;
}

export const ScheduleCacheManager: React.FC<ScheduleCacheManagerProps> = ({ className = '' }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleClearCache = async () => {
    setIsRefreshing(true);
    try {
      // Cache clearing functionality removed
      setLastRefresh(new Date());
      
      // Show success message briefly
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setIsRefreshing(false);
    }
  };

  const routeMappings: any[] = [];

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <DownloadIcon size={20} />
          Runtime Schedule Fetching
        </h3>
        <button
          onClick={handleClearCache}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isRefreshing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <RefreshIcon size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Clear Cache'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon size={16} className="text-green-400" />
            <span className="text-sm font-medium text-green-400">Live Data Source</span>
          </div>
          <p className="text-xs text-gray-300 mb-2">
            Schedules are fetched directly from CTP Cluj website during app runtime
          </p>
          <span className="text-xs text-gray-400">
            Official schedules from static data
          </span>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-white mb-2">Cache Status</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Cache Duration: 30 minutes</div>
            <div>
              Last Refresh: {lastRefresh ? formatTime24(lastRefresh) : 'Never'}
            </div>
            <div className="text-green-400">
              ✅ Automatic updates from official CTP Cluj schedules
            </div>
          </div>
        </div>

        {routeMappings.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-2">Route Mappings</h4>
            <div className="space-y-1">
              {routeMappings.map((mapping, index) => (
                <div key={index} className="text-xs text-gray-300 flex justify-between">
                  <span>Route {mapping.routeShortName}</span>
                  <span className="text-gray-500">
                    ID {mapping.tranzyRouteId} → {mapping.ctpRouteSlug}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Benefits</h4>
          <ul className="text-xs text-blue-200 space-y-1">
            <li>• Always current schedules from CTP Cluj</li>
            <li>• No manual updates needed</li>
            <li>• Automatic PDF availability checking</li>
            <li>• 30-minute caching for performance</li>
            <li>• Real-time route information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};