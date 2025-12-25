// StationViewHeader - Header with filtering controls and status indicators
// Displays filtering toggle and status chips

import type { FC } from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Stack
} from '@mui/material';
import { 
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

interface StationViewHeaderProps {
  isFiltering: boolean;
  toggleFiltering: () => void;
  filteredCount: number;
  totalCount: number;
  favoritesFilterEnabled: boolean;
  toggleFavoritesFilter: () => void;
  hasFavoriteRoutes: boolean;
}

export const StationViewHeader: FC<StationViewHeaderProps> = ({
  isFiltering,
  toggleFiltering,
  filteredCount,
  totalCount,
  favoritesFilterEnabled,
  toggleFavoritesFilter,
  hasFavoriteRoutes
}) => {
  return (
    <Box sx={{ p: 2, pb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
        {/* Favorites filter toggle - only show when user has favorite routes */}
        {hasFavoriteRoutes && (
          <Chip
            icon={<FavoriteIcon />}
            label="Favorites"
            variant={favoritesFilterEnabled ? 'filled' : 'outlined'}
            color={favoritesFilterEnabled ? 'error' : 'default'}
            onClick={toggleFavoritesFilter}
            clickable
            size="small"
          />
        )}
        
        <Chip
          icon={<LocationIcon />}
          label="Nearby"
          variant={isFiltering ? 'filled' : 'outlined'}
          color={isFiltering ? 'primary' : 'default'}
          onClick={toggleFiltering}
          clickable
          size="small"
        />
      </Stack>
    </Box>
  );
};