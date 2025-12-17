import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useConfigStore } from '../../../stores/configStore';
import { withPerformanceMonitoring } from '../../../utils/performance';
import { logger } from '../../../utils/logger';
import { MapPinIcon } from '../../ui/Icons/Icons';
import { BusRouteMapModal } from '../shared/BusRouteMapModal';
import { VehicleCard } from '../shared/VehicleCard';
import { StationHeader } from '../shared/StationHeader';
import { StationMapModal } from '../shared/StationMapModal';
import { RouteFilterChips } from '../shared/RouteFilterChips';
import { useNearbyViewController } from '../../../hooks/controllers/useNearbyViewController';
import type { EnhancedVehicleInfo } from '../../../types';
import type { FavoriteBusInfo } from '../../../services/favoriteBusService';


import { useModernRefreshSystem } from '../../../hooks/shared/useModernRefreshSystem';

interface EnhancedVehicleInfoWithDirection extends EnhancedVehicleInfo {
  _internalDirection?: 'arriving' | 'departing' | 'unknown';
  stopSequence?: Array<{
    stopId: string;
    stopName: string;
    sequence: number;
    isCurrent: boolean;
    isDestination: boolean;
  }>;
}

interface StationDisplayProps {
  // No props needed - maxVehicles comes from config
}

