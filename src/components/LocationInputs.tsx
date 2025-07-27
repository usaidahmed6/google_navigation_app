"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from "react-native"
import { Text, ActivityIndicator } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { LocationData, RouteData } from "../types/navigation"
import { calculateRoute } from "../services/directionsService"

interface LocationInputsProps {
  origin: LocationData | null
  destination: LocationData | null
  onOriginSelect: (location: LocationData | null) => void
  onDestinationSelect: (location: LocationData | null) => void
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
      setOriginText("Your location")
      onOriginSelect(currentLocation)
      setShowOriginSuggestions(false)
    } else {
      Alert.alert("Location Error", "Current location not available. Please enable GPS.")
    }
  }

  const handleSwapLocations = () => {
    if (origin && destination) {
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
    <View style={styles.container}>
      {/* Google Maps Style Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="menu" size={24} color="#5F6368" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Directions</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="account-circle" size={32} color="#4285F4" />
        </TouchableOpacity>
      </View>

      {/* Search Container */}
      <View style={styles.searchContainer}>
        {/* Origin Input */}
        <View style={styles.inputRow}>
          <View style={styles.routeIndicator}>
            <View style={styles.originDot} />
            <View style={styles.routeLine} />
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
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
                placeholderTextColor="#9AA0A6"
              />
              {origin && (
                <TouchableOpacity onPress={clearOrigin} style={styles.clearButton}>
                  <Icon name="clear" size={20} color="#9AA0A6" />
                </TouchableOpacity>
              )}
            </View>

            {/* Current Location Button */}
            <TouchableOpacity
              onPress={handleUseCurrentLocation}
              style={styles.currentLocationButton}
              disabled={!currentLocation}
            >
              <Icon name="my-location" size={16} color={currentLocation ? "#4285F4" : "#ccc"} />
              <Text style={[styles.currentLocationText, !currentLocation && styles.disabled]}>Your location</Text>
            </TouchableOpacity>

            {/* Origin Suggestions */}
            {showOriginSuggestions && originSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsContainer} nestedScrollEnabled>
                {originSuggestions.slice(0, 5).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleOriginSelect(suggestion)}
                  >
                    <Icon name="place" size={20} color="#9AA0A6" style={styles.suggestionIcon} />
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionMainText} numberOfLines={1}>
                        {suggestion.structured_formatting?.main_text || suggestion.description}
                      </Text>
                      <Text style={styles.suggestionSecondaryText} numberOfLines={1}>
                        {suggestion.structured_formatting?.secondary_text || ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Swap Button */}
        {origin && destination && (
          <TouchableOpacity onPress={handleSwapLocations} style={styles.swapButton}>
            <Icon name="swap-vert" size={20} color="#5F6368" />
          </TouchableOpacity>
        )}

        {/* Destination Input */}
        <View style={styles.inputRow}>
          <View style={styles.routeIndicator}>
            <View style={styles.destinationDot} />
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
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
                placeholderTextColor="#9AA0A6"
              />
              {destination && (
                <TouchableOpacity onPress={clearDestination} style={styles.clearButton}>
                  <Icon name="clear" size={20} color="#9AA0A6" />
                </TouchableOpacity>
              )}
            </View>

            {/* Destination Suggestions */}
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsContainer} nestedScrollEnabled>
                {destinationSuggestions.slice(0, 5).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleDestinationSelect(suggestion)}
                  >
                    <Icon name="place" size={20} color="#9AA0A6" style={styles.suggestionIcon} />
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionMainText} numberOfLines={1}>
                        {suggestion.structured_formatting?.main_text || suggestion.description}
                      </Text>
                      <Text style={styles.suggestionSecondaryText} numberOfLines={1}>
                        {suggestion.structured_formatting?.secondary_text || ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>

      {/* Route Status */}
      {isCalculatingRoute && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4285F4" />
          <Text style={styles.loadingText}>Finding the best route...</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EAED",
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#3C4043",
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  routeIndicator: {
    alignItems: "center",
    marginRight: 16,
    marginTop: 16,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4285F4",
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: "#E8EAED",
    marginVertical: 4,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#EA4335",
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#3C4043",
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  currentLocationText: {
    fontSize: 14,
    color: "#4285F4",
    marginLeft: 8,
  },
  disabled: {
    color: "#9AA0A6",
  },
  swapButton: {
    alignSelf: "flex-end",
    marginRight: 16,
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
  },
  suggestionsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F4",
  },
  suggestionIcon: {
    marginRight: 16,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 16,
    color: "#3C4043",
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: "#5F6368",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 16,
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#5F6368",
  },
})

export default LocationInputs
