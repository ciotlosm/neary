/**
 * Nearby View Controller
 * 
 * Main controller that orchestrates station selection, integrates with existing
 * vehicle processing systems, and provides error handling and fallback logic
 * for the Nearby View Stabilization system.
 * 
 * Requirements: 5.3, 5.4, 6.1, 6.5
 */

import * as React from 'react';
import type { 
  Coordinates, 
  Station, 
  LiveVehicle,
  EnhancedVehicleInfo 
} from '../types';
import type { Route, StopTime, Trip } from '../types/tranzyApi';
import { 
  stationSelector,
  type StationSelectionCriteria,
  type StationSelectionResult,
  type StationWithRoutes
} from '../services/stationSelector';
import { 
  filterStationsWithValidRoutes,
  getRouteAssociationStatistics,
  type RouteAssociationFilterOptions
} from '../services/routeAssociationFilter';
import {
  NEARBY_STATION_DISTANCE_THRESHOLD,
  MAX_NEARBY_SEARCH_RADIUS,
  STATION_STABILITY_THRESHOLD,
  isSignificantLocationChange
} from '../utils/nearbyViewConstants';
import { calculateDistance } from '../utils/distanceUtils';
import { logger } from '../utils/logger';
import {
  createPerformanceMonitor,
  optimizedDistanceCalculation,
  optimizedRouteAssociationFiltering,
  validateNearbyViewPerformance,
  shouldApplyOptimizations,
  type NearbyViewPerformanceMetrics,
  type NearbyViewPerformanceMonitor
} from '../utils/nearbyViewPerformance';
import { validatePerformanceMetrics } from '../utils/nearbyViewPerformanceValidator';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Configuration options for the nearby view controller
 */
export interface NearbyViewOptions {
  enableSecondStation?: boolean;
  customDistanceThreshold?: number;
  stabilityMode?: 'strict' | 'normal' | 'flexible';
  maxSearchRadius?: number;
  maxVehiclesPerStation?: number;
  requireActiveRoutes?: boolean;
  enableStabilityTracking?: boolean;
}

/**
 * Enhanced vehicle with direction analysis for nearby view
 */
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

/**
 * Station vehicle group for nearby view display
 */
export interface NearbyStationVehicleGroup {
  station: { station: Station; distance: number };
  vehicles: EnhancedVehicleInfoWithDirection[];
  allRoutes: Array<{
    routeId: string;
    routeName: string;
    vehicleCount: number;
  }>;
}

/**
 * Nearby view controller result
 */
export interface NearbyViewResult {
  selectedStations: StationSelectionResult;
  stationVehicleGroups: NearbyStationVehicleGroup[];
  isLoading: boolean;
  effectiveLocationForDisplay: Coordinates | null;
  thresholdUsed: number;
  selectionMetadata: {
    totalStationsEvaluated: number;
    stationsWithRoutes: number;
    selectionTime: number;
    stabilityApplied: boolean;
  };
  performanceMetrics?: NearbyViewPerformanceMetrics;
  error?: NearbyViewError;
}

/**
 * Error types specific to nearby view operations
 */
export enum NearbyViewErrorType {
  NO_GPS_LOCATION = 'no_gps_location',
  NO_STATIONS_IN_RANGE = 'no_stations_in_range',
  NO_ROUTES_AVAILABLE = 'no_routes_available',
  STATION_SELECTION_FAILED = 'station_selection_failed',
  VEHICLE_PROCESSING_FAILED = 'vehicle_processing_failed',
  DATA_LOADING_ERROR = 'data_loading_error',
  CONFIGURATION_ERROR = 'configuration_error',
  OFFLINE_MODE = 'offline_mode',
  CACHE_UNAVAILABLE = 'cache_unavailable'
}

/**
 * Nearby view error with context and fallback actions
 */
export interface NearbyViewError {
  type: NearbyViewErrorType;
  message: string;
  fallbackAction?: 'show_message' | 'retry' | 'use_cached_data' | 'show_all_stations';
  context?: Record<string, any>;
  retryable?: boolean;
}

/**
 * Station selection context for stability tracking
 */
interface StationSelectionContext {
  previousLocation?: Coordinates;
  previousSelection?: StationSelectionResult;
  lastSelectionTime?: Date;
  stabilityOverrideActive?: boolean;
  consecutiveOverrides?: number;
  lastLocationChangeTime?: Date;
  stabilityScore?: number; // 0-1 score indicating how stable the selection is
  locationHistory?: Array<{
    location: Coordinates;
    timestamp: Date;
    selectionChanged: boolean;
  }>;
}

// ============================================================================
// NEARBY VIEW CONTROLLER CLASS
// ============================================================================

/**
 * Main controller class for nearby view operations
 * 
 * Orchestrates station selection, integrates with vehicle processing,
 * and provides comprehensive error handling and fallback logic.
 */
