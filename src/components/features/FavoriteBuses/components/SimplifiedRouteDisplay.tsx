import React from 'react';
import { Box, Typography, Stack, useTheme, alpha, Chip } from '@mui/material';
import { LocationOn, DirectionsBus, PersonPin } from '@mui/icons-material';
import type { BusStopInfo } from '../../../../services/favoriteBusService';

interface SimplifiedRouteDisplayProps {
  stopSequence: BusStopInfo[];
  destination?: string;
  onMapClick?: () => void;
}

export const SimplifiedRouteDisplay: React.FC<SimplifiedRouteDisplayProps> = ({
  stopSequence,
  destination,
  onMapClick,
}) => {
  const theme = useTheme();

  // Get the three key stops in order
  const getKeyStops = () => {
    if (!stopSequence || stopSequence.length === 0) {
      return [];
    }

    const userStop = stopSequence.find(stop => stop.isClosestToUser);
    const currentStop = stopSequence.find(stop => stop.isCurrent);
    
    if (!userStop || !currentStop) {
      return [];
    }

    const userStopIndex = stopSequence.findIndex(stop => stop.isClosestToUser);
    const currentStopIndex = stopSequence.findIndex(stop => stop.isCurrent);

    // Check if bus is at user's stop
    const isBusAtUserStop = currentStop.id === userStop.id;

    // Create ordered list of key stops
    const keyStops = [];

    if (isBusAtUserStop) {
      // Bus is at user's stop - combine into single item
      keyStops.push({
        ...userStop,
        type: 'bus-at-user',
        order: userStopIndex,
      });
    } else {
      // Add current bus stop
      keyStops.push({
        ...currentStop,
        type: 'bus',
        order: currentStopIndex,
      });

      // Add user stop
      keyStops.push({
        ...userStop,
        type: 'user',
        order: userStopIndex,
      });
    }

    // Check if user stop is the final destination
    const lastStop = stopSequence[stopSequence.length - 1];
    const isUserStopFinalDestination = lastStop && lastStop.id === userStop.id;
    
    // Add destination only if it's different from user stop and current stop
    if (lastStop && lastStop.id !== currentStop.id && lastStop.id !== userStop.id) {
      keyStops.push({
        ...lastStop,
        type: 'destination',
        order: stopSequence.length - 1,
      });
    } else if (destination && !isUserStopFinalDestination) {
      // If no distinct last stop and user stop is not final destination, create a virtual destination
      keyStops.push({
        id: 'destination',
        name: destination,
        sequence: 999,
        coordinates: { latitude: 0, longitude: 0 },
        type: 'destination',
        order: 999,
      });
    }
    
    // Mark user stop as final destination if it is
    if (isUserStopFinalDestination) {
      const userStopInList = keyStops.find(stop => stop.type === 'user' || stop.type === 'bus-at-user');
      if (userStopInList) {
        userStopInList.isFinalDestination = true;
      }
    }

    // Sort by actual route order
    return keyStops.sort((a, b) => a.order - b.order);
  };

  const keyStops = getKeyStops();

  if (keyStops.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Route information unavailable
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 0.25, mb: 0.5 }}>
      {/* Compact Horizontal Route Progress */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        overflowX: 'auto',
        py: 0.5,
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
      }}>
        {keyStops.map((stop, index) => {
          const isCurrent = stop.type === 'bus';
          const isClosestToUser = stop.type === 'user';
          const isBusAtUser = stop.type === 'bus-at-user';
          
          return (
            <React.Fragment key={`simplified-${stop.id}-${stop.type}-${index}`}>
              {/* Compact Stop Indicator */}
              <Box 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  minWidth: 'fit-content',
                  maxWidth: 140,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isCurrent
                    ? alpha(theme.palette.primary.main, 0.15)
                    : (isClosestToUser || isBusAtUser)
                    ? alpha(theme.palette.info.main, 0.15)
                    : alpha(theme.palette.divider, 0.05),
                  border: `1px solid ${
                    isCurrent
                      ? alpha(theme.palette.primary.main, 0.3)
                      : (isClosestToUser || isBusAtUser)
                      ? alpha(theme.palette.info.main, 0.3)
                      : 'transparent'
                  }`,
                }}
              >
                {/* Compact Icon */}
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCurrent
                      ? theme.palette.primary.main
                      : (isClosestToUser || isBusAtUser)
                      ? theme.palette.info.main
                      : theme.palette.divider,
                    flexShrink: 0,
                  }}
                >
                  {stop.type === 'bus' ? (
                    <DirectionsBus 
                      sx={{ 
                        fontSize: 10, 
                        color: 'white'
                      }} 
                    />
                  ) : stop.type === 'user' || stop.type === 'bus-at-user' ? (
                    <PersonPin 
                      sx={{ 
                        fontSize: 10, 
                        color: 'white'
                      }} 
                    />
                  ) : (
                    <LocationOn 
                      sx={{ 
                        fontSize: 10, 
                        color: 'white'
                      }} 
                    />
                  )}
                </Box>
                
                {/* Compact Stop Name */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: isCurrent ? 600 : (isClosestToUser || isBusAtUser) ? 500 : 400,
                    color: isCurrent 
                      ? theme.palette.primary.main 
                      : (isClosestToUser || isBusAtUser)
                      ? theme.palette.info.main 
                      : theme.palette.text.secondary,
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {stop.name}
                </Typography>
                
                {/* Special State Indicators */}
                {stop.type === 'bus-at-user' && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: theme.palette.warning.main,
                      flexShrink: 0,
                    }}
                  />
                )}
                
                {(stop.type === 'user' || stop.type === 'bus-at-user') && stop.isFinalDestination && (
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: theme.palette.success.main,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
              
              {/* Connecting Arrow (except for last item) */}
              {index < keyStops.length - 1 && (
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid',
                    borderTop: '3px solid transparent',
                    borderBottom: '3px solid transparent',
                    borderLeftColor: theme.palette.divider,
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};