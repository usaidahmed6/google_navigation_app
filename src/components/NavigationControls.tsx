import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Button, Text, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RouteData} from '../types/navigation';

interface NavigationControlsProps {
  canStartNavigation: boolean;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  route: RouteData | null;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  canStartNavigation,
  isNavigating,
  onStartNavigation,
  onStopNavigation,
  route,
}) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        {route && (
          <View style={styles.routeInfo}>
            <View style={styles.routeStats}>
              <Chip icon="clock-outline" style={styles.chip}>
                {formatDuration(route.duration)}
              </Chip>
              <Chip icon="map-marker-distance" style={styles.chip}>
                {formatDistance(route.distance)}
              </Chip>
            </View>
            
            {isNavigating && (
              <View style={styles.navigationInfo}>
                <Text variant="titleSmall" style={styles.navigationText}>
                  🧭 Navigation Active
                </Text>
                <Text variant="bodySmall" style={styles.instructionText}>
                  Follow the blue route on the map
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!isNavigating ? (
            <Button
              mode="contained"
              onPress={onStartNavigation}
              disabled={!canStartNavigation}
              style={[
                styles.button,
                canStartNavigation ? styles.startButton : styles.disabledButton,
              ]}
              contentStyle={styles.buttonContent}
              icon={({size, color}) => (
                <Icon name="navigation" size={size} color={color} />
              )}
            >
              Start Navigation
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={onStopNavigation}
              style={[styles.button, styles.stopButton]}
              contentStyle={styles.buttonContent}
              icon={({size, color}) => (
                <Icon name="stop" size={size} color={color} />
              )}
            >
              Stop Navigation
            </Button>
          )}
        </View>

        {!canStartNavigation && (
          <Text variant="bodySmall" style={styles.helpText}>
            Select origin and destination to start navigation
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  routeInfo: {
    marginBottom: 16,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#e3f2fd',
  },
  navigationInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigationText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  instructionText: {
    color: '#2e7d32',
    marginTop: 4,
  },
  buttonContainer: {
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default NavigationControls;