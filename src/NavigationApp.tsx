"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, StyleSheet, Alert, BackHandler } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { request, PERMISSIONS, RESULTS } from "react-native-permissions"
import Geolocation from "@react-native-community/geolocation"
import LocationInputs from "./components/LocationInputs"
import MapView from "./components/MapView"
import NavigationControls from "./components/NavigationControls"
import NavigationMapView from "./components/NavigationMapView"
import type { LocationData, RouteData, NavigationState } from "./types/navigation"
import { navigationService } from "./services/navigationService"
import { voiceGuidanceService } from "./services/voiceGuidanceService"

const NavigationApp: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [origin, setOrigin] = useState<LocationData | null>(null)
  const [destination, setDestination] = useState<LocationData | null>(null)
  const [route, setRoute] = useState<RouteData | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentStepIndex: 0,
  })
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [eta, setEta] = useState("")

  const lastLocationRef = useRef<LocationData | null>(null)
  const speedCalculationRef = useRef<{ timestamp: number; location: LocationData } | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    requestLocationPermission()

    // Handle back button during navigation
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isNavigating) {
        Alert.alert("Stop Navigation", "Are you sure you want to stop navigation?", [
          { text: "Cancel", style: "cancel" },
          { text: "Stop", onPress: handleStopNavigation },
        ])
        return true
      }
      return false
    })

    return () => backHandler.remove()
  }, [isNavigating])

  useEffect(() => {
    if (locationPermissionGranted) {
      getCurrentLocation()
      startLocationTracking()
    }

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [locationPermissionGranted])

  const startLocationTracking = () => {
    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords
        const newLocation: LocationData = {
          latitude,
          longitude,
          address: "Current Location",
          heading: heading || 0,
        }

        setCurrentLocation(newLocation)

        // Calculate speed if GPS speed is not available
        if (speed !== null && speed >= 0) {
          setCurrentSpeed(speed * 3.6) // Convert m/s to km/h
        } else {
          calculateSpeed(newLocation)
        }

        // Update navigation state
        if (isNavigating && route) {
          const navState = navigationService.updateLocation(newLocation)
          setNavigationState(navState)

          // Check for rerouting
          if (navigationService.checkForRerouting(newLocation, route.steps)) {
            console.log("Rerouting triggered")
            // In a real app, you would recalculate the route here
          }

          // Voice guidance
          const currentStep = navigationService.getCurrentStep()
          if (currentStep && navState.distanceToNextTurn) {
            voiceGuidanceService.announceInstruction(
              currentStep,
              navState.currentStepIndex,
              navState.distanceToNextTurn,
            )
          }
        }

        lastLocationRef.current = newLocation
      },
      (error) => {
        console.log("Location error:", error)
        if (error.code === 1) {
          Alert.alert("Location Permission", "Location permission denied. Please enable location access in settings.")
        } else if (error.code === 2) {
          Alert.alert("Location Error", "Unable to determine location. Please check your GPS settings.")
        } else {
          Alert.alert("Location Error", "Location service temporarily unavailable.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
        distanceFilter: 2, // Update every 2 meters for better navigation
      },
    )
  }

  // Calculate ETA
  useEffect(() => {
    if (route && isNavigating && navigationState.distanceToNextTurn !== undefined) {
      // Calculate remaining distance and time based on current progress
      const remainingDistance = route.distance - (navigationState.distanceToNextTurn || 0)
      const averageSpeed = currentSpeed > 0 ? currentSpeed : 30 // Default 30 km/h if no speed
      const remainingTimeHours = remainingDistance / 1000 / averageSpeed
      const remainingTimeSeconds = remainingTimeHours * 3600

      const etaDate = new Date(Date.now() + remainingTimeSeconds * 1000)
      setEta(etaDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
  }, [route, isNavigating, navigationState, currentSpeed])

  const calculateSpeed = (newLocation: LocationData) => {
    const now = Date.now()
    const lastCalc = speedCalculationRef.current

    if (lastCalc && lastLocationRef.current) {
      const timeDiff = (now - lastCalc.timestamp) / 1000
      if (timeDiff > 1) {
        // Calculate every 1 second for better accuracy
        const distance = calculateDistance(lastCalc.location, newLocation)
        const speedMps = distance / timeDiff
        const speedKmh = speedMps * 3.6

        setCurrentSpeed(Math.max(0, Math.min(speedKmh, 200))) // Cap at 200 km/h
        speedCalculationRef.current = { timestamp: now, location: newLocation }
      }
    } else {
      speedCalculationRef.current = { timestamp: now, location: newLocation }
    }
  }

  const calculateDistance = (point1: LocationData, point2: LocationData): number => {
    const R = 6371e3
    const φ1 = (point1.latitude * Math.PI) / 180
    const φ2 = (point2.latitude * Math.PI) / 180
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const requestLocationPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      if (result === RESULTS.GRANTED) {
        setLocationPermissionGranted(true)
      } else {
        Alert.alert(
          "Location Permission Required",
          "This navigation app requires location access to function properly. Please grant location permission.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Retry", onPress: requestLocationPermission },
            {
              text: "Settings",
              onPress: () => {
                console.log("Open app settings")
              },
            },
          ],
        )
      }
    } catch (error) {
      console.log("Permission error:", error)
      Alert.alert("Error", "Failed to request location permission")
    }
  }

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = {
          latitude,
          longitude,
          address: "Current Location",
        }
        setCurrentLocation(location)
      },
      (error) => {
        console.log("Get current location error:", error)
        Alert.alert("Location Error", "Unable to get current location. Please check your GPS settings.")
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    )
  }

  const handleStartNavigation = () => {
    if (origin && destination && route) {
      Alert.alert("Start Navigation", "Are you ready to start turn-by-turn navigation?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: () => {
            setIsNavigating(true)
            navigationService.setRoute(route.steps)
            navigationService.startNavigation({
              onStepChanged: (step, index) => {
                console.log("Step changed:", step.instruction)
              },
              onNavigationComplete: () => {
                setIsNavigating(false)
                voiceGuidanceService.announceNavigationComplete()
                Alert.alert("Navigation Complete", "You have arrived at your destination!")
              },
              onReroute: (newRoute) => {
                voiceGuidanceService.announceRerouting()
              },
            })
            voiceGuidanceService.announceNavigationStart()
          },
        },
      ])
    } else {
      Alert.alert("Cannot Start Navigation", "Please select both origin and destination to start navigation.")
    }
  }

  const handleStopNavigation = () => {
    setIsNavigating(false)
    navigationService.stopNavigation()
    voiceGuidanceService.reset()
    setNavigationState({
      isNavigating: false,
      currentStepIndex: 0,
    })
    Alert.alert("Navigation Stopped", "Navigation has been stopped.")
  }

  const handleOriginSelect = (location: LocationData | null) => {
    setOrigin(location)
    if (!location) {
      setRoute(null)
    }
  }

  const handleDestinationSelect = (location: LocationData | null) => {
    setDestination(location)
    if (!location) {
      setRoute(null)
    }
  }

  const currentStep = navigationService.getCurrentStep()
  const nextSteps = navigationService.getNextSteps(3)

  // Show full-screen navigation view when navigating
  if (isNavigating) {
    return (
      <SafeAreaView style={styles.navigationContainer}>
        <NavigationMapView
          currentLocation={currentLocation}
          origin={origin}
          destination={destination}
          route={route}
          isNavigating={isNavigating}
          currentSpeed={currentSpeed}
          eta={eta}
          currentStep={currentStep}
          nextSteps={nextSteps}
          distanceToNextTurn={navigationState.distanceToNextTurn || 0}
          onStopNavigation={handleStopNavigation}
        />
      </SafeAreaView>
    )
  }

  // Show regular planning view when not navigating
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LocationInputs
          origin={origin}
          destination={destination}
          onOriginSelect={handleOriginSelect}
          onDestinationSelect={handleDestinationSelect}
          onRouteCalculated={setRoute}
          currentLocation={currentLocation}
        />

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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  navigationContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
  },
})

export default NavigationApp