export class NearbyViewController {
  private options: Required<NearbyViewOptions>;
  private selectionContext: StationSelectionContext = {};
  
  constructor(options: NearbyViewOptions = {}) {
    this.options = {
      enableSecondStation: options.enableSecondStation ?? true,
      customDistanceThreshold: options.customDistanceThreshold ?? NEARBY_STATION_DISTANCE_THRESHOLD,
      stabilityMode: options.stabilityMode ?? 'normal',
      maxSearchRadius: options.maxSearchRadius ?? MAX_NEARBY_SEARCH_RADIUS,
      maxVehiclesPerStation: options.maxVehiclesPerStation ?? 5,
      requireActiveRoutes: options.requireActiveRoutes ?? true,
      enableStabilityTracking: options.enableStabilityTracking ?? true
    };
    
    logger.debug('NearbyViewController initialized', {
      options: this.options
    });
  }
  
  /**
   * Main method to process nearby view data
   * 
   * @param userLocation - User's current GPS position
   * @param stations - Available stations data
   * @param routes - Available routes data
   * @param vehicles - Current vehicle data
   * @param stopTimes - Optional GTFS stop times data
   * @param trips - Optional GTFS trips data
   * @returns Nearby view result with selected stations and processed vehicles
   * 
   * Requirements 5.3, 5.4, 6.1: Main controller orchestration
   */
  async processNearbyView(
    userLocation: Coordinates | null,
    stations: Station[],
    routes: Route[],
    vehicles: LiveVehicle[],
    stopTimes?: StopTime[],
    trips?: Trip[]
  ): Promise<NearbyViewResult> {
    const startTime = performance.now();
    
    // Initialize performance monitoring
    const performanceMonitor = createPerformanceMonitor();
    performanceMonitor.startMonitoring();
    
    // Check if optimizations should be applied based on dataset sizes
    const optimizationFlags = shouldApplyOptimizations(
      stations.length,
      vehicles.length,
      routes.length
    );
    
    if (optimizationFlags.stations || optimizationFlags.vehicles || optimizationFlags.routes) {
      logger.debug('Large dataset detected, applying performance optimizations', {
        stationCount: stations.length,
        vehicleCount: vehicles.length,
        routeCount: routes.length,
        optimizations: optimizationFlags
      });
    }
    
    try {
      // Step 1: Validate input data and location
      const validationResult = this.validateInputData(userLocation, stations, routes, vehicles);
      if (validationResult.error) {
        return this.createErrorResult(validationResult.error, startTime, performanceMonitor);
      }
      
      const effectiveLocation = userLocation!; // Validated above
      
      // Step 2: Apply GPS stability logic if enabled
      const shouldUseStabilityOverride = this.shouldApplyStabilityOverride(effectiveLocation);
      
      if (shouldUseStabilityOverride && this.selectionContext.previousSelection) {
        logger.debug('Applying GPS stability override', {
          previousLocation: this.selectionContext.previousLocation,
          currentLocation: effectiveLocation,
          stabilityMode: this.options.stabilityMode
        });
        
        const overrideResult = await this.createStabilityOverrideResult(
          this.selectionContext.previousSelection,
          effectiveLocation,
          vehicles,
          startTime
        );
        
        // Update context to track the override
        this.updateSelectionContext(effectiveLocation, this.selectionContext.previousSelection, true);
        
        return overrideResult;
      }
      
      // Step 3: Perform station selection
      const selectionResult = await this.performStationSelection(
        effectiveLocation,
        stations,
        routes,
        stopTimes,
        trips,
        performanceMonitor
      );
      
      if (selectionResult.error) {
        // Update context even in error cases to track location history
        const emptySelection: StationSelectionResult = {
          closestStation: null,
          secondStation: null,
          rejectedStations: []
        };
        this.updateSelectionContext(effectiveLocation, emptySelection, false);
        
        return this.createErrorResult(selectionResult.error, startTime, performanceMonitor);
      }
      
      // Step 4: Process vehicles for selected stations
      const vehicleProcessingStart = performance.now();
      const vehicleGroups = await this.processVehiclesForStations(
        selectionResult.selectedStations!,
        vehicles,
        routes,
        stopTimes
      );
      const vehicleProcessingEnd = performance.now();
      performanceMonitor.recordVehicleProcessing(
        vehicleProcessingEnd - vehicleProcessingStart,
        vehicles.length
      );
      
      // Step 5: Update stability tracking context
      this.updateSelectionContext(effectiveLocation, selectionResult.selectedStations!, false);
      
      // Step 6: Finalize performance monitoring and validate
      const performanceMetrics = performanceMonitor.finishMonitoring();
      const performanceValidation = validateNearbyViewPerformance(performanceMetrics);
      
      if (!performanceValidation.isValid) {
        logger.warn('Nearby view performance validation failed', {
          violations: performanceValidation.violations,
          recommendations: performanceValidation.recommendations
        });
      }
      
      // Record metrics in global performance validator for production monitoring
      validatePerformanceMetrics(performanceMetrics);
      
      // Step 7: Create successful result
      const endTime = performance.now();
      const result: NearbyViewResult = {
        selectedStations: selectionResult.selectedStations!,
        stationVehicleGroups: vehicleGroups,
        isLoading: false,
        effectiveLocationForDisplay: effectiveLocation,
        thresholdUsed: this.options.customDistanceThreshold,
        selectionMetadata: {
          totalStationsEvaluated: stations.length,
          stationsWithRoutes: selectionResult.stationsWithRoutes || 0,
          selectionTime: endTime - startTime,
          stabilityApplied: shouldUseStabilityOverride
        },
        performanceMetrics
      };
      
      logger.debug('Nearby view processing completed successfully', {
        hasClosestStation: !!result.selectedStations.closestStation,
        hasSecondStation: !!result.selectedStations.secondStation,
        vehicleGroupsCount: result.stationVehicleGroups.length,
        processingTime: result.selectionMetadata.selectionTime
      });
      
      return result;
      
    } catch (error) {
      logger.error('Nearby view processing failed', {
        error: error instanceof Error ? error.message : String(error),
        userLocation,
        stationsCount: stations.length,
        routesCount: routes.length,
        vehiclesCount: vehicles.length
      });
      
      const nearbyError: NearbyViewError = {
        type: NearbyViewErrorType.STATION_SELECTION_FAILED,
        message: `Processing failed: ${error instanceof Error ? error.message : String(error)}`,
        fallbackAction: 'retry',
        retryable: true,
        context: {
          originalError: error instanceof Error ? error.message : String(error),
          hasLocation: !!userLocation,
          dataAvailable: {
            stations: stations.length,
            routes: routes.length,
            vehicles: vehicles.length
          }
        }
      };
      
      return this.createErrorResult(nearbyError, startTime, performanceMonitor);
    }
  }
  
