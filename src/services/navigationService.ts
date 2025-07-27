import type { LocationData, RouteStep, NavigationState } from "../types/navigation"

export class NavigationService {
  private currentStepIndex = 0
  private route: RouteStep[] = []
  private isNavigating = false
  private navigationCallbacks: {
    onStepChanged?: (step: RouteStep, index: number) => void
    onNavigationComplete?: () => void
    onReroute?: (newRoute: RouteStep[]) => void
  } = {}

  setRoute(steps: RouteStep[]) {
    this.route = steps
    this.currentStepIndex = 0
  }

  startNavigation(callbacks: typeof this.navigationCallbacks) {
    this.isNavigating = true
    this.navigationCallbacks = callbacks
    this.currentStepIndex = 0
  }

  stopNavigation() {
    this.isNavigating = false
    this.currentStepIndex = 0
    this.navigationCallbacks = {}
  }

  updateLocation(currentLocation: LocationData): NavigationState {
    if (!this.isNavigating || this.route.length === 0) {
      return {
        isNavigating: false,
        currentStepIndex: 0,
      }
    }

    const currentStep = this.route[this.currentStepIndex]
    if (!currentStep) {
      return {
        isNavigating: false,
        currentStepIndex: 0,
      }
    }

    // Calculate distance to next turn
    const distanceToNextTurn = this.calculateDistance(currentLocation, {
      latitude: currentStep.endLocation.latitude,
      longitude: currentStep.endLocation.longitude,
      address: "",
    })

    // Check if we should move to next step (within 50 meters of turn)
    if (distanceToNextTurn < 50 && this.currentStepIndex < this.route.length - 1) {
      this.currentStepIndex++
      const nextStep = this.route[this.currentStepIndex]
      this.navigationCallbacks.onStepChanged?.(nextStep, this.currentStepIndex)
    }

    // Check if navigation is complete
    if (this.currentStepIndex >= this.route.length - 1 && distanceToNextTurn < 20) {
      this.stopNavigation()
      this.navigationCallbacks.onNavigationComplete?.()
      return {
        isNavigating: false,
        currentStepIndex: this.currentStepIndex,
      }
    }

    return {
      isNavigating: true,
      currentStepIndex: this.currentStepIndex,
      distanceToNextTurn,
    }
  }

  getCurrentStep(): RouteStep | null {
    if (this.currentStepIndex < this.route.length) {
      return this.route[this.currentStepIndex]
    }
    return null
  }

  getNextSteps(count = 3): RouteStep[] {
    const nextIndex = this.currentStepIndex + 1
    return this.route.slice(nextIndex, nextIndex + count)
  }

  private calculateDistance(point1: LocationData, point2: LocationData): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180
    const φ2 = (point2.latitude * Math.PI) / 180
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Simulate rerouting when user deviates from route
  checkForRerouting(currentLocation: LocationData, originalRoute: RouteStep[]): boolean {
    if (!this.isNavigating) return false

    const currentStep = this.getCurrentStep()
    if (!currentStep) return false

    // Check if user is significantly off route (more than 200 meters)
    const distanceToRoute = this.calculateDistanceToRoute(currentLocation, currentStep)

    if (distanceToRoute > 200) {
      // Trigger rerouting
      this.triggerRerouting(currentLocation)
      return true
    }

    return false
  }

  private calculateDistanceToRoute(location: LocationData, step: RouteStep): number {
    // Simplified calculation - distance to step's start location
    return this.calculateDistance(location, {
      latitude: step.startLocation.latitude,
      longitude: step.startLocation.longitude,
      address: "",
    })
  }

  private triggerRerouting(currentLocation: LocationData) {
    // In a real implementation, this would call the Directions API again
    // For now, we'll just notify that rerouting is needed
    console.log("Rerouting needed from:", currentLocation)
    // this.navigationCallbacks.onReroute?.(newRoute);
  }
}

export const navigationService = new NavigationService()
