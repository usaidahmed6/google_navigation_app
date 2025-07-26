import {LocationData, RouteData} from '../types/navigation';

const GOOGLE_API_KEY = 'AIzaSyAfyaSB4Rgd0p9PECIrPHz0Z-FVUnkq-FU';
const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';

export const calculateRoute = async (
  origin: LocationData,
  destination: LocationData
): Promise<RouteData> => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    
    const url = `${DIRECTIONS_API_URL}?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_API_KEY}&mode=driving`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Directions API error: ${data.status}`);
    }
    
    const route = data.routes[0];
    const leg = route.legs[0];
    
    // Decode polyline points
    const coordinates = decodePolyline(route.overview_polyline.points);
    
    return {
      coordinates,
      distance: leg.distance.value, // in meters
      duration: leg.duration.value, // in seconds
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
        distance: step.distance.value,
        duration: step.duration.value,
        startLocation: {
          latitude: step.start_location.lat,
          longitude: step.start_location.lng,
        },
        endLocation: {
          latitude: step.end_location.lat,
          longitude: step.end_location.lng,
        },
      })),
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
};

// Function to decode Google's polyline encoding
const decodePolyline = (encoded: string): Array<{latitude: number; longitude: number}> => {
  const points: Array<{latitude: number; longitude: number}> = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};