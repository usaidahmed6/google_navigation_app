import type React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Text } from "react-native-paper"
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
    return `${minutes} min`
  }

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  if (!route) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Route Options */}
      <View style={styles.routeOptions}>
        <View style={styles.routeOption}>
          <View style={styles.routeHeader}>
            <View style={styles.routeBadge}>
              <Icon name="directions-car" size={16} color="#ffffff" />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeTime}>{formatDuration(route.duration)}</Text>
              <Text style={styles.routeDistance}>{formatDistance(route.distance)}</Text>
            </View>
            <Text style={styles.routeLabel}>Fastest route</Text>
          </View>
        </View>
      </View>

      {/* Start Navigation Button */}
      <TouchableOpacity
        style={[styles.startButton, !canStartNavigation && styles.disabledButton]}
        onPress={onStartNavigation}
        disabled={!canStartNavigation}
      >
        <Icon name="navigation" size={24} color="#ffffff" />
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>

      {/* Additional Options */}
      <View style={styles.additionalOptions}>
        <TouchableOpacity style={styles.optionButton}>
          <Icon name="more-vert" size={24} color="#5F6368" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EAED",
  },
  routeOptions: {
    marginBottom: 16,
  },
  routeOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#4285F4",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeBadge: {
    backgroundColor: "#4285F4",
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3C4043",
  },
  routeDistance: {
    fontSize: 14,
    color: "#5F6368",
    marginTop: 2,
  },
  routeLabel: {
    fontSize: 12,
    color: "#4285F4",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#4285F4",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: "#E8EAED",
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  additionalOptions: {
    alignItems: "center",
  },
  optionButton: {
    padding: 8,
  },
})

export default NavigationControls
