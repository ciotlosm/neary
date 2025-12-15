# Cluj Bus App - User Guide

## 📱 What is Cluj Bus App?

A real-time bus tracking app for Cluj-Napoca that shows you:
- **Live bus locations** with GPS tracking via Tranzy API
- **GTFS schedule data** from Tranzy API
- **Smart route suggestions** based on your location
- **Accurate arrival times** with confidence indicators

## 🎯 Key Features

### 🔴 Live Tracking
See buses moving in real-time on the map with accurate ETAs.

### 📋 Schedule Data
Get departure times from GTFS-compliant schedule data via Tranzy API.

### 🏠 Smart Favorites
The app learns your patterns and suggests relevant routes based on your location.

### 📱 Mobile Optimized
Designed for your phone with touch-friendly controls and fast loading.

## 🚀 How to Use

### First Time Setup

1. **Open the app** at the production URL
2. **Setup Wizard appears** with 2 simple steps:
   - **Step 1**: Enter your Tranzy API key and test it
   - **Step 2**: Select your city (saved permanently)
3. **Complete Setup** - Immediately access the main app
4. **Optional**: Set home/work locations later for enhanced route suggestions

**Note**: The app is fully functional after the 2-step setup. Home and work locations are optional features that can be configured later in Settings.

### Daily Usage

1. **Check your favorites** - routes you use regularly
2. **See live buses** - red dots show real-time positions
3. **Check departure times** - schedule data from Tranzy API
4. **Get directions** - tap routes for detailed information

### Understanding the Interface

#### Status Indicators (Header)
The app header shows your current status with colored chips:

**Internet Connection:**
- 🟢 **"Connected"** - Online with real-time data
- 🔴 **"No Internet"** - Offline, showing cached data only

**Current GPS Location (Device):**
- 🟢 **"GPS Active"** - Device location services working, real-time coordinates available
- 🟡 **"GPS Inactive"** - Device location not available but can be enabled
- 🔴 **"GPS Disabled"** - Device location access denied in browser settings

**Tip**: This shows your device's current GPS status, not your saved home/work locations.

#### Route Display
- **Route Number** (e.g., "42") - the bus line
- **Direction** - where the bus is heading
- **Next Departure** - when the next bus leaves
- **Confidence Level** - how reliable the timing is

#### Confidence Indicators
- **🔴 LIVE** - Real-time GPS tracking (most accurate)
- **⏱️ ESTIMATED** - GTFS schedule data from Tranzy API (less reliable when no live data)

### Adding Favorite Routes

1. **Tap the search icon**
2. **Enter route number** (e.g., "42")
3. **Select your direction** (towards home/work)
4. **Save as favorite** for quick access

### Location-Based Features

The app uses your location to:
- **Show nearby stops** automatically
- **Suggest relevant directions** (home vs work routes)
- **Filter routes** to ones you actually use
- **Calculate walking distances** to stops

## 📍 Route Examples

### Route 42 (Popular Route)
- **Runs**: Pod Traian ↔ Bis.Câmpului
- **Schedule**: Every 30 minutes (06:15 to 21:45)
- **Key Times**: Includes 15:45 departure
- **Live Tracking**: Available during operating hours

### How Timing Works
1. **Live buses** show exact positions and ETAs via Tranzy API
2. **Schedule data** provides GTFS departure times from Tranzy API
3. **Fallback data** used when live tracking unavailable

## 🔧 Settings & Customization

### Common Settings (Top of Settings)
- **Refresh Rate** - how often to update bus data (5-300 seconds)
- **Stale Data Threshold** - when to consider data outdated (1-30 minutes)
- **Fallback Location** - configurable location used when GPS and saved locations unavailable
- **Valid Config indicator** - green chip shows when setup is complete

### Location Settings

#### Three Types of GPS Locations:

**1. Current GPS Location (Device)**
- Your device's real-time location
- Shown in header status indicators
- Used for automatic location updates during refresh
- Requires browser location permission

**2. Home GPS Location (Saved)**
- Your saved home address/coordinates
- Set once in Settings > Config > Location Settings
- Used for intelligent route direction detection
- Optional but recommended for better suggestions

