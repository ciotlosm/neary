/**
 * Enhanced TypeScript type definitions index
 * Centralized export of all component and utility types
 * Validates Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

// Import core types needed by legacy interfaces
import type { Coordinates, CoreVehicle } from './coreVehicle';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export type {
  // Standard prop patterns
  StandardEventHandlers,
  StandardStylingProps,
  StandardStateProps,
  StandardConfigProps,
  StandardCompositionProps,
  
  // Enhanced component props
  StandardButtonProps,
  StandardInputProps,
  StandardCardProps,
  StandardModalProps,
  StandardLoadingProps,
  StandardErrorProps,
  StandardEmptyStateProps,
  
  // Extended Material-UI props
  ExtendedButtonProps,
  ExtendedInputProps,
  ExtendedCardProps,
} from './componentProps';

// ============================================================================
// COMPONENT TYPE UTILITIES
// ============================================================================

export type {
  // Polymorphic component types
  PolymorphicComponentProps,
  PolymorphicComponentPropsWithRef,
  AnyComponent,
  PropsOf,
  
  // Variant types
  VariantUnion,
  ButtonVariant,
  CardVariant,
  InputVariant,
  LoadingVariant,
  ErrorVariant,
  SizeVariant,
  ColorVariant,
  SeverityVariant,
  
  // Composition types
  SlotProps,
  GenericSlotProps,
  TypedSlotProps,
  RenderProp,
  ChildrenAsFunction,
  CompositionProps,
  
  // Utility types
  RequireProps,
  OptionalProps,
  MergeProps,
  VariantProps,
  StateProps,
  EventHandlerProps,
  StylingProps,
  
  // Component factory types
  ComponentFactoryProps,
  ComponentFactory,
  HOC,
  
  // Theme-aware types
  ThemeAwareProps,
  ResponsiveProp,
  ResponsiveVariantProps,
  
  // Accessibility types
  AriaProps,
  KeyboardNavigationProps,
  AccessibilityProps,
  
  // Form types
  FormFieldProps,
  ValidationResult,
  FieldValidator,
  
  // Async types
  AsyncState,
  AsyncComponentProps,
} from './componentTypeUtils';

// ============================================================================
// TYPE GUARDS AND VALIDATORS
// ============================================================================

export {
  // Variant validators
  isValidVariant,
  isButtonVariant,
  isCardVariant,
  isSizeVariant,
  isColorVariant,
  
  // Component validators
  isChildrenFunction,
  hasSlots,
  
  // Variant constants
  BUTTON_VARIANTS,
  CARD_VARIANTS,
  INPUT_VARIANTS,
  LOADING_VARIANTS,
  ERROR_VARIANTS,
  SIZE_VARIANTS,
  COLOR_VARIANTS,
  SEVERITY_VARIANTS,
} from './componentTypeUtils';

// ============================================================================
// THEME TYPE EXTENSIONS
// ============================================================================

export type {
  // Theme extension types
  ThemeAccessor,
  ResponsiveThemeValue,
  ThemeAwareComponentProps,
  CustomThemeHookReturn,
  
  // Re-export Material-UI types with extensions
  Theme,
  ThemeOptions,
  Palette,
  PaletteOptions,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
} from '../theme/typeExtensions';

// ============================================================================
// COMPONENT FACTORY UTILITIES
// ============================================================================

export type {
  BaseComponentFactoryProps,
  ComponentFactoryConfig,
} from '../components/ui/utils/componentFactory';

export {
  createComponent,
  createPolymorphicComponent,
  createVariantComponent,
  createCompositionComponent,
  createHOC,
  createThemeAwareComponent,
  createResponsiveComponent,
  hasComponentProp,
  mergeComponentProps,
  extractProps,
  omitProps,
} from '../components/ui/utils/componentFactory';

// ============================================================================
// GENERIC COMPONENTS
// ============================================================================

export type {
  GenericBoxProps,
  GenericButtonProps,
  GenericListProps,
  GenericFormFieldProps,
  GenericDataDisplayProps,
} from '../components/ui/base/GenericComponents';

export {
  GenericBox,
  GenericButton,
  GenericList,
  GenericFormField,
  GenericDataDisplay,
} from '../components/ui/base/GenericComponents';

// ============================================================================
// UNIFIED CORE VEHICLE TYPE SYSTEM
// ============================================================================

// Export the unified core vehicle types as the single source of truth
export type {
  CoreVehicle,
  Coordinates,
  PartialCoreVehicle,
  RawVehicleData,
  DirectionStatusValue,
  ConfidenceLevelValue,
  RouteTypeValue,
} from './coreVehicle';

export {
  DirectionStatus,
  ConfidenceLevel,
  RouteType,
  isCoreVehicle,
  isCoordinates,
  isDirectionStatus,
  isConfidenceLevel,
  isRouteType,
  DIRECTION_STATUS_VALUES,
  CONFIDENCE_LEVEL_VALUES,
  ROUTE_TYPE_VALUES,
  DEFAULT_COORDINATES,
  createCoreVehicle,
  createCoordinates,
} from './coreVehicle';

// ============================================================================
// BUSINESS LOGIC LAYER INTERFACES
// ============================================================================

// Export business logic interfaces for timing, direction analysis, and route metadata
export type {
  VehicleSchedule,
  VehicleDirection,
  RouteInfo,
  VehicleScheduleRelation,
  VehicleDirectionRelation,
  RouteStationRelation,
  EnhancedVehicleWithBusinessLogic,
  BusinessLogicValidationResult,
  BusinessLogicValidator,
  BusinessLogicFactory,
} from './businessLogic';

export type {
  VehicleId,
  StationId,
  RouteId,
  TripId,
  AgencyId,
} from './businessLogic';

export {
  createVehicleId,
  createStationId,
  createRouteId,
  createTripId,
  createAgencyId,
  extractId,
  BUSINESS_LOGIC_DEFAULTS,
  BUSINESS_LOGIC_ERRORS,
} from './businessLogic';

// ============================================================================
// PRESENTATION LAYER INTERFACES
// ============================================================================

// Export presentation layer interfaces for UI-specific data, user context, and transformation results
export type {
  UserPreferences,
  TransformationStation,
  TransformationContext,
  VehicleDisplayData,
  TransformationMetadata,
  TransformedVehicleData,
  DisplayFormattingOptions,
  UIThemeInfo,
  PresentationLayerConfig,
} from './presentationLayer';

export {
  isTransformationContext,
  isVehicleDisplayData,
  isTransformedVehicleData,
  createDefaultUserPreferences,
  createDefaultTransformationContext,
  createEmptyTransformedVehicleData,
  PRESENTATION_LAYER_DEFAULTS,
  VEHICLE_STATUS_COLORS,
  VEHICLE_ICONS,
  ANIMATION_STATES,
} from './presentationLayer';

// ============================================================================
// TRANSFORMATION PIPELINE INFRASTRUCTURE
// ============================================================================

// Export transformation pipeline interfaces and classes for composable data processing
export type {
  ValidationError,
  ValidationWarning,
  TransformationValidationResult,
  TransformationStep,
} from './transformationPipeline';

export {
  TransformationError,
  TransformationPipeline,
  createSuccessValidation,
  createFailureValidation,
  createValidationError,
  createValidationWarning,
  isTransformationError,
  isValidationFailure,
  isValidationSuccess,
} from './transformationPipeline';

// ============================================================================
// LEGACY TYPES (DEPRECATED - Use CoreVehicle types instead)
// ============================================================================

/**
 * Error state for application errors
 */
