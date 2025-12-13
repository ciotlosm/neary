import React from 'react';
import {
  Alert,
  Typography,
} from '@mui/material';

interface StatusMessagesProps {
  isLoading: boolean;
  hasRoutes: boolean;
  hasFilteredRoutes: boolean;
  hasFavorites: boolean;
  searchTerm: string;
  selectedTypes: string[];
  cityName?: string;
  selectedCount: number;
  hasChanges: boolean;
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({
  isLoading,
  hasRoutes,
  hasFilteredRoutes,
  hasFavorites,
  searchTerm,
  selectedTypes,
  cityName,
  selectedCount,
  hasChanges,
}) => {
  // No Routes Found (with search/filter)
  if (!isLoading && !hasFilteredRoutes && !hasFavorites && hasRoutes) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          No routes found matching "{searchTerm}". Try a different search term.
        </Typography>
      </Alert>
    );
  }

  // No Available Routes (all are favorites)
  if (!isLoading && !hasFilteredRoutes && hasFavorites && searchTerm === '' && selectedTypes.length === 0) {
    return (
      <Alert severity="success" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          All available routes are already in your favorites! You can remove routes from favorites by unchecking them above.
        </Typography>
      </Alert>
    );
  }

  // No Routes Available
  if (!isLoading && !hasRoutes) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          No routes available for {cityName}. This might be a temporary issue or the city might not be supported yet.
        </Typography>
      </Alert>
    );
  }

  // Current Favorites Summary (when no changes)
  if (selectedCount > 0 && !hasChanges) {
    return (
      <Alert severity="success" sx={{ borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          You have {selectedCount} favorite bus route{selectedCount !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="body2">
          These routes will appear in your favorites section for quick access to real-time information.
        </Typography>
      </Alert>
    );
  }

  return null;
};