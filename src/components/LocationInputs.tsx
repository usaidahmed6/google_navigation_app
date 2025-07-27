"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native"
import { Card, Text, ActivityIndicator, Button } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { LocationData, RouteData } from "../types/navigation"
import { calculateRoute } from "../services/directionsService"

interface LocationInputsProps {
  origin: LocationData | null
  destination: LocationData | null
  onOriginSelect: (location: LocationData) => void
  onDestinationSelect: (location: LocationData) => void
  onRouteCalculated: (route: RouteData) => void
  currentLocation: LocationData | null
}

const GOOGLE_API_KEY = "AIzaSyAfyaSB4Rgd0p9PECIrPHz0Z-FVUnkq-FU"

const LocationInputs: React.FC<LocationInputsProps> = ({
  origin,
  destination,
  onOriginSelect,
  onDestinationSelect,
  onRouteCalculated,
  currentLocation,
}) => {
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [originText, setOriginText] = useState("")
  const [destinationText, setDestinationText] = useState("")
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)

  // Search for places using Google Places API
  const searchPlaces = async (query: string): Promise<any[]> => {
    if (query.length < 2) return []

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query,
        )}&key=${GOOGLE_API_KEY}&types=geocode&language=en`,
      )
      const data = await response.json()

      if (data.status === "OK") {
        return data.predictions || []
      }
      return []
    } catch (error) {
      console.log("Places search error:", error)
      return []
    }
  }

  // Get place details
  const getPlaceDetails = async (placeId: string): Promise<LocationData | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_API_KEY}`,
      )
      const data = await response.json()

      if (data.status === "OK" && data.result) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
          address: data.result.formatted_address,
        }
      }
      return null
    } catch (error) {
      console.log("Place details error:", error)
      return null
    }
  }

  // Handle origin text change
  const handleOriginTextChange = useCallback(async (text: string) => {
    setOriginText(text)
    if (text.length >= 2) {
      const suggestions = await searchPlaces(text)
      setOriginSuggestions(suggestions)
      setShowOriginSuggestions(true)
    } else {
      setOriginSuggestions([])
      setShowOriginSuggestions(false)
    }
  }, [])

  // Handle destination text change
  const handleDestinationTextChange = useCallback(async (text: string) => {
    setDestinationText(text)
    if (text.length >= 2) {
      const suggestions = await searchPlaces(text)
      setDestinationSuggestions(suggestions)
      setShowDestinationSuggestions(true)
    } else {
      setDestinationSuggestions([])
      setShowDestinationSuggestions(false)
    }
  }, [])

  // Handle origin selection
  const handleOriginSelect = async (suggestion: any) => {
    const location = await getPlaceDetails(suggestion.place_id)
    if (location) {
      setOriginText(suggestion.description)
      onOriginSelect(location)
      setShowOriginSuggestions(false)

      // Auto-calculate route if destination exists
      if (destination) {
        await calculateRouteIfReady(location, destination)
      }
    }
  }

  // Handle destination selection
  const handleDestinationSelect = async (suggestion: any) => {
    const location = await getPlaceDetails(suggestion.place_id)
    if (location) {
      setDestinationText(suggestion.description)
      onDestinationSelect(location)
      setShowDestinationSuggestions(false)

      // Auto-calculate route if origin exists
      if (origin) {
        await calculateRouteIfReady(origin, location)
      }
    }
  }

  const calculateRouteIfReady = async (originLoc: LocationData, destLoc: LocationData) => {
    if (originLoc && destLoc) {
      setIsCalculatingRoute(true)
      try {
        const route = await calculateRoute(originLoc, destLoc)
        onRouteCalculated(route)
        Alert.alert("Route Found", "Route calculated successfully! You can now start navigation.")
      } catch (error) {
        console.log("Route calculation error:", error)
        Alert.alert("Route Error", "Failed to calculate route. Please try again.")
      } finally {
        setIsCalculatingRoute(false)
      }
    }
  }

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setOriginText("Current Location")
      onOriginSelect(currentLocation)
      setShowOriginSuggestions(false)
    } else {
      Alert.alert("Location Error", "Current location not available. Please enable GPS.")
    }
  }

  const handleSwapLocations = () => {
    if (origin && destination) {
      // Swap the locations
      const tempOrigin = originText
      const tempDestination = destinationText

      setOriginText(tempDestination)
      setDestinationText(tempOrigin)

      onOriginSelect(destination)
      onDestinationSelect(origin)
    }
  }

  const clearOrigin = () => {
    setOriginText("")
    onOriginSelect(null)
    setShowOriginSuggestions(false)
  }

  const clearDestination = () => {
    setDestinationText("")
    onDestinationSelect(null)
    setShowDestinationSuggestions(false)
  }

  // Update text when locations change externally
  useEffect(() => {
    if (origin && origin.address !== originText) {
      setOriginText(origin.address)
    }
  }, [origin])

  useEffect(() => {
    if (destination && destination.address !== destinationText) {
      setDestinationText(destination.address)
    }
  }, [destination])

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Plan Your Route
          </Text>
          {isCalculatingRoute && <ActivityIndicator size="small" color="#2196F3" />}
        </View>

        {/* Origin Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Icon name="my-location" size={20} color="#4CAF50" />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Choose starting point"
              value={originText}
              onChangeText={handleOriginTextChange}
              onFocus={() => {
                if (originSuggestions.length > 0) {
                  setShowOriginSuggestions(true)
                }
              }}
              placeholderTextColor="#999"
            />
            {origin && (
              <TouchableOpacity onPress={clearOrigin} style={styles.clearButton}>
                <Icon name="clear" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            style={styles.currentLocationButton}
            disabled={!currentLocation}
          >
            <Icon name="gps-fixed" size={16} color={currentLocation ? "#2196F3" : "#ccc"} />
            <Text style={[styles.currentLocationText, !currentLocation && styles.disabled]}>Use current location</Text>
          </TouchableOpacity>

          {/* Origin Suggestions */}
          {showOriginSuggestions && originSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {originSuggestions.slice(0, 5).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleOriginSelect(suggestion)}
                >
                  <Icon name="place" size={16} color="#666" style={styles.suggestionIcon} />
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {suggestion.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Swap Button */}
        {origin && destination && (
          <View style={styles.swapContainer}>
            <TouchableOpacity onPress={handleSwapLocations} style={styles.swapButton}>
              <Icon name="swap-vert" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
        )}

        {/* Destination Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Icon name="place" size={20} color="#F44336" />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Choose destination"
              value={destinationText}
              onChangeText={handleDestinationTextChange}
              onFocus={() => {
                if (destinationSuggestions.length > 0) {
                  setShowDestinationSuggestions(true)
                }
              }}
              placeholderTextColor="#999"
            />
            {destination && (
              <TouchableOpacity onPress={clearDestination} style={styles.clearButton}>
                <Icon name="clear" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Destination Suggestions */}
          {showDestinationSuggestions && destinationSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {destinationSuggestions.slice(0, 5).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleDestinationSelect(suggestion)}
                >
                  <Icon name="place" size={16} color="#666" style={styles.suggestionIcon} />
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {suggestion.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Route Status */}
        {origin && destination && (
          <View style={styles.routeStatus}>
            <Icon name="route" size={16} color="#4CAF50" />
            <Text style={styles.routeStatusText}>
              {isCalculatingRoute ? "Calculating route..." : "Route ready for navigation"}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setOriginText("")
              setDestinationText("")
              onOriginSelect(null)
              onDestinationSelect(null)
              setShowOriginSuggestions(false)
              setShowDestinationSuggestions(false)
            }}
            style={styles.quickActionButton}
            compact
          >
            Clear All
          </Button>
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
    color: "#212121",
  },
  inputWrapper: {
    marginBottom: 16,
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 56,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: "#2196F3",
    marginLeft: 8,
    fontWeight: "500",
  },
  disabled: {
    color: "#ccc",
  },
  suggestionsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 8,
    marginTop: 4,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  swapContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  swapButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    padding: 8,
  },
  routeStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  routeStatusText: {
    fontSize: 14,
    color: "#2e7d32",
    marginLeft: 8,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  quickActionButton: {
    marginHorizontal: 8,
  },
})

export default LocationInputs
