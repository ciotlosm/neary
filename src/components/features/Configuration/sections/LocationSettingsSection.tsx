import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home as HomeIcon,
  Business as WorkIcon,
  LocationOn as LocationOnIcon,
  LocationDisabled as LocationDisabledIcon,
} from '@mui/icons-material';
import { Button } from '../../../ui/Button';
import { useLocationStore } from '../../../../stores/locationStore';
type Coordinates = { latitude: number; longitude: number; };

interface LocationSettingsSectionProps {
  homeLocation?: Coordinates;
  workLocation?: Coordinates;
  defaultLocation?: Coordinates;
  onLocationPicker: (type: 'home' | 'work' | 'default') => void;
  formatLocationDisplay: (location: Coordinates | undefined) => string | null;
}

export const LocationSettingsSection: React.FC<LocationSettingsSectionProps> = ({
  homeLocation,
  workLocation,
  defaultLocation,
  onLocationPicker,
  formatLocationDisplay,
}) => {
  const theme = useTheme();
  const { locationPermission } = useLocationStore();

  return (
    <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.02) }}>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ color: 'info.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Location Settings
            </Typography>
            {locationPermission === 'denied' && (
              <Chip
                icon={<LocationDisabledIcon sx={{ fontSize: 14 }} />}
                label="GPS Disabled"
                size="small"
                color="error"
                sx={{ ml: 'auto' }}
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Configure locations for intelligent route suggestions (all optional)
          </Typography>
          
          {/* Location Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            {/* Home Location */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <HomeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Home
                </Typography>
                {homeLocation && (
                  <Chip
                    label="Set"
                    size="small"
                    color="success"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => onLocationPicker('home')}
                disabled={locationPermission === 'denied'}
              >
                {homeLocation ? 'Change' : 'Set Home'}
              </Button>
              {homeLocation && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem', display: 'block' }}>
                  {formatLocationDisplay(homeLocation)}
                </Typography>
              )}
            </Box>
            
            {/* Work Location */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Work
                </Typography>
                {workLocation && (
                  <Chip
                    label="Set"
                    size="small"
                    color="success"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => onLocationPicker('work')}
                disabled={locationPermission === 'denied'}
              >
                {workLocation ? 'Change' : 'Set Work'}
              </Button>
              {workLocation && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem', display: 'block' }}>
                  {formatLocationDisplay(workLocation)}
                </Typography>
              )}
            </Box>

            {/* Default Location */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Default
                </Typography>
                {defaultLocation && (
                  <Chip
                    label="Set"
                    size="small"
                    color="info"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => onLocationPicker('default')}
              >
                {defaultLocation ? 'Change' : 'Set Default'}
              </Button>
              {defaultLocation && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem', display: 'block' }}>
                  {formatLocationDisplay(defaultLocation)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* GPS Disabled Warning */}
          {locationPermission === 'denied' && (
            <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
              ⚠️ GPS disabled - "Use Current Location" features unavailable in location picker
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};