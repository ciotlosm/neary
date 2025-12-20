# Implementation Plan: StationDisplay Architecture Alignment

## Overview

This implementation plan addresses critical architectural misalignments in the StationDisplay component by ensuring proper integration with the established nearby-view-stabilization architecture. The tasks focus on replacing hardcoded station selection logic with proper StationSelector usage, fixing empty state messaging, and ensuring consistent behavior across the application.

## Tasks

- [x] 1. Refactor useVehicleDisplay to use StationSelector
  - Replace allStations.slice(0, maxStations) with StationSelector.selectStations()
  - Create proper StationSelectionCriteria from available data
  - Expose StationSelectionResult in hook return value
  - _Requirements: 1.1, 1.2, 6.1, 6.2_

- [ ]* 1.1 Write property test for StationSelector service usage
  - **Property 1: StationSelector service usage consistency**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 2. Update transformation context creation
  - Use selected stations from StationSelectionResult instead of raw slicing
  - Implement convertToTransformationStation helper function
  - Ensure maximum 2 stations (closest + optional second) in context
  - _Requirements: 6.2, 2.5, 6.4_

- [ ]* 2.1 Write property test for transformation context correctness
  - **Property 7: Transformation context correctness**
  - **Validates: Requirements 6.1, 6.2**

- [ ] 3. Implement GPS stability logic in useVehicleDisplay
  - Add GPSStabilityState management to prevent frequent reselection
  - Implement evaluateLocationStability function using isSignificantLocationChange
  - Use STATION_STABILITY_THRESHOLD for stability evaluation
  - _Requirements: 4.1, 4.2, 4.4_

- [ ]* 3.1 Write property test for GPS stability maintenance
  - **Property 5: GPS stability maintenance**
  - **Validates: Requirements 4.1, 4.2, 4.4**

- [x] 4. Fix StationDisplay empty state logic
  - Replace allStationsFromHook usage with stationSelectionResult data
  - Use stations that were actually evaluated by StationSelector
  - Include route count information from associatedRoutes
  - Sort stations by distance from user location
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 4.1 Write property test for empty state accuracy
  - **Property 6: Empty state accuracy**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 5. Remove hardcoded station selection logic from StationDisplay
  - Eliminate direct array manipulation for station selection
  - Remove custom distance sorting implementations
  - Remove custom route association filtering
  - Ensure all station processing uses StationSelector results
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 5.1 Write property test for hardcoded logic elimination
  - **Property 8: Hardcoded logic elimination**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 6. Implement proper distance threshold enforcement
  - Ensure NEARBY_STATION_DISTANCE_THRESHOLD is used consistently
  - Enforce 2-station maximum display limit
  - Implement proper second station evaluation logic
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 7.2_

- [ ]* 6.1 Write property test for distance threshold application
  - **Property 2: Distance threshold application accuracy**
  - **Validates: Requirements 2.1, 2.2, 2.3, 7.2**

- [ ]* 6.2 Write property test for two-station display limit
  - **Property 4: Two-station display limit enforcement**
  - **Validates: Requirements 2.5, 6.4**

- [x] 7. Implement route association filtering integration
  - Ensure only stations with route associations are considered
  - Pass existing station.routes data to StationSelector
  - Handle edge case where all stations lack route associations
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 7.1 Write property test for route association filtering
  - **Property 3: Route association filtering completeness**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.5**

- [ ] 8. Add comprehensive error handling
  - Handle StationSelector service failures with fallback logic
  - Implement proper error messages for no stations/no routes scenarios
  - Add validation for station data consistency
  - _Requirements: 1.4, 3.4, 5.5_

- [ ]* 8.1 Write unit tests for error scenarios
  - Test no stations available scenario
  - Test no route associations scenario
  - Test StationSelector service failure scenario
  - **Validates: Requirements 1.4, 3.4, 5.5**

- [x] 9. Update useVehicleDisplay interface
  - Add stationSelectionResult to UseVehicleDisplayResult
  - Add stationSelectionMetadata for debugging information
  - Remove any need for backward compatibility with existing usage, and migrate existing usage to the new method
  - _Requirements: 6.3, 6.5_

- [ ]* 9.1 Write integration tests for hook interface changes
  - Test new stationSelectionResult exposure
  - Test backward compatibility with existing components
  - Test metadata information accuracy
  - _Requirements: 6.3, 6.5_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Performance optimization and validation
  - Monitor StationSelector integration performance impact
  - Optimize GPS stability evaluation for frequent position updates
  - Validate empty state message generation performance
  - _Requirements: Performance requirements_

- [ ]* 11.1 Write performance benchmark tests
  - Test StationSelector integration performance
  - Test GPS stability logic performance
  - Test empty state generation performance
  - _Requirements: Performance requirements_

- [ ] 12. Final integration testing and cleanup
  - Test complete StationDisplay functionality end-to-end
  - Verify all architectural misalignments are resolved
  - Clean up any remaining legacy code patterns
  - _Requirements: All requirements validation_

- [ ]* 12.1 Write end-to-end integration tests
  - Test complete station selection workflow
  - Test error handling integration
  - Test GPS stability integration
  - _Requirements: All requirements_

- [ ] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests ensure components work together correctly
- Performance tests ensure no regression from architectural changes