import React from 'react';
import { useRefreshSystem } from '../../../hooks/useRefreshSystem';
import { useBusStore } from '../../../stores/busStore';
import { MaterialButton } from '../../ui/Button/MaterialButton';
import { logger } from '../../../utils/logger';
import { formatRelativeTime } from '../../../utils/timeFormat';

interface RefreshControlProps {
  className?: string;
}

/**
 * Component that provides manual refresh controls and displays auto-refresh status
 */
export const RefreshControl: React.FC<RefreshControlProps> = ({ className = '' }) => {
  const { manualRefresh } = useRefreshSystem();
  const { isLoading, lastUpdate } = useBusStore();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}m ago`;
    } else {
      return formatRelativeTime(date);
    }
  };



  const handleManualRefresh = () => {
    logger.info('Manual refresh triggered by user', { lastUpdate, isLoading }, 'UI');
    manualRefresh();
  };

  return (
    <div className={`refresh-control ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Last update time */}
        <span className="text-xs text-white/70 hidden sm:block" title="Last time bus data was updated">
          Updated {formatLastUpdate(lastUpdate)}
        </span>

        {/* Refresh button - always visible */}
        <MaterialButton
          size="small"
          variant="outlined"
          onClick={handleManualRefresh}
          loading={isLoading}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-white/50"
          title="Refresh bus times now"
          startIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </MaterialButton>
      </div>
    </div>
  );
};