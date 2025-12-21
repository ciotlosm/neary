import React from 'react';
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  DirectionsBus, 
  FlagOutlined,
  Map as MapIcon,
  LocationOn,
  PersonPin,
} from '@mui/icons-material';
import { formatRefreshTime } from '../../../utils/formatting/timeFormat';
import type { CoreVehicle } from '../../../types/coreVehicle';
import { useConfigStore } from '../../../stores/configStore';
import { useVehicleStore } from '../../../stores/vehicleStore';
import { useThemeUtils, useMuiUtils } from '../../../hooks';

interface VehicleCardProps {
  /** Core vehicle data */
  vehicle: CoreVehicle;
  /** Station ID for highlighting current station */
  stationId?: string;
  /** Whether the stops list is expanded */
  isExpanded: boolean;
  /** Callback when stops list is toggled */
  onToggleExpanded: () => void;
  /** Callback when map button is clicked */
  onShowMap: () => void;
  /** Callback when route is clicked */
  onRouteClick?: () => void;
  /** Show short stop list always visible in card */
  showShortStopList?: boolean;
  /** Show "Show stops" button for full expandable list */
  showFullStopsButton?: boolean;
  /** Stop sequence data for displaying route stops */
  stopSequence?: Array<{
    stopId: string;
    stopName: string;
    sequence: number;
    isCurrent: boolean;
    isDestination: boolean;
  }>;
  /** Optional arrival time override (e.g., "5 min", "Now") */
  arrivalText?: string;
  /** Optional destination override */
  destination?: string;
}

