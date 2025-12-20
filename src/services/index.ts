export { TranzyApiService, tranzyApiService, createTranzyApiService, enhancedTranzyApi } from './tranzyApiService';
export type { TranzyApiService as TranzyApiServiceInterface } from '../types';

// Vehicle Transformation Service
export { VehicleTransformationService, vehicleTransformationService } from './VehicleTransformationService';

// Station Selection
export { 
  StationSelector, 
  stationSelector,
  filterStationsByRouteAssociation,
  getStationsWithRoutes
} from './stationSelector';
export type {
  StationSelectionCriteria,
  StationWithRoutes,
  StationSelectionResult,
  RouteAssociationResult
} from './stationSelector';

// Route Association Filter
export {
  determineStationRouteAssociations,
  filterStationsWithValidRoutes,
  getStationRouteAssociation,
  validateStationForDisplay,
  validateRouteData,
  validateStopTimesData,
  validateTripsData,
  getRouteAssociationStatistics
} from './routeAssociationFilter';
export type {
  RouteAssociation,
  RouteAssociationResult as RouteAssociationFilterResult,
  StationWithValidatedRoutes,
  RouteValidationResult,
  RouteAssociationFilterOptions
} from './routeAssociationFilter';

// Route Activity Analyzer
export {
  RouteActivityAnalyzer,
  routeActivityAnalyzer,
  createRouteActivityAnalyzer,
  RouteClassification,
  DEFAULT_ROUTE_ACTIVITY_CONFIG
} from './RouteActivityAnalyzer';
export type {
  IRouteActivityAnalyzer,
  RouteActivityInfo,
  VehicleDataQuality,
  RouteActivitySnapshot,
  RouteActivityConfig,
  RouteAnalysisPerformanceMetrics
} from './RouteActivityAnalyzer';

// Route Filtering Configuration Manager
export {
  RouteFilteringConfigurationManager,
  routeFilteringConfigurationManager,
  createRouteFilteringConfigurationManager
} from './RouteFilteringConfigurationManager';
export type {
  IConfigurationManager as IRouteFilteringConfigurationManager
} from '../types/routeFiltering';