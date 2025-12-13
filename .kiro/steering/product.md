# Cluj Bus App - Product Overview

A real-time bus tracking application for Cluj-Napoca, Romania, using Tranzy API as the single data source for both live vehicle tracking and schedule information.

## Core Features
- **Live Vehicle Tracking**: Real-time bus locations and ETAs via Tranzy API
- **Schedule Data**: GTFS-compliant schedule information from Tranzy API
- **Smart Favorites**: Location-aware route tracking (work/home directions)
- **Mobile-First Design**: Responsive Material Design interface
- **Offline Support**: Service worker for offline functionality

## Data Sources Priority (Tranzy API Only)
1. **🔴 LIVE Vehicle Data** (Highest Priority) - Real-time GPS positions with calculated ETAs
2. **⏱️ ESTIMATED Schedule Data** (Fallback Priority) - GTFS schedule data from `/stop_times` endpoint

**Architecture**: Single-source approach using only Tranzy API for reliability and consistency.

## Key User Flows
- API key setup and validation
- Location-based configuration (home/work)
- Favorite route management with intelligent direction detection
- Real-time bus tracking with confidence indicators

## Technical Goals
- Reliability through multiple data source fallbacks
- Performance with intelligent caching and auto-refresh
- User experience with clear confidence indicators and error handling