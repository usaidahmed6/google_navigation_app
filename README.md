# Google Maps Navigation App

A React Native CLI application that provides turn-by-turn navigation using Google Maps SDK and react-native-paper for UI components.

## 🚀 Features

### Core Features
- 📍 **Google Places Autocomplete** for origin/destination selection
- 🗺️ **Real-time Google Maps integration** with route visualization
- 🧭 **Turn-by-turn navigation** with voice instructions
- 📱 **Material Design UI** using react-native-paper
- 📍 **Real-time location tracking** with high accuracy
- ⏱️ **ETA and distance calculations**
- 🚗 **Route visualization** with polylines
- 🎯 **Current location detection** with GPS button

### Bonus Features
- 🔄 **Live rerouting support** - automatically recalculates route when user deviates
- 🚗 **Current speed tracking** - displays real-time speed in km/h
- 📏 **Distance to next turn** - shows precise distance to upcoming maneuver
- 🔊 **Text-to-Speech** - voice navigation instructions
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
- The app will switch to navigation mode with voice instructions

### 4. Navigation Features
- **Voice Instructions**: Turn-by-turn voice guidance
- **Speed Display**: Real-time speed in the top-right corner
- **Distance to Turn**: Shows distance to next maneuver
- **Live Rerouting**: Automatically recalculates route if you deviate
- **Stop Navigation**: Use the red "Stop Navigation" button to end

### 5. Navigation Controls
- **Back Button**: Pressing back during navigation will prompt to stop navigation
- **Screen Orientation**: Automatically locks to portrait during navigation
- **Keep Awake**: Screen stays on during navigation

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
- **Theme**: Modify `src/theme/navigationTheme.ts` for custom colors
- **Voice Language**: Change TTS language in `NavigationScreen.tsx`
- **Rerouting Threshold**: Adjust deviation threshold in `NavigationService.ts`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LocationSearchInput.tsx
│   ├── MapPreview.tsx
│   ├── NavigationInstructions.tsx
│   ├── NavigationStats.tsx
│   ├── Speedometer.tsx
│   └── ...
├── screens/            # Main app screens
│   ├── SearchScreen.tsx
│   └── NavigationScreen.tsx
├── services/           # API and business logic
│   ├── NavigationService.ts
│   └── directionsService.ts
├── context/            # React Context for state management
│   └── NavigationContext.tsx
├── types/              # TypeScript type definitions
│   └── navigation.ts
└── theme/              # UI theme configuration
    └── navigationTheme.ts
```

## 🎯 Key Features Implementation

### Live Rerouting
- Monitors user's position relative to planned route
- Automatically detects deviations (>100m from route)
- Recalculates route from current location to destination
- Provides voice feedback during rerouting

### Speed Tracking
- Uses device GPS for real-time speed
- Converts m/s to km/h for display
- Updates navigation state with current speed
- Displays in prominent speedometer component

### Distance to Next Turn
- Calculates precise distance to upcoming maneuver
- Updates in real-time as user moves
- Displays in navigation instructions
- Triggers next instruction when approaching turn

## 🐛 Troubleshooting

### Common Issues

1. **Location Permission Denied**
   - Go to Settings > Apps > Navigation App > Permissions
   - Enable "Location" permission

2. **Maps Not Loading**
   - Check internet connection
   - Verify Google Maps API key is valid
   - Ensure required APIs are enabled

3. **Voice Instructions Not Working**
   - Check device volume
   - Verify TTS is enabled in device settings
   - Restart the app

4. **Route Calculation Fails**
   - Check internet connection
   - Verify origin and destination are valid
   - Try different locations

## 📝 Assumptions and Limitations

### Assumptions
- User has stable internet connection for API calls
- Device has GPS capabilities
- User grants location permissions
- Android 6.0+ for full functionality

### Limitations
- Requires internet connection for route calculation
- Voice instructions in English only
- Rerouting has 3-second delay to prevent excessive API calls
- Speed accuracy depends on device GPS quality

## 🎥 Demo Video

The app demonstrates:
- Location permission handling
- Origin/destination selection with autocomplete
- Route calculation and display
- Turn-by-turn navigation with voice instructions
- Live rerouting when deviating from route
- Real-time speed tracking
- Distance to next turn display

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Maps Platform for APIs
- React Native community for excellent libraries
- React Native Paper for beautiful UI components
