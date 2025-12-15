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
} from '@mui/icons-material';
import { Button } from '../../../ui/Button';
type Coordinates = { latitude: number; longitude: number; };

interface LocationSettingsSectionProps {
  homeLocation?: Coordinates;
  workLocation?: Coordinates;
  onLocationPicker: (type: 'home' | 'work') => void;
  formatLocationDisplay: (location: Coordinates | undefined) => string | null;
}

export const LocationSettingsSection: React.FC<LocationSettingsSectionProps> = ({
  homeLocation,
  workLocation,
  onLocationPicker,
  formatLocationDisplay,
}) => {
  const theme = useTheme();

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