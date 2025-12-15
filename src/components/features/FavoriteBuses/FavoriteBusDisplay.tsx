import React from 'react';
import {
  Box,
  Stack,
} from '@mui/material';
import { useFavoriteBusDisplay } from '../../../hooks/useFavoriteBusDisplay';
import { GroupedFavoriteBusDisplay } from './components/GroupedFavoriteBusDisplay';
import { EmptyStates } from './components/EmptyStates';

interface FavoriteBusDisplayProps {
  className?: string;
}

export const FavoriteBusDisplay: React.FC<FavoriteBusDisplayProps> = ({ className }) => {
  const {
    // Data
    favoriteBusResult,
    isLoading,
    error,
    lastUpdate,
    config,
    
    // Computed
    hasFavoriteRoutes,
    hasFavoriteBusData,
    
    // Utilities
    getRouteLabel,
    getRouteTypeInfo,
  } = useFavoriteBusDisplay();

  if (error) {
    return <EmptyStates type="error" error={error} />;
  }

  if (!hasFavoriteRoutes) {
    return <EmptyStates type="no-favorites" />;
  }

  // If we have favorite routes configured but no bus data yet (still loading)
  if (hasFavoriteRoutes && !favoriteBusResult && isLoading) {
    return <EmptyStates type="loading" />;
  }

  // If we have favorite routes configured but no bus data available (finished loading but no data)
  if (hasFavoriteRoutes && favoriteBusResult && !hasFavoriteBusData && !isLoading) {
    return (
      <EmptyStates 
        type="no-data" 
        config={config}
        getRouteLabel={getRouteLabel}
        getRouteTypeInfo={getRouteTypeInfo}
      />
    );
  }

  return (
    <Box className={className}>
      <GroupedFavoriteBusDisplay buses={favoriteBusResult?.favoriteBuses || []} />
    </Box>
  );
};

export default FavoriteBusDisplay;