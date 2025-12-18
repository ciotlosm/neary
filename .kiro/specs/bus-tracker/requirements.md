# Requirements Document

## Introduction

A mobile reactive application that provides comprehensive bus tracking functionality using tranzy.ai data. The system enables users to track buses between home and work locations, manage favorite buses and stations, and receive real-time updates with intelligent error handling and directional awareness. The application features comprehensive caching for offline support and combines schedule and live data for accurate arrival predictions.

## Glossary

- **Bus_Tracker_System**: The mobile reactive application that provides bus tracking functionality
- **Tranzy_API**: The tranzy.ai service that provides real-time bus and transit data (https://api.tranzy.ai)
- **GPS_Service**: The device's Global Positioning System capability for location detection
- **Home_Location**: The user's designated primary residence location
- **Work_Location**: The user's designated work or destination location
- **Target_City**: The city/agency where transport integration is configured (selected from API agencies)
- **Favorite_Bus**: A specific bus route that the user has marked for priority tracking
- **Favorite_Station**: A bus station that the user has marked for quick access
- **Live_Data**: Real-time bus location information from Tranzy_API vehicles endpoint (refreshes every 1 minute)
- **Scheduled_Data**: Planned bus arrival times from Tranzy_API stop_times endpoint (refreshes daily)
- **Static_Data**: Routes, stops, trips, and agency data that rarely changes (refreshes every 24 hours to 7 days)
- **Refresh_Rate**: The configurable interval for automatic data updates
- **Direction_Intelligence**: System capability to determine bus direction based on closest station to home/work locations
- **Error_State**: Visual indicators for various data anomalies and system errors
- **Mobile_Interface**: The responsive user interface optimized for mobile devices
- **Data_Cache**: Local storage system for offline access with different refresh cycles per data type
- **Confidence_Level**: Indicator of data reliability (high/medium/low) based on live data freshness

## Requirements

### Requirement 1

**User Story:** As a commuter, I want to configure my city and locations, so that the app can provide relevant transport information for my specific area and journey.

#### Acceptance Criteria

1. WHEN setting up the application, THE Bus_Tracker_System SHALL first prompt for API key validation, then allow Target_City selection from available agencies fetched from the API
2. WHEN a city is selected, THE Bus_Tracker_System SHALL configure Tranzy_API integration for that specific agency
3. WHEN configuring locations, THE Bus_Tracker_System SHALL allow setting both Home_Location and Work_Location via:
   - Current GPS location
   - Manual coordinate entry
   - Interactive map selection (using OpenStreetMap/Leaflet)
   - Address search with autocomplete
4. WHEN GPS_Service is available, THE Bus_Tracker_System SHALL offer to use current location for either address
5. WHEN locations are saved, THE Bus_Tracker_System SHALL persist all configuration data for future sessions
6. WHEN displaying address inputs, THE Bus_Tracker_System SHALL ensure address search suggestions are isolated between home and work inputs (no cross-contamination)

### Requirement 2

**User Story:** As a user, I want to manage favorite buses and stations, so that I can quickly track the routes I use most frequently.

#### Acceptance Criteria

1. WHEN viewing bus routes, THE Bus_Tracker_System SHALL provide options to mark buses as Favorite_Bus
2. WHEN Favorite_Bus routes are selected, THE Bus_Tracker_System SHALL filter station results to show only stations where those buses stop
3. WHEN managing stations, THE Bus_Tracker_System SHALL allow marking stations as Favorite_Station
4. WHEN favorites are modified, THE Bus_Tracker_System SHALL update the filtered views immediately
5. WHEN accessing favorites, THE Bus_Tracker_System SHALL display both favorite buses and stations with current status

### Requirement 3

**User Story:** As a user, I want to configure refresh settings and manual update options, so that I can control how frequently the app updates data.

#### Acceptance Criteria

1. WHEN accessing settings, THE Bus_Tracker_System SHALL provide Refresh_Rate configuration options
2. WHEN Refresh_Rate is set, THE Bus_Tracker_System SHALL update background data according to the specified interval
3. WHEN manual refresh is triggered, THE Bus_Tracker_System SHALL immediately query Tranzy_API regardless of Refresh_Rate
4. WHEN configuration is updated, THE Bus_Tracker_System SHALL apply changes without requiring application restart
5. WHEN settings are accessed, THE Bus_Tracker_System SHALL provide identical options to initial setup for reconfiguration

### Requirement 4

**User Story:** As a user, I want clear visual indicators for data problems and errors, so that I understand when information may be incomplete or unreliable.

#### Acceptance Criteria

1. WHEN no data is received on schedule, THE Bus_Tracker_System SHALL display a distinct Error_State indicator
2. WHEN service calls fail, THE Bus_Tracker_System SHALL show network error status with retry options
3. WHEN live buses are missing from scheduled data, THE Bus_Tracker_System SHALL highlight the discrepancy with clear colors
4. WHEN partial data is received, THE Bus_Tracker_System SHALL indicate incomplete information status
5. WHEN parsing errors occur, THE Bus_Tracker_System SHALL display data format error messages with diagnostic information

### Requirement 5

**User Story:** As a commuter, I want to see directional bus information for going to work and coming home, so that I only see relevant buses for my current journey needs.

#### Acceptance Criteria

1. WHEN displaying bus information, THE Bus_Tracker_System SHALL show separate sections for "Going to work" and "Going home"
2. WHEN Live_Data is available, THE Bus_Tracker_System SHALL display buses with live timing and "🔴 Live" indicator
3. WHEN only Scheduled_Data exists, THE Bus_Tracker_System SHALL show scheduled times with "📅 Scheduled" indicator
4. WHEN neither live nor scheduled data is available, THE Bus_Tracker_System SHALL show "⏱️ Estimated" indicator
5. WHEN Direction_Intelligence determines bus direction, THE Bus_Tracker_System SHALL categorize buses based on closest station to home/work locations (buses at stations closer to home go to work, and vice versa)
6. WHEN station information is displayed, THE Bus_Tracker_System SHALL show next buses with both live and scheduled data combined
7. WHEN displaying buses per direction, THE Bus_Tracker_System SHALL limit to the next 3 buses by default
8. WHEN displaying confidence levels, THE Bus_Tracker_System SHALL show high/medium/low based on live data freshness

### Requirement 6

**User Story:** As a user, I want intelligent direction detection, so that the app automatically determines which buses go toward my work or home.

#### Acceptance Criteria

1. WHEN analyzing bus routes, THE Bus_Tracker_System SHALL use Home_Location and Work_Location to determine direction by calculating distance from bus station to each location
2. WHEN a bus is at a station closer to Home_Location, THE Bus_Tracker_System SHALL classify it as going to "work"
3. WHEN a bus is at a station closer to Work_Location, THE Bus_Tracker_System SHALL classify it as going to "home"
4. WHEN station metadata includes directional information, THE Bus_Tracker_System SHALL incorporate this data for accuracy
5. WHEN direction cannot be determined automatically, THE Bus_Tracker_System SHALL mark the bus as "unknown" direction
6. WHEN displaying nearby stations, THE Bus_Tracker_System SHALL show only 3 stations initially with an option to expand

### Requirement 7

**User Story:** As a mobile user, I want a responsive interface with clear data presentation, so that I can quickly understand bus timing and status information.

#### Acceptance Criteria

1. WHEN displaying bus times, THE Mobile_Interface SHALL show format "Bus X in Y minutes (live/scheduled) at HH:MM"
2. WHEN multiple buses are available, THE Mobile_Interface SHALL list them in chronological order of arrival
3. WHEN showing station information, THE Mobile_Interface SHALL display "Next buses at <station>" with complete timing details
4. WHEN data updates occur, THE Mobile_Interface SHALL refresh displays smoothly without disrupting user interaction
5. WHEN touch interactions happen, THE Mobile_Interface SHALL provide immediate visual feedback and smooth transitions

### Requirement 8

**User Story:** As a user, I want secure API key management, so that my tranzy.ai credentials are protected and properly configured.

#### Acceptance Criteria

1. WHEN first launching the application, THE Bus_Tracker_System SHALL prompt for Tranzy_API key configuration using the `/v1/opendata/agency` endpoint for validation
2. WHEN API key is entered, THE Bus_Tracker_System SHALL validate it against Tranzy_API before storing
3. WHEN making API requests, THE Bus_Tracker_System SHALL include both `Authorization: Bearer <key>` and `X-API-Key: <key>` headers
4. WHEN API authentication fails, THE Bus_Tracker_System SHALL prompt for key reconfiguration with clear error messages
5. WHEN API key is stored, THE Bus_Tracker_System SHALL persist the key securely for future sessions

### Requirement 9

**User Story:** As a user, I want the app to cache data intelligently, so that I can access bus information even when offline.

#### Acceptance Criteria

1. WHEN fetching data, THE Bus_Tracker_System SHALL cache responses locally with different refresh cycles:
   - Static data (agencies, routes, stops): 24 hours to 7 days
   - Semi-static data (trips, shapes): Daily refresh
   - Dynamic data (vehicles): 1 minute refresh
   - Schedule data (stop_times): Daily refresh
2. WHEN offline, THE Bus_Tracker_System SHALL serve cached data with a visual indicator showing data age
3. WHEN online, THE Bus_Tracker_System SHALL refresh only data that has exceeded its cache duration
4. WHEN in Settings, THE Bus_Tracker_System SHALL provide a "Force Refresh All" option to fetch fresh data regardless of cache
5. WHEN displaying cached data, THE Bus_Tracker_System SHALL show confidence levels based on data freshness
6. WHEN cache is corrupted, THE Bus_Tracker_System SHALL detect and clear corrupted data automatically

### Requirement 10

**User Story:** As a user, I want to see nearby stations and their buses, so that I can find the closest transit options.

#### Acceptance Criteria

1. WHEN displaying nearby stations, THE Bus_Tracker_System SHALL show only 3 stations initially
2. WHEN user wants more stations, THE Bus_Tracker_System SHALL provide an "expand" option to show all nearby stations
3. WHEN displaying a station, THE Bus_Tracker_System SHALL show a "Show Buses" button
4. WHEN "Show Buses" is clicked, THE Bus_Tracker_System SHALL display buses arriving at that specific station