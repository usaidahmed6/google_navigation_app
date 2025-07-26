import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import LocationInputs from './components/LocationInputs';
import MapView from './components/MapView';
import NavigationControls from './components/NavigationControls';
import {LocationData, RouteData} from './types/navigation';

const NavigationApp: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (locationPermissionGranted) {
      getCurrentLocation();
      // Set up location tracking
      const watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setCurrentLocation({
            latitude,
            longitude,
            address: 'Current Location',
          });
        },
        error => console.log('Location error:', error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 10,
        }
      );

      return () => Geolocation.clearWatch(watchId);
    }
  }, [locationPermissionGranted]);

  const requestLocationPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === RESULTS.GRANTED) {
        setLocationPermissionGranted(true);
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission is required for navigation features.'
        );
      }
    } catch (error) {
      console.log('Permission error:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const location = {
          latitude,
          longitude,
          address: 'Current Location',
        };
        setCurrentLocation(location);
        setOrigin(location);
      },
      error => {
        console.log('Get current location error:', error);
        Alert.alert('Error', 'Unable to get current location');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
    );
  };

  const handleStartNavigation = () => {
    if (origin && destination && route) {
      setIsNavigating(true);
    } else {
      Alert.alert('Error', 'Please select both origin and destination');
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* <LocationInputs
          origin={origin}
          destination={destination}
          onOriginSelect={setOrigin}
          onDestinationSelect={setDestination}
          onRouteCalculated={setRoute}
        /> */}
        
        <MapView
          currentLocation={currentLocation}
          origin={origin}
          destination={destination}
          route={route}
          isNavigating={isNavigating}
        />
        
        <NavigationControls
          canStartNavigation={!!(origin && destination && route)}
          isNavigating={isNavigating}
          onStartNavigation={handleStartNavigation}
          onStopNavigation={handleStopNavigation}
          route={route}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
});

export default NavigationApp;