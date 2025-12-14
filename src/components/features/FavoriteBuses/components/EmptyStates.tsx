import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { InfoCard } from '../../../ui/Card';

interface EmptyStatesProps {
  type: 'no-favorites' | 'loading' | 'no-data' | 'error';
  error?: any;
  config?: any;
  getRouteLabel?: (routeId: string) => string;
  getRouteTypeInfo?: (routeId: string, theme?: any) => any;
}

export const EmptyStates: React.FC<EmptyStatesProps> = ({
  type,
  error,
  config,
  getRouteLabel,
  getRouteTypeInfo,
}) => {
  const theme = useTheme();

  if (type === 'error') {
    return (
      <InfoCard
        title="Favorites Error"
        subtitle="Unable to load favorite buses"
        icon={<FavoriteIcon />}
      >
        <Typography variant="body2" color="error.main">
          {typeof error === 'string' ? error : error?.message || 'Unknown error'}
        </Typography>
      </InfoCard>
    );
  }

  if (type === 'no-favorites') {
    return (
      <InfoCard
        title="No Favorite Buses"
        subtitle="Add buses to your favorites to see them here"
        icon={<FavoriteIcon />}
      >
        <Typography variant="body2" color="text.secondary">
          Go to Settings → Favorites to select your favorite bus routes.
        </Typography>
      </InfoCard>
    );
  }

  if (type === 'loading') {
    return (
      <InfoCard
        title="Loading Favorites..."
        subtitle="Getting your favorite bus times"
        icon={<FavoriteIcon />}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: theme.palette.error.main,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Loading favorite buses...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (type === 'no-data' && config && getRouteLabel && getRouteTypeInfo) {
    return (
      <InfoCard
        title="Favorite Buses"
        subtitle={`${config?.favoriteBuses?.length || 0} favorite route${(config?.favoriteBuses?.length || 0) !== 1 ? 's' : ''} configured`}
        icon={<FavoriteIcon />}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No real-time data available for your favorite routes at the moment.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {(config?.favoriteBuses || []).map((favoriteRoute: any) => {
              // Handle both old format (string) and new format (FavoriteRoute object)
              const routeId = typeof favoriteRoute === 'string' ? favoriteRoute : favoriteRoute.id;
              const routeShortName = typeof favoriteRoute === 'string' ? favoriteRoute : favoriteRoute.routeName;
              const routeType = typeof favoriteRoute === 'string' ? 'bus' : favoriteRoute.type;
              
              // Get route type info based on the route type, not helper functions
              const getRouteTypeIcon = (type: string) => {
                switch (type) {
                  case 'bus': return '🚌';
                  case 'trolleybus': return '🚎';
                  case 'tram': return '🚋';
                  case 'metro': return '🚇';
                  default: return '🚌';
                }
              };
              
              const routeTypeInfo = {
                icon: getRouteTypeIcon(routeType),
                color: theme.palette.primary.main
              };
              
              return (
                <Chip
                  key={routeId}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span style={{ fontSize: '0.9rem' }}>{routeTypeInfo.icon}</span>
                      <span>Route {routeShortName}</span>
                    </Box>
                  }
                  size="small"
                  icon={<FavoriteIcon />}
                  sx={{ 
                    mb: 1,
                    bgcolor: alpha(routeTypeInfo.color, 0.1),
                    color: routeTypeInfo.color,
                    borderColor: alpha(routeTypeInfo.color, 0.3),
                    '& .MuiChip-icon': {
                      color: routeTypeInfo.color,
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          Routes are monitored for live vehicles and official schedule data only.
        </Typography>
      </InfoCard>
    );
  }

  return null;
};