**3. Work GPS Location (Saved)**
- Your saved work address/coordinates  
- Set once in Settings > Config > Location Settings
- Used for intelligent route direction detection
- Optional but recommended for better suggestions

**4. Fallback Location**
- Configurable fallback location for direction detection
- Used when GPS permission denied and no saved locations available
- Set in Settings > Config > Location Settings
- Defaults to Cluj-Napoca center but can be customized to your preferred area

#### Location Priority System
The app uses locations in this priority order for route suggestions:
1. **Current GPS** (if permission granted and available)
2. **Home Location** (if saved and GPS unavailable)
3. **Work Location** (if saved and no home location)
4. **Fallback Location** (configurable fallback, defaults to Cluj center)

#### Location Settings Interface
- **Adaptive 3-column layout** - Home, Work, and Fallback locations in one view
- **GPS status indicator** - Shows "GPS Disabled" chip when location permission denied
- **Smart location picker** - Fallback location doesn't offer "Use Current Location" (it's fallback-only)
- **Coordinate chips** - GPS coordinates displayed as styled chips for better visual appeal
- **Adaptive prominence** - Fallback location becomes less prominent when GPS is available
- **Optional settings** - All locations are optional, app works without any saved locations

#### GPS Permission Management:
- **GPS Status** shown in Settings with current permission state
- **"Use Current Location" buttons** disabled when GPS permission denied
- **Enable in browser settings** if you want to use current location features
- **Privacy**: All location data stays on your device

### Display Options
- **Auto-refresh** - updates based on your refresh rate setting (also refreshes GPS location)
- **Animated refresh button** - circular progress shows time until next refresh
- **Visual cache status** - button color indicates update health
- **Automatic GPS refresh** - location updated every refresh cycle for better accuracy
- **Offline mode** - cached data when no internet

#### Refresh Button Colors
- 🟢 **Green Circle** - Cache updated successfully, counting down to next refresh
- 🔴 **Red Circle** - No cache updates happening (check connection/settings)
- 🟡 **Yellow Circle** - Auto-refresh disabled

#### Theme Control
- **Dark/Light Mode** - Toggle available in Settings > Config tab
- **Automatic detection** - Respects your system theme preference

### API Configuration (Separate Tab)
- **Tranzy API Key** - for live bus tracking data
- **Google Maps API Key** - for enhanced location features
- **City info** - visible in version menu for troubleshooting (set during initial setup)

## 📱 Mobile Tips

### Best Practices
- **Add to home screen** for app-like experience
- **Enable location** for better suggestions
- **Use in landscape** for map view
- **Pull to refresh** for latest data

### Battery Saving
- **Turn off auto-refresh** when not needed
- **Close unused tabs** to save memory
- **Use WiFi** when available for faster updates

## 🚨 Troubleshooting

### Common Issues

#### "No buses found"
- Check if route number is correct
- Verify the route operates at current time
- Try refreshing the data

#### "Location not available"
- Enable location permissions in browser
- Check GPS is turned on
- Try refreshing the page

#### "API key invalid"
- Double-check the key is entered correctly
- Verify the key is active on Tranzy.ai
- Contact support if issues persist

### Getting Help
1. **Check error messages** in the app
2. **Try refreshing** the page
3. **Clear browser cache** if problems persist
4. **Check network connection**

## 🎯 Pro Tips

### Efficient Usage
- **Bookmark favorite routes** for quick access
- **Check schedules in advance** to plan trips
- **Use live tracking** during peak hours
- **Set up home/work locations** for smart suggestions

### Understanding Data
- **Live data** is most accurate but not always available
- **Official schedules** are reliable for planning
- **Estimated times** should be used as rough guides
- **Confidence indicators** help you judge reliability

### Planning Trips
1. **Check departure times** from official schedules
2. **Monitor live buses** for real-time updates
3. **Allow extra time** during peak hours
4. **Have backup routes** in case of delays

---

**Need more help?** Check the [troubleshooting guide](troubleshooting.md) or [developer documentation](developer-guide.md) for technical details.