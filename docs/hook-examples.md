# Hook Usage Examples

This document provides practical examples of using the new hook architecture in the Cluj Bus App.

## Basic Data Fetching Examples

### Example 1: Simple Station List

```typescript
import React from 'react';
import { useStationData } from '../hooks/data/useStationData';
import { useConfigStore } from '../stores/configStore';

const StationList: React.FC = () => {
  const { config } = useConfigStore();
  const { data: stations, isLoading, error, refetch } = useStationData({
    agencyId: config?.agencyId,
    cacheMaxAge: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Error loading stations: {error.message}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bus Stations ({stations?.length || 0})</h2>
      <div className="grid gap-2">
        {stations?.map(station => (
          <div key={station.id} className="p-3 border rounded-lg hover:bg-gray-50">
            <h3 className="font-semibold">{station.name}</h3>
            <p className="text-sm text-gray-600">
              {station.coordinates.latitude.toFixed(6)}, {station.coordinates.longitude.toFixed(6)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StationList;
```

### Example 2: Live Vehicle Tracker with Auto-Refresh

```typescript
import React, { useState } from 'react';
import { useVehicleData } from '../hooks/data/useVehicleData';
import { useConfigStore } from '../stores/configStore';

const LiveVehicleTracker: React.FC = () => {
  const { config } = useConfigStore();
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { 
    data: vehicles, 
    isLoading, 
    error, 
    lastUpdated 
  } = useVehicleData({
    agencyId: config?.agencyId,
    autoRefresh,
    refreshInterval: 30 * 1000, // 30 seconds
    cacheMaxAge: 30 * 1000
  });

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Live Vehicles</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <span className="text-sm text-gray-600">
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Updating vehicles...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          Error: {error.message}
        </div>
      )}

      <div className="grid gap-3">
        {vehicles?.map(vehicle => (
          <div key={vehicle.id} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Route {vehicle.routeId}</h3>
                <p className="text-gray-600">Vehicle {vehicle.label}</p>
                <p className="text-sm text-gray-500">Trip: {vehicle.tripId}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">LIVE</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Speed: {vehicle.speed || 0} km/h
                </p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm">
                <span className="font-medium">Position:</span> {' '}
                {vehicle.position.latitude.toFixed(6)}, {vehicle.position.longitude.toFixed(6)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Last seen:</span> {' '}
                {new Date(vehicle.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {vehicles?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No vehicles currently active
        </div>
      )}
    </div>
  );
};

export default LiveVehicleTracker;
```

## Processing Layer Examples

### Example 3: Vehicle Filtering Component

```typescript
import React, { useState } from 'react';
import { useVehicleData } from '../hooks/data/useVehicleData';
import { useVehicleFiltering } from '../hooks/processing/useVehicleFiltering';
import { useLocationStore } from '../stores/locationStore';
import { useConfigStore } from '../stores/configStore';

const VehicleFilter: React.FC = () => {
  const { config } = useConfigStore();
  const { currentLocation } = useLocationStore();
  const [filterByFavorites, setFilterByFavorites] = useState(false);
  const [maxRadius, setMaxRadius] = useState(5000);

  // Get vehicle data
  const { data: vehicles, isLoading } = useVehicleData({
    agencyId: config?.agencyId,
    autoRefresh: true,
    refreshInterval: 30 * 1000
  });

  // Apply filtering
  const { filteredVehicles, filterStats } = useVehicleFiltering(vehicles || [], {
    filterByFavorites,
    favoriteRoutes: config?.favoriteBuses || [],
    maxSearchRadius: maxRadius,
    userLocation: currentLocation
  });

  if (isLoading) {
    return <div className="p-4">Loading vehicles...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Vehicle Filter</h2>
      
      {/* Filter Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Filter Options</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterByFavorites}
              onChange={(e) => setFilterByFavorites(e.target.checked)}
              className="rounded"
            />
            <span>Show only favorite routes</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Max radius: {maxRadius}m
            </label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={maxRadius}
              onChange={(e) => setMaxRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Filter Statistics */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Filter Results</h3>
        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <span className="text-sm text-gray-600">Total vehicles:</span>
            <span className="ml-2 font-semibold">{filterStats.totalVehicles}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Filtered:</span>
            <span className="ml-2 font-semibold">{filterStats.filteredCount}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Applied filters:</span>
            <span className="ml-2 font-semibold">
              {filterStats.appliedFilters.length > 0 
                ? filterStats.appliedFilters.join(', ')
                : 'None'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Filtered Vehicles */}
      <div className="grid gap-3">
        {filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="p-3 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">Route {vehicle.routeId}</span>
                <span className="ml-2 text-gray-600">Vehicle {vehicle.label}</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(vehicle.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No vehicles match the current filters
        </div>
      )}
    </div>
  );
};

export default VehicleFilter;
```