export interface ErrorState {
  type: 'network' | 'authentication' | 'parsing' | 'partial' | 'noData';
  message: string;
  timestamp: Date;
  retryable: boolean;
  metadata?: Record<string, any>;
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark';

/**
 * User configuration
 */
export interface UserConfig {
  apiKey?: string;
  refreshRate?: number;
  theme?: ThemeMode;
  homeLocation?: Coordinates;
  workLocation?: Coordinates;
  favoriteRoutes?: FavoriteRoute[];
  favoriteStations?: string[];
  city?: string;
  agencyId?: string;
  staleDataThreshold?: number;
  logLevel?: number;
  maxVehiclesPerStation?: number;
  defaultLocation?: Coordinates;
}

/**
 * Favorite route
 */
export interface FavoriteRoute {
  id: string;
  routeId: string;
  routeName: string;
  direction: 'to_work' | 'to_home';
  stationId: string;
  stationName: string;
  isActive: boolean;
}

/**
 * Station information
 */
export interface Station {
  id: string;
  name: string;
  coordinates: Coordinates;
  routes?: string[];
  isFavorite?: boolean;
}

// Legacy types removed - use CoreVehicle and VehicleDisplayData from their respective modules

/**
 * Bus information
 */
export interface BusInfo {
  routeId: string;
  destination: string;
  arrivalTime: string;
  isRealTime: boolean;
  minutesAway: number;
  station?: Station;
}

/**
 * Agency information
 */
export interface Agency {
  id: string;
  name: string;
  url?: string;
  timezone?: string;
}

// Legacy VehicleInfo interface removed - use CoreVehicle instead

/**
 * Tranzy API service interface
 */
export interface TranzyApiService {
  setApiKey(apiKey: string): void;
  validateApiKey(apiKey: string): Promise<boolean>;
  getAgencies(): Promise<Agency[]>;
  getStations(): Promise<Station[]>;
  getVehicles(): Promise<CoreVehicle[]>;
}

/**
 * Store interfaces
 */
export interface ConfigStore {
  // Configuration state
  config: UserConfig | null;
  isConfigured: boolean;
  isFullyConfigured: boolean;
  
