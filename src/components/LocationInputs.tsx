import React, {useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {LocationData, RouteData} from '../types/navigation';
import {calculateRoute} from '../services/directionsService';

interface LocationInputsProps {
  origin: LocationData | null;
  destination: LocationData | null;
  onOriginSelect: (location: LocationData) => void;
  onDestinationSelect: (location: LocationData) => void;
  onRouteCalculated: (route: RouteData) => void;
}

const GOOGLE_API_KEY = 'AIzaSyAfyaSB4Rgd0p9PECIrPHz0Z-FVUnkq-FU';

const LocationInputs: React.FC<LocationInputsProps> = ({
  origin,
  destination,
  onOriginSelect,
  onDestinationSelect,
  onRouteCalculated,
}) => {
  const originRef = useRef<any>(null);
  const destinationRef = useRef<any>(null);

  const handleOriginSelect = (data: any, details: any) => {
    const location: LocationData = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: data.description,
    };
    onOriginSelect(location);
    calculateRouteIfReady(location, destination);
  };

  const handleDestinationSelect = (data: any, details: any) => {
    const location: LocationData = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: data.description,
    };
    onDestinationSelect(location);
    calculateRouteIfReady(origin, location);
  };

  const calculateRouteIfReady = async (
    originLoc: LocationData | null,
    destLoc: LocationData | null
  ) => {
    if (originLoc && destLoc) {
      try {
        const route = await calculateRoute(originLoc, destLoc);
        onRouteCalculated(route);
      } catch (error) {
        console.log('Route calculation error:', error);
      }
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Navigation Setup
        </Text>
        
        <View style={styles.inputContainer}>
          <Text variant="labelMedium" style={styles.label}>
            From
          </Text>
          <GooglePlacesAutocomplete
            ref={originRef}
            placeholder="Enter origin"
            onPress={handleOriginSelect}
            query={{
              key: GOOGLE_API_KEY,
              language: 'en',
            }}
            fetchDetails={true}
            styles={{
              textInputContainer: styles.textInputContainer,
              textInput: styles.textInput,
              listView: styles.listView,
            }}
            textInputProps={{
              value: origin?.address || '',
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text variant="labelMedium" style={styles.label}>
            To
          </Text>
          <GooglePlacesAutocomplete
            ref={destinationRef}
            placeholder="Enter destination"
            onPress={handleDestinationSelect}
            query={{
              key: GOOGLE_API_KEY,
              language: 'en',
            }}
            fetchDetails={true}
            styles={{
              textInputContainer: styles.textInputContainer,
              textInput: styles.textInput,
              listView: styles.listView,
            }}
            textInputProps={{
              value: destination?.address || '',
            }}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#666',
  },
  textInputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    borderRadius: 8,
  },
  listView: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
  },
});

export default LocationInputs;