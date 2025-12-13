import React from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { formatTime24 } from '../../../utils/timeFormat';
import {
  DirectionsBus as BusIcon,
  Star as StarIcon,
} from '@mui/icons-material';

import { useIntelligentBusStore } from '../../../stores/intelligentBusStore';
import { useConfigStore } from '../../../stores/configStore';
import { BusCard, InfoCard } from '../../ui/Card';

interface MaterialIntelligentBusDisplayProps {
  className?: string;
}



export const MaterialIntelligentBusDisplay: React.FC<MaterialIntelligentBusDisplayProps> = ({ className }) => {
  const { recommendedRoutes, isLoading, error, lastUpdate } = useIntelligentBusStore();
  const { config } = useConfigStore();
  const theme = useTheme();

  if (!config?.homeLocation || !config?.workLocation) {
    return (
      <InfoCard
        title="Intelligent Routing"
        subtitle="Set up your home and work locations to see personalized routes"
        icon={<BusIcon />}
      >
        <Typography variant="body2" color="text.secondary">
          Configure your locations in Settings to get intelligent bus recommendations.
        </Typography>
      </InfoCard>
    );
  }

  if (isLoading) {
    return (
      <InfoCard
        title="Finding Best Routes..."
        subtitle="Analyzing real-time data"
        icon={<BusIcon />}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.main,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Loading intelligent routes...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard
        title="Route Analysis Error"
        subtitle="Unable to load intelligent routes"
        icon={<BusIcon />}
      >
        <Typography variant="body2" color="error.main">
          {typeof error === 'string' ? error : error?.message || 'Unknown error'}
        </Typography>
      </InfoCard>
    );
  }

  const hasRoutes = recommendedRoutes.length > 0;

  if (!hasRoutes) {
    return (
      <InfoCard
        title="No Intelligent Routes"
        subtitle="No route recommendations available at the moment"
        icon={<BusIcon />}
      >
        <Typography variant="body2" color="text.secondary">
          Check your favorite buses for live vehicle tracking.
        </Typography>
      </InfoCard>
    );
  }

  return (
    <Box className={className}>
      <InfoCard
        title="Intelligent Routes"
        subtitle={lastUpdate ? `Updated ${formatTime24(lastUpdate)}` : 'Real-time analysis'}
        icon={<BusIcon />}
      >
        <Stack spacing={2}>
          {/* Recommended Routes */}
          {recommendedRoutes.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recommended Routes
              </Typography>
              <Stack spacing={2}>
                {recommendedRoutes.map((routeOption, index) => {
                  if (routeOption.type === 'direct') {
                    const directRoute = routeOption.route as any; // DirectRoute
                    const bus = directRoute.bus;
                    return (
                      <BusCard
                        key={`direct-${bus.route}-${index}`}
                        routeId={bus.route}
                        routeName={bus.routeName || `Route ${bus.route}`}
                        destination={bus.destination || 'Unknown destination'}
                        arrivalTime={directRoute.arrivalTime ? formatTime24(new Date(directRoute.arrivalTime)) : 'Unknown'}
                        isRealTime={bus.isLive || false}
                        delay={bus.delay || 0}
                        location={bus.currentLocation || 'Unknown location'}
                      >
                        {index === 0 && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <Chip
                              icon={<StarIcon sx={{ fontSize: 14 }} />}
                              label="Best Route"
                              size="small"
                              sx={{
                                bgcolor: theme.palette.success.main,
                                color: theme.palette.success.contrastText,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          </Box>
                        )}
                      </BusCard>
                    );
                  } else {
                    // Connection route - simplified display
                    return (
                      <InfoCard
                        key={`connection-${index}`}
                        title="Connection Route"
                        subtitle={`Total time: ${routeOption.totalTime} min`}
                        icon={<BusIcon />}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Multi-route connection available
                        </Typography>
                      </InfoCard>
                    );
                  }
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      </InfoCard>
    </Box>
  );
};

export default MaterialIntelligentBusDisplay;