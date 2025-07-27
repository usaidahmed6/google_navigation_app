export interface LocationData {
  latitude: number
  longitude: number
  address: string
  heading?: number // Added for direction arrow
}

export interface RouteStep {
  instruction: string
  distance: number // in meters
  duration: number // in seconds
  startLocation: {
    latitude: number
    longitude: number
  }
  endLocation: {
    latitude: number
    longitude: number
  }
}

export interface RouteData {
  coordinates: Array<{ latitude: number; longitude: number }>
  distance: number // total distance in meters
  duration: number // total duration in seconds
  steps: RouteStep[]
}

export interface NavigationState {
  isNavigating: boolean
  currentStepIndex: number
  distanceToNextTurn?: number
  currentSpeed?: number
  eta?: Date
}
