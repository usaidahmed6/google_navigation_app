"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native"
import { Text, Card } from "react-native-paper"
import MapViewComponent, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { LocationData, RouteData, RouteStep } from "../types/navigation"

interface NavigationMapViewProps {
  currentLocation: LocationData | null
  origin: LocationData | null
  destination: LocationData | null
  route: RouteData | null
  isNavigating: boolean
  currentSpeed: number
  eta: string
  currentStep: RouteStep | null
  nextSteps: RouteStep[]
  distanceToNextTurn: number
  onStopNavigation: () => void
}

const { width, height } = Dimensions.get("window")

const NavigationMapView: React.FC<NavigationMapViewProps> = ({
  currentLocation,
  origin,
  destination,
  route,
  isNavigating,
  currentSpeed,
  eta,
  currentStep,
  nextSteps,
  distanceToNextTurn,
  onStopNavigation,
}) => {
  const mapRef = useRef<MapViewComponent>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (isNavigating && currentLocation && mapRef.current && mapReady) {
      // Center map on current location during navigation with appropriate zoom
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005, // Closer zoom for navigation
          longitudeDelta: 0.005,
        },
        1000,
      )
    }
  }, [currentLocation, isNavigating, mapReady])

  const getInitialRegion = () => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    }
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
  }

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${Math.round(meters)} m`
  }

  const getInstructionIcon = (instruction: string): string => {
    const lowerInstruction = instruction.toLowerCase()
    if (lowerInstruction.includes("left")) return "turn-left"
    if (lowerInstruction.includes("right")) return "turn-right"
    if (lowerInstruction.includes("straight") || lowerInstruction.includes("continue")) return "straight"
    if (lowerInstruction.includes("u-turn")) return "u-turn-left"
    return "navigation"
  }

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <MapViewComponent
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={false} // We'll show custom marker
        showsMyLocationButton={false}
        followsUserLocation={false} // We handle this manually
        showsTraffic={true}
        showsBuildings={true}
        showsIndoors={true}
        mapType="standard"
        onMapReady={() => setMapReady(true)}
      >
        {/* Current Location Marker with Direction */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={currentLocation.heading || 0}
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.locationDot} />
              <View style={styles.directionArrow} />
            </View>
          </Marker>
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
          >
            <View style={styles.destinationMarker}>
              <Icon name="place" size={30} color="#ffffff" />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#007AFF"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapViewComponent>

      {/* Top Navigation Info Panel */}
      <View style={styles.topPanel}>
        <Card style={styles.navigationCard}>
          <Card.Content style={styles.navigationContent}>
            {currentStep && (
              <View style={styles.currentInstruction}>
                <View style={styles.instructionRow}>
                  <Icon name={getInstructionIcon(currentStep.instruction)} size={32} color="#007AFF" />
                  <View style={styles.instructionDetails}>
                    <Text variant="titleMedium" style={styles.instructionText}>
                      {currentStep.instruction}
                    </Text>
                    <Text variant="bodyMedium" style={styles.distanceText}>
                      in {formatDistance(distanceToNextTurn)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Bottom Speed and ETA Panel */}
      <View style={styles.bottomPanel}>
        <Card style={styles.speedCard}>
          <Card.Content style={styles.speedContent}>
            <View style={styles.speedInfo}>
              <View style={styles.speedSection}>
                <Text variant="headlineMedium" style={styles.speedValue}>
                  {Math.round(currentSpeed)}
                </Text>
                <Text variant="bodySmall" style={styles.speedUnit}>
                  km/h
                </Text>
              </View>
              <View style={styles.etaSection}>
                <Text variant="bodySmall" style={styles.etaLabel}>
                  ETA
                </Text>
                <Text variant="titleLarge" style={styles.etaValue}>
                  {eta}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Stop Navigation Button */}
      <TouchableOpacity style={styles.stopButton} onPress={onStopNavigation}>
        <Icon name="close" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Next Steps Preview (if available) */}
      {nextSteps.length > 0 && (
        <View style={styles.nextStepsPanel}>
          <Card style={styles.nextStepsCard}>
            <Card.Content style={styles.nextStepsContent}>
              <Text variant="bodySmall" style={styles.nextStepsTitle}>
                Then:
              </Text>
              <View style={styles.nextStepItem}>
                <Icon name={getInstructionIcon(nextSteps[0].instruction)} size={16} color="#666" />
                <Text variant="bodySmall" style={styles.nextStepText} numberOfLines={1}>
                  {nextSteps[0].instruction}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  directionArrow: {
    position: "absolute",
    top: -2,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#007AFF",
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  topPanel: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
  },
  navigationCard: {
    elevation: 8,
    backgroundColor: "#ffffff",
  },
  navigationContent: {
    paddingVertical: 16,
  },
  currentInstruction: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  instructionDetails: {
    marginLeft: 16,
    flex: 1,
  },
  instructionText: {
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  distanceText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
  },
  speedCard: {
    elevation: 8,
    backgroundColor: "#000000",
  },
  speedContent: {
    paddingVertical: 12,
  },
  speedInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  speedSection: {
    alignItems: "center",
  },
  speedValue: {
    color: "#00FF00",
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  speedUnit: {
    color: "#ffffff",
    marginTop: 4,
  },
  etaSection: {
    alignItems: "center",
  },
  etaLabel: {
    color: "#ffffff",
    marginBottom: 4,
  },
  etaValue: {
    color: "#ffffff",
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  stopButton: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  nextStepsPanel: {
    position: "absolute",
    top: 140,
    left: 16,
    right: 16,
  },
  nextStepsCard: {
    elevation: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  nextStepsContent: {
    paddingVertical: 8,
  },
  nextStepsTitle: {
    color: "#666",
    marginBottom: 4,
  },
  nextStepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextStepText: {
    marginLeft: 8,
    color: "#333",
    flex: 1,
  },
})

export default NavigationMapView
