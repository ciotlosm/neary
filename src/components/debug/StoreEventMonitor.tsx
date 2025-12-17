/**
 * Store Event Monitor Component
 * 
 * Demonstrates event-based store communication by monitoring and displaying
 * store events in real-time. This component shows how components can react
 * to store changes via events instead of direct store access.
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  Settings as ConfigIcon,
  DirectionsBus as VehicleIcon,
  LocationOn as LocationIcon,
  Palette as ThemeIcon,
} from '@mui/icons-material';

import { 
  useStoreEvents, 
  useStoreEventDebug, 
  StoreEvents 
} from '../../stores/shared/storeEvents';

interface EventLog {
  id: string;
  event: StoreEvents;
  timestamp: Date;
  data: any;
}

export const StoreEventMonitor: React.FC = () => {
  const [eventLog, setEventLog] = React.useState<EventLog[]>([]);
  const eventDebugInfo = useStoreEventDebug();

  // Subscribe to all store events for monitoring
  useStoreEvents([
    {
      event: StoreEvents.CONFIG_CHANGED,
      handler: React.useCallback((data: any) => {
        setEventLog(prev => [...prev.slice(-9), {
          id: `config-${Date.now()}`,
          event: StoreEvents.CONFIG_CHANGED,
          timestamp: new Date(),
          data
        }]);
      }, [])
    },
    {
      event: StoreEvents.VEHICLES_UPDATED,
      handler: React.useCallback((data: any) => {
        setEventLog(prev => [...prev.slice(-9), {
          id: `vehicles-${Date.now()}`,
          event: StoreEvents.VEHICLES_UPDATED,
          timestamp: new Date(),
          data: {
            vehicleCount: data.vehicles.length,
            timestamp: data.timestamp,
            source: data.source
          }
        }]);
      }, [])
    },
    {
      event: StoreEvents.LOCATION_CHANGED,
      handler: React.useCallback((data: any) => {
        setEventLog(prev => [...prev.slice(-9), {
          id: `location-${Date.now()}`,
          event: StoreEvents.LOCATION_CHANGED,
          timestamp: new Date(),
          data: {
            latitude: data.location.latitude.toFixed(6),
            longitude: data.location.longitude.toFixed(6),
            source: data.source
          }
        }]);
      }, [])
    },
    {
      event: StoreEvents.THEME_CHANGED,
      handler: React.useCallback((data: any) => {
        setEventLog(prev => [...prev.slice(-9), {
          id: `theme-${Date.now()}`,
          event: StoreEvents.THEME_CHANGED,
          timestamp: new Date(),
          data
        }]);
      }, [])
    }
  ], []);

  const getEventIcon = (event: StoreEvents) => {
    switch (event) {
      case StoreEvents.CONFIG_CHANGED:
        return <ConfigIcon fontSize="small" />;
      case StoreEvents.VEHICLES_UPDATED:
        return <VehicleIcon fontSize="small" />;
      case StoreEvents.LOCATION_CHANGED:
        return <LocationIcon fontSize="small" />;
      case StoreEvents.THEME_CHANGED:
        return <ThemeIcon fontSize="small" />;
      default:
        return <EventIcon fontSize="small" />;
    }
  };

  const getEventColor = (event: StoreEvents) => {
    switch (event) {
      case StoreEvents.CONFIG_CHANGED:
        return 'primary';
      case StoreEvents.VEHICLES_UPDATED:
        return 'success';
      case StoreEvents.LOCATION_CHANGED:
        return 'warning';
      case StoreEvents.THEME_CHANGED:
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <EventIcon />
          <Typography variant="h6">
            Store Event Monitor
          </Typography>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This component demonstrates event-based store communication. 
          It listens to store events instead of directly accessing store state.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Event Statistics */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Event Listeners
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {Object.entries(eventDebugInfo).map(([event, count]) => (
              <Chip
                key={event}
                label={`${event}: ${count}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Recent Events */}
        <Typography variant="subtitle2" gutterBottom>
          Recent Events (Last 10)
        </Typography>
        
        {eventLog.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No events captured yet. Try changing theme, location, or configuration.
          </Typography>
        ) : (
          <List dense>
            {eventLog.slice().reverse().map((log) => (
              <ListItem key={log.id} divider>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {getEventIcon(log.event)}
                      <Chip
                        label={log.event}
                        size="small"
                        color={getEventColor(log.event) as any}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {log.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Box component="pre" sx={{ 
                      fontSize: '0.75rem', 
                      mt: 0.5, 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(log.data, null, 2)}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreEventMonitor;