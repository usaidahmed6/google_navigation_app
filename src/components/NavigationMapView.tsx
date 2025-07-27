"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { StyleSheet, View, TouchableOpacity, Dimensions, StatusBar } from "react-native"
import { Text } from "react-native-paper"
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
  const [remainingTime, setRemainingTime] = useState("")
  const [remainingDistance, setRemainingDistance] = useState("")

  useEffect(() => {
    if (isNavigating && currentLocation && mapRef.current && mapReady) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        500,
      )
    }
  }, [currentLocation, isNavigating, mapReady])

  useEffect(() => {
    if (route) {
      // Calculate remaining time and distance
      const avgSpeed = currentSpeed > 5 ? currentSpeed : 40 // Default 40 km/h
      const timeInHours = route.distance / 1000 / avgSpeed
      const timeInMinutes = Math.round(timeInHours * 60)

      if (timeInMinutes >= 60) {
        const hours = Math.floor(timeInMinutes / 60)
        const mins = timeInMinutes % 60
        setRemainingTime(`${hours}h ${mins}m`)
      } else {
        setRemainingTime(`${timeInMinutes} min`)
      }

      if (route.distance >= 1000) {
        setRemainingDistance(`${(route.distance / 1000).toFixed(1)} km`)
      } else {
        setRemainingDistance(`${Math.round(route.distance)} m`)
      }
    }
  }, [route, currentSpeed])

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
    if (lowerInstruction.includes("merge")) return "merge"
    if (lowerInstruction.includes("exit")) return "exit-to-app"
    return "navigation"
  }

  const handleRecenterLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        500,
      )
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />

      {/* Full Screen Map */}
      <MapViewComponent
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={false}
        showsMyLocationButton={false}
        followsUserLocation={false}
        {...({ showsTraffic: true } as any)}
        showsBuildings={false}
        showsIndoors={false}
        mapType="standard"
        onMapReady={() => setMapReady(true)}
        customMapStyle={[
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ]}
      >
        {/* Current Location Marker */}
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
              <View style={styles.locationPulse} />
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
          >
            <View style={styles.destinationMarker}>
              <View style={styles.destinationPin}>
                <Icon name="place" size={20} color="#ffffff" />
              </View>
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#4285F4"
            strokeWidth={8}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapViewComponent>

      {/* Compact Navigation Instruction Card - Top */}
      <View style={styles.topInstructionCard}>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="menu" size={20} color="#5F6368" />
        </TouchableOpacity>

        <View style={styles.instructionContent}>
          {currentStep && (
            <>
              <View style={styles.mainInstruction}>
                <Text style={styles.distanceText}>{formatDistance(distanceToNextTurn)}</Text>
                <View style={styles.instructionRow}>
                  <Icon name={getInstructionIcon(currentStep.instruction)} size={20} color="#1976D2" />
                  <Text style={styles.instructionText} numberOfLines={1}>
                    {currentStep.instruction}
                  </Text>
                </View>
              </View>

              {/* Next Step Preview */}
              {nextSteps.length > 0 && (
                <View style={styles.nextStepRow}>
                  <Icon name="refresh" size={14} color="#5F6368" />
                  <Text style={styles.nextStepText} numberOfLines={1}>
                    Then {nextSteps[0].instruction.toLowerCase()}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        <TouchableOpacity onPress={onStopNavigation} style={styles.closeButton}>
          <Icon name="close" size={20} color="#5F6368" />
        </TouchableOpacity>
      </View>

      {/* Compact Route Info Card */}
      <View style={styles.routeInfoCard}>
        <View style={styles.routeInfoItem}>
          <Text style={styles.routeInfoValue}>{remainingTime}</Text>
          <Text style={styles.routeInfoLabel}>ETA</Text>
        </View>
        <View style={styles.routeInfoItem}>
          <Text style={styles.routeInfoValue}>{remainingDistance}</Text>
          <Text style={styles.routeInfoLabel}>remaining</Text>
        </View>
      </View>

      {/* Speed Display - Bottom Left */}
      <View style={styles.speedContainer}>
        <View style={styles.speedCard}>
          <Text style={styles.speedValue}>{Math.round(currentSpeed)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      </View>

      {/* Control Buttons - Bottom Right */}
      <View style={styles.controlButtons}>
        {/* Recenter Button */}
        <TouchableOpacity style={styles.controlButton} onPress={handleRecenterLocation}>
          <Icon name="my-location" size={20} color="#5F6368" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  locationPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(66, 133, 244, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(66, 133, 244, 0.3)",
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4285F4",
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  directionArrow: {
    position: "absolute",
    top: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4285F4",
  },
  destinationMarker: {
    alignItems: "center",
  },
  destinationPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EA4335",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  topInstructionCard: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
    maxHeight: 80,
  },
  menuButton: {
    padding: 4,
    marginRight: 8,
  },
  instructionContent: {
    flex: 1,
  },
  mainInstruction: {
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 2,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 14,
    color: "#3C4043",
    marginLeft: 8,
    flex: 1,
  },
  nextStepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  nextStepText: {
    fontSize: 12,
    color: "#5F6368",
    marginLeft: 6,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  routeInfoCard: {
    position: "absolute",
    top: 130,
    left: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  routeInfoItem: {
    alignItems: "center",
    marginRight: 16,
  },
  routeInfoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3C4043",
  },
  routeInfoLabel: {
    fontSize: 10,
    color: "#5F6368",
    marginTop: 1,
  },
  speedContainer: {
    position: "absolute",
    bottom: 100,
    left: 16,
  },
  speedCard: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  speedValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3C4043",
  },
  speedUnit: {
    fontSize: 10,
    color: "#5F6368",
    marginTop: 1,
  },
  controlButtons: {
    position: "absolute",
    bottom: 100,
    right: 16,
  },
  controlButton: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
})

export default NavigationMapView
