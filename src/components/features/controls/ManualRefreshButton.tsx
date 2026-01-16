// ManualRefreshButton - Color-coded refresh button
// Integrates with Data Freshness Monitor and Manual Refresh System

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { IconButton, Box, CircularProgress } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { getDataFreshnessMonitor, type ApiFreshnessStatus } from '../../../utils/core/apiFreshnessMonitor';
import { automaticRefreshService } from '../../../services/automaticRefreshService';
import { manualRefreshService } from '../../../services/manualRefreshService';
import { useConfigStore } from '../../../stores/configStore';
import { useStatusStore } from '../../../stores/statusStore';
import { API_FETCH_FRESHNESS_THRESHOLDS } from '../../../utils/core/constants';

interface ManualRefreshButtonProps {
  className?: string;
  disabled?: boolean;
}

/**
 * Manual Refresh Button Component
 * 
 * Features:
 * - Color-coded status indicator (green for fresh, red for stale)
 * - Loading state during refresh operations
 * - Integrates with Material-UI design system
 * - Prevents concurrent refresh operations
 */
export const ManualRefreshButton: FC<ManualRefreshButtonProps> = ({
  className,
  disabled = false
}) => {
  const [freshnessStatus, setFreshnessStatus] = useState<ApiFreshnessStatus>({
    status: 'stale',
    vehicleApiAge: Infinity,
    staticApiAge: Infinity,
    isRefreshing: false,
    nextAutoRefreshIn: 0,
    lastApiFetchTime: null
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to freshness monitor for fresh/stale status
  useEffect(() => {
    const monitor = getDataFreshnessMonitor();
    
    // Get initial status
    const initialStatus = monitor.calculateApiFreshness();
    setFreshnessStatus(initialStatus);
    
    // Subscribe to changes
    const unsubscribe = monitor.subscribeToChanges((status) => {
      setFreshnessStatus(status);
    });

    return unsubscribe;
  }, []);

  // Poll refresh status from manualRefreshService
  useEffect(() => {
    const checkRefreshStatus = () => {
      const refreshing = manualRefreshService.isRefreshInProgress();
      setIsRefreshing(refreshing);
    };

    // Check immediately
    checkRefreshStatus();

    // Poll every 100ms
    const interval = setInterval(checkRefreshStatus, 100);

    return () => clearInterval(interval);
  }, []);

  /**
   * Manual refresh system - triggers automatic refresh service and resets timer
   */
  const handleManualRefresh = async () => {
    // Prevent concurrent operations
    if (isRefreshing || disabled) {
      return;
    }

    console.log('[Manual Refresh] User triggered manual refresh');

    try {
      // Use automatic refresh service to trigger refresh and reset timer
      await automaticRefreshService.triggerManualRefresh();
    } catch (error) {
      // Error handling - let automatic refresh service handle errors
      console.warn('Manual refresh encountered errors:', error);
    }
  };

  // Determine button color based on API fetch time and disabled conditions
  const getButtonColor = (): 'success' | 'warning' | 'error' | 'default' => {
    // Get store states for disabled state checks
    const configState = useConfigStore.getState();
    const statusState = useStatusStore.getState();
    
    // Check disabled conditions first
    const isDisabled = 
      !configState.apiKey || 
      !configState.agency_id || 
      !statusState.networkOnline || 
      statusState.apiStatus !== 'online';
    
    if (isDisabled) {
      return 'default'; // Grey for disabled states
    }
    
    // If no API fetch has occurred yet
    if (freshnessStatus.lastApiFetchTime === null) {
      return 'default'; // Grey for initial state
    }
    
    // Calculate API fetch age in milliseconds
    const apiFetchAge = Date.now() - freshnessStatus.lastApiFetchTime;
    
    // Apply three-color thresholds
    if (apiFetchAge < API_FETCH_FRESHNESS_THRESHOLDS.FRESH) {
      return 'success'; // Green: < 1 minute
    } else if (apiFetchAge < API_FETCH_FRESHNESS_THRESHOLDS.WARNING) {
      return 'warning'; // Yellow: 1-3 minutes
    } else {
      return 'error'; // Red: > 3 minutes
    }
  };

  const buttonColor = getButtonColor();

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <IconButton
        className={className}
        color={buttonColor}
        onClick={handleManualRefresh}
        disabled={disabled || isRefreshing}
        aria-label="Manual refresh data"
        size="small"
        sx={{
          transition: 'color 0.2s ease-in-out',
        }}
      >
        {isRefreshing ? (
          <CircularProgress
            size={24}
            color={buttonColor === 'default' ? 'inherit' : buttonColor}
            sx={{
              width: '24px !important',
              height: '24px !important',
            }}
          />
        ) : (
          <RefreshIcon />
        )}
      </IconButton>
    </Box>
  );
};
