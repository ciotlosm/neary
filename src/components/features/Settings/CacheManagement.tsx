import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  CloudSync as CloudSyncIcon,
  Schedule as ScheduleIcon,
  LiveTv as LiveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { useEnhancedBusStore } from '../../../stores/enhancedBusStore';
import { logger } from '../../../utils/logger';
import { MaterialButton } from '../../ui/Button';

export const CacheManagement: React.FC = () => {
  const {
    cacheStats,
    getCacheStats,
    clearCache,
    forceRefreshAll,
    refreshScheduleData,
    refreshLiveData,
  } = useEnhancedBusStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshType, setRefreshType] = useState<string>('');

  useEffect(() => {
    getCacheStats();
    const interval = setInterval(getCacheStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [getCacheStats]);

  const handleForceRefreshAll = async () => {
    setIsRefreshing(true);
    setRefreshType('all');
    try {
      await forceRefreshAll();
      logger.info('Force refresh all completed from UI', {}, 'CACHE_MGMT');
    } catch (error) {
      logger.error('Force refresh all failed from UI', { error }, 'CACHE_MGMT');
    } finally {
      setIsRefreshing(false);
      setRefreshType('');
    }
  };

  const handleRefreshSchedule = async () => {
    setIsRefreshing(true);
    setRefreshType('schedule');
    try {
      await refreshScheduleData();
      logger.info('Schedule refresh completed from UI', {}, 'CACHE_MGMT');
    } catch (error) {
      logger.error('Schedule refresh failed from UI', { error }, 'CACHE_MGMT');
    } finally {
      setIsRefreshing(false);
      setRefreshType('');
    }
  };

  const handleRefreshLive = async () => {
    setIsRefreshing(true);
    setRefreshType('live');
    try {
      await refreshLiveData();
      logger.info('Live data refresh completed from UI', {}, 'CACHE_MGMT');
    } catch (error) {
      logger.error('Live data refresh failed from UI', { error }, 'CACHE_MGMT');
    } finally {
      setIsRefreshing(false);
      setRefreshType('');
    }
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data? This will require fresh downloads when offline.')) {
      clearCache();
      logger.info('Cache cleared from UI', {}, 'CACHE_MGMT');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAge = (timestamp?: Date): string => {
    if (!timestamp) return 'Never';
    const age = Date.now() - timestamp.getTime();
    const minutes = Math.floor(age / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  const theme = useTheme();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon />
          Cache Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage cached data for offline access and performance. Static data (routes, stops) is cached for 24 hours, 
          while live vehicle data is refreshed every minute.
        </Typography>
      </Box>

      {/* Cache Statistics */}
      <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            📊 Cache Statistics
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 3 
          }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Entries</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{cacheStats.totalEntries}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Cache Size</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{formatBytes(cacheStats.totalSize)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Last Refresh</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatAge(cacheStats.lastRefresh)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip 
                label={navigator.onLine ? 'Online' : 'Offline'}
                color={navigator.onLine ? 'success' : 'warning'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {Object.keys(cacheStats.entriesByType).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Cached Data Types:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(cacheStats.entriesByType).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${type}: ${count}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Refresh Controls */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RefreshIcon />
          Data Refresh
        </Typography>

        <Stack spacing={2}>
          <Card 
            variant="outlined" 
            sx={{ 
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1,
              '&:hover': !isRefreshing ? {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              } : {},
            }}
            onClick={!isRefreshing ? handleRefreshLive : undefined}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LiveIcon color="primary" />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Refresh Live Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update vehicle positions and real-time info
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isRefreshing && refreshType === 'live' && (
                  <CircularProgress size={16} />
                )}
                <Chip label="~1 min" size="small" color="primary" />
              </Box>
            </CardContent>
          </Card>

          <Card 
            variant="outlined" 
            sx={{ 
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1,
              '&:hover': !isRefreshing ? {
                bgcolor: alpha(theme.palette.secondary.main, 0.04),
              } : {},
            }}
            onClick={!isRefreshing ? handleRefreshSchedule : undefined}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon color="secondary" />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Refresh Schedule Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update routes, stops, and timetables
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isRefreshing && refreshType === 'schedule' && (
                  <CircularProgress size={16} />
                )}
                <Chip label="~24h" size="small" color="secondary" />
              </Box>
            </CardContent>
          </Card>

          <Card 
            variant="outlined" 
            sx={{ 
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              borderColor: alpha(theme.palette.warning.main, 0.3),
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1,
              '&:hover': !isRefreshing ? {
                bgcolor: alpha(theme.palette.warning.main, 0.12),
              } : {},
            }}
            onClick={!isRefreshing ? handleForceRefreshAll : undefined}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CloudSyncIcon sx={{ color: theme.palette.warning.main }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                    Force Refresh All Data
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.warning.main, 0.8) }}>
                    Download fresh data for everything (use when online)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isRefreshing && refreshType === 'all' && (
                  <CircularProgress size={16} sx={{ color: theme.palette.warning.main }} />
                )}
                <Chip label="~5 min" size="small" sx={{ bgcolor: theme.palette.warning.main, color: 'white' }} />
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Cache Management */}
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            Clear Cache
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will remove all cached data. You'll need an internet connection to download fresh data.
          </Typography>
          <MaterialButton
            variant="filled"
            color="error"
            onClick={handleClearCache}
            icon={<DeleteIcon />}
            size="small"
          >
            Clear All Cache
          </MaterialButton>
        </Box>
      </Alert>

      {/* Offline Capabilities */}
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: 2,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            📱 Offline Capabilities
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • <strong>Routes & Stops:</strong> Cached for 24 hours, available offline
            </Typography>
            <Typography variant="body2">
              • <strong>Schedules:</strong> Cached daily, works offline with last known timetables
            </Typography>
            <Typography variant="body2">
              • <strong>Live Data:</strong> Cached for 5 minutes, shows last known positions when offline
            </Typography>
            <Typography variant="body2">
              • <strong>Maps:</strong> Cached by your browser for offline map viewing
            </Typography>
          </Stack>
        </Box>
      </Alert>
    </Stack>
  );
};

export default CacheManagement;