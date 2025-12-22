# Design Document

## Overview

The Routes view feature replaces the existing Vehicles view with a comprehensive route display system. This design maintains architectural consistency with the existing VehicleView pattern while adapting the interface to display route information effectively. The implementation follows the established clean architecture principles with direct store integration and minimal transformations.

## Architecture

### Component Hierarchy

```
RouteView (Main Container)
├── Loading State (CircularProgress)
├── Error State (Alert with Retry)
├── Configuration Prompt (Alert)
└── RouteList (Display Component)
    └── RouteListItem (Individual Route)
        ├── Route Name Display
        ├── Route Color Indicator
        ├── Route Type Badge
        └── Route Description
```

### Data Flow

```
ConfigStore → RouteView → RouteStore → RouteService → Tranzy API
     ↓
RouteView → RouteList → RouteListItem (Raw API Data)
```

The data flows directly from the API through the store to the components without any transformation layer, maintaining the established pattern from VehicleView.

## Components and Interfaces

### RouteView Component

**Purpose**: Main container component that manages route loading and displays appropriate states

**Props**: None (uses hooks for state management)

**State Management**:
- Connects to `useRouteStore` for route data
- Connects to `useConfigStore` for API configuration
- Manages loading, error, and success states

**Responsibilities**:
- Load routes on component mount when configuration is available
- Handle loading states with spinner display
- Handle error states with retry functionality
- Handle missing configuration with helpful prompts
- Render RouteList when data is available

### RouteList Component

**Purpose**: Display component that renders a list of routes

**Props**:
```typescript
interface RouteListProps {
  routes: TranzyRouteResponse[];
}
```

**Responsibilities**:
- Render individual route items in a Material-UI List
- Handle empty state display
- Provide consistent spacing and layout

### RouteListItem Component

**Purpose**: Individual route display component

**Props**: Individual `TranzyRouteResponse` object

**Display Elements**:
- **Primary Text**: Route short name and long name
- **Route Color**: Visual indicator using route_color field
- **Route Type**: Badge showing route type (Bus, Tram, Trolleybus)
- **Secondary Text**: Route description
- **Visual Hierarchy**: Clear information hierarchy for easy scanning

## Data Models

### Route Data Structure

The component uses the existing `TranzyRouteResponse` interface directly:

```typescript
interface TranzyRouteResponse {
  agency_id: number;
  route_id: number;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_type: number; // 0=Tram, 3=Bus, 11=Trolleybus
  route_desc: string;
}
```

### Route Type Mapping

```typescript
const ROUTE_TYPE_LABELS = {
  0: 'Tram',
  3: 'Bus', 
  11: 'Trolleybus'
} as const;
```

### Navigation Integration

The main application navigation will be updated to replace "Vehicles" with "Routes":
- Navigation label changes from "Vehicles" to "Routes"
- Navigation icon remains the same (DirectionsBus)
- View index 1 now renders RouteView instead of VehicleView

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Let me analyze the acceptance criteria for testable properties:

<function_calls>
<invoke name="prework">
<parameter name="featureName">routes-view

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing the acceptance criteria, I've identified the following testable properties:

### Property Reflection

Reviewing the prework analysis, I can consolidate several related properties:
- Properties 2.1, 2.2, 2.3, and 2.4 can be combined into a comprehensive route display property
- Properties 3.3 and 2.4 are redundant (both test data integrity)
- Properties 3.4 and 1.4 can be combined (both test state handling consistency)
- Properties 3.5 and 5.4 are redundant (both test architectural consistency)

### Core Properties

**Property 1: Route display completeness**
*For any* set of routes returned by the API, the RouteList should display all routes with their short name, long name, description, color indicator (when specified), and correct route type label
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 2: Data integrity preservation**
*For any* route data from the store, the displayed information should match the raw API data exactly without any transformations
**Validates: Requirements 2.4, 3.3**

**Property 3: Configuration-driven loading**
*For any* valid API key and agency ID combination, the RouteView should automatically trigger route loading and pass the correct parameters to the store
**Validates: Requirements 3.2, 5.1, 5.2**

**Property 4: State handling consistency**
*For any* loading, error, or success state from the route store, the RouteView should handle and display the state consistently with the established VehicleView patterns
**Validates: Requirements 1.4, 3.4**

**Property 5: Error recovery behavior**
*For any* error state, clicking the retry button should clear the previous error and attempt to reload routes with the current configuration
**Validates: Requirements 4.4, 4.5**

## Error Handling

### Error States

1. **Network Errors**: Display user-friendly error messages with retry functionality
2. **API Authentication Errors**: Clear messaging about API key configuration
3. **Missing Configuration**: Helpful prompts directing users to settings
4. **Empty Route Data**: Appropriate empty state messaging

### Error Recovery

- **Retry Mechanism**: All error states include retry buttons that clear errors and reattempt loading
- **Configuration Validation**: Automatic validation of API key and agency ID before attempting requests
- **Graceful Degradation**: Application remains functional even when route data is unavailable

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit tests for specific scenarios with property-based tests for comprehensive coverage:

**Unit Tests**:
- Specific examples: Empty route arrays, missing configuration, error states
- Integration points: Navigation integration, store connections
- Edge cases: Invalid route colors, unknown route types, malformed data

**Property-Based Tests**:
- Universal properties: Route display completeness across all route data sets
- Data integrity: Raw API data preservation through all transformations
- State consistency: Loading and error handling across all possible states
- Configuration handling: Automatic loading behavior with any valid configuration

### Property-Based Testing Configuration

Using **fast-check** library for property-based testing:
- **Minimum 100 iterations** per property test
- **Route data generators**: Generate valid TranzyRouteResponse objects with varied field values
- **Configuration generators**: Generate valid and invalid API key/agency ID combinations
- **State generators**: Generate different loading, error, and success states

Each property test will be tagged with:
**Feature: routes-view, Property {number}: {property_text}**

### Test Coverage Requirements

- **Component Rendering**: Verify correct component rendering in all states
- **Store Integration**: Verify proper hook usage and store method calls
- **Navigation Integration**: Verify RouteView replaces VehicleView correctly
- **Data Display**: Verify all route fields are displayed correctly
- **User Interactions**: Verify retry buttons and error recovery work correctly