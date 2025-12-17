# Debug Utilities

This directory contains debug-related code that was moved out of the main `src` directory to keep the production codebase clean.

## Contents

### Components (`components/`)
- `DebugPanel.tsx` - General debug panel for development
- `DebugFavorites.tsx` - Debug component for favorite buses
- `NearbyViewDebugPanel.tsx` - Debug panel for nearby view troubleshooting

### Hooks (`hooks/`)
- `useDebugNearbyView.ts` - Debug hook for nearby view data inspection

### Utilities (`utils/`)
- `nearbyViewDebugger.ts` - Comprehensive nearby view debugging utilities

## Usage

These files are preserved for future debugging needs but are not included in the production build. If you need to debug nearby view issues or other components, you can temporarily move the relevant files back to `src/` and import them as needed.

## Note

These debug utilities were removed from the main codebase as part of the December 2024 cleanup to improve production performance and reduce bundle size.