### Example 4: Station Grouping with Distance

```typescript
import React from 'react';
import { useStationData } from '../hooks/data/useStationData';
import { useVehicleData } from '../hooks/data/useVehicleData';
import { useVehicleFiltering } from '../hooks/processing/useVehicleFiltering';
import { useVehicleGrouping } from '../hooks/processing/useVehicleGrouping';
import { useLocationStore } from '../stores/locationStore';
import { useConfigStore } from '../stores/configStore';

const StationGrouping: React.FC = () => {
  const { config } = useConfigStore();
  const { currentLocation } = useLocationStore();

  // Get data
  const { data: stations } = useStationData({ agencyId: config?.agencyId });
  const { data: vehicles } = useVehicleData({ 
    agencyId: config?.agencyId,
    autoRefresh: true 
  });

  // Filter vehicles
  const { filteredVehicles } = useVehicleFiltering(vehicles || [], {
    filterByFavorites: true,
    favoriteRoutes: config?.favoriteBuses || [],
    userLocation: currentLocation
  });

  // Group by stations
  const { stationGroups, groupingStats } = useVehicleGrouping(
    filteredVehicles,
    stations || [],
    currentLocation || { latitude: 0, longitude: 0 },
    {
      maxStations: 3,
      maxVehiclesPerStation: 5,
      proximityThreshold: 200
    }
  );

  if (!currentLocation) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        Please enable location access to see nearby stations
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nearby Stations with Vehicles</h2>
      
      {/* Grouping Statistics */}
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Grouping Summary</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <span className="text-sm text-gray-600">Stations with vehicles:</span>
            <span className="ml-2 font-semibold">{groupingStats.stationsWithVehicles}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total vehicles grouped:</span>
            <span className="ml-2 font-semibold">{groupingStats.totalVehiclesGrouped}</span>
          </div>
        </div>
      </div>

      {/* Station Groups */}
      <div className="space-y-6">
        {stationGroups.map((group, index) => (
          <div key={group.station.station.id} className="border rounded-lg p-4 bg-white shadow-sm">
            {/* Station Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{group.station.station.name}</h3>
                <p className="text-sm text-gray-600">
                  Distance: {Math.round(group.station.distance)}m away
                </p>
                {index === 0 && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Closest
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {group.vehicles.length} vehicle{group.vehicles.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">
                  {group.allRoutes.length} route{group.allRoutes.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Routes at Station */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Routes at this station:</h4>
              <div className="flex flex-wrap gap-2">
                {group.allRoutes.map(route => (
                  <span 
                    key={route.routeId}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {route.routeName} ({route.vehicleCount})
                  </span>
                ))}
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <h4 className="font-medium mb-2">Active vehicles:</h4>
              <div className="grid gap-2">
                {group.vehicles.map(vehicle => (
                  <div key={vehicle.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold">Route {vehicle.route}</span>
                        <p className="text-sm text-gray-600">{vehicle.destination}</p>
                        <p className="text-xs text-gray-500">Vehicle {vehicle.vehicle.label}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {vehicle.minutesAway}
                        </div>
                        <div className="text-xs text-gray-500">
                          minute{vehicle.minutesAway !== 1 ? 's' : ''}
                        </div>
                        <div className={`text-xs px-1 py-0.5 rounded ${
                          vehicle.confidence === 'high' ? 'bg-green-100 text-green-800' :
                          vehicle.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.confidence}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stationGroups.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No stations with vehicles found nearby
        </div>
      )}
    </div>
  );
};

export default StationGrouping;
```

## Advanced Examples

### Example 5: Custom Hook Composition

```typescript
import { useMemo } from 'react';
import { useStationData } from '../hooks/data/useStationData';
import { useVehicleData } from '../hooks/data/useVehicleData';
import { useVehicleFiltering } from '../hooks/processing/useVehicleFiltering';
import { useProximityCalculation } from '../hooks/processing/useProximityCalculation';

