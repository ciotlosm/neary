# Implementation Plan: Unified Setup Flow

## Overview

This implementation transforms the current setup flow into a unified two-phase experience. The SetupView component has been created with both API key validation (Phase 1) and agency selection (Phase 2). The remaining work focuses on simplifying SettingsView and updating navigation logic to complete the unified setup experience.

## Tasks

- [x] 1. Rename and restructure SetupView component
  - Rename `ApiKeySetupView.tsx` to `SetupView.tsx`
  - Update all imports across the codebase to use new name
  - Add Phase 2 UI structure (agency dropdown and Continue button) to component
  - Ensure both phases are visible on initial render with Phase 2 disabled
  - _Requirements: 1.1, 1.2_

- [x] 2. Implement Phase 1 (API Key Validation)
  - [x] 2.1 Add Phase 1 state management
    - Add state for API key input, validation status, loading, and errors
    - Implement Validate button enable/disable logic based on input
    - _Requirements: 2.1_
  
  - [ ]* 2.2 Write property test for Validate button enablement
    - **Property 3: Validate button enablement**
    - **Validates: Requirements 2.1**
  
  - [x] 2.3 Implement API key validation handler
    - Call configStore.validateApiKey() on Validate button click
    - Handle success: enable Phase 2, populate agency dropdown
    - Handle errors: display error message, allow retry
    - Support Enter key to trigger validation
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 2.4 Write property test for Phase 2 enablement
    - **Property 4: Phase 2 enablement and population**
    - **Validates: Requirements 2.4, 3.1**
  
  - [ ]* 2.5 Write property test for agency list storage
    - **Property 6: Agency list storage and persistence**
    - **Validates: Requirements 2.3, 4.1, 4.2**

- [x] 3. Implement Phase 2 (Agency Selection)
  - [x] 3.1 Add Phase 2 state management
    - Add state for selected agency, loading, and errors
    - Implement agency dropdown with disabled state until Phase 1 completes
    - Implement Continue button enable/disable logic based on selection
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 3.2 Write property test for Phase 2 disabled state
    - **Property 1: Phase 2 remains disabled until Phase 1 completes**
    - **Validates: Requirements 1.3**
  
  - [ ]* 3.3 Write property test for Continue button enablement
    - **Property 5: Continue button enablement**
    - **Validates: Requirements 3.3**
  
  - [x] 3.4 Implement agency validation handler
    - Call configStore.validateAndSave() on Continue button click
    - Handle success: navigate to main app (view 0)
    - Handle errors: display error message, prevent navigation
    - _Requirements: 3.4, 3.5, 3.6_

- [x] 4. Implement reconfiguration flow
  - [x] 4.1 Add support for pre-filled API key
    - Implement API key masking (password field type)
    - Track whether pre-filled key has been modified
    - Use original unmasked key if not modified
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ]* 4.2 Write property test for API key masking
    - **Property 10: API key masking for reconfiguration**
    - **Validates: Requirements 5.2**
  
  - [ ]* 4.3 Write property test for modified key detection
    - **Property 11: Modified key detection**
    - **Validates: Requirements 5.4**
  
  - [x] 4.4 Add support for pre-selected agency
    - Pre-populate agency dropdown if agency_id is provided
    - Load cached agencies from agencyStore on mount
    - _Requirements: 4.3_
  
  - [ ]* 4.5 Write property test for agency list pre-population
    - **Property 7: Agency list pre-population**
    - **Validates: Requirements 4.3**

- [x] 5. Implement error handling and user feedback
  - [x] 5.1 Add error display for Phase 1
    - Display error Alert above API key field
    - Clear error when user types
    - _Requirements: 8.1, 8.3_
  
  - [x] 5.2 Add error display for Phase 2
    - Display error Alert above Continue button
    - Clear error when user selects agency
    - _Requirements: 8.2, 8.3_
  
  - [ ]* 5.3 Write property test for error clearing
    - **Property 13: Error clearing on input change**
    - **Validates: Requirements 8.3**
  
  - [x] 5.4 Add loading states
    - Show loading indicator on Validate button during Phase 1
    - Show loading indicator on Continue button during Phase 2
    - Disable all inputs during loading
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 5.5 Write property test for input disabling during loading
    - **Property 14: Input disabling during loading**
    - **Validates: Requirements 8.5**

