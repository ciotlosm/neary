// RouteView - Core view component for routes following VehicleView pattern
// Displays raw API data directly with loading, error, and success states

import { useEffect } from 'react';
import type { FC } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Button
} from '@mui/material';
import { useRouteStore } from '../../../stores/routeStore';
import { useConfigStore } from '../../../stores/configStore';
import { RouteList } from '../lists/RouteList';

export const RouteView: FC = () => {
  const { routes, loading, error, loadRoutes } = useRouteStore();
  const { apiKey, agency_id } = useConfigStore();

  useEffect(() => {
    if (apiKey && agency_id) {
      loadRoutes(apiKey, agency_id);
    }
  }, [apiKey, agency_id, loadRoutes]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => {
              if (apiKey && agency_id) {
                loadRoutes(apiKey, agency_id);
              }
            }}
          >
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!apiKey || !agency_id) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Please configure your API key and agency in settings
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ p: 2 }}>
        Routes
      </Typography>
      
      <RouteList routes={routes} />
      
      {routes.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No routes found
        </Typography>
      )}
    </Box>
  );
};