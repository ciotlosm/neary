# Requirements Document

## Introduction

This feature redesigns the manual refresh button in the app header to provide clearer visual feedback about data freshness through a three-color system (green/yellow/red) and improved iconography. The redesign removes visual clutter (countdown dots) while maintaining essential functionality and ensuring consistent sizing with other header controls.

## Glossary

- **Manual_Refresh_Button**: Interactive UI component in the app header that triggers data refresh and displays data freshness status
- **API_Fetch_Time**: The timestamp when the application last successfully fetched data from the API
- **Data_Age**: The time elapsed since the last API fetch
- **Freshness_State**: The current status of data freshness (fresh/warning/stale)
- **Refresh_Operation**: The process of fetching new data from the API, which can be cache-check or API-call
- **Cache_Check**: Quick validation of cached data without hitting the API
- **API_Call**: Full network request to fetch fresh data from the Tranzy API
- **Header_Controls**: The collection of interactive buttons in the app header (GPS, API status, refresh, settings)

## Requirements

### Requirement 1: Three-Color Freshness System

**User Story:** As a user, I want to see clear visual indicators of data freshness through a traffic-light color system, so that I can quickly assess whether I need to refresh.

#### Acceptance Criteria

1. WHEN the API fetch time is less than 1 minute old, THE Manual_Refresh_Button SHALL display green color
2. WHEN the API fetch time is between 1 and 3 minutes old, THE Manual_Refresh_Button SHALL display yellow color
3. WHEN the API fetch time is greater than 3 minutes old, THE Manual_Refresh_Button SHALL display red color
4. THE Manual_Refresh_Button SHALL update its color immediately when data age crosses a threshold
5. THE color thresholds SHALL be based on API fetch time, not GPS timestamp age or data update time

### Requirement 2: Grey State for Disabled Conditions

**User Story:** As a user, I want the refresh button to be visually disabled when refresh is not possible, so that I understand when the feature is unavailable.

#### Acceptance Criteria

1. WHEN no API key is configured, THE Manual_Refresh_Button SHALL display grey color and be disabled
2. WHEN network connectivity is offline, THE Manual_Refresh_Button SHALL display grey color and be disabled
3. WHEN the API status is offline or error, THE Manual_Refresh_Button SHALL display grey color and be disabled
4. WHEN no agency is selected, THE Manual_Refresh_Button SHALL display grey color and be disabled
5. THE Manual_Refresh_Button SHALL remain clickable but show appropriate error messages in tooltip when disabled

### Requirement 3: Color Preservation During Refresh

**User Story:** As a user, I want to see the refresh button maintain its freshness color while spinning, so that I can still assess data age during refresh operations.

#### Acceptance Criteria

1. WHEN a refresh operation starts AND data was green, THE Manual_Refresh_Button SHALL spin with green color
2. WHEN a refresh operation starts AND data was yellow, THE Manual_Refresh_Button SHALL spin with yellow color
3. WHEN a refresh operation starts AND data was red, THE Manual_Refresh_Button SHALL spin with red color
4. WHEN a refresh operation completes, THE Manual_Refresh_Button SHALL update to the new freshness color based on the new API fetch time
5. THE spinning animation SHALL not change the button to grey/default color

### Requirement 4: Differentiated Refresh Animations

**User Story:** As a user, I want to see different spinning speeds for cache checks versus API calls, so that I can understand what type of operation is happening.

#### Acceptance Criteria

1. WHEN a cache check operation is in progress, THE Manual_Refresh_Button SHALL display a faster spinning animation
2. WHEN an API call operation is in progress, THE Manual_Refresh_Button SHALL display a normal-speed spinning animation
3. THE cache check animation SHALL complete in approximately 0.5 seconds
4. THE API call animation SHALL use the standard CircularProgress duration (approximately 1.4 seconds per rotation)
5. THE refresh services SHALL expose information about whether the operation is a cache check or API call

### Requirement 5: Countdown Dots Removal

**User Story:** As a user, I want a cleaner refresh button without visual clutter, so that the interface is simpler and more focused.

#### Acceptance Criteria

1. THE Manual_Refresh_Button SHALL NOT display countdown dots around the icon
2. THE countdown information SHALL remain available in the button tooltip
3. THE tooltip SHALL display "Next auto-refresh: Xm Ys" when countdown is active
4. THE tooltip SHALL display current freshness status and refresh progress
5. THE button visual design SHALL be simplified without the dots component

### Requirement 6: Consistent Header Control Sizing

**User Story:** As a user, I want all header controls to have consistent sizing, so that the interface looks polished and professional.

#### Acceptance Criteria

1. THE Manual_Refresh_Button SHALL use the same size as GPS and API status icons
2. THE Manual_Refresh_Button SHALL use Material-UI size="small" for the IconButton
3. THE Manual_Refresh_Button SHALL NOT use explicit width/height overrides
4. THE Manual_Refresh_Button SHALL align vertically with other header controls
5. THE button spacing SHALL match the gap between GPS and API status icons

### Requirement 7: Tooltip Information Display

**User Story:** As a user, I want comprehensive information in the tooltip, so that I can understand data status without cluttering the visual interface.

#### Acceptance Criteria

1. WHEN the button is not refreshing, THE tooltip SHALL display current freshness status ("Data is fresh" / "Data is stale")
2. WHEN the button is not refreshing, THE tooltip SHALL display countdown to next auto-refresh
3. WHEN the button is refreshing, THE tooltip SHALL display which stores are currently being refreshed
4. WHEN the button is refreshing, THE tooltip SHALL display which stores have completed
5. THE tooltip SHALL always include "Click to refresh" prompt when button is enabled

### Requirement 8: API Fetch Time Tracking

**User Story:** As a developer, I want accurate tracking of API fetch times, so that the color system reflects actual data freshness.

#### Acceptance Criteria

1. THE System SHALL track the timestamp of each successful API fetch
2. THE System SHALL calculate data age based on the difference between current time and last API fetch time
3. THE System SHALL update the data age calculation every second for real-time color updates
4. THE System SHALL persist the last API fetch time across page reloads
5. THE System SHALL handle cases where no API fetch has occurred yet (show grey/disabled state)

### Requirement 9: Backward Compatibility

**User Story:** As a developer, I want the redesign to maintain existing functionality, so that no features are lost in the update.

#### Acceptance Criteria

1. THE Manual_Refresh_Button SHALL continue to trigger manual refresh on click
2. THE Manual_Refresh_Button SHALL continue to prevent concurrent refresh operations
3. THE Manual_Refresh_Button SHALL continue to integrate with automatic refresh service
4. THE Manual_Refresh_Button SHALL continue to update when automatic refresh occurs
5. THE Manual_Refresh_Button SHALL continue to work with all existing stores and services

### Requirement 10: Accessibility Standards

**User Story:** As a user with accessibility needs, I want the refresh button to be fully accessible, so that I can use it with assistive technologies.

#### Acceptance Criteria

1. THE Manual_Refresh_Button SHALL maintain proper ARIA labels
2. THE color states SHALL have sufficient contrast ratios (WCAG AA standard)
3. THE button SHALL be keyboard accessible
4. THE tooltip SHALL be screen-reader friendly
5. THE disabled state SHALL be properly announced to screen readers
