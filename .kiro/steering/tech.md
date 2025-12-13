# Cluj Bus App - Technical Stack

## Core Technologies
- **React 19.2.0** with TypeScript for type safety
- **Vite** as build tool with Rolldown optimization
- **Material-UI (MUI) 7.3.6** for component library and theming
- **Zustand 5.0.9** for lightweight state management
- **Tailwind CSS 4.1.18** for utility-first styling
- **Leaflet + React-Leaflet** for map functionality

## Testing & Quality
- **Vitest** for unit and integration testing
- **Testing Library** for component testing
- **ESLint + TypeScript ESLint** for code quality
- **Fast-check** for property-based testing

## API & Data
- **Axios** for HTTP requests
- **Tranzy API** for all transit data (live vehicles + schedules via proxy)
- **Service Worker** for offline functionality

## Build Configuration
- **Vite config** includes API proxies to avoid CORS
- **Code splitting** with manual chunks for vendors
- **Terser minification** for production builds
- **Source maps disabled** in production for performance

## Common Commands

### Development
```bash
npm run dev          # Start development server (port 5175)
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

## API Proxy Configuration
Development server proxies API requests:
- `/api/tranzy` → `https://api.tranzy.ai` (single data source for all transit data)

## Performance Optimizations
- React deduplication in Vite config
- Manual chunk splitting for vendors
- HMR and WebSocket disabled for stability
- Dependency optimization for core libraries