const VehicleCardComponent: React.FC<VehicleCardProps> = ({
  vehicle,
  stationId,
  isExpanded,
  onToggleExpanded,
  onShowMap,
  onRouteClick,
  showShortStopList = false,
  showFullStopsButton = true,
  stopSequence = [],
  arrivalText,
  destination
}) => {
  const { config } = useConfigStore();
  // Offline functionality is now integrated into vehicleStore
  const { error } = useVehicleStore();
  const isOnline = !error || error.type !== 'network';
  const isApiOnline = isOnline;
  const { getDataFreshnessColor, getBackgroundColors, getBorderColors, alpha, theme } = useThemeUtils();
  const { getCardStyles } = useMuiUtils();
  
  // Determine if vehicle has departed based on simple logic
  const isDeparted = false; // TODO: Implement simple departure logic if needed
  
  // State for updating relative time display every 10 seconds
  const [currentTime, setCurrentTime] = React.useState(Date.now());
  
  // Update current time every 10 seconds for relative time display
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Memoize expensive color calculations using vehicle timestamp
  const statusDotColor = React.useMemo(() => {
    const vehicleTimestamp = vehicle.timestamp;
    if (!vehicleTimestamp) {
      return getDataFreshnessColor(Infinity, config?.staleDataThreshold || 5, !isOnline || !isApiOnline);
    }

    const lastUpdate = vehicleTimestamp instanceof Date 
      ? vehicleTimestamp 
      : new Date(vehicleTimestamp);
    
    const minutesSinceUpdate = (currentTime - lastUpdate.getTime()) / (1000 * 60);
    
    return getDataFreshnessColor(minutesSinceUpdate, config?.staleDataThreshold || 5, !isOnline || !isApiOnline);
  }, [vehicle.timestamp, config?.staleDataThreshold, isOnline, isApiOnline, currentTime, getDataFreshnessColor]);

  const timestampColor = React.useMemo(() => {
    const vehicleTimestamp = vehicle.timestamp;
    if (!vehicleTimestamp) {
      const baseColor = getDataFreshnessColor(Infinity, config?.staleDataThreshold || 5, !isOnline || !isApiOnline);
      return alpha(baseColor, isDeparted ? 0.3 : 0.4);
    }

    const lastUpdate = vehicleTimestamp instanceof Date 
      ? vehicleTimestamp 
      : new Date(vehicleTimestamp);
    
    const minutesSinceUpdate = (currentTime - lastUpdate.getTime()) / (1000 * 60);
    
    const baseColor = getDataFreshnessColor(minutesSinceUpdate, config?.staleDataThreshold || 5, !isOnline || !isApiOnline);
    return alpha(baseColor, isDeparted ? 0.3 : 0.5);
  }, [vehicle.timestamp, config?.staleDataThreshold, isOnline, isApiOnline, currentTime, getDataFreshnessColor, alpha, isDeparted]);

  // Get stops to show in short list (next few stops)
  const stopsToShow = React.useMemo(() => {
    if (!stopSequence || !showShortStopList) return [];
    
    // Find current stop index
    const currentStopIndex = stopSequence.findIndex(stop => stop.isCurrent);
    if (currentStopIndex === -1) return stopSequence.slice(0, 3); // Show first 3 if no current stop
    
    // Show current stop + next 2 stops
    return stopSequence.slice(currentStopIndex, currentStopIndex + 3);
  }, [stopSequence, showShortStopList]);

  const backgrounds = getBackgroundColors();
  const borders = getBorderColors();

  return (
    <Card
      sx={{
        ...getCardStyles('glass'),
        opacity: isDeparted ? 0.7 : 1,
        bgcolor: isDeparted 
          ? alpha(backgrounds.paper, 0.3)
          : backgrounds.paper,
        border: `1px solid ${alpha(borders.divider, isDeparted ? 0.3 : 0.5)}`,
        '&:hover': {
          bgcolor: isDeparted 
            ? alpha(backgrounds.paper, 0.5)
            : backgrounds.paperHover,
          border: `1px solid ${alpha(borders.divider, isDeparted ? 0.5 : 0.7)}`,
        },
        // Add overlay for departed vehicles
        '&::before': isDeparted ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: alpha(theme.palette.action.disabled, 0.2),
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 1,
        } : {},
      }}
    >
      <CardContent sx={{ 
        py: { xs: 1.5, sm: 2 }, 
        px: { xs: 1.5, sm: 2 },
        position: 'relative', 
        zIndex: 2,
        '&:last-child': {
          pb: { xs: 1.5, sm: 2 }
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
          <Box 
            onClick={onRouteClick}
            sx={{
              minWidth: 48,
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: isDeparted ? alpha(theme.palette.primary.main, 0.4) : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onRouteClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              flexShrink: 0,
              ...(onRouteClick && {
                '&:hover': {
                  bgcolor: isDeparted ? alpha(theme.palette.primary.main, 0.5) : 'primary.dark',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              })
            }}
          >
            <Typography variant="h6" sx={{ 
              color: isDeparted 
                ? alpha(theme.palette.primary.contrastText, 0.7) 
                : theme.palette.primary.contrastText, 
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              {vehicle.routeId}
            </Typography>
          </Box>
          
          <Box sx={{ 
            flexGrow: 1, 
            minWidth: 0, // Allow shrinking below content size
            overflow: 'hidden' // Prevent overflow
          }}>
            <Typography variant="body1" sx={{ 
              color: isDeparted 
                ? alpha(theme.palette.text.primary, 0.6) 
                : theme.palette.text.primary, 
              fontWeight: 600,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {destination || vehicle.routeName || `Route ${vehicle.routeId}`}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: { xs: 0.5, sm: 1 }, 
              mt: 0.5,
              width: '100%'
            }}>
              <Typography variant="body2" sx={{ 
                color: isDeparted 
                  ? alpha(theme.palette.text.secondary, 0.6) 
                  : theme.palette.text.secondary,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 1
              }}>
                Vehicle: {vehicle.label || vehicle.id}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 0.5, sm: 1 },
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexWrap: 'wrap'
              }}>
                {arrivalText && (
                  <Chip
                    label={arrivalText}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: isDeparted 
                        ? alpha(theme.palette.success.main, 0.6)
                        : theme.palette.success.main,
                      border: `1px solid ${alpha(theme.palette.success.main, isDeparted ? 0.2 : 0.3)}`,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: { xs: 18, sm: 20 },
                      opacity: isDeparted ? 0.7 : 1,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
            </Box>
            
            {/* Short stop list (always visible for favorite routes) */}
            {showShortStopList && stopsToShow.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {stopsToShow.map((stop) => (
                    <Box
                      key={`${vehicle.id}-short-stop-${stop.stopId}-${stop.sequence}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: stop.isCurrent
                          ? alpha(theme.palette.primary.main, 0.1)
                          : stop.stopId === stationId
                          ? alpha(theme.palette.info.main, 0.1)
                          : alpha(theme.palette.action.hover, 0.5),
                        border: stop.isCurrent
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                          : stop.stopId === stationId
                          ? `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                          : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      }}
                    >
                      {/* Icon circle */}
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          flexShrink: 0,
                        }}
                      >
                        {stop.isCurrent ? (
                          <DirectionsBus 
                            sx={{ 
                              fontSize: 10, 
                              color: theme.palette.primary.main
                            }} 
                          />
                        ) : stop.stopId === stationId ? (
                          <LocationOn 
                            sx={{ 
                              fontSize: 10, 
                              color: theme.palette.info.main
                            }} 
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: theme.palette.text.disabled,
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Stop name */}
                      <Typography 
                        variant="caption" 
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: stop.isCurrent ? 600 : 400,
                          color: stop.isCurrent 
                            ? theme.palette.primary.main 
                            : stop.stopId === stationId
                            ? theme.palette.info.main
                            : theme.palette.text.secondary,
                          lineHeight: 1,
                        }}
                      >
                        {stop.stopName}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Expandable stops toggle and map button */}
            {stopSequence && stopSequence.length > 0 && (
              <Box sx={{ 
                mt: 1, 
                display: 'flex', 
                gap: 1,
                width: '100%',
                alignItems: 'stretch', // Make buttons same height
                mx: 0, // Ensure no horizontal margin
                px: 0  // Ensure no horizontal padding
              }}>
                {/* Stops toggle button (only show if showFullStopsButton is true) */}
                {showFullStopsButton && (
                  <Box
                    onClick={onToggleExpanded}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.action.hover, 0.5),
                      flex: 1, // Take up all available space on the left
                      minWidth: 0, // Allow shrinking
                      maxWidth: 'calc(100% - 52px)', // Reserve space for map button (44px + 8px gap)
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.7),
                      },
                      '&:active': {
                        bgcolor: alpha(theme.palette.action.hover, 0.9),
                      }
                    }}
                  >
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {isExpanded ? (
                        <ExpandLess fontSize="small" />
                      ) : (
                        <ExpandMore fontSize="small" />
                      )}
                    </Box>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.7rem' }, // Smaller font for mobile
                        flexGrow: 1,
                        whiteSpace: 'nowrap', // Prevent text wrapping
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      Stops ({stopSequence.length})
                    </Typography>
                  </Box>
                )}
                
                {/* Map button */}
                <Box
                  onClick={onShowMap}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    py: 0.5,
                    px: { xs: 1.5, sm: 1 },
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    flexShrink: 0, // Don't shrink the map button
                    minWidth: { xs: 44, sm: 36 },
                    ...(showFullStopsButton ? {} : { 
                      flex: 1, 
                      justifyContent: 'center',
                      minWidth: 'auto'
                    }),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                    '&:active': {
                      bgcolor: alpha(theme.palette.primary.main, 0.3),
                    }
                  }}
                >
                  <MapIcon 
                    fontSize="small" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }} 
                  />
                  {!showFullStopsButton && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 1, 
                        color: theme.palette.primary.main,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}
                    >
                      View on map
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ 
            textAlign: 'right',
            flexShrink: 0,
            minWidth: { xs: 40, sm: 60 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.5
          }}>
            {/* Status dot */}
            <Box
              sx={{
                width: { xs: 8, sm: 10 },
                height: { xs: 8, sm: 10 },
                borderRadius: '50%',
                bgcolor: isDeparted 
                  ? alpha(statusDotColor, 0.5) 
                  : statusDotColor,
                border: `1px solid ${alpha(statusDotColor, 0.3)}`,
                boxShadow: `0 0 4px ${alpha(statusDotColor, 0.4)}`,
                flexShrink: 0,
              }}
            />
          </Box>
        </Box>
        
        {/* Last update timestamp - positioned at bottom right */}
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            bottom: 8,
            right: 12,
            color: timestampColor, // Color based on data freshness and stale threshold
            fontSize: { xs: '0.65rem', sm: '0.7rem' },
            lineHeight: 1,
            whiteSpace: 'nowrap',
            zIndex: 3, // Above the card content
            pointerEvents: 'none', // Don't interfere with card interactions
          }}
        >
          {formatRefreshTime(
            vehicle.timestamp instanceof Date 
              ? vehicle.timestamp 
              : vehicle.timestamp 
                ? new Date(vehicle.timestamp)
                : new Date()
          )}
        </Typography>
      </CardContent>
      
      {/* Collapsible stops list (always shows full route) */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, pb: 2 }}>

          <List dense sx={{ py: 0 }}>
            {(stopSequence || []).map((stop) => (
              <ListItem
                key={`${vehicle.id}-stop-${stop.stopId}-${stop.sequence}`}
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: stop.isCurrent
                    ? alpha(theme.palette.primary.main, 0.1)
                    : stop.stopId === stationId
                    ? alpha(theme.palette.info.main, 0.1)
                    : 'transparent',
                  border: stop.isCurrent
                    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                    : stop.stopId === stationId
                    ? `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                    : '1px solid transparent',
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {stop.isCurrent ? (
                      <DirectionsBus 
                        sx={{ 
                          fontSize: 14, 
                          color: theme.palette.primary.main
                        }} 
                      />
                    ) : stop.stopId === stationId ? (
                      <PersonPin 
                        sx={{ 
                          fontSize: 14, 
                          color: theme.palette.info.main
                        }} 
                      />
                    ) : stop.isDestination ? (
                      <FlagOutlined 
                        sx={{ 
                          fontSize: 14, 
                          color: theme.palette.success.main
                        }} 
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: theme.palette.text.disabled,
                        }}
                      />
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: stop.isCurrent || stop.stopId === stationId ? 600 : 400,
                        color: stop.isCurrent 
                          ? theme.palette.primary.main 
                          : stop.stopId === stationId
                          ? theme.palette.info.main
                          : theme.palette.text.primary,
                        lineHeight: 1.2,
                      }}
                    >
                      {stop.stopName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                      {stop.isCurrent && 'Bus is currently closest to this stop'}
                      {stop.stopId === stationId && 'Your closest station'}
                      {stop.isDestination && 'Final destination'}
                      {!stop.isCurrent && !stop.isDestination && stop.stopId !== stationId && `Stop ${stop.sequence}`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Card>
  );
};

// Memoized export to prevent unnecessary re-renders
export const VehicleCard = React.memo(VehicleCardComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders when only timestamp changes slightly
  return (
    prevProps.vehicle.id === nextProps.vehicle.id &&
    prevProps.vehicle.routeId === nextProps.vehicle.routeId &&
    prevProps.arrivalText === nextProps.arrivalText &&
    prevProps.destination === nextProps.destination &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.stationId === nextProps.stationId &&
    prevProps.showShortStopList === nextProps.showShortStopList &&
    prevProps.showFullStopsButton === nextProps.showFullStopsButton
  );
});

VehicleCard.displayName = 'VehicleCard';