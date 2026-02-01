/**
 * OpenStreetMap Geocoding Utility
 * Uses Nominatim API for free geocoding services
 * No API key required
 */

export interface SearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  boundingbox: [string, string, string, string];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchOptions {
  limit?: number;
  countrycodes?: string; // ISO 3166-1alpha2 country codes, comma-separated
  viewbox?: string; // left,top,right,bottom
  bounded?: boolean;
}

/**
 * Search for locations using Nominatim API
 * @param query - Search query string
 * @param options - Optional search parameters
 * @returns Promise resolving to array of search results
 */
export async function searchLocation(
  query: string,
  options: LocationSearchOptions = {}
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const {
    limit = 5,
    countrycodes = 'in', // Default to India for Rakshak Sindoor
    viewbox,
    bounded = false,
  } = options;

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: limit.toString(),
    addressdetails: '1',
  });

  if (countrycodes) {
    params.append('countrycodes', countrycodes);
  }

  if (viewbox) {
    params.append('viewbox', viewbox);
    params.append('bounded', bounded ? '1' : '0');
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'RakshakSindoor/1.0', // Required by Nominatim usage policy
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results: SearchResult[] = await response.json();
    return results;
  } catch (error) {
    console.error('Location search failed:', error);
    return [];
  }
}

/**
 * Reverse geocode coordinates to address
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise resolving to search result with address
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<SearchResult | null> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json',
    addressdetails: '1',
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'RakshakSindoor/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding error: ${response.status}`);
    }

    const result: SearchResult = await response.json();
    return result;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate distance and return formatted string
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Formatted distance string (e.g., "1.2 km" or "850 m")
 */
export function formatDistance(
  coord1: Coordinates,
  coord2: Coordinates
): string {
  const distanceKm = calculateDistance(coord1, coord2);

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }

  return `${distanceKm} km`;
}

/**
 * Find nearest location from a list of locations
 * @param origin - Origin coordinates
 * @param locations - Array of locations with coordinates
 * @returns Nearest location with distance
 */
export function findNearest<T extends { position: [number, number] }>(
  origin: Coordinates,
  locations: T[]
): { location: T; distance: number; distanceFormatted: string } | null {
  if (locations.length === 0) return null;

  let nearest = locations[0];
  let minDistance = calculateDistance(origin, {
    latitude: locations[0].position[0],
    longitude: locations[0].position[1],
  });

  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(origin, {
      latitude: locations[i].position[0],
      longitude: locations[i].position[1],
    });

    if (distance < minDistance) {
      minDistance = distance;
      nearest = locations[i];
    }
  }

  return {
    location: nearest,
    distance: minDistance,
    distanceFormatted: formatDistance(origin, {
      latitude: nearest.position[0],
      longitude: nearest.position[1],
    }),
  };
}

/**
 * Calculate ETA (estimated time of arrival)
 * @param distanceKm - Distance in kilometers
 * @param speedKmh - Average speed in km/h (default: walking speed 5 km/h)
 * @returns Formatted ETA string
 */
export function calculateETA(distanceKm: number, speedKmh: number = 5): string {
  const hours = distanceKm / speedKmh;
  const minutes = Math.round(hours * 60);

  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const displayHours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;

  if (displayMinutes === 0) {
    return `${displayHours} ${displayHours === 1 ? 'hour' : 'hours'}`;
  }

  return `${displayHours}h ${displayMinutes}m`;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Parse coordinate string to Coordinates object
 * @param coordString - Coordinate string in format "lat,lon"
 * @returns Coordinates object or null if invalid
 */
export function parseCoordinates(coordString: string): Coordinates | null {
  const parts = coordString.split(',').map(s => parseFloat(s.trim()));
  
  if (parts.length !== 2 || parts.some(isNaN)) {
    return null;
  }

  const [latitude, longitude] = parts;

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude };
}

/**
 * Format coordinates for display
 * @param coords - Coordinates object
 * @param precision - Number of decimal places (default: 4)
 * @returns Formatted coordinate string
 */
export function formatCoordinates(
  coords: Coordinates,
  precision: number = 4
): string {
  return `${coords.latitude.toFixed(precision)}, ${coords.longitude.toFixed(precision)}`;
}

/**
 * Check if coordinates are within Kashmir region bounds
 * @param coords - Coordinates to check
 * @returns True if coordinates are within Kashmir region
 */
export function isWithinKashmirRegion(coords: Coordinates): boolean {
  // Kashmir region approximate bounds
  const bounds = {
    north: 36.0,
    south: 32.0,
    east: 76.5,
    west: 73.5,
  };

  return (
    coords.latitude >= bounds.south &&
    coords.latitude <= bounds.north &&
    coords.longitude >= bounds.west &&
    coords.longitude <= bounds.east
  );
}