  // Theme state
  theme: ThemeMode;
  
  // Agencies state
  agencies: Agency[];
  isAgenciesLoading?: boolean;
  agenciesError: ErrorState | null;
  isApiValidated?: boolean;

  // Configuration actions
  updateConfig: (config: Partial<UserConfig>) => void;
  resetConfig: () => void;
  validateConfig: () => boolean;
  
  // Theme actions
  setTheme?: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Agency actions
  fetchAgencies?: () => Promise<void>;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  clearAgenciesError?: () => void;
  
  // Favorites actions
  addFavoriteRoute?: (route: FavoriteRoute) => void;
  removeFavoriteRoute?: (routeId: string) => void;
  addFavoriteStation?: (stationId: string) => void;
  removeFavoriteStation?: (stationId: string) => void;
  getFavoriteRoutes?: () => FavoriteRoute[];
  getFavoriteStations?: () => string[];
}

export interface LocationStore {
  currentLocation: Coordinates | null;
  locationPermission: 'granted' | 'denied' | 'prompt';
  requestLocation: () => Promise<Coordinates>;
  calculateDistance: (from: Coordinates, to: Coordinates) => number;
  validateCoordinates: (coords: Coordinates) => boolean;
  watchLocation: (callback: (coordinates: Coordinates) => void, errorCallback?: (error: Error) => void) => Promise<number>;
  clearLocationWatch: (watchId: number) => void;
  checkLocationPermission?: () => Promise<'granted' | 'denied' | 'prompt'>;
}

export interface VehicleStore {
  // Unified Data
  vehicles: CoreVehicle[];
  stations?: Station[];
  
  // State Management
  isLoading: boolean;
  error: ErrorState | null;
  lastUpdate: Date | null;
  lastApiUpdate?: Date | null;
  lastCacheUpdate?: Date | null;
  
  // Cache and Offline Integration
  cacheStats?: CacheStats;
  isOnline?: boolean;
  isUsingCachedData?: boolean;
  
  // Auto-refresh state
  isAutoRefreshEnabled?: boolean;

  // Actions - Data Management
  refreshVehicles: (options?: RefreshOptions) => Promise<void>;
  refreshStations?: (forceRefresh?: boolean) => Promise<void>;
  refreshScheduleData?: () => Promise<void>;
  refreshLiveData?: () => Promise<void>;
  forceRefreshAll?: () => Promise<void>;
  
  // Actions - Data Fetching Methods
  getStationData?: (options?: any) => Promise<any>;
  getVehicleData?: (options?: any) => Promise<any>;
  getRouteData?: (options?: any) => Promise<any>;
  getStopTimesData?: (options?: any) => Promise<any>;
  
  // Actions - Auto Refresh
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  manualRefresh?: () => Promise<void>;
  
  // Actions - Cache Management
  getCacheStats?: () => void;
  clearCache?: () => void;
  clearError?: () => void;
  