const StationDisplayComponent: React.FC<StationDisplayProps> = () => {
  const { config } = useConfigStore();
  
  // MIGRATION: Use modern refresh system instead of enhanced bus store
  const { refreshAll, lastUpdate } = useModernRefreshSystem();
  

  
  // State for route filtering per station (must be declared before use)
  const [selectedRoutePerStation, setSelectedRoutePerStation] = React.useState<Map<string, string>>(new Map());
  
  // Trigger store refresh when component mounts if data is stale
  React.useEffect(() => {
    const shouldRefresh = () => {
      if (!config?.agencyId || !config?.apiKey) return false;
      
      // If no data or data is older than 5 minutes, refresh
      if (!lastUpdate) return true;
      
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return lastUpdate < fiveMinutesAgo;
    };

    if (shouldRefresh()) {
      logger.debug('Triggering modern refresh for station display', {
        hasLastUpdate: !!lastUpdate,
        lastUpdate
      }, 'STATION_DISPLAY');
      refreshAll();
    }
  }, [config?.agencyId, config?.apiKey, lastUpdate, refreshAll]);
  
  // Use the new nearby view controller for improved station selection
  const {
    stationVehicleGroups,
    isLoading,
    effectiveLocationForDisplay,
    selectedStations,
    error: nearbyViewError,
    selectionMetadata,
  } = useNearbyViewController({
    enableSecondStation: true,
    customDistanceThreshold: 200,
    stabilityMode: 'normal',
    maxSearchRadius: 5000,
    maxVehiclesPerStation: 999, // Get all vehicles, we'll filter per station
    requireActiveRoutes: true,
    enableStabilityTracking: true,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Log nearby view integration for debugging
  React.useEffect(() => {
    if (selectedStations && selectionMetadata) {
      logger.debug('StationDisplay using nearby view controller', {
        hasClosestStation: !!selectedStations.closestStation,
        hasSecondStation: !!selectedStations.secondStation,
        stationGroupsCount: stationVehicleGroups.length,
        totalStationsEvaluated: selectionMetadata.totalStationsEvaluated,
        stationsWithRoutes: selectionMetadata.stationsWithRoutes,
        selectionTime: selectionMetadata.selectionTime,
        stabilityApplied: selectionMetadata.stabilityApplied,
        hasError: !!nearbyViewError
      }, 'STATION_DISPLAY_INTEGRATION');
    }
  }, [selectedStations, selectionMetadata, stationVehicleGroups.length, nearbyViewError]);

  // Additional debug logging for empty states (will be added after processedStationGroups is defined)

  // Get all stations for map functionality (fallback to empty array)
  const allStations = React.useMemo(() => {
    const stations: any[] = [];
    stationVehicleGroups.forEach(group => {
      if (group.station?.station && !stations.find(s => s.id === group.station.station.id)) {
        stations.push(group.station.station);
      }
    });
    return stations;
  }, [stationVehicleGroups]);
  
  // State for managing expanded stops per vehicle
  const [expandedVehicles, setExpandedVehicles] = React.useState<Set<string>>(new Set());
  
  // State for managing individual bus route map modal
  const [mapModalOpen, setMapModalOpen] = React.useState(false);
  const [selectedVehicleForMap, setSelectedVehicleForMap] = React.useState<EnhancedVehicleInfoWithDirection | null>(null);
  const [targetStationId, setTargetStationId] = React.useState<string>('');
  
  // State for managing station map modal (all routes for a station)
  const [stationMapModalOpen, setStationMapModalOpen] = React.useState(false);
  const [selectedStationForMap, setSelectedStationForMap] = React.useState<{
    station: { id: string; name: string; coordinates: { latitude: number; longitude: number } };
    distance: number;
    vehicles: EnhancedVehicleInfoWithDirection[];
    allVehicles: EnhancedVehicleInfoWithDirection[]; // All vehicles for map, not deduplicated
  } | null>(null);

  // Process station groups with per-station route filtering and deduplication
  const processedStationGroups = React.useMemo(() => {
    const maxVehicles = config?.maxVehiclesPerStation || 5;
    
    return stationVehicleGroups.map(stationGroup => {
      const selectedRoute = selectedRoutePerStation.get(stationGroup.station.station.id);
      
      if (selectedRoute) {
        // Filter to show only vehicles from the selected route (all vehicles for that route)
        const filteredVehicles = stationGroup.vehicles.filter(vehicle => 
          vehicle.routeId === selectedRoute
        );

        return {
          ...stationGroup,
          vehicles: filteredVehicles
        };
      } else {
        // No filter active for this station - apply deduplication (best vehicle per route)
        const routeGroups = new Map<string, typeof stationGroup.vehicles>();
        
        // Group vehicles by route
        stationGroup.vehicles.forEach(vehicle => {
          const routeId = vehicle.routeId;
          if (!routeGroups.has(routeId)) {
            routeGroups.set(routeId, []);
          }
          routeGroups.get(routeId)!.push(vehicle);
        });

        // Select the best vehicle per route based on priority
        const bestVehiclePerRoute = Array.from(routeGroups.entries()).map(([routeId, vehicles]) => {
          // Sort vehicles within this route by priority
          const sortedVehicles = vehicles.sort((a, b) => {
            // Priority 1: At station (minutesAway = 0 and arriving)
            const aAtStation = a.minutesAway === 0 && a._internalDirection === 'arriving';
            const bAtStation = b.minutesAway === 0 && b._internalDirection === 'arriving';
            
            if (aAtStation && !bAtStation) return -1;
            if (!aAtStation && bAtStation) return 1;
            
            // Priority 2: Arriving vehicles (sorted by minutes ascending)
            const aArriving = a._internalDirection === 'arriving' && a.minutesAway > 0;
            const bArriving = b._internalDirection === 'arriving' && b.minutesAway > 0;
            
            if (aArriving && !bArriving) return -1;
            if (!aArriving && bArriving) return 1;
            
            // If both are arriving, sort by minutes (closest first)
            if (aArriving && bArriving) {
              return a.minutesAway - b.minutesAway;
            }
            
            // Priority 3: Departed vehicles (at the end)
            const aDeparted = a._internalDirection === 'departing';
            const bDeparted = b._internalDirection === 'departing';
            
            if (aDeparted && !bDeparted) return 1;
            if (!aDeparted && bDeparted) return -1;
            
            // Fallback: sort by vehicle ID for consistency
            return String(a.id).localeCompare(String(b.id));
          });
          
          // Return the best vehicle for this route
          return sortedVehicles[0];
        });

        // Sort by priority and apply vehicle limit
        const finalVehicles = bestVehiclePerRoute
          .sort((a, b) => {
            // Priority 1: At station
            const aAtStation = a.minutesAway === 0 && a._internalDirection === 'arriving';
            const bAtStation = b.minutesAway === 0 && b._internalDirection === 'arriving';
            
            if (aAtStation && !bAtStation) return -1;
            if (!aAtStation && bAtStation) return 1;
            
            // Priority 2: Arriving vehicles (sorted by minutes ascending)
            const aArriving = a._internalDirection === 'arriving' && a.minutesAway > 0;
            const bArriving = b._internalDirection === 'arriving' && b.minutesAway > 0;
            
            if (aArriving && !bArriving) return -1;
            if (!aArriving && bArriving) return 1;
            
            if (aArriving && bArriving) {
              return a.minutesAway - b.minutesAway;
            }
            
            // Priority 3: Departed vehicles
            const aDeparted = a._internalDirection === 'departing';
            const bDeparted = b._internalDirection === 'departing';
            
            if (aDeparted && !bDeparted) return 1;
            if (!aDeparted && bDeparted) return -1;
            
            // If both departed, sort by route name
            if (aDeparted && bDeparted) {
              return (a.route || '').localeCompare(b.route || '');
            }
            
            return a.minutesAway - b.minutesAway;
          })
          .slice(0, maxVehicles);

        return {
          ...stationGroup,
          vehicles: finalVehicles
        };
      }
    });
  }, [stationVehicleGroups, selectedRoutePerStation, config?.maxVehiclesPerStation]);

  // Check if we have any stations with vehicles after processing
  const hasStationsWithVehicles = processedStationGroups.some(group => group.vehicles.length > 0);

  // Debug logging for processed data
  React.useEffect(() => {
    logger.debug('StationDisplay processed data state', {
      isLoading,
      hasError: !!nearbyViewError,
      errorType: nearbyViewError?.type,
      stationGroupsCount: stationVehicleGroups.length,
      processedGroupsCount: processedStationGroups.length,
      groupsWithVehicles: processedStationGroups.filter(g => g.vehicles.length > 0).length,
      hasStationsWithVehicles,
      effectiveLocation: !!effectiveLocationForDisplay,
      locationCoords: effectiveLocationForDisplay ? 
        `${effectiveLocationForDisplay.latitude.toFixed(4)}, ${effectiveLocationForDisplay.longitude.toFixed(4)}` : 
        'none'
    }, 'STATION_DISPLAY_DEBUG');
  }, [isLoading, nearbyViewError, stationVehicleGroups.length, processedStationGroups.length, hasStationsWithVehicles, effectiveLocationForDisplay]);

  // Show empty state if no stations have vehicles
  if (!isLoading && !nearbyViewError && !hasStationsWithVehicles) {
    return (
      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
        <Card sx={{ 
          p: 3, 
          textAlign: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
            No Active Buses
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No buses are currently serving nearby stations. Try refreshing or check back later.
          </Typography>
        </Card>
      </Box>
    );
  }

  // Convert vehicle to FavoriteBusInfo format for map modal
  const convertVehicleToFavoriteBusInfo = (vehicle: EnhancedVehicleInfoWithDirection, targetStationId: string): FavoriteBusInfo => {
    return {
      routeName: vehicle.route || 'Unknown',
      routeDesc: vehicle.destination,
      routeType: 'bus' as const,
      vehicleId: vehicle.id,
      tripId: vehicle.vehicle?.tripId || '',
      label: vehicle.vehicle?.label,
      destination: vehicle.destination,
      latitude: vehicle.vehicle?.position?.latitude || 0,
      longitude: vehicle.vehicle?.position?.longitude || 0,
      speed: vehicle.vehicle?.speed,
      bearing: vehicle.vehicle?.position?.bearing,
      lastUpdate: vehicle.vehicle?.timestamp instanceof Date 
        ? vehicle.vehicle.timestamp 
        : vehicle.vehicle?.timestamp 
          ? new Date(vehicle.vehicle.timestamp)
          : new Date(),
      currentStation: vehicle.station ? {
        id: vehicle.station.id,
        name: vehicle.station.name,
        distance: 0, // We don't have this data readily available
        isAtStation: vehicle.minutesAway === 0
      } : null,
      stopSequence: vehicle.stopSequence?.map(stop => {
        // Find the corresponding station coordinates
        const stationCoords = allStations.find(s => s.id === stop.stopId)?.coordinates;
        
        return {
          id: stop.stopId,
          name: stop.stopName,
          sequence: stop.sequence,
          coordinates: stationCoords || { latitude: 0, longitude: 0 },
          arrivalTime: undefined,
          isCurrent: false, // Don't mark where the bus currently is
          isClosestToUser: stop.stopId === targetStationId, // Mark the target station (where vehicle is arriving)
          distanceToUser: undefined,
          distanceFromBus: undefined
        };
      }),
      direction: undefined,
      distanceFromUser: undefined
    };
  };

  // Handle nearby view errors with appropriate messages
  if (nearbyViewError) {
    const getErrorMessage = () => {
      switch (nearbyViewError.type) {
        case 'no_gps_location':
          return {
            title: 'Location Required',
            message: 'Please enable location services to see nearby station buses'
          };
        case 'no_stations_in_range':
          return {
            title: 'No Nearby Stations',
            message: 'No bus stations found within 5km of your location'
          };
        case 'no_routes_available':
          return {
            title: 'No Active Routes',
            message: 'No active routes found for nearby stations'
          };
        case 'configuration_error':
          return {
            title: 'Configuration Required',
            message: 'Please configure your API settings to see bus data'
          };
        default:
          return {
            title: 'Unable to Load Data',
            message: nearbyViewError.message || 'Please try again later'
          };
      }
    };

    const { title, message } = getErrorMessage();

    return (
      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
        <Card sx={{ 
          bgcolor: 'rgba(30, 41, 59, 0.3)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(100, 116, 139, 0.2)'
        }}>
          <CardContent>
            <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: 3,
                bgcolor: 'rgba(71, 85, 105, 0.5)',
                border: '1px solid rgba(100, 116, 139, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPinIcon size={28} className="text-gray-400" />
              </Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', textAlign: 'center' }}>
                {message}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
        <Card sx={{ 
          bgcolor: 'rgba(30, 41, 59, 0.3)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(100, 116, 139, 0.2)'
        }}>
          <CardContent>
            <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
              <CircularProgress size={48} sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Loading Station Data
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', textAlign: 'center' }}>
                Finding buses that serve nearby stations...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }





  return (
    <Box sx={{ px: 3, pb: 3, pt: 1 }}>
      <Stack spacing={4}>
        {/* Only show stations that have vehicles serving them */}
        {processedStationGroups.map((stationGroup, stationIndex) => {
          // Skip if no vehicles
          if (!stationGroup.vehicles.length) {
            return null;
          }
          
          return (
            <Box key={stationGroup.station.station.id}>
              {/* Station Section Header */}
              <Box sx={{ mb: 2 }}>
                <StationHeader
                  stationName={stationGroup.station.station.name}
                  distance={stationGroup.station.distance}
                  isClosest={stationIndex === 0}
                  onClick={() => {
                    // Find the original station group with all vehicles (before deduplication)
                    const originalStationGroup = stationVehicleGroups.find(
                      sg => sg.station.station.id === stationGroup.station.station.id
                    );
                    
                    setSelectedStationForMap({
                      station: stationGroup.station.station,
                      distance: stationGroup.station.distance,
                      vehicles: stationGroup.vehicles, // Deduplicated vehicles for display context
                      allVehicles: originalStationGroup?.vehicles || stationGroup.vehicles // All vehicles for map
                    });
                    setStationMapModalOpen(true);
                  }}
                />
                
                {/* Route filter buttons */}
                {stationGroup.allRoutes && stationGroup.allRoutes.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <RouteFilterChips
                      routes={stationGroup.allRoutes}
                      selectedRouteId={selectedRoutePerStation.get(stationGroup.station.station.id)}
                      onRouteSelect={(routeId) => {
                        const newSelection = new Map(selectedRoutePerStation);
                        if (routeId) {
                          newSelection.set(stationGroup.station.station.id, routeId);
                        } else {
                          newSelection.delete(stationGroup.station.station.id);
                        }
                        setSelectedRoutePerStation(newSelection);
                      }}
                    />
                  </Box>
                )}
              </Box>
              
              {/* Vehicles for this station */}
              <Stack spacing={2}>
                {stationGroup.vehicles.map((vehicle, index) => (
                  <VehicleCard
                    key={`${vehicle.id}-${stationGroup.station.station.id}-${index}`}
                    vehicle={vehicle}
                    stationId={stationGroup.station.station.id}
                    isExpanded={expandedVehicles.has(vehicle.id)}
                    onToggleExpanded={() => {
                      const newExpanded = new Set(expandedVehicles);
                      if (expandedVehicles.has(vehicle.id)) {
                        newExpanded.delete(vehicle.id);
                      } else {
                        newExpanded.add(vehicle.id);
                      }
                      setExpandedVehicles(newExpanded);
                    }}
                    onShowMap={() => {
                      setSelectedVehicleForMap(vehicle);
                      setTargetStationId(stationGroup.station.station.id);
                      setMapModalOpen(true);
                    }}
                    onRouteClick={() => {
                      const newSelection = new Map(selectedRoutePerStation);
                      const isSelected = selectedRoutePerStation.get(stationGroup.station.station.id) === vehicle.routeId;
                      
                      if (isSelected) {
                        newSelection.delete(stationGroup.station.station.id);
                      } else {
                        newSelection.set(stationGroup.station.station.id, vehicle.routeId);
                      }
                      setSelectedRoutePerStation(newSelection);
                    }}
                    showShortStopList={false} // Don't show short stop list in station view
                    showFullStopsButton={true} // Show "Show all stops" button
                  />
                ))}
              </Stack>
            </Box>
          );
        }).filter(Boolean)}
      </Stack>
      
      {/* Individual Bus Route Map Modal */}
      {selectedVehicleForMap && (
        <BusRouteMapModal
          open={mapModalOpen}
          onClose={() => {
            setMapModalOpen(false);
            setSelectedVehicleForMap(null);
            setTargetStationId('');
          }}
          bus={convertVehicleToFavoriteBusInfo(selectedVehicleForMap, targetStationId)}
          userLocation={null} // Don't show user location as requested
          cityName={config?.city || 'Cluj-Napoca'}
        />
      )}

      {/* Station Map Modal (All Routes for Station) */}
      {selectedStationForMap && selectedStationForMap.allVehicles && (
        <StationMapModal
          open={stationMapModalOpen}
          onClose={() => {
            setStationMapModalOpen(false);
            setSelectedStationForMap(null);
          }}
          station={{
            ...selectedStationForMap.station,
            isFavorite: false // Station display doesn't track favorites
          }}
          vehicles={selectedStationForMap.allVehicles.map(vehicle => ({
            id: vehicle.id,
            routeId: vehicle.routeId,
            route: vehicle.route,
            destination: vehicle.destination || 'Unknown destination',
            vehicle: vehicle.vehicle?.position ? {
              position: {
                latitude: vehicle.vehicle.position.latitude,
                longitude: vehicle.vehicle.position.longitude
              },
              tripId: vehicle.vehicle.tripId
            } : undefined,
            minutesAway: vehicle.minutesAway,
            _internalDirection: vehicle._internalDirection
          })).filter(vehicle => 
            vehicle.vehicle?.position && 
            !isNaN(vehicle.vehicle.position.latitude) && 
            !isNaN(vehicle.vehicle.position.longitude)
          )}
          userLocation={effectiveLocationForDisplay}
          cityName={config?.city || 'Cluj-Napoca'}
          agencyId={config?.agencyId}
        />
      )}


    </Box>
  );
};

export const StationDisplay = withPerformanceMonitoring(
  StationDisplayComponent,
  'StationDisplay'
);