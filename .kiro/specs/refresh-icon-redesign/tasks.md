# Implementation Plan: Refresh Icon Redesign

## Overview

This plan implements a comprehensive refresh button redesign with improved visual feedback (three-color system), cleaner UI (no countdown dots), and consistent naming across the codebase for API vs GPS timing.

## Tasks

- [x] 1. Refactor timing constants for clarity
  - Rename `IN_MEMORY_CACHE_DURATIONS` → `API_CACHE_DURATION` in constants.ts
  - Rename `STALENESS_THRESHOLDS` → `API_DATA_STALENESS_THRESHOLDS` in constants.ts
  - Rename `GPS_DATA_AGE_THRESHOLDS.CURRENT_THRESHOLD` → `GPS_DATA_AGE_THRESHOLDS.FRESH`
  - Rename `GPS_DATA_AGE_THRESHOLDS.STALE_THRESHOLD` → `GPS_DATA_AGE_THRESHOLDS.STALE`
  - Add `GPS_DATA_AGE_THRESHOLDS.ERROR = 30 * 60 * 1000` (30 minutes)
  - Add `API_FETCH_FRESHNESS_THRESHOLDS` with FRESH (60s) and WARNING (180s)
  - Add `REFRESH_ANIMATION_DURATIONS` with CACHE_CHECK (500ms) and API_CALL (1400ms)
  - Update all imports and usages across codebase
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2_

- [x] 2. Refactor Data Freshness Monitor service
  - [x] 2.1 Rename `DataFreshnessMonitor` class → `ApiFreshnessMonitor`
    - Update class name and file name
    - Update all imports across codebase
    - _Requirements: 8.1_

  - [x] 2.2 Rename monitor methods and fields
    - Rename `calculateFreshness()` → `calculateApiFreshness()`
    - Rename `lastVehicleRefresh` → `lastVehicleApiFetch`
    - Rename `updateVehicleRefreshTime()` → `updateVehicleApiFetchTime()`
    - Update all method calls across codebase
    - _Requirements: 8.1, 8.2_

  - [x] 2.3 Update `ApiFreshnessStatus` interface
    - Rename `vehicleDataAge` → `vehicleApiAge`
    - Rename `staticDataAge` → `staticApiAge`
    - Rename `nextVehicleRefresh` → `nextAutoRefreshIn`
    - Add `lastApiFetchTime: number | null` field
    - Update all usages of this interface
    - _Requirements: 8.1, 8.4_

- [ ] 3. Checkpoint - Ensure refactoring tests pass
  - Run all tests to verify refactoring didn't break anything
  - Fix any broken tests due to renames
  - Ensure all affected components still work

- [x] 4. Remove countdown dots from refresh button
  - [x] 4.1 Delete `RefreshCountdownDots` component
    - Remove component file
    - Remove all imports
    - _Requirements: 5.1, 5.5_

  - [x] 4.2 Update ManualRefreshButton component
    - Remove dots rendering logic
    - Keep countdown info in tooltip
    - Test visual appearance
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Implement three-color system for refresh button
  - [x] 5.1 Update button color logic
    - Add 'warning' to color type union
    - Update `getButtonColor()` function to use `API_FETCH_FRESHNESS_THRESHOLDS`
    - Read from `vehicleStore.lastApiFetch` for age calculation
    - Calculate age in milliseconds
    - Return green (<1min), yellow (1-3min), or red (>3min)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.2 Handle disabled states
    - Check for no API key, no agency, network offline, API offline
    - Return 'default' (grey) for all disabled conditions
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 5.3 Update tooltip content
    - Show freshness status based on new thresholds
    - Keep countdown information
    - Show "Click to refresh" when enabled
    - _Requirements: 5.2, 5.3, 5.4, 7.1, 7.2, 7.5_

- [x] 6. Preserve color during refresh operations
  - [x] 6.1 Store color before refresh starts
    - Capture current button color when refresh begins
    - Pass color to CircularProgress component
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 6.2 Update color only after refresh completes
    - Keep stored color during entire refresh operation
    - Recalculate color when refresh finishes
    - Update to new color based on fresh API fetch time
    - _Requirements: 3.4, 3.5_

- [x] 7. Differentiate refresh animations
  - [x] 7.1 Add operation type tracking to refresh service
    - Expose whether operation is cache-check or API-call
    - Provide subscription mechanism for button to react
    - _Requirements: 4.5_

  - [x] 7.2 Implement fast animation for cache checks
    - Use `REFRESH_ANIMATION_DURATIONS.CACHE_CHECK` (500ms)
    - Apply to CircularProgress via sx prop
    - _Requirements: 4.1, 4.3_

  - [x] 7.3 Implement normal animation for API calls
    - Use `REFRESH_ANIMATION_DURATIONS.API_CALL` (1400ms)
    - Apply to CircularProgress via sx prop
    - _Requirements: 4.2, 4.4_

- [x] 8. Update button size to match other header controls
  - [x] 8.1 Change button size
    - Update from `size="medium"` to `size="small"`
    - Remove explicit `width: 48, height: 48` overrides
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 8.2 Verify visual consistency
    - Test alignment with GPS and API status icons
    - Verify spacing matches other header controls
    - Test on different screen sizes
    - _Requirements: 6.1, 6.4, 6.5_

- [ ] 9. Checkpoint - Ensure all functionality works
  - Test all color states (green, yellow, red, grey)
  - Test color preservation during refresh
  - Test animation differences (cache vs API)
  - Test button sizing and alignment
  - Verify tooltip content is correct

- [ ] 10. Update tests for new behavior
  - [ ] 10.1 Update existing unit tests
    - Update color calculation tests for three-color system
    - Update component rendering tests for new size
    - Update tooltip tests for new content
    - Remove countdown dots tests
    - _Requirements: All_

  - [ ] 10.2 Add property-based tests
    - **Property 1: Color Threshold Boundaries** - Test color calculation for all age ranges
    - **Property 2: Color Based on API Fetch Time** - Verify only API fetch time affects color
    - **Property 3: Disabled State Conditions** - Test all disabled state combinations
    - **Property 4: Color Preservation During Refresh** - Test color stays same during refresh
    - **Property 5: Color Update After Refresh** - Test color updates to green after refresh
    - **Property 6: Concurrent Refresh Prevention** - Test rapid clicks only trigger one refresh
    - **Property 7: Timestamp Persistence** - Test timestamps survive page reload
    - **Property 8: Age Calculation Accuracy** - Test age calculation is correct
    - **Property 9: Tooltip Content Completeness** - Test tooltip always has required content
    - **Property 10: API Timestamp Tracking** - Test timestamps are recorded on API calls
    - _Requirements: All_

  - [ ] 10.3 Add accessibility tests
    - Test ARIA labels are present
    - Test keyboard navigation works
    - Test color contrast ratios meet WCAG AA
    - Test screen reader announcements
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11. Final checkpoint - Verify all tests pass
  - Run full test suite
  - Fix any failing tests
  - Verify no regressions in existing functionality
  - Test manually in browser

## Notes

- All tasks build on previous tasks - complete in order
- Refactoring (tasks 1-3) must be done first to establish clear naming
- Button updates (tasks 4-8) implement the visual changes
- Testing (tasks 10-11) ensures correctness and no regressions
- Property-based tests should run minimum 100 iterations each
- Each property test must reference its design document property number
