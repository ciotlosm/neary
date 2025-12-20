# UI Component Architecture Refactoring - Design Document

## Overview

This design establishes a comprehensive Material Design-based component architecture for the Cluj Bus App. The refactoring will eliminate styling inconsistencies, create clear separation of concerns, and establish reusable component patterns that follow Material-UI best practices.

The architecture will be organized into three main layers:
1. **UI Components** - Generic, reusable components with no business logic
2. **Feature Components** - Business-specific components that compose UI components
3. **Styling System** - Centralized theme utilities and styling patterns

## Architecture

### Component Hierarchy

```
src/components/
├── ui/                     # Generic UI components
│   ├── base/              # Base components (Button, Input, Card, etc.)
│   ├── composite/         # Composite UI components (SearchInput, DataTable, etc.)
│   ├── feedback/          # Feedback components (Loading, Error, Empty states)
│   └── layout/            # Layout components (Container, Stack, Grid)
├── features/              # Feature-specific components
│   ├── shared/            # Shared feature components
│   └── [feature-name]/    # Feature-specific components
└── layout/                # Application layout components
```

### Styling Architecture

```
src/hooks/shared/
├── useThemeUtils.ts       # Theme utilities and color functions
├── useMuiUtils.ts         # Material-UI component styling utilities
└── useComponentStyles.ts  # Component-specific styling patterns

src/theme/
├── materialTheme.ts       # Theme configuration
├── components.ts          # Global component overrides
└── tokens.ts              # Design tokens and constants
```

## Components and Interfaces

### Base UI Components

#### Button Component
```typescript
interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'filled' | 'outlined' | 'text' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
```

#### Input Component
```typescript
interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  clearable?: boolean;
}
```

#### Card Component
```typescript
interface CardProps extends CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  interactive?: boolean;
  loading?: boolean;
}
```

### Composite UI Components

#### SearchInput Component
```typescript
interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onSearch: (query: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  loading?: boolean;
  debounceMs?: number;
}
```

#### DataCard Component
```typescript
interface DataCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  children: React.ReactNode;
}
```

### Feedback Components

#### LoadingState Component
```typescript
interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'progress';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullHeight?: boolean;
}
```

#### ErrorState Component
```typescript
interface ErrorStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'inline' | 'page' | 'card';
}
```

#### EmptyState Component
```typescript
interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'minimal';
}
```

## Data Models

### Theme Configuration
```typescript
interface ExtendedTheme extends Theme {
  custom: {
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    borderRadius: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    elevation: {
      none: string;
      low: string;
      medium: string;
      high: string;
    };
  };
}
```

### Component Style Configuration
```typescript
interface ComponentStyleConfig {
  variant: string;
  size: string;
  state: 'default' | 'hover' | 'active' | 'disabled' | 'loading';
  theme: 'light' | 'dark';
}

interface StyleResult {
  sx: SxProps<Theme>;
  className?: string;
}
```