  /**
   * Validate input data for nearby view processing
   * 
   * @param userLocation - User's GPS position
   * @param stations - Available stations
   * @param routes - Available routes
   * @param vehicles - Current vehicles
   * @returns Validation result with potential error
   * 
   * Requirements 5.4, 7.1, 7.2: Error handling and validation
   */
  private validateInputData(
    userLocation: Coordinates | null,
    stations: Station[],
    routes: Route[],
    vehicles: LiveVehicle[]
  ): { error?: NearbyViewError } {
    // Check GPS location availability
    if (!userLocation) {
      return {
        error: {
          type: NearbyViewErrorType.NO_GPS_LOCATION,
          message: 'GPS location is required for nearby view',
          fallbackAction: 'show_message',
          retryable: false,
          context: {
            locationProvided: false,
            fallbackSuggestion: 'Enable location services or configure default location'
          }
        }
      };
    }
    
    // Validate GPS coordinates
    if (isNaN(userLocation.latitude) || isNaN(userLocation.longitude) ||
        Math.abs(userLocation.latitude) > 90 || Math.abs(userLocation.longitude) > 180) {
      return {
        error: {
          type: NearbyViewErrorType.NO_GPS_LOCATION,
          message: 'Invalid GPS coordinates provided',
          fallbackAction: 'show_message',
          retryable: false,
          context: {
            providedLocation: userLocation,
            validationFailed: true
          }
        }
      };
    }
    
    // Debug: Check what stations data we're receiving
    logger.debug('NearbyViewController stations input', {
      stationsIsArray: Array.isArray(stations),
      stationsCount: stations?.length || 0,
      sampleStation: stations?.[0] ? {
        id: stations[0].id,
        name: stations[0].name,
        coordinates: stations[0].coordinates
      } : null,
      userLocation: {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      }
    }, 'nearbyViewController');

    // Check stations availability
    if (!Array.isArray(stations) || stations.length === 0) {
      return {
        error: {
          type: NearbyViewErrorType.NO_STATIONS_IN_RANGE,
          message: 'No stations data available',
          fallbackAction: 'retry',
          retryable: true,
          context: {
            stationsProvided: Array.isArray(stations),
            stationsCount: stations?.length || 0
          }
        }
      };
    }
    
    // Check routes availability
    if (!Array.isArray(routes) || routes.length === 0) {
      return {
        error: {
          type: NearbyViewErrorType.NO_ROUTES_AVAILABLE,
          message: 'No routes data available',
          fallbackAction: 'retry',
          retryable: true,
          context: {
            routesProvided: Array.isArray(routes),
            routesCount: routes?.length || 0
          }
        }
      };
    }
    
    // Vehicles are optional for station display, but log if missing
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      logger.warn('No vehicles data available for nearby view', {
        vehiclesProvided: Array.isArray(vehicles),
        vehiclesCount: vehicles?.length || 0
      });
    }
    
