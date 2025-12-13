import React from 'react';
import { Typography, Stack, Chip, useTheme, alpha } from '@mui/material';
import { CLUJ_POPULAR_LOCATIONS } from '../../../../utils/locationUtils';

interface PopularLocationsProps {
  onLocationSelect: (locationName: string) => void;
  getLocationColor: () => string;
}

export const PopularLocations: React.FC<PopularLocationsProps> = ({
  onLocationSelect,
  getLocationColor,
}) => {
  const theme = useTheme();

  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Popular Locations
      </Typography>
      
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {CLUJ_POPULAR_LOCATIONS.map((location) => (
          <Chip
            key={location.name}
            label={location.name}
            onClick={() => onLocationSelect(location.name)}
            sx={{
              mb: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha(getLocationColor(), 0.1),
              },
            }}
          />
        ))}
      </Stack>
    </>
  );
};