// Custom hook that combines multiple focused hooks
export const useNearbyFavoriteVehicles = (
  agencyId: string,
  userLocation: { latitude: number; longitude: number } | null,
  favoriteRoutes: string[],
  maxRadius: number = 2000
) => {
  // Get base data
  const { data: stations, isLoading: isLoadingStations } = useStationData({ agencyId });
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicleData({ 
    agencyId,
    autoRefresh: true 
  });

  // Filter vehicles by favorites
  const { filteredVehicles } = useVehicleFiltering(vehicles || [], {
    filterByFavorites: true,
    favoriteRoutes,
    userLocation,
    maxSearchRadius: maxRadius
  });

  // Calculate distances and find nearby vehicles
  const nearbyVehicles = useMemo(() => {
    if (!userLocation || !filteredVehicles.length) return [];

    return filteredVehicles
      .map(vehicle => {
        const proximityResult = useProximityCalculation(
          userLocation,
          vehicle.position,
          maxRadius
        );

        return {
          ...vehicle,
          distance: proximityResult.distance,
          withinRadius: proximityResult.withinRadius,
          bearing: proximityResult.bearing
        };
      })
      .filter(vehicle => vehicle.withinRadius)
      .sort((a, b) => a.distance - b.distance);
  }, [filteredVehicles, userLocation, maxRadius]);

  // Find closest station for each vehicle
  const vehiclesWithStations = useMemo(() => {
    if (!stations?.length || !nearbyVehicles.length) return [];

    return nearbyVehicles.map(vehicle => {
      let closestStation = null;
      let minDistance = Infinity;

      for (const station of stations) {
        const proximityResult = useProximityCalculation(
          vehicle.position,
          station.coordinates
        );

        if (proximityResult.distance < minDistance) {
          minDistance = proximityResult.distance;
          closestStation = {
            ...station,
            distance: proximityResult.distance
          };
        }
      }

      return {
        ...vehicle,
        nearestStation: closestStation
      };
    });
  }, [nearbyVehicles, stations]);

  return {
    vehicles: vehiclesWithStations,
    isLoading: isLoadingStations || isLoadingVehicles,
    totalCount: vehiclesWithStations.length,
    averageDistance: vehiclesWithStations.length > 0 
      ? vehiclesWithStations.reduce((sum, v) => sum + v.distance, 0) / vehiclesWithStations.length
      : 0
  };
};

// Usage component
const NearbyFavorites: React.FC = () => {
  const { config } = useConfigStore();
  const { currentLocation } = useLocationStore();

  const { 
    vehicles, 
    isLoading, 
    totalCount, 
    averageDistance 
  } = useNearbyFavoriteVehicles(
    config?.agencyId || '',
    currentLocation,
    config?.favoriteBuses || [],
    2000 // 2km radius
  );

  if (isLoading) return <div>Loading nearby favorites...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Nearby Favorite Vehicles ({totalCount})
      </h2>
      
      {totalCount > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          Average distance: {Math.round(averageDistance)}m
        </p>
      )}

      <div className="space-y-3">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Route {vehicle.routeId}</h3>
                <p className="text-sm text-gray-600">
                  {Math.round(vehicle.distance)}m away
                </p>
                {vehicle.nearestStation && (
                  <p className="text-xs text-gray-500">
                    Near: {vehicle.nearestStation.name} 
                    ({Math.round(vehicle.nearestStation.distance)}m from vehicle)
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  Vehicle {vehicle.label}
                </div>
                {vehicle.bearing && (
                  <div className="text-xs text-gray-500">
                    Bearing: {Math.round(vehicle.bearing)}°
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          No favorite vehicles nearby
        </div>
      )}
    </div>
  );
};
```

### Example 6: Error Handling and Retry Logic

```typescript
import React, { useState } from 'react';
import { useStationData } from '../hooks/data/useStationData';

const RobustStationList: React.FC = () => {
  const { config } = useConfigStore();
  const [retryCount, setRetryCount] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);

  const { 
    data: stations, 
    isLoading, 
    error, 
    refetch,
    lastUpdated 
  } = useStationData({
    agencyId: config?.agencyId,
    forceRefresh,
    cacheMaxAge: 5 * 60 * 1000
  });

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setForceRefresh(true);
    
    try {
      await refetch();
      setForceRefresh(false);
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  const handleForceRefresh = () => {
    setForceRefresh(true);
    refetch().finally(() => setForceRefresh(false));
  };

  // Error state with retry options
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Failed to Load Stations
          </h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Retrying...' : `Retry ${retryCount > 0 ? `(${retryCount})` : ''}`}
            </button>
            
            <button
              onClick={handleForceRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Force Refresh
            </button>
          </div>
          
          {retryCount > 2 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                Multiple retry attempts failed. Please check your internet connection 
                or try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Bus Stations {stations && `(${stations.length})`}
        </h2>
        
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={handleForceRefresh}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading stations...</span>
        </div>
      )}

      <div className="grid gap-2">
        {stations?.map(station => (
          <div key={station.id} className="p-3 border rounded-lg hover:bg-gray-50">
            <h3 className="font-semibold">{station.name}</h3>
            <p className="text-sm text-gray-600">
              {station.coordinates.latitude.toFixed(6)}, {station.coordinates.longitude.toFixed(6)}
            </p>
          </div>
        ))}
      </div>

      {stations?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No stations found
        </div>
      )}
    </div>
  );
};