### Component Composition Pattern
```typescript
interface ComposableComponent<T = {}> {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  className?: string;
  component?: React.ElementType;
  slots?: Record<string, React.ElementType>;
  slotProps?: Record<string, any>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*
Property 1: Material-UI theme integration consistency
*For any* UI component, all styling should use Material-UI theme integration with consistent patterns across the component
**Validates: Requirements 1.1**

Property 2: Centralized styling utilities usage
*For any* component that needs styling, the component should use centralized styling utilities instead of inline styles or mixed approaches
**Validates: Requirements 1.2**

Property 3: Design system consistency
*For any* styled component, the component should follow the established design system with consistent spacing, colors, and typography from the theme
**Validates: Requirements 1.3**

Property 4: Theme switching compatibility
*For any* component with styling, the component should render correctly in both light and dark themes without visual issues
**Validates: Requirements 1.4**

Property 5: Custom styling theme integration
*For any* component with custom styling, the styling should integrate with the Material-UI theme system for consistency
**Validates: Requirements 1.5**

Property 6: UI component purity
*For any* UI component, the component should be generic and reusable without direct dependencies on business logic modules or stores
**Validates: Requirements 2.1**

Property 7: Feature component composition
*For any* feature component, the component should compose UI components and contain business logic appropriately
**Validates: Requirements 2.2**

Property 8: Component organization structure
*For any* component, the component should be located in the correct directory (`src/components/ui/` for UI components, `src/components/features/` for feature components)
**Validates: Requirements 2.3**

Property 9: UI component data flow
*For any* UI component that needs data, the component should receive data through props without direct store access
**Validates: Requirements 2.4**

Property 10: Shared functionality extraction
*For any* components with shared functionality, the functionality should be extracted to appropriate hook or utility modules
**Validates: Requirements 2.5**

Property 11: Styling prop naming consistency
*For any* component that accepts styling props, the component should use consistent prop naming conventions across all components
**Validates: Requirements 3.1**

Property 12: Variant standardization
*For any* component that supports variants, the component should use standardized variant names and behaviors
**Validates: Requirements 3.2**

Property 13: Event handler naming consistency
*For any* component that handles events, the component should use consistent event handler prop naming patterns
**Validates: Requirements 3.3**

Property 14: Composition pattern support
*For any* composable component, the component should support standard composition patterns like children and render props
**Validates: Requirements 3.4**

Property 15: Configuration prop consistency
*For any* component that needs configuration, the component should use consistent configuration prop patterns
**Validates: Requirements 3.5**

Property 16: Styling utilities centralization
*For any* styling utilities needed, the utilities should be centralized in dedicated hook modules
**Validates: Requirements 4.1**

Property 17: Theme access centralization
*For any* theme value access, the access should go through centralized theme utility hooks
**Validates: Requirements 4.2**

Property 18: Theme-based color usage
*For any* color usage, the colors should come from the theme system with proper alpha transparency support
**Validates: Requirements 4.3**

Property 19: Theme-based spacing consistency
*For any* spacing application, the spacing should use theme-based spacing units consistently
**Validates: Requirements 4.4**

Property 20: Theme extension over override
*For any* custom styling needed, the styling should extend the theme system rather than override it
**Validates: Requirements 4.5**

Property 21: Material-UI styling exclusivity
*For any* component styling, the component should use Material-UI styling system exclusively
**Validates: Requirements 5.1**

Property 22: Material Design compliance
*For any* styling application, the styling should follow Material Design principles and Material-UI patterns
**Validates: Requirements 5.2**

Property 23: Custom styling approach consistency
*For any* custom styling needed, the styling should extend Material-UI theme system using sx props or styled components
**Validates: Requirements 5.3**

Property 24: Tailwind CSS elimination
*For any* existing Tailwind CSS styling, the styling should be completely replaced with Material-UI equivalents with no legacy code remaining
**Validates: Requirements 5.4**

Property 25: Material-UI utility implementation
*For any* styling utilities needed, the utilities should be built using Material-UI theme system and styling APIs
**Validates: Requirements 5.5**

Property 26: Component composition structure
*For any* complex component, the component should be composed from smaller, focused components
**Validates: Requirements 6.1**

Property 27: Visual pattern extraction
*For any* components that share visual patterns, the patterns should be extracted to reusable base components
**Validates: Requirements 6.2**

Property 28: Variant composition implementation
*For any* component variants needed, the variants should be implemented through composition rather than large conditional logic
**Validates: Requirements 6.3**

Property 29: Customization through composition
*For any* component customization needed, the customization should be achieved through props and composition patterns
**Validates: Requirements 6.4**

Property 30: Functionality extraction consistency
*For any* components with similar functionality, the functionality should be extracted to shared utilities or base components
**Validates: Requirements 6.5**

Property 31: Loading state consistency
*For any* component that handles loading states, the component should use consistent loading indicators and patterns
**Validates: Requirements 7.1**

Property 32: Error handling consistency
*For any* component that handles errors, the component should use consistent error display patterns
**Validates: Requirements 7.2**

Property 33: Async operation feedback
*For any* component with async operations, the component should provide appropriate feedback to users
**Validates: Requirements 7.3**

Property 34: Actionable error messages
*For any* error states that occur, the component should provide actionable error messages and recovery options
**Validates: Requirements 7.4**

Property 35: Centralized error handling
*For any* components that share error handling, the handling should use centralized error handling utilities
**Validates: Requirements 7.5**

Property 36: TypeScript interface completeness
*For any* component props defined, the props should have comprehensive TypeScript interfaces
**Validates: Requirements 8.1**

Property 37: Material-UI type extension
*For any* components that extend Material-UI components, the extension should properly inherit and extend Material-UI prop types
**Validates: Requirements 8.2**

Property 38: Variant type safety
*For any* component variants used, the variants should be type-safe with proper union types
**Validates: Requirements 8.3**

Property 39: Composition type safety
*For any* component composition, the composition should maintain type safety across component boundaries
**Validates: Requirements 8.4**

Property 40: Generic component typing
*For any* generic components created, the components should use appropriate TypeScript generics for flexibility
**Validates: Requirements 8.5**

## Error Handling

### Error Boundary Integration
- All feature components will be wrapped with error boundaries
- Error boundaries will use consistent error display components
- Error recovery mechanisms will be standardized across components

### Loading State Management
- Loading states will use consistent indicators (spinner, skeleton, progress)
- Loading states will be managed through centralized hooks
- Loading states will provide appropriate user feedback

### Validation and Error Display
- Form validation will use consistent error display patterns
- Error messages will be actionable and user-friendly
- Error states will provide recovery options where possible

## Testing Strategy

### Unit Testing Approach
- Test component rendering with different props and variants
- Test theme integration and styling consistency
- Test component composition and prop forwarding
- Test error handling and loading states
- Test TypeScript type safety and prop validation

### Property-Based Testing Approach
- Use **fast-check** library for property-based testing with minimum 100 iterations per test
- Generate random component props to test styling consistency
- Test theme switching with random component configurations
- Test component composition with random child components
- Test error handling with random error scenarios
- Each property-based test will be tagged with format: **Feature: ui-component-architecture-refactoring, Property {number}: {property_text}**

### Integration Testing
- Test component integration within feature components
- Test theme provider integration across component tree
- Test error boundary integration and error recovery
- Test responsive behavior across different screen sizes

### Testing Requirements
- All new components must have comprehensive unit tests
- Property-based tests must validate universal properties across all inputs
- Integration tests must verify component composition and theme integration
- Tests must validate both light and dark theme compatibility