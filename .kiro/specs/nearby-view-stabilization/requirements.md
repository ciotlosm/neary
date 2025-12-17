# Requirements Document

## Introduction

A stabilized and improved nearby view system that displays the most relevant bus stations and vehicles based on user location. The system intelligently selects stations that have active routes passing through them and applies configurable distance thresholds to determine when to show a second nearby station. The nearby view focuses on providing users with actionable transit information for stations they can realistically reach and use.

## Glossary

- **Nearby_View_System**: The component responsible for displaying nearby stations and their associated vehicles
- **Station**: A physical bus stop location (called "stops" in the API) with coordinates and route associations
- **Vehicle**: A bus or transit vehicle passing through stations with real-time location data
- **Route**: A transit line that groups vehicles traveling the same path and serves as a filter mechanism
- **Closest_Station**: The station nearest to the user's GPS position that meets all display criteria
- **Second_Station**: An additional station shown only if it meets distance threshold requirements
- **Route_Association**: The relationship between stations and the routes that pass through them
- **Distance_Threshold**: A configurable maximum distance between the closest and second station (default 200m)
- **Users_GPS_Position**: The user's current geographic location from device location services
- **Active_Routes**: Routes that are defined in the API
- **Display_Rules**: The logic that determines which stations qualify for display in the nearby view
- **Global_Config_Constants**: A system-wide configuration value that can be modified in code but not exposed in UI settings

## Requirements

### Requirement 1

**User Story:** As a commuter, I want to see the closest relevant station to my location, so that I can find the most accessible transit option near me.

#### Acceptance Criteria

1. WHEN the user has a valid GPS position, THE Nearby_View_System SHALL identify the closest station based on geographic distance from the user's coordinates
2. WHEN evaluating stations for display, THE Nearby_View_System SHALL only consider stations that have Route_Association with at least one route
3. WHEN a station has Route_Association, THE Nearby_View_System SHALL display it as the Closest_Station regardless of whether vehicles are currently live at that station
4. WHEN no stations have Route_Association, THE Nearby_View_System SHALL display an appropriate "no stations" message
5. WHEN the Closest_Station is determined, THE Nearby_View_System SHALL display it with all associated route information and vehicle data

### Requirement 2

**User Story:** As a user, I want to see a second nearby station when it's close enough to be a viable alternative, so that I have more transit options without information overload. This usually happens when there is a statino across the road, or when user's gps accuracy puts the user on the oposite side of the road. 

#### Acceptance Criteria

1. WHEN a Closest_Station has been identified, THE Nearby_View_System SHALL evaluate other stations for potential display as a Second_Station
2. WHEN evaluating potential Second_Station candidates, THE Nearby_View_System SHALL only consider stations that have Route_Association with at least one route
3. WHEN a candidate Second_Station is found, THE Nearby_View_System SHALL calculate the distance between the Closest_Station and the candidate station
4. WHEN the distance between Closest_Station and candidate Second_Station is less than or equal to the Distance_Threshold, THE Nearby_View_System SHALL display the Second_Station
5. WHEN the distance exceeds the Distance_Threshold, THE Nearby_View_System SHALL not display any Second_Station

### Requirement 3

**User Story:** As a system administrator, I want the distance threshold to be configurable as a global constant, so that the nearby view behavior can be tuned without exposing complexity to end users.

#### Acceptance Criteria

1. WHEN the system initializes, THE Nearby_View_System SHALL use a Distance_Threshold Global_Constant with a default value of 200 meters
2. WHEN the Distance_Threshold is defined, THE Nearby_View_System SHALL store it as a Global_Constant accessible throughout the application
3. WHEN developers need to adjust the threshold, THE Nearby_View_System SHALL allow modification through code changes to the Global_Constant
4. WHEN the Distance_Threshold is used in calculations, THE Nearby_View_System SHALL apply the current Global_Constant value consistently
5. WHEN the Global_Constant is modified, THE Nearby_View_System SHALL not expose this configuration in the user interface settings

### Requirement 4

**User Story:** As a user, I want to see vehicles and routes for displayed stations, so that I can make informed decisions about which transit option to use.

#### Acceptance Criteria

1. WHEN a station is displayed, THE Nearby_View_System SHALL show all vehicles currently on a route passing through that station
2. WHEN vehicles are displayed, THE Nearby_View_System SHALL group them by route for better organization
3. WHEN no live vehicles are present on the routes passing through this station, THE Nearby_View_System SHALL still display the station with its associated routes
4. WHEN route information is shown, THE Nearby_View_System SHALL indicate which routes serve the station even without current vehicle presence
5. WHEN multiple vehicles from the same route are present, THE Nearby_View_System SHALL display them according to existing vehicle prioritization logic

### Requirement 5

**User Story:** As a user, I want the nearby view to be stable and predictable, so that I can rely on consistent information presentation.

#### Acceptance Criteria

1. WHEN the user's GPS position changes slightly, THE Nearby_View_System SHALL maintain station display stability by avoiding frequent switching between nearby stations
2. WHEN station data is refreshed, THE Nearby_View_System SHALL preserve the current display unless significant changes warrant an update
3. WHEN network connectivity is intermittent, THE Nearby_View_System SHALL gracefully handle data loading states without breaking the display
4. WHEN invalid or missing data is encountered, THE Nearby_View_System SHALL provide appropriate fallback displays and error handling
5. WHEN the system processes station selection, THE Nearby_View_System SHALL complete the operation within reasonable time limits to maintain responsive user experience

### Requirement 6

**User Story:** As a developer, I want clear separation between station selection logic and display logic, so that the nearby view system is maintainable and testable.

#### Acceptance Criteria

1. WHEN implementing station selection, THE Nearby_View_System SHALL separate the logic for identifying qualifying stations from the logic for displaying them
2. WHEN processing route associations, THE Nearby_View_System SHALL use a dedicated function to determine which stations have valid route relationships
3. WHEN calculating distances and thresholds, THE Nearby_View_System SHALL implement distance logic as pure functions that can be tested independently and should make use of existing distance logic utilites present in the project
4. WHEN handling display rules, THE Nearby_View_System SHALL encapsulate the decision logic in clearly defined, testable functions
5. WHEN integrating with existing vehicle processing, THE Nearby_View_System SHALL work seamlessly with current vehicle filtering and grouping mechanisms using clean, modern interfaces

### Requirement 7

**User Story:** As a user, I want the nearby view to handle edge cases gracefully, so that the application remains functional under various conditions.

#### Acceptance Criteria

1. WHEN no GPS position is available, THE Nearby_View_System SHALL display an appropriate message requesting location access or if access was denied, to use the fallback offline gps coordinates provided by the user in settings
2. WHEN no stations exist with route associations, THE Nearby_View_System SHALL show a clear "no stations avaiable" message
3. WHEN all nearby stations lack route associations, THE Nearby_View_System SHALL display an informative message about no active routes
4. WHEN API data is temporarily unavailable, THE Nearby_View_System SHALL show loading states and retry mechanisms
5. WHEN the Distance_Threshold results in no Second_Station being shown, THE Nearby_View_System SHALL display only the Closest_Station without indicating missing information
6. The Nearby_View_System shall make use of the proper app hooks so it can get cached data, and work offline as well, and avoid duplicating logic or bypassing the cache