  // Helper Methods
  calculateDistance?: (from: Coordinates, to: Coordinates) => number;
}

/**
 * Refresh options
 */
export interface RefreshOptions {
  force?: boolean;
  forceRefresh?: boolean;
  timeout?: number;
  includeLive?: boolean;
}



/**
 * Route information
 */
export interface Route {
  id: string;
  agencyId: string;
  routeName: string;
  routeDesc?: string;
  type?: string;
}

/**
 * Stop time information
 */
export interface StopTime {
  tripId: string;
  stopId: string;
  sequence: number;
  arrivalTime: string;
  departureTime?: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  entriesByType: Record<string, number>;
  entriesWithTimestamps: Record<string, { createdAt: number; updatedAt: number; age: number; accessCount: number; }>;
  lastCacheUpdate: number;
}

/**
 * Favorites type (legacy)
 */
export type Favorites = FavoriteRoute[];

// ============================================================================
// ROUTE FILTERING CONFIGURATION TYPES
// ============================================================================

// Export route filtering configuration types and utilities
export type {
  RouteFilteringConfig,
  ValidationResult,
  IConfigurationManager,
  ConfigChangeEvent,
} from './routeFiltering';

export {
  DEFAULT_ROUTE_FILTERING_CONFIG,
  CONFIG_VALIDATION_CONSTRAINTS,
  isRouteFilteringConfig,
  createDefaultRouteFilteringConfig,
  mergeRouteFilteringConfig,
} from './routeFiltering';

// ============================================================================
// RE-EXPORTS FROM OTHER TYPE FILES
// ============================================================================

// Re-export types from tranzyApi for compatibility
export type {
  Route as TranzyRoute,
  StopTime as TranzyStopTime,
} from './tranzyApi';

// Re-export processing types (excluding duplicates already exported from coreVehicle)
export type {
  DirectionAnalysisResult,
  EnhancedVehicleWithDirection,
  VehicleEnhancementResult,
  VehicleTransformationOptions,
  VehicleTransformationPipeline,
} from '../hooks/shared/processing/types';

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================================

// Re-export existing types for backward compatibility
// Note: These types are imported from their respective modules as needed

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Utility type to make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type to make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Utility type to get the keys of an object as a union type
 */
export type KeysOf<T> = keyof T;

/**
 * Utility type to get the values of an object as a union type
 */
export type ValuesOf<T> = T[keyof T];

/**
 * Utility type to create a union from an array
 */
export type ArrayToUnion<T extends readonly unknown[]> = T[number];

/**
 * Utility type to create a strict object type
 */
export type Exact<T, U extends T> = T & Record<Exclude<keyof U, keyof T>, never>;

/**
 * Utility type to create a branded type
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Utility type to extract the brand from a branded type
 */
export type UnBrand<T> = T extends Brand<infer U, any> ? U : T;

/**
 * Utility type for nominal typing
 */
export type Nominal<T, N extends string> = T & { readonly __nominal: N };

/**
 * Utility type to create a readonly version of an object recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Utility type to create a mutable version of a readonly object recursively
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

/**
 * Utility type to get non-nullable properties
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Utility type to get nullable properties
 */
export type Nullable<T> = T | null | undefined;

/**
 * Utility type for function types
 */
export type Fn<Args extends any[] = any[], Return = any> = (...args: Args) => Return;

/**
 * Utility type for async function types
 */
export type AsyncFn<Args extends any[] = any[], Return = any> = (...args: Args) => Promise<Return>;

/**
 * Utility type for event handler types
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Utility type for async event handler types
 */
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

/**
 * Utility type for component ref types
 */
export type ComponentRef<T = HTMLElement> = React.Ref<T>;

/**
 * Utility type for component children types
 */
export type ComponentChildren = React.ReactNode;

/**
 * Utility type for component key types
 */
export type ComponentKey = React.Key;

/**
 * Utility type for CSS properties
 */
export type CSSProperties = React.CSSProperties;

/**
 * Utility type for HTML attributes
 */
export type HTMLAttributes<T = HTMLElement> = React.HTMLAttributes<T>;

/**
 * Utility type for SVG attributes
 */
export type SVGAttributes<T = SVGElement> = React.SVGAttributes<T>;

// ============================================================================
// CONDITIONAL EXPORTS
// ============================================================================

// Only export development types in development mode
declare const __DEV__: boolean;

export type DevOnlyTypes = typeof __DEV__ extends true ? {
  DebugProps: {
    debug?: boolean;
    debugLevel?: 'info' | 'warn' | 'error';
    debugPrefix?: string;
  };
  TestProps: {
    testId?: string;
    testMode?: boolean;
    testData?: any;
  };
} : {};

// ============================================================================
// VERSION INFORMATION
// ============================================================================

/**
 * Type system version information
 */
export const TYPE_SYSTEM_VERSION = '1.0.0' as const;

/**
 * Type system feature flags
 */
export const TYPE_SYSTEM_FEATURES = {
  POLYMORPHIC_COMPONENTS: true,
  VARIANT_TYPE_SAFETY: true,
  COMPOSITION_PATTERNS: true,
  MATERIAL_UI_EXTENSIONS: true,
  GENERIC_COMPONENTS: true,
  RESPONSIVE_PROPS: true,
  ACCESSIBILITY_TYPES: true,
  FORM_VALIDATION: true,
  ASYNC_STATE_MANAGEMENT: true,
  THEME_INTEGRATION: true,
} as const;

export type TypeSystemFeatures = typeof TYPE_SYSTEM_FEATURES;