import React, {useRef, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import MapViewComponent, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {LocationData, RouteData} from '../types/navigation';

interface MapViewProps {
  currentLocation: LocationData | null;
  origin: LocationData | null;
  destination: LocationData | null;
  route: RouteData | null;
  isNavigating: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  currentLocation,
  origin,
  destination,
  route,
  isNavigating,
}) => {
  const mapRef = useRef<MapViewComponent>(null);

  useEffect(() => {
    if (route && mapRef.current) {
      // Fit the map to show the entire route
      const coordinates = route.coordinates;
      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
          animated: true,
        });
      }
    }
  }, [route]);

  useEffect(() => {
    if (isNavigating && currentLocation && mapRef.current) {
      // Center map on current location during navigation
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation, isNavigating]);

  const getInitialRegion = () => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    // Default to a general location if no current location
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  };

  return (
    <View style={styles.container}>
      <MapViewComponent
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={isNavigating}
        showsTraffic={true}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Current Location"
            pinColor="blue"
          />
        )}

        {/* Origin Marker */}
        {origin && (
          <Marker
            coordinate={{
              latitude: origin.latitude,
              longitude: origin.longitude,
            }}
            title="Origin"
            description={origin.address}
            pinColor="green"
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description={destination.address}
            pinColor="red"
          />
        )}

        {/* Route Polyline */}
        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={isNavigating ? "#007AFF" : "#FF6B6B"}
            strokeWidth={4}
            lineDashPattern={isNavigating ? [] : [5, 5]}
          />
        )}
      </MapViewComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapView;
