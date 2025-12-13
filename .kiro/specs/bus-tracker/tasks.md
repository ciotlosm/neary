# Implementation Plan

- [x] 1. Set up project structure and development environment
  - Create React TypeScript project with Vite
  - Install and configure dependencies (Zustand, Tailwind CSS, Axios, fast-check, Vitest)
  - Set up project directory structure for components, services, stores, and types
  - Configure TypeScript strict mode and ESLint rules
  - _Requirements: All requirements need proper project foundation_

- [x] 2. Implement core data types and interfaces
  - Define TypeScript interfaces for BusInfo, Station, Coordinates, UserConfig, Favorites, and ErrorState
  - Create API service interface for Tranzy integration
  - Implement data validation functions for all core types
  - _Requirements: 1.1, 1.2, 2.1, 8.1_

- [x] 2.1 Write property test for configuration round-trip integrity
  - **Property 14: Configuration round-trip integrity**
  - **Validates: Requirements 1.2**

- [x] 3. Create Zustand stores for state management
  - Implement ConfigStore for user configuration management
  - Create BusStore for bus data and API state
  - Build FavoritesStore for managing favorite buses and stations
  - Implement LocationStore for GPS and location services
  - Add persistence layer using LocalStorage with encryption for sensitive data
  - _Requirements: 1.5, 2.2, 2.4, 8.5_

- [x] 3.1 Write property test for configuration persistence and application
  - **Property 1: Configuration persistence and application**
  - **Validates: Requirements 1.5, 3.4**

- [x] 3.2 Write property test for immediate favorites view updates
  - **Property 3: Immediate favorites view updates**
  - **Validates: Requirements 2.4**

- [x] 4. Implement Tranzy API service layer
  - Create TranzyApiService class with authentication handling
  - Implement methods for getBusesForCity, getStationsForCity, getBusesAtStation
  - Add API key validation and error handling
  - Implement request/response interceptors for authentication and error management
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 4.1 Write property test for API key validation and storage
  - **Property 12: API key validation and storage**
  - **Validates: Requirements 8.2, 8.5**

- [x] 4.2 Write property test for authentication header inclusion
  - **Property 13: Authentication header inclusion**
  - **Validates: Requirements 8.3**

- [x] 5. Build location services and GPS integration
  - Implement browser Geolocation API wrapper with error handling
  - Create distance calculation utilities using Haversine formula
  - Add location permission management and fallback options
  - Implement coordinate validation and bounds checking
  - _Requirements: 1.3, 1.4, 6.1_

- [x] 6. Create configuration management system
  - Build ConfigurationManager component for initial setup
  - Implement city selection interface with validation
  - Create location setup with GPS integration and manual entry options
  - Add API key configuration with validation feedback
  - Implement refresh rate configuration with reasonable bounds
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 8.1_

- [x] 7. Implement direction intelligence algorithm
  - Create direction classification logic using home/work locations and route endpoints
  - Implement station metadata integration for directional information
  - Add geographic routing validation using coordinate analysis
  - Create fallback manual direction assignment interface
  - _Requirements: 5.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7.1 Write property test for direction classification accuracy
  - **Property 10: Direction classification accuracy**
  - **Validates: Requirements 5.4, 6.1, 6.2**

- [x] 7.2 Write property test for metadata integration for direction accuracy
  - **Property 11: Metadata integration for direction accuracy**
  - **Validates: Requirements 6.3, 6.4**

- [x] 8. Build favorites management system
  - Implement favorite bus selection and storage
  - Create station filtering based on favorite buses
  - Add favorite station management with persistence
  - Implement real-time updates when favorites change
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8.1 Write property test for favorite bus station filtering
  - **Property 2: Favorite bus station filtering**
  - **Validates: Requirements 2.2**

- [x] 9. Create comprehensive error handling system
  - Implement ErrorDisplay component with color-coded indicators
  - Create error classification for network, parsing, partial data, and authentication errors
  - Add retry mechanisms with exponential backoff
  - Implement graceful degradation with cached data display
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9.1 Write property test for error state management
  - **Property 6: Error state management**
  - **Validates: Requirements 4.2, 4.4, 4.5**

- [x] 9.2 Write property test for live vs scheduled data discrepancy detection
  - **Property 7: Live vs scheduled data discrepancy detection**
  - **Validates: Requirements 4.3**

- [x] 10. Implement real-time data refresh system
  - Create automatic refresh mechanism based on configurable intervals
  - Implement manual refresh functionality that bypasses automatic timing
  - Add background data polling with proper cleanup
  - Create refresh rate configuration with validation
  - _Requirements: 3.2, 3.3, 5.5_

