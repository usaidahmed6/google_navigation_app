import type React from "react"
import { View, StyleSheet } from "react-native"
import { Card, Button, Text, Chip } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { RouteData } from "../types/navigation"

interface NavigationControlsProps {
  canStartNavigation: boolean
  isNavigating: boolean
  onStartNavigation: () => void
  onStopNavigation: () => void
  route: RouteData | null
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  canStartNavigation,
  isNavigating,
  onStartNavigation,
  onStopNavigation,
  route,
}) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        {route && (
          <View style={styles.routeInfo}>
            <Text variant="titleSmall" style={styles.routeTitle}>
              Route Information
            </Text>
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
                <Icon name="navigation" size={20} color="#2e7d32" />
                <Text variant="titleSmall" style={styles.navigationText}>
                  Navigation Active
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
              style={[styles.button, canStartNavigation ? styles.startButton : styles.disabledButton]}
              contentStyle={styles.buttonContent}
              icon={({ size, color }) => <Icon name="navigation" size={size} color={color} />}
            >
              Start Navigation
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={onStopNavigation}
              style={[styles.button, styles.stopButton]}
              contentStyle={styles.buttonContent}
              icon={({ size, color }) => <Icon name="stop" size={size} color={color} />}
            >
              Stop Navigation
            </Button>
          )}
        </View>

        {!canStartNavigation && (
          <Text variant="bodySmall" style={styles.helpText}>
            {!route ? "Select origin and destination to calculate route" : "Route ready - tap Start Navigation"}
          </Text>
        )}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
    backgroundColor: "#ffffff",
  },
  routeInfo: {
    marginBottom: 16,
  },
  routeTitle: {
    marginBottom: 12,
    fontWeight: "bold",
    color: "#212121",
  },
  routeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  chip: {
    backgroundColor: "#e3f2fd",
  },
  navigationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  navigationText: {
    color: "#2e7d32",
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonContainer: {
    marginBottom: 8,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#f44336",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  helpText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
  },
})

export default NavigationControls
