# Google Maps Navigation App

A React Native CLI application that provides turn-by-turn navigation using Google Maps SDK and react-native-paper for UI components.

## 🚀 Features

### Core Features
- 📍 **Google Places Autocomplete** for origin/destination selection
- 🗺️ **Real-time Google Maps integration** with route visualization
- 📱 **Material Design UI** using react-native-paper
- 📍 **Real-time location tracking** with high accuracy
- ⏱️ **ETA and distance calculations**
- 🚗 **Route visualization** with polylines
- 🎯 **Current location detection** with GPS button

### Bonus Features
- 🔄 **Live rerouting support** - automatically recalculates route when user deviates
- 🚗 **Current speed tracking** - displays real-time speed in km/h
- 📏 **Distance to next turn** - shows precise distance to upcoming maneuver
- 🎨 **Modern UI** - beautiful gradient headers and smooth animations

## 📋 Prerequisites

- Node.js (>= 18)
- React Native CLI
- Android Studio with Android SDK
- Java Development Kit (JDK 11 or higher)
- Google Maps API Key with the following APIs enabled:
  - Maps SDK for Android
  - Places API
  - Directions API
  - Geolocation API

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd google_navigation_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Android Setup**
   ```bash
   # For Android, make sure you have Android Studio and SDK installed
   # The Google Maps API key is already configured in android/app/src/main/AndroidManifest.xml
   ```

4. **iOS Setup (if needed)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## 🚀 Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## 📱 Usage Instructions

### 1. Location Permission
- The app will request location permission on first launch
- Grant "Allow all the time" permission for best navigation experience

### 2. Setting Origin and Destination
- **Origin**: Tap the "From" field and either:
  - Use the GPS button to set current location
  - Type an address and select from autocomplete suggestions
- **Destination**: Tap the "Where to?" field and type your destination

### 3. Starting Navigation
- Once both origin and destination are set, a route will be calculated
- Tap the "Start Navigation" button to begin turn-by-turn navigation
- The app will switch to navigation mode

### 4. Navigation Features
- **Speed Display**: Real-time speed in the top-right corner
- **Distance to Turn**: Shows distance to next maneuver
- **Live Rerouting**: Automatically recalculates route if you deviate
- **Stop Navigation**: Use the red "Stop Navigation" button to end

## 🔧 Configuration

### Google Maps API Key
The app is pre-configured with a Google Maps API key. If you need to use your own:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the required APIs:
   - Maps SDK for Android
   - Places API
   - Directions API
   - Geolocation API
3. Replace the API key in `android/app/src/main/AndroidManifest.xml`

### Customization
- **Theme**: Modify `src/theme/theme.ts` for custom colors
- **Rerouting Threshold**: Adjust deviation threshold in `navigationService.ts`

## 📁 Project Structure

```
GOOGLE_NAVIGATION_APP/
├── android/
├── ios/
├── src/
│   ├── components/
│   │   ├── LocationInputs.tsx
│   │   ├── MapView.tsx
│   │   ├── NavigationControls.tsx
│   │   ├── NavigationInstructions.tsx
│   │   └── NavigationMapView.tsx
│   ├── services/
│   │   ├── directionsService.ts
│   │   └── navigationService.ts
│   ├── theme/
│   │   └── theme.ts
│   ├── types/
│   │   └── navigation.ts
│   └── NavigationApp.tsx
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── .watchmanconfig
```

## ✅ What I Implemented

- 🌍 Origin and destination selection using **Google Places Autocomplete**.
- 🗺️ Displays the calculated route on **Google Maps**.
- 🧭 Starts **in-app turn-by-turn navigation** using **Google Navigation SDK for Android (v5+)**. **ETA**, **distance**, and **maneuver instructions**.
- 📍 Shows the user's **real-time location**.
- 🔄 Supports **live rerouting**, **current speed tracking**, and **distance to next turn**.
- 🧪 Developed using **functional components**, **React Hooks**, and **modular code** for readability.

## 📝 Assumptions and Limitations

### Assumptions
- User has stable internet connection for API calls
- Device has GPS capabilities
- User grants location permissions
- Android 6.0+ for full functionality

### Limitations
- Requires internet connection for route calculation
- Rerouting has 3-second delay to prevent excessive API calls
- Speed accuracy depends on device GPS quality