- [x] 10.1 Write property test for refresh rate timing compliance
  - **Property 4: Refresh rate timing compliance**
  - **Validates: Requirements 3.2**

- [x] 10.2 Write property test for manual refresh bypass
  - **Property 5: Manual refresh bypass**
  - **Validates: Requirements 3.3**

- [x] 11. Build main bus display interface
  - Create BusDisplay component with "Going to work" and "Going home" sections
  - Implement live vs scheduled data indicators
  - Add proper time formatting with "Bus X in Y minutes (live/scheduled) at HH:MM" format
  - Create chronological sorting for multiple buses
  - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2_

- [x] 11.1 Write property test for data presentation consistency
  - **Property 8: Data presentation consistency**
  - **Validates: Requirements 5.2, 5.3, 7.1**

- [x] 11.2 Write property test for chronological bus ordering
  - **Property 9: Chronological bus ordering**
  - **Validates: Requirements 7.2**

- [x] 12. Create station information display
  - Build StationList component for showing buses at specific stations
  - Implement "Next buses at <station>" formatting with complete timing details
  - Add integration with favorites system for quick access
  - Create responsive mobile interface with touch-friendly interactions
  - _Requirements: 5.5, 7.3, 7.4, 7.5_

- [x] 13. Implement mobile-responsive UI shell
  - Create App component with navigation and global error boundary
  - Build responsive layout using Tailwind CSS mobile-first approach
  - Implement smooth transitions and visual feedback for touch interactions
  - Add loading states and skeleton screens for better UX
  - _Requirements: 7.4, 7.5_

- [x] 14. Add settings and reconfiguration interface
  - Create settings page with identical options to initial setup
  - Implement configuration updates without requiring app restart
  - Add export/import functionality for configuration backup
  - Create reset to defaults option with confirmation
  - _Requirements: 3.4, 3.5_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement offline capability and caching
  - Add service worker for offline functionality
  - Implement intelligent caching strategy for API responses
  - Create offline indicators and cached data timestamps
  - Add cache invalidation and refresh strategies
  - _Requirements: 4.4, 5.5_

- [x] 16.1 Write unit tests for offline functionality
  - Test service worker registration and caching behavior
  - Verify offline indicators display correctly
  - Test cache invalidation and refresh mechanisms
  - _Requirements: 4.4, 5.5_

- [x] 17. Add performance optimizations
  - Implement React.memo for expensive components
  - Add debouncing for API calls and user inputs
  - Optimize bundle size with code splitting
  - Add performance monitoring and metrics
  - _Requirements: 3.2, 7.4_

- [x] 18. Final integration and testing
  - Integrate all components into complete application flow
  - Test end-to-end user journeys from setup to bus tracking
  - Verify all error scenarios and recovery mechanisms
  - Validate mobile responsiveness across different screen sizes
  - _Requirements: All requirements_

- [x] 18.1 Write integration tests for complete user flows
  - Test complete setup flow from initial launch to bus tracking
  - Verify favorites management across app sessions
  - Test error recovery and retry mechanisms
  - Validate configuration persistence and updates
  - _Requirements: All requirements_

- [x] 19. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Implement enhanced caching system
  - Create dataCache.ts with different TTL per data type
  - Implement enhancedTranzyApi.ts with GTFS endpoint support
  - Create enhancedBusStore.ts combining schedule and live data
  - Add cache management UI in Settings
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 21. Implement map-based location selection
  - Add MapPicker component using React Leaflet and OpenStreetMap
  - Integrate map selection into ConfigurationManager and LocationSetup
  - Add Leaflet CSS for proper map rendering
  - _Requirements: 1.3_

- [x] 22. Implement nearby stations feature
  - Create NearbyStations component with 3-station limit and expand option
  - Add "Show Buses" and "Directions" buttons per station
  - Integrate with enhanced API for station data
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 23. Implement direction intelligence based on station proximity
  - Update enhancedBusStore to classify buses by closest station to home/work
  - Add calculateDistance helper method to store
  - Limit bus display to 3 per direction
  - _Requirements: 6.1, 6.2, 6.3, 5.7_

- [x] 24. Fix address search isolation
  - Update AddressSearchInput with unique IDs per instance
  - Ensure suggestions don't persist between home/work inputs
  - _Requirements: 1.6_

- [x] 25. Fix UI overlap issues
  - Add proper z-index layering for navigation and content
  - Ensure action buttons don't overlap with navigation
  - _Requirements: 7.4, 7.5_

- [x] 26. Update tests for enhanced architecture
  - Update BusDisplay tests to use useEnhancedBusStore
  - Fix tranzyApiService tests for new API flow
  - Ensure all 271 tests pass
  - _Requirements: All requirements_