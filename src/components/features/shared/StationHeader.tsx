import React from 'react';
import {
  Box,
  Chip,
} from '@mui/material';
import { MapPinIcon } from '../../ui/Icons/Icons';

interface StationHeaderProps {
  stationName: string;
  distance: number;
  isClosest?: boolean;
}

export const StationHeader: React.FC<StationHeaderProps> = ({
  stationName,
  distance,
  isClosest = false
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      <Chip
        icon={<MapPinIcon size={16} className="text-blue-400" />}
        label={stationName}
        sx={{
          bgcolor: 'rgba(59, 130, 246, 0.1)',
          color: 'rgb(147, 197, 253)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          fontWeight: 600,
        }}
      />
      <Chip
        label={`${Math.round(distance)}m`}
        sx={{
          bgcolor: isClosest ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)',
          color: isClosest ? 'rgb(134, 239, 172)' : 'rgb(196, 181, 253)',
          border: isClosest ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)',
          fontWeight: 600,
        }}
      />
    </Box>
  );
};