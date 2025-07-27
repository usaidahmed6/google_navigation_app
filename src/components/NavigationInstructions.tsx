import type React from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { Card, Text, Chip } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { RouteStep, LocationData } from "../types/navigation"

interface NavigationInstructionsProps {
  currentStep: RouteStep | null
  nextSteps: RouteStep[]
  currentLocation: LocationData | null
  isNavigating: boolean
  distanceToNextTurn: number
  currentSpeed: number
  eta: string
}

const NavigationInstructions: React.FC<NavigationInstructionsProps> = ({
  currentStep,
  nextSteps,
  currentLocation,
  isNavigating,
  distanceToNextTurn,
  currentSpeed,
  eta,
}) => {
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

  if (!isNavigating) {
    return null
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Current Navigation Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Chip icon="speedometer" style={styles.speedChip}>
              {Math.round(currentSpeed)} km/h
            </Chip>
            <Chip icon="clock-outline" style={styles.etaChip}>
              ETA: {eta}
            </Chip>
          </View>
        </View>

        {/* Current Instruction */}
        {currentStep && (
          <View style={styles.currentInstruction}>
            <View style={styles.instructionHeader}>
              <Icon
                name={getInstructionIcon(currentStep.instruction)}
                size={32}
                color="#2196F3"
                style={styles.instructionIcon}
              />
              <View style={styles.instructionText}>
                <Text variant="titleMedium" style={styles.mainInstruction}>
                  {currentStep.instruction}
                </Text>
                <Text variant="bodySmall" style={styles.distanceText}>
                  in {formatDistance(distanceToNextTurn)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Next Steps Preview */}
        {nextSteps.length > 0 && (
          <View style={styles.nextStepsContainer}>
            <Text variant="labelMedium" style={styles.nextStepsTitle}>
              Next Steps:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nextStepsScroll}>
              {nextSteps.slice(0, 3).map((step, index) => (
                <View key={index} style={styles.nextStepItem}>
                  <Icon name={getInstructionIcon(step.instruction)} size={20} color="#666" />
                  <Text variant="bodySmall" style={styles.nextStepText} numberOfLines={2}>
                    {step.instruction}
                  </Text>
                  <Text variant="bodySmall" style={styles.nextStepDistance}>
                    {formatDistance(step.distance)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
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
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  speedChip: {
    backgroundColor: "#e3f2fd",
  },
  etaChip: {
    backgroundColor: "#e8f5e8",
  },
  currentInstruction: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructionIcon: {
    marginRight: 16,
  },
  instructionText: {
    flex: 1,
  },
  mainInstruction: {
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  distanceText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  nextStepsContainer: {
    marginTop: 8,
  },
  nextStepsTitle: {
    marginBottom: 8,
    color: "#666",
  },
  nextStepsScroll: {
    flexDirection: "row",
  },
  nextStepItem: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    minWidth: 100,
    maxWidth: 120,
  },
  nextStepText: {
    textAlign: "center",
    marginVertical: 4,
    color: "#666",
  },
  nextStepDistance: {
    color: "#999",
    fontSize: 10,
  },
})

export default NavigationInstructions