export default RobustStationList;
```

## Testing Examples

### Example 7: Testing Data Hooks

```typescript
// __tests__/hooks/useStationData.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useStationData } from '../../hooks/data/useStationData';
import { enhancedTranzyApi } from '../../services/tranzyApiService';

// Mock the API service
vi.mock('../../services/tranzyApiService');
const mockApi = vi.mocked(enhancedTranzyApi);

describe('useStationData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return station data', async () => {
    const mockStations = [
      { id: '1', name: 'Station 1', coordinates: { latitude: 46.7712, longitude: 23.6236 } },
      { id: '2', name: 'Station 2', coordinates: { latitude: 46.7713, longitude: 23.6237 } }
    ];

    mockApi.getStops.mockResolvedValue(mockStations);

    const { result } = renderHook(() => 
      useStationData({ agencyId: '123' })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockStations);
    expect(result.current.error).toBeNull();
    expect(mockApi.getStops).toHaveBeenCalledWith('123', false);
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('API Error');
    mockApi.getStops.mockRejectedValue(mockError);

    const { result } = renderHook(() => 
      useStationData({ agencyId: '123' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should refetch data when refetch is called', async () => {
    const mockStations = [
      { id: '1', name: 'Station 1', coordinates: { latitude: 46.7712, longitude: 23.6236 } }
    ];

    mockApi.getStops.mockResolvedValue(mockStations);

    const { result } = renderHook(() => 
      useStationData({ agencyId: '123' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear the mock to verify refetch calls the API again
    mockApi.getStops.mockClear();
    
    await result.current.refetch();

    expect(mockApi.getStops).toHaveBeenCalledTimes(1);
  });
});
```

### Example 8: Testing Processing Hooks

```typescript
// __tests__/hooks/useVehicleFiltering.test.tsx
import { renderHook } from '@testing-library/react';
import { useVehicleFiltering } from '../../hooks/processing/useVehicleFiltering';

describe('useVehicleFiltering', () => {
  const mockVehicles = [
    { id: '1', routeId: '42', position: { latitude: 46.7712, longitude: 23.6236 } },
    { id: '2', routeId: '24', position: { latitude: 46.7713, longitude: 23.6237 } },
    { id: '3', routeId: '35', position: { latitude: 46.7714, longitude: 23.6238 } }
  ];

  it('should filter vehicles by favorite routes', () => {
    const { result } = renderHook(() =>
      useVehicleFiltering(mockVehicles, {
        filterByFavorites: true,
        favoriteRoutes: ['42', '24']
      })
    );

    expect(result.current.filteredVehicles).toHaveLength(2);
    expect(result.current.filteredVehicles.map(v => v.routeId)).toEqual(['42', '24']);
    expect(result.current.filterStats.totalVehicles).toBe(3);
    expect(result.current.filterStats.filteredCount).toBe(2);
    expect(result.current.filterStats.appliedFilters).toContain('favorites');
  });

  it('should return all vehicles when not filtering by favorites', () => {
    const { result } = renderHook(() =>
      useVehicleFiltering(mockVehicles, {
        filterByFavorites: false
      })
    );

    expect(result.current.filteredVehicles).toHaveLength(3);
    expect(result.current.filterStats.totalVehicles).toBe(3);
    expect(result.current.filterStats.filteredCount).toBe(3);
    expect(result.current.filterStats.appliedFilters).toHaveLength(0);
  });

  it('should handle empty vehicle array', () => {
    const { result } = renderHook(() =>
      useVehicleFiltering([], {
        filterByFavorites: true,
        favoriteRoutes: ['42']
      })
    );

    expect(result.current.filteredVehicles).toHaveLength(0);
    expect(result.current.filterStats.totalVehicles).toBe(0);
    expect(result.current.filterStats.filteredCount).toBe(0);
  });
});
```

These examples demonstrate the flexibility and power of the new hook architecture, showing how to build complex functionality by composing focused, reusable hooks.