    return {}; // No errors
  }
  
  /**
   * Determine if GPS stability override should be applied
   * 
   * @param currentLocation - Current GPS position
   * @returns True if stability override should be applied
   * 
   * Requirements 5.1: GPS position stability logic
   */
  private shouldApplyStabilityOverride(currentLocation: Coordinates): boolean {
    if (!this.options.enableStabilityTracking || !this.selectionContext.previousLocation) {
      return false;
    }
    
    // Calculate location change significance
    const isLocationChangeSignificant = isSignificantLocationChange(
      this.selectionContext.previousLocation,
      currentLocation,
      this.getStabilityThreshold()
    );
    
    // Check if we have a recent valid selection
    const hasRecentSelection = this.selectionContext.lastSelectionTime &&
      (Date.now() - this.selectionContext.lastSelectionTime.getTime()) < this.getSelectionValidityWindow();
    
    // Check if previous selection is valid
    const hasPreviousSelection = !!this.selectionContext.previousSelection?.closestStation;
    
    // Calculate stability score based on recent history
    const stabilityScore = this.calculateStabilityScore(currentLocation);
    
    // Determine if override should be applied based on stability mode
    const shouldApplyOverride = this.evaluateStabilityOverride(
      isLocationChangeSignificant,
      hasRecentSelection,
      hasPreviousSelection,
      stabilityScore
    );
    
    // Update location history
    this.updateLocationHistory(currentLocation, shouldApplyOverride);
    
    logger.debug('GPS stability evaluation', {
      locationChangeSignificant: isLocationChangeSignificant,
      hasRecentSelection,
      hasPreviousSelection,
      stabilityScore,
      shouldApplyOverride,
      stabilityMode: this.options.stabilityMode,
      threshold: this.getStabilityThreshold(),
      consecutiveOverrides: this.selectionContext.consecutiveOverrides || 0
    });
    
    return shouldApplyOverride;
  }
  
  /**
   * Get stability threshold based on stability mode
   * 
   * @returns Stability threshold in meters
   */
  private getStabilityThreshold(): number {
    switch (this.options.stabilityMode) {
      case 'strict':
        return STATION_STABILITY_THRESHOLD * 0.5; // 25m
      case 'flexible':
        return STATION_STABILITY_THRESHOLD * 2; // 100m
      case 'normal':
      default:
        return STATION_STABILITY_THRESHOLD; // 50m
    }
  }
  
  /**
   * Get selection validity window based on stability mode
   * 
   * @returns Time window in milliseconds for which a selection remains valid
   */
  private getSelectionValidityWindow(): number {
    switch (this.options.stabilityMode) {
      case 'strict':
        return 60000; // 1 minute
      case 'flexible':
        return 15000; // 15 seconds
      case 'normal':
      default:
        return 30000; // 30 seconds
    }
  }
  
  /**
   * Calculate stability score based on recent location history
   * 
   * @param currentLocation - Current GPS position
   * @returns Stability score between 0 (unstable) and 1 (very stable)
   */
  private calculateStabilityScore(currentLocation: Coordinates): number {
    if (!this.selectionContext.locationHistory || this.selectionContext.locationHistory.length < 2) {
      return 0.5; // Neutral score for insufficient history
    }
    
    const history = this.selectionContext.locationHistory;
    const recentHistory = history.slice(-5); // Last 5 location updates
    
    // Calculate average distance between consecutive locations
    let totalDistance = 0;
    let selectionChanges = 0;
    
    for (let i = 1; i < recentHistory.length; i++) {
      const distance = calculateDistance(
        recentHistory[i - 1].location,
        recentHistory[i].location
      );
      totalDistance += distance;
      
      if (recentHistory[i].selectionChanged) {
        selectionChanges++;
      }
    }
    
    const averageMovement = totalDistance / (recentHistory.length - 1);
    const changeRate = selectionChanges / recentHistory.length;
    
    // Lower movement and fewer changes = higher stability
    const movementScore = Math.max(0, 1 - (averageMovement / this.getStabilityThreshold()));
    const changeScore = Math.max(0, 1 - (changeRate * 2)); // Penalize frequent changes
    
    const stabilityScore = (movementScore + changeScore) / 2;
    
    logger.debug('Stability score calculation', {
      averageMovement,
      changeRate,
      movementScore,
      changeScore,
      finalScore: stabilityScore,
      historyLength: recentHistory.length
    });
    
    return Math.max(0, Math.min(1, stabilityScore));
  }
  
  /**
   * Evaluate whether stability override should be applied based on all factors
   * 
   * @param isLocationChangeSignificant - Whether location change is significant
   * @param hasRecentSelection - Whether there's a recent valid selection
   * @param hasPreviousSelection - Whether there's a previous selection to use
   * @param stabilityScore - Current stability score (0-1)
   * @returns True if stability override should be applied
   */
  private evaluateStabilityOverride(
    isLocationChangeSignificant: boolean,
    hasRecentSelection: boolean,
    hasPreviousSelection: boolean,
    stabilityScore: number
  ): boolean {
    // Must have a previous selection to override to
    if (!hasPreviousSelection) {
      return false;
    }
    
    // If location change is significant, don't override (allow new selection)
    if (isLocationChangeSignificant) {
      return false;
    }
    
    // If no recent selection, don't override
    if (!hasRecentSelection) {
      return false;
    }
    
    // Check consecutive override limit to prevent getting stuck
    const consecutiveOverrides = this.selectionContext.consecutiveOverrides || 0;
    const maxConsecutiveOverrides = this.getMaxConsecutiveOverrides();
    
    if (consecutiveOverrides >= maxConsecutiveOverrides) {
      logger.debug('Stability override limit reached, forcing new selection', {
        consecutiveOverrides,
        maxConsecutiveOverrides
      });
      return false;
    }
    
    // Apply stability mode specific logic
    switch (this.options.stabilityMode) {
      case 'strict':
        // In strict mode, apply override if stability score is high
        return stabilityScore > 0.7;
        
      case 'flexible':
        // In flexible mode, apply override more liberally
        return stabilityScore > 0.3;
        
      case 'normal':
      default:
        // In normal mode, balanced approach
        return stabilityScore > 0.5;
    }
  }
  
  /**
   * Get maximum consecutive overrides allowed based on stability mode
   * 
   * @returns Maximum number of consecutive stability overrides
   */
  private getMaxConsecutiveOverrides(): number {
    switch (this.options.stabilityMode) {
      case 'strict':
        return 10; // Allow more overrides in strict mode
      case 'flexible':
        return 3; // Fewer overrides in flexible mode
      case 'normal':
      default:
        return 5; // Balanced approach
    }
  }
  
  /**
   * Update location history for stability tracking
   * 
   * @param currentLocation - Current GPS position
   * @param selectionChanged - Whether selection changed with this location update
   */
  private updateLocationHistory(currentLocation: Coordinates, selectionChanged: boolean): void {
    if (!this.selectionContext.locationHistory) {
      this.selectionContext.locationHistory = [];
    }
    
    const historyEntry = {
      location: currentLocation,
      timestamp: new Date(),
      selectionChanged
    };
    
    this.selectionContext.locationHistory.push(historyEntry);
    
    // Keep only recent history (last 10 entries)
    if (this.selectionContext.locationHistory.length > 10) {
      this.selectionContext.locationHistory = this.selectionContext.locationHistory.slice(-10);
    }
    
    // Update last location change time if location changed significantly
    if (this.selectionContext.previousLocation) {
      const isSignificant = isSignificantLocationChange(
        this.selectionContext.previousLocation,
        currentLocation,
        this.getStabilityThreshold()
      );
      
      if (isSignificant) {
        this.selectionContext.lastLocationChangeTime = new Date();
      }
    }
  }
  
  /**
   * Perform station selection using the station selector
   * 
   * @param userLocation - User's GPS position
   * @param stations - Available stations
   * @param routes - Available routes
   * @param stopTimes - Optional GTFS stop times
   * @param trips - Optional GTFS trips
   * @returns Station selection result or error
   * 
   * Requirements 6.1: Station selection logic integration
   */
  private async performStationSelection(
    userLocation: Coordinates,
    stations: Station[],
    routes: Route[],
    stopTimes?: StopTime[],
    trips?: Trip[],
    performanceMonitor?: NearbyViewPerformanceMonitor
  ): Promise<{ selectedStations?: StationSelectionResult; stationsWithRoutes?: number; error?: NearbyViewError }> {
    try {
      // Get route association statistics for context
      const routeStats = getRouteAssociationStatistics(stations, routes, stopTimes, trips);
      
      if (routeStats.stationsWithRoutes === 0) {
        return {
          error: {
            type: NearbyViewErrorType.NO_ROUTES_AVAILABLE,
            message: 'No stations have active route associations',
            fallbackAction: 'show_message',
            retryable: false,
            context: {
              totalStations: routeStats.totalStations,
              stationsWithRoutes: routeStats.stationsWithRoutes,
              hasGTFSData: routeStats.hasGTFSData
            }
          }
        };
      }
      
      // Prepare selection criteria
      const criteria: StationSelectionCriteria = {
        userLocation,
        availableStations: stations,
        routeData: routes,
        stopTimesData: stopTimes,
        tripsData: trips,
        maxSearchRadius: this.options.maxSearchRadius
      };
      
      // Perform station selection with performance monitoring
      const selectionResult = stationSelector.selectStations(criteria, performanceMonitor);
      
      // Check if any stations were selected
      if (!selectionResult.closestStation) {
        const rejectionReasons = new Map<string, number>();
        selectionResult.rejectedStations.forEach(({ rejectionReason }) => {
          rejectionReasons.set(rejectionReason, (rejectionReasons.get(rejectionReason) || 0) + 1);
        });
        
        return {
          error: {
            type: NearbyViewErrorType.NO_STATIONS_IN_RANGE,
            message: 'No suitable stations found within search radius',
            fallbackAction: 'show_message',
            retryable: false,
            context: {
              searchRadius: this.options.maxSearchRadius,
              rejectionReasons: Object.fromEntries(rejectionReasons),
              totalRejected: selectionResult.rejectedStations.length
            }
          }
        };
      }
      
      // Apply second station filtering if disabled
      if (!this.options.enableSecondStation && selectionResult.secondStation) {
        selectionResult.secondStation = null;
        logger.debug('Second station disabled by configuration');
      }
      
      return {
        selectedStations: selectionResult,
        stationsWithRoutes: routeStats.stationsWithRoutes
      };
      
    } catch (error) {
      return {
        error: {
          type: NearbyViewErrorType.STATION_SELECTION_FAILED,
          message: `Station selection failed: ${error instanceof Error ? error.message : String(error)}`,
          fallbackAction: 'retry',
          retryable: true,
          context: {
            originalError: error instanceof Error ? error.message : String(error),
            userLocation,
            stationsCount: stations.length,
            routesCount: routes.length
          }
        }
      };
    }
  }
  
  /**
   * Process vehicles for selected stations to create display groups
   * 
   * @param selectedStations - Result from station selection
   * @param vehicles - Available vehicles
   * @param routes - Available routes
   * @param stopTimes - Optional GTFS stop times
   * @returns Array of station vehicle groups for display
   * 
   * Requirements 6.5: Integration with existing vehicle processing
   */
  private async processVehiclesForStations(
    selectedStations: StationSelectionResult,
    vehicles: LiveVehicle[],
    routes: Route[],
    stopTimes?: StopTime[]
  ): Promise<NearbyStationVehicleGroup[]> {
    const stationGroups: NearbyStationVehicleGroup[] = [];
    const routeMap = new Map<string, Route>();
    
    // Create route lookup map
    routes.forEach(route => {
      routeMap.set(route.id, route);
    });
    
    // Process closest station
    if (selectedStations.closestStation) {
      const group = await this.createStationVehicleGroup(
        selectedStations.closestStation,
        vehicles,
        routeMap,
        stopTimes
      );
      stationGroups.push(group);
    }
    
    // Process second station if available
    if (selectedStations.secondStation) {
      const group = await this.createStationVehicleGroup(
        selectedStations.secondStation,
        vehicles,
        routeMap,
        stopTimes
      );
      stationGroups.push(group);
    }
    
    logger.debug('Vehicle processing for stations completed', {
      stationGroupsCreated: stationGroups.length,
      totalVehicles: stationGroups.reduce((sum, group) => sum + group.vehicles.length, 0)
    });
    
    return stationGroups;
  }
  
  /**
   * Create a station vehicle group for display
   * 
   * @param station - Station with routes
   * @param vehicles - Available vehicles
   * @param routeMap - Map of route ID to route object
   * @param stopTimes - Optional GTFS stop times
   * @returns Station vehicle group
   */
  private async createStationVehicleGroup(
    station: StationWithRoutes,
    vehicles: LiveVehicle[],
    routeMap: Map<string, Route>,
    stopTimes?: StopTime[]
  ): Promise<NearbyStationVehicleGroup> {
    // Find vehicles that serve this station using trip-based matching (like debug script)
    // First, get vehicles with trip IDs
    const vehiclesWithTrips = vehicles.filter(v => v.tripId);
    
    // Extract trip IDs from vehicles
    const vehicleTripIds = new Set(vehiclesWithTrips.map(v => v.tripId).filter(Boolean));
    
    // Filter stop times for this station and active trips
    // Filter stop times for this station and active trips
    const stationStopTimes = (stopTimes || []).filter(st => 
      st.stopId?.toString() === station.id?.toString() && 
      vehicleTripIds.has(st.tripId)
    );
    
    // Get trip IDs that serve this station
    const tripIdsServingStation = new Set(stationStopTimes.map(st => st.tripId));
    
    // Find vehicles whose trips serve this station
    const stationVehicles = vehiclesWithTrips.filter(vehicle => {
      return vehicle.tripId && tripIdsServingStation.has(vehicle.tripId);
    });
    
    // Create enhanced vehicle info (simplified version for now)
    const enhancedVehicles: EnhancedVehicleInfoWithDirection[] = stationVehicles.map(vehicle => {
      const route = routeMap.get(vehicle.routeId || '');
      
      return {
        id: vehicle.id,
        routeId: vehicle.routeId || '',
        route: route?.routeName || `Route ${vehicle.routeId}`,
        destination: route?.routeDesc || 'Unknown destination',
        vehicle: {
          id: vehicle.id,
          routeId: vehicle.routeId || '',
          tripId: vehicle.tripId,
          label: vehicle.label,
          position: vehicle.position,
          timestamp: vehicle.timestamp,
          speed: vehicle.speed,
          isWheelchairAccessible: vehicle.isWheelchairAccessible,
          isBikeAccessible: vehicle.isBikeAccessible,
        },
        isLive: true,
        isScheduled: false,
        confidence: 'medium' as const,
        direction: 'unknown' as const,
        station: station,
        minutesAway: 0, // Will be calculated by direction analysis
        estimatedArrival: new Date(),
        _internalDirection: 'unknown' as const
      };
    });
    
    // Create route summary - include all associated routes, not just those with vehicles
    const routeCounts = new Map<string, number>();
    enhancedVehicles.forEach(vehicle => {
      const routeId = vehicle.routeId;
      routeCounts.set(routeId, (routeCounts.get(routeId) || 0) + 1);
    });
    
    // Include all associated routes, even if no vehicles are present
    const allRoutes = station.associatedRoutes.map(route => {
      const vehicleCount = routeCounts.get(route.id) || 0;
      return {
        routeId: route.id,
        routeName: route.routeName,
        vehicleCount
      };
    });
    
    return {
      station: {
        station: station,
        distance: station.distanceFromUser
      },
      vehicles: enhancedVehicles,
      allRoutes
    };
  }
  
  /**
   * Create result using stability override (previous selection)
   * 
   * @param previousSelection - Previous station selection
   * @param currentLocation - Current GPS position
   * @param vehicles - Current vehicles
   * @param startTime - Processing start time
   * @returns Nearby view result using previous selection
   */
  private async createStabilityOverrideResult(
    previousSelection: StationSelectionResult,
    currentLocation: Coordinates,
    vehicles: LiveVehicle[],
    startTime: number
  ): Promise<NearbyViewResult> {
    // Update location for display but keep previous station selection
    const vehicleGroups = await this.processVehiclesForStations(
      previousSelection,
      vehicles,
      [], // Routes will be derived from vehicles
      undefined
    );
    
    const endTime = performance.now();
    
    return {
      selectedStations: previousSelection,
      stationVehicleGroups: vehicleGroups,
      isLoading: false,
      effectiveLocationForDisplay: currentLocation,
      thresholdUsed: this.options.customDistanceThreshold,
      selectionMetadata: {
        totalStationsEvaluated: 0, // Not evaluated due to stability override
        stationsWithRoutes: 0,
        selectionTime: endTime - startTime,
        stabilityApplied: true
      }
    };
  }
  
  /**
   * Update selection context for stability tracking
   * 
   * @param location - Current GPS position
   * @param selection - Current station selection
   * @param wasOverrideApplied - Whether stability override was applied
   */
  private updateSelectionContext(
    location: Coordinates, 
    selection: StationSelectionResult, 
    wasOverrideApplied: boolean = false
  ): void {
    // Check if selection actually changed
    const selectionChanged = !this.selectionContext.previousSelection ||
      this.selectionContext.previousSelection.closestStation?.id !== selection.closestStation?.id ||
      this.selectionContext.previousSelection.secondStation?.id !== selection.secondStation?.id;
    
    // Update consecutive override counter
    let consecutiveOverrides = this.selectionContext.consecutiveOverrides || 0;
    if (wasOverrideApplied) {
      consecutiveOverrides++;
    } else {
      consecutiveOverrides = 0; // Reset counter when new selection is made
    }
    
    // Calculate new stability score
    const stabilityScore = this.calculateStabilityScore(location);
    
    // Ensure location history is initialized
    if (!this.selectionContext.locationHistory) {
      this.selectionContext.locationHistory = [];
    }
    
    this.selectionContext = {
      ...this.selectionContext, // Preserve location history
      previousLocation: location,
      previousSelection: selection,
      lastSelectionTime: new Date(),
      stabilityOverrideActive: wasOverrideApplied,
      consecutiveOverrides,
      stabilityScore,
      locationHistory: this.selectionContext.locationHistory || [] // Ensure it's always defined
    };
    
    // Update location history with selection change info
    this.updateLocationHistory(location, selectionChanged);
    
    logger.debug('Selection context updated', {
      selectionChanged,
      wasOverrideApplied,
      consecutiveOverrides,
      stabilityScore,
      hasClosestStation: !!selection.closestStation,
      hasSecondStation: !!selection.secondStation
    });
  }
  
  /**
   * Create error result with fallback data
   * 
   * @param error - Nearby view error
   * @param startTime - Processing start time
   * @returns Error result with empty data
   */
  private createErrorResult(error: NearbyViewError, startTime: number, performanceMonitor?: any): NearbyViewResult {
    const endTime = performance.now();
    
    // Create basic performance metrics even for error cases
    let performanceMetrics: NearbyViewPerformanceMetrics | undefined;
    
    if (performanceMonitor) {
      try {
        performanceMetrics = performanceMonitor.finishMonitoring();
        // Record error case metrics in global validator
        validatePerformanceMetrics(performanceMetrics);
      } catch (e) {
        // If performance monitoring fails, create minimal metrics
        performanceMetrics = {
          stationSelectionTime: 0,
          distanceCalculationTime: 0,
          routeFilteringTime: 0,
          totalProcessingTime: endTime - startTime,
          datasetSizes: {
            stations: 0,
            vehicles: 0,
            routes: 0
          },
          optimizationsApplied: [],
          performanceWarnings: []
        };
      }
    }
    
    return {
      selectedStations: {
        closestStation: null,
        secondStation: null,
        rejectedStations: []
      },
      stationVehicleGroups: [],
      isLoading: false,
      effectiveLocationForDisplay: null,
      thresholdUsed: this.options.customDistanceThreshold,
      selectionMetadata: {
        totalStationsEvaluated: 0,
        stationsWithRoutes: 0,
        selectionTime: endTime - startTime,
        stabilityApplied: false
      },
      performanceMetrics,
      error
    };
  }
  
  /**
   * Update controller options
   * 
   * @param newOptions - New options to merge
   */
  updateOptions(newOptions: Partial<NearbyViewOptions>): void {
    this.options = {
      ...this.options,
      ...newOptions
    };
    
    logger.debug('NearbyViewController options updated', {
      newOptions,
      currentOptions: this.options
    });
  }
  
  /**
   * Reset stability tracking context
   */
  resetStabilityContext(): void {
    this.selectionContext = {
      consecutiveOverrides: 0,
      stabilityScore: 0.5,
      locationHistory: []
    };
    logger.debug('Stability context reset');
  }
  
  /**
   * Get current controller configuration
   * 
   * @returns Current options
   */
  getOptions(): Required<NearbyViewOptions> {
    return { ...this.options };
  }
  
  /**
   * Get current stability context information
   * 
   * @returns Current stability context
   */
  getStabilityContext(): Readonly<StationSelectionContext> {
    return { ...this.selectionContext };
  }
  
  /**
   * Force a new selection on the next update (bypasses stability override)
   * Useful when user explicitly requests a refresh or when significant changes occur
   */
  forceNewSelection(): void {
    if (this.selectionContext.consecutiveOverrides) {
      this.selectionContext.consecutiveOverrides = this.getMaxConsecutiveOverrides();
      logger.debug('Forced new selection by setting override limit');
    }
  }
  
  /**
   * Check if the current selection is considered stable
   * 
   * @returns True if current selection is stable
   */
  isSelectionStable(): boolean {
    const stabilityScore = this.selectionContext.stabilityScore || 0;
    const consecutiveOverrides = this.selectionContext.consecutiveOverrides || 0;
    const maxOverrides = this.getMaxConsecutiveOverrides();
    
    return stabilityScore > 0.6 && consecutiveOverrides < maxOverrides * 0.8;
  }
  
  /**
   * Get stability metrics for debugging and monitoring
   * 
   * @returns Stability metrics object
   */
  getStabilityMetrics(): {
    stabilityScore: number;
    consecutiveOverrides: number;
    maxConsecutiveOverrides: number;
    locationHistoryLength: number;
    lastSelectionAge: number | null;
    isStable: boolean;
  } {
    const now = Date.now();
    const lastSelectionAge = this.selectionContext.lastSelectionTime
      ? now - this.selectionContext.lastSelectionTime.getTime()
      : null;
    
    return {
      stabilityScore: this.selectionContext.stabilityScore || 0,
      consecutiveOverrides: this.selectionContext.consecutiveOverrides || 0,
      maxConsecutiveOverrides: this.getMaxConsecutiveOverrides(),
      locationHistoryLength: this.selectionContext.locationHistory?.length || 0,
      lastSelectionAge,
      isStable: this.isSelectionStable()
    };
  }
}

// ============================================================================
// EXPORTED INSTANCE AND UTILITIES
// ============================================================================

/**
 * Default nearby view controller instance
 */
export const nearbyViewController = new NearbyViewController();

/**
 * Create a nearby view controller with custom options
 * 
 * @param options - Controller configuration options
 * @returns New controller instance
 */
export const createNearbyViewController = (options: NearbyViewOptions = {}): NearbyViewController => {
  return new NearbyViewController(options);
};

/**
 * Utility function to check if an error is retryable
 * 
 * @param error - Nearby view error
 * @returns True if error can be retried
 */
export const isRetryableError = (error: NearbyViewError): boolean => {
  return error.retryable === true;
};

/**
 * Utility function to get appropriate fallback action for an error
 * 
 * @param error - Nearby view error
 * @returns Recommended fallback action
 */
export const getFallbackAction = (error: NearbyViewError): string => {
  return error.fallbackAction || 'show_message';
};