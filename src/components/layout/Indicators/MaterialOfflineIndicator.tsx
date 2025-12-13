import React from 'react';
import {
  Alert,
  Chip,
  Box,
  Typography,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  SignalWifiOff as OfflineIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';

import { useOfflineStore } from '../../../stores/offlineStore';

export const MaterialOfflineIndicator: React.FC = () => {
  const { isOnline } = useOfflineStore();
  const hasOfflineData = false; // Simplified for now
  const theme = useTheme();

  // Don't show anything if online
  if (isOnline) {
    return null;
  }

  return (
    <Collapse in={!isOnline}>
      <Alert
        severity="warning"
        icon={<OfflineIcon />}
        sx={{
          mb: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          '& .MuiAlert-icon': {
            color: theme.palette.warning.main,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              You're offline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasOfflineData 
                ? 'Showing cached data. Some information may be outdated.'
                : 'No cached data available. Connect to internet for live updates.'
              }
            </Typography>
          </Box>
          
          <Chip
            icon={<CloudOffIcon sx={{ fontSize: 16 }} />}
            label="Offline"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.2),
              color: theme.palette.warning.dark,
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: theme.palette.warning.dark,
              },
            }}
          />
        </Box>
      </Alert>
    </Collapse>
  );
};

export default MaterialOfflineIndicator;