import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface GroupedFavoriteBusDisplayProps {
  buses: any[];
  className?: string;
}

export const GroupedFavoriteBusDisplay: React.FC<GroupedFavoriteBusDisplayProps> = ({ buses, className }) => {
  return (
    <Box className={className}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {buses.length > 0 ? `Displaying ${buses.length} favorite buses` : 'No favorite buses to display'}
        </Typography>
      </Paper>
    </Box>
  );
};