- [x] 6. Implement cache management
  - [x] 6.1 Cache clearing on API key change
    - configStore.validateApiKey() already calls clearAgencyData()
    - _Requirements: 4.4, 9.4_
  
  - [x] 6.2 Cache clearing on agency change
    - configStore.validateAndSave() already calls clearAgencyData() when agency changes
    - _Requirements: 9.5_
  
  - [ ]* 6.3 Write property test for cache clearing on API key change
    - **Property 8: Cache clearing on API key change**
    - **Validates: Requirements 4.4, 9.4**
  
  - [ ]* 6.4 Write property test for cache clearing on agency change
    - **Property 9: Cache clearing on agency change**
    - **Validates: Requirements 9.5**
  
  - [ ]* 6.5 Write property test for configuration persistence
    - **Property 15: Configuration persistence**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 7. Simplify SettingsView
  - [x] 7.1 Remove agency selection section
    - Delete agency dropdown and related state
    - Delete agency validation logic
    - Delete agency loading and error handling
    - _Requirements: 6.2_
  
  - [x] 7.2 Remove API key management card
    - Delete "Manage API Key" button and card
    - _Requirements: 6.3_
  
  - [x] 7.3 Add Reconfigure button
    - Create new card with "Reconfigure" button
    - Wire button to navigate to SetupView (view -1)
    - Button should pass current apiKey and agency_id to SetupView
    - _Requirements: 6.1, 6.4_
  
  - [ ]* 7.4 Write unit tests for simplified SettingsView
    - Test that only theme toggle and Reconfigure button are present
    - Test that agency dropdown is not present
    - Test that API key card is not present
    - Test Reconfigure button navigation
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Update main.tsx navigation logic
  - [x] 8.1 Update initial view calculation
    - If no API key → view -1 (SetupView)
    - If API key but no agency → view -1 (SetupView, not Settings)
    - If both configured → view 0 (Stations)
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ]* 8.2 Write property test for navigation blocking
    - **Property 12: Navigation blocking based on configuration state**
    - **Validates: Requirements 7.2, 7.3, 7.4**

- [ ] 9. Checkpoint - Manual testing
  - Test complete setup flow from empty state
  - Test reconfiguration flow from Settings
  - Test error handling in both phases
  - Verify navigation blocking works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integration testing
  - [ ]* 10.1 Write integration test for complete setup flow
    - Test full flow from empty state to configured
    - Test Phase 1 → Phase 2 → Main app navigation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1-2.6, 3.1-3.6_
  
  - [ ]* 10.2 Write integration test for reconfiguration flow
    - Test navigation from Settings → SetupView
    - Test pre-filled values and modification detection
    - Test successful reconfiguration and return to main app
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 10.3 Write integration test for error recovery
    - Test Phase 1 error → retry → success
    - Test Phase 2 error → retry → success
    - _Requirements: 2.5, 3.6, 8.1, 8.2_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation preserves existing state management patterns in configStore and agencyStore
- Navigation blocking is enforced at the App level in main.tsx

## Implementation Status

**Completed:**
- ✅ SetupView component fully implemented with two-phase flow
- ✅ Phase 1 (API key validation) with error handling and loading states
- ✅ Phase 2 (agency selection) with proper enablement logic
- ✅ Reconfiguration support with API key masking and modification detection
- ✅ Error handling and user feedback for both phases
- ✅ Cache management in configStore (clearAgencyData on key/agency change)
- ✅ Navigation integration in main.tsx (SetupView renders correctly)

**Remaining:**
- ⏳ Simplify SettingsView (remove agency selection, add Reconfigure button)
- ⏳ Update main.tsx initial view logic (route to SetupView when agency missing)
- ⏳ Optional: Property-based tests and integration tests
