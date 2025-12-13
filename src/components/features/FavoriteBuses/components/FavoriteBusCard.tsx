import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { ExpandMore, ExpandLess, LocationOn, RadioButtonUnchecked, Warning } from '@mui/icons-material';
import { getRouteTypeInfo } from '../../../../utils/busDisplayUtils';
import { BusCard } from '../../../ui/Card';
import type { FavoriteBusInfo } from '../../../../services/favoriteBusService';

interface FavoriteBusCardProps {
  bus: FavoriteBusInfo;
  index: number;
}

export const FavoriteBusCard: React.FC<FavoriteBusCardProps> = ({ bus }) => {
  const theme = useTheme();
  const [showStops, setShowStops] = useState(false);
  
  // Validate bus data
  if (!bus) {
    return null;
  }
  
  const routeTypeInfo = getRouteTypeInfo(bus.routeType, theme);
  const displayRouteName = bus.routeName || `Route ${bus.routeShortName}`;
  const avatarRouteNumber = bus.routeShortName || 'N/A';

  // Format coordinates for display with proper validation
  const formatCoordinate = (coord: number | undefined) => {
    if (typeof coord === 'number' && !isNaN(coord)) {
      return coord.toFixed(4);
    }
    return 'N/A';
  };
  
  // Calculate time since last update with validation
  const getUpdateText = () => {
    if (!bus.lastUpdate || !(bus.lastUpdate instanceof Date)) {
      return 'Unknown';
    }
    const timeSinceUpdate = Math.floor((Date.now() - bus.lastUpdate.getTime()) / 1000);
    if (timeSinceUpdate <= 5) return 'now';
    return timeSinceUpdate < 60 ? `${timeSinceUpdate}s ago` : `${Math.floor(timeSinceUpdate / 60)}m ago`;
  };

  // Format distance for better readability - show meters for short distances, km for long distances
  const formatDistance = (distanceInMeters: number) => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  };
  
  const updateText = getUpdateText();

  return (
    <Box sx={{ position: 'relative' }}>
      <BusCard
        routeId={avatarRouteNumber}
        routeName={`${routeTypeInfo.icon} ${displayRouteName}`}
        destination={bus.destination || ''}
        arrivalTime={updateText}
        isRealTime={true}
        delay={0}
        location={bus.nearestStation ? `Near ${bus.nearestStation.name}` : `${formatCoordinate(bus.latitude)}, ${formatCoordinate(bus.longitude)}`}
        isFavorite={true}
        onToggleFavorite={() => {
          console.log('Toggle favorite for route:', bus.routeShortName);
        }}
      >
        {/* Additional vehicle information */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Vehicle {bus.vehicleId || 'N/A'}
              </Typography>
              {bus.nearestStation && (
                <Typography variant="caption" color="text.secondary">
                  • {formatDistance(bus.nearestStation.distance)}
                </Typography>
              )}
            </Stack>
            
            <Chip
              label={routeTypeInfo.label}
              size="small"
              sx={{
                bgcolor: alpha(routeTypeInfo.color, 0.1),
                color: routeTypeInfo.color,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
          
          {(bus.speed !== undefined && bus.speed !== null && bus.speed > 0) && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Speed: {bus.speed} km/h
              </Typography>
            </Box>
          )}

          {/* Stop sequence toggle */}
          {bus.stopSequence && bus.stopSequence.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => setShowStops(!showStops)}
                  sx={{ p: 0.5 }}
                >
                  {showStops ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  Route Stops ({bus.stopSequence.length})
                  {bus.direction && ` • ${bus.direction === 'inbound' ? 'Inbound' : 'Outbound'}`}
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Stop sequence list */}
        {bus.stopSequence && bus.stopSequence.length > 0 && (
          <Collapse in={showStops}>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                Route Stops
              </Typography>
              <List dense sx={{ py: 0 }}>
                {/* Show off-route nearest station if bus is off-route */}
                {bus.nearestStation && bus.stopSequence.some(stop => stop.isOffRoute) && (
                  <ListItem
                    sx={{
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                      mb: 1
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Warning 
                        fontSize="small" 
                        color="error"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="caption" 
                          color="error"
                          sx={{ fontWeight: 600 }}
                        >
                          {bus.nearestStation.name} (Off-Route)
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="error" sx={{ fontSize: '0.65rem' }}>
                          {formatDistance(bus.nearestStation.distance)} from bus
                        </Typography>
                      }
                    />
                    <Chip
                      label="Off-Route"
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  </ListItem>
                )}

                {/* Show route stops */}
                {bus.stopSequence.map((stop) => {
                  const isOffRouteClosest = stop.isClosestRouteStop && stop.isOffRoute;
                  const isOppositeDirectionClosest = stop.isClosestRouteStop && !stop.isOffRoute;
                  const isNormalCurrent = stop.isNearest && !stop.isOffRoute;
                  
                  return (
                    <ListItem
                      key={stop.id}
                      sx={{
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        bgcolor: (isNormalCurrent || isOppositeDirectionClosest)
                          ? alpha(theme.palette.primary.main, 0.1)
                          : isOffRouteClosest
                          ? alpha(theme.palette.error.main, 0.1)
                          : 'transparent',
                        border: (isNormalCurrent || isOppositeDirectionClosest)
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                          : isOffRouteClosest
                          ? `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                          : '1px solid transparent',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {(isNormalCurrent || isOppositeDirectionClosest) ? (
                          <LocationOn 
                            fontSize="small" 
                            color="primary"
                          />
                        ) : isOffRouteClosest ? (
                          <LocationOn 
                            fontSize="small" 
                            color="error"
                          />
                        ) : (
                          <RadioButtonUnchecked 
                            fontSize="small" 
                            sx={{ color: theme.palette.text.disabled }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="caption" 
                            color={(isNormalCurrent || isOppositeDirectionClosest) ? 'primary' : isOffRouteClosest ? 'error' : 'text.secondary'}
                            sx={{ fontWeight: (isNormalCurrent || isOppositeDirectionClosest || isOffRouteClosest) ? 600 : 400 }}
                          >
                            {stop.name}
                          </Typography>
                        }
                        secondary={
                          stop.arrivalTime && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                              {stop.arrivalTime}
                            </Typography>
                          )
                        }
                      />
                      {isNormalCurrent && (
                        <Chip
                          label="Current"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                      {isOppositeDirectionClosest && (
                        <Chip
                          label="Current"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                      {isOffRouteClosest && (
                        <Chip
                          label="Closest"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Collapse>
        )}
      </BusCard>
    </Box>
  );
};