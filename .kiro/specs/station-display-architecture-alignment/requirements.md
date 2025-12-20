# Requirements Document

## Introduction

The StationDisplay component currently bypasses the proper nearby view architecture, leading to incorrect station selection logic and inconsistent behavior with the established nearby-view-stabilization requirements. This feature addresses critical architectural misalignments by ensuring StationDisplay uses the proper StationSelector service and adheres to the established nearby view patterns for station selection, distance thresholds, and GPS stability.

## Glossary

- **StationDisplay_Component**: The React component responsible for displaying nearby stations and their vehicles
- **StationSelector_Service**: The established service for proper station selection logic with route associations and distance thresholds
- **Nearby_View_Architecture**: The established architecture for station selection including StationSelector, distance thresholds, and GPS stability
- **Route_Association_Filtering**: The process of filtering stations based on actual GTFS route relationships
- **Distance_Threshold_Logic**: The 200-meter threshold logic for determining second station eligibility
- **GPS_Stability_Logic**: The logic to prevent frequent station switching due to minor GPS position changes
- **Empty_State_Logic**: The logic for displaying appropriate messages when no vehicles are found
- **Station_Selection_Result**: The structured result from StationSelector containing closest and second stations
- **Transformation_Context**: The context object used by VehicleTransformationService for processing
- **useVehicleDisplay_Hook**: The hook that orchestrates vehicle data processing and station selection

## Requirements

### Requirement 1

**User Story:** As a developer, I want StationDisplay to use the proper StationSelector service, so that station selection follows the established nearby view architecture and requirements.

#### Acceptance Criteria

1. WHEN StationDisplay needs to select stations, THE StationDisplay_Component SHALL use StationSelector.selectStations() instead of direct station manipulation
2. WHEN calling StationSelector, THE StationDisplay_Component SHALL provide proper StationSelectionCriteria including user location, available stations, and route data
3. WHEN StationSelector returns results, THE StationDisplay_Component SHALL use the closestStation and secondStation from the selection result
4. WHEN no stations are selected by StationSelector, THE StationDisplay_Component SHALL display appropriate empty state messages
5. WHEN StationSelector provides rejection reasons, THE StationDisplay_Component SHALL use this information for better empty state messaging

### Requirement 2

**User Story:** As a user, I want the station selection to respect the 200-meter distance threshold, so that I only see a second station when it's genuinely close enough to be useful.

#### Acceptance Criteria

1. WHEN evaluating stations for display, THE StationDisplay_Component SHALL use NEARBY_STATION_DISTANCE_THRESHOLD (200m) for second station evaluation
2. WHEN the distance between closest and second station exceeds the threshold, THE StationDisplay_Component SHALL display only the closest station
3. WHEN the distance is within the threshold, THE StationDisplay_Component SHALL display both closest and second stations
4. WHEN no second station meets the threshold criteria, THE StationDisplay_Component SHALL not indicate missing information
5. WHEN displaying stations, THE StationDisplay_Component SHALL respect the maximum of 2 stations (closest + optional second)

### Requirement 3

**User Story:** As a user, I want station selection to be based on actual route associations, so that I only see stations that have buses actually serving them.

#### Acceptance Criteria

1. WHEN filtering stations for display, THE StationDisplay_Component SHALL only consider stations that have Route_Association with at least one route
2. WHEN using existing station.routes property, THE StationDisplay_Component SHALL pass this information to StationSelector for route association filtering
3. WHEN a station lacks route associations, THE StationDisplay_Component SHALL exclude it from consideration regardless of proximity
4. WHEN all nearby stations lack route associations, THE StationDisplay_Component SHALL display "no active routes" message
5. WHEN route association data is available, THE StationDisplay_Component SHALL use it for accurate station filtering

### Requirement 4

**User Story:** As a user, I want GPS position changes to not cause frequent station switching, so that the display remains stable and predictable.

#### Acceptance Criteria

1. WHEN GPS position changes slightly, THE StationDisplay_Component SHALL use GPS stability logic to prevent unnecessary station switching
2. WHEN position changes are within STATION_STABILITY_THRESHOLD, THE StationDisplay_Component SHALL maintain current station selection
3. WHEN position changes are significant, THE StationDisplay_Component SHALL allow station selection to update
4. WHEN GPS accuracy varies, THE StationDisplay_Component SHALL use isSignificantLocationChange() to determine if reselection is needed
5. WHEN maintaining stability, THE StationDisplay_Component SHALL preserve user context and avoid jarring display changes

### Requirement 5

**User Story:** As a user, I want accurate empty state messages that reflect the stations actually evaluated, so that I understand why no vehicles are shown.

#### Acceptance Criteria

1. WHEN no vehicles are found, THE StationDisplay_Component SHALL display stations that were actually evaluated by StationSelector
2. WHEN building empty state messages, THE StationDisplay_Component SHALL use stations from StationSelectionResult rather than raw station data
3. WHEN stations have route associations, THE StationDisplay_Component SHALL include route count information in empty state messages
4. WHEN displaying checked stations, THE StationDisplay_Component SHALL sort them by distance from user location
5. WHEN no stations meet selection criteria, THE StationDisplay_Component SHALL provide clear messaging about why no stations are shown

### Requirement 6

**User Story:** As a developer, I want StationDisplay to integrate cleanly with useVehicleDisplay, so that the architecture remains maintainable and follows established patterns.

#### Acceptance Criteria

1. WHEN useVehicleDisplay processes stations, THE useVehicleDisplay_Hook SHALL use StationSelector internally for station selection
2. WHEN creating transformation context, THE useVehicleDisplay_Hook SHALL use properly selected stations rather than raw station slicing
3. WHEN StationDisplay receives data from useVehicleDisplay, THE StationDisplay_Component SHALL trust the station selection has been done correctly
4. WHEN maxStations parameter is used, THE useVehicleDisplay_Hook SHALL respect the 2-station limit from nearby view requirements
5. WHEN integrating with existing vehicle processing, THE useVehicleDisplay_Hook SHALL maintain backward compatibility while using proper station selection

### Requirement 7

**User Story:** As a user, I want consistent station selection behavior across the application, so that the same logic applies everywhere stations are selected.

#### Acceptance Criteria

1. WHEN any component needs station selection, THE component SHALL use the same StationSelector service and logic
2. WHEN distance thresholds are applied, THE system SHALL use the same NEARBY_STATION_DISTANCE_THRESHOLD constant everywhere
3. WHEN GPS stability is needed, THE system SHALL use the same isSignificantLocationChange() logic consistently
4. WHEN route associations are evaluated, THE system SHALL use the same filterStationsByRouteAssociation() logic
5. WHEN station selection results are processed, THE system SHALL handle them consistently across all components

### Requirement 8

**User Story:** As a developer, I want to remove incorrect hardcoded station selection logic, so that the codebase follows the established architecture patterns.

#### Acceptance Criteria

1. WHEN StationDisplay processes stations, THE StationDisplay_Component SHALL not use allStationsFromHook.slice(0, 3) for station selection
2. WHEN building station lists, THE StationDisplay_Component SHALL not bypass StationSelector with direct array manipulation
3. WHEN determining nearby stations, THE StationDisplay_Component SHALL not implement its own distance sorting logic
4. WHEN filtering by routes, THE StationDisplay_Component SHALL not implement custom route association logic
5. WHEN the refactoring is complete, THE StationDisplay_Component SHALL have no hardcoded station selection logic remaining