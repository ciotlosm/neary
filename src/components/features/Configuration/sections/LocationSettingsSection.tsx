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
  Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
  Business as WorkIcon,
  LocationOn as LocationOnIcon,
  LocationOff as LocationOffIcon,
  LocationDisabled as LocationDisabledIcon,
  MyLocation as MyLocationIcon,
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
  const { currentLocation, locationPermission } = useLocationStore();

  const getGPSPermissionStatus = () => {
    switch (locationPermission) {
      case 'granted':
        return {
          icon: <LocationOnIcon sx={{ fontSize: 16 }} />,
          label: 'GPS Enabled',
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1),
          description: currentLocation 
            ? `Current location available: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
            : 'GPS permission granted, location will be available when requested',
        };
      case 'denied':
        return {
          icon: <LocationDisabledIcon sx={{ fontSize: 16 }} />,
          label: 'GPS Disabled',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          description: 'GPS access denied. Enable location services in browser settings to use "Use Current Location" features.',
        };
      default:
        return {
          icon: <LocationOffIcon sx={{ fontSize: 16 }} />,
          label: 'GPS Not Requested',
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          description: 'GPS permission not yet requested. Click "Use Current Location" to enable.',
        };
    }
  };

  const gpsStatus = getGPSPermissionStatus();

  const getActiveLocationStatus = () => {
    // Determine which location would be used for direction detection
    // Priority: current GPS → home → work → default
    if (currentLocation && locationPermission === 'granted') {
      return {
        type: 'current',
        icon: <MyLocationIcon sx={{ fontSize: 16 }} />,
        label: 'Using Current GPS',
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        description: `Live GPS location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`,
      };
    } else if (homeLocation) {
      return {
        type: 'home',
        icon: <HomeIcon sx={{ fontSize: 16 }} />,
        label: 'Using Home Location',
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        description: `Fallback to saved home: ${formatLocationDisplay(homeLocation)}`,
      };
    } else if (workLocation) {
      return {
        type: 'work',
        icon: <WorkIcon sx={{ fontSize: 16 }} />,
        label: 'Using Work Location',
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        description: `Fallback to saved work: ${formatLocationDisplay(workLocation)}`,
      };
    } else {
      return {
        type: 'default',
        icon: <LocationOnIcon sx={{ fontSize: 16 }} />,
        label: 'Using Default Location',
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        description: defaultLocation 
          ? `Fallback to default: ${formatLocationDisplay(defaultLocation)}`
          : 'Fallback to Cluj-Napoca center (46.7712, 23.6236)',
      };
    }
  };

  const activeLocationStatus = getActiveLocationStatus();

  return (
    <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.02) }}>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon sx={{ color: 'info.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Location Settings
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Set your home and work locations for intelligent routing (optional)
          </Typography>

          {/* GPS Permission Status */}
          <Alert 
            severity={locationPermission === 'granted' ? 'success' : locationPermission === 'denied' ? 'error' : 'info'}
            sx={{ 
              bgcolor: gpsStatus.bgColor,
              border: `1px solid ${alpha(gpsStatus.color, 0.3)}`,
              '& .MuiAlert-icon': {
                color: gpsStatus.color,
              },
            }}
            icon={gpsStatus.icon}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Device GPS Status: {gpsStatus.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {gpsStatus.description}
            </Typography>
          </Alert>

          {/* Active Location Status */}
          <Alert 
            severity={activeLocationStatus.type === 'current' ? 'success' : activeLocationStatus.type === 'default' ? 'warning' : 'info'}
            sx={{ 
              bgcolor: activeLocationStatus.bgColor,
              border: `1px solid ${alpha(activeLocationStatus.color, 0.3)}`,
              '& .MuiAlert-icon': {
                color: activeLocationStatus.color,
              },
            }}
            icon={activeLocationStatus.icon}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Direction Detection: {activeLocationStatus.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeLocationStatus.description}
            </Typography>
          </Alert>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <HomeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Home Location
                </Typography>
                {homeLocation && (
                  <Chip
                    label="Set"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Stack>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => onLocationPicker('home')}
              >
                {homeLocation ? 'Change Home' : 'Set Home Location'}
              </Button>
              {homeLocation && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                  {formatLocationDisplay(homeLocation)}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Work Location
                </Typography>
                {workLocation && (
                  <Chip
                    label="Set"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Stack>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => onLocationPicker('work')}
              >
                {workLocation ? 'Change Work' : 'Set Work Location'}
              </Button>
              {workLocation && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                  {formatLocationDisplay(workLocation)}
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};