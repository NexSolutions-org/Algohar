/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Free and doesn't require an API key
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocode an address to get latitude and longitude coordinates
 * @param address - The address to geocode
 * @returns Promise with coordinates or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address || address.trim() === '') {
    return null;
  }

  try {
    // Use OpenStreetMap Nominatim API (free, no API key required)
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Al Gohar Foundation Website', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error('Geocoding failed:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Generate OpenStreetMap embed URL with coordinates
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param zoom - Zoom level (default: 15)
 * @returns OpenStreetMap embed URL
 */
export function getOpenStreetMapEmbedUrl(
  latitude: number,
  longitude: number,
  zoom: number = 15
): string {
  // Calculate bounding box for the map view
  const latDelta = 0.01; // Approximately 1km
  const lonDelta = 0.01;
  
  const bbox = [
    longitude - lonDelta, // min lon
    latitude - latDelta,  // min lat
    longitude + lonDelta, // max lon
    latitude + latDelta,  // max lat
  ].join('%2C');

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}

/**
 * Generate OpenStreetMap view URL with coordinates
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param zoom - Zoom level (default: 17)
 * @returns OpenStreetMap view URL
 */
export function getOpenStreetMapViewUrl(
  latitude: number,
  longitude: number,
  zoom: number = 17
): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;
}

/**
 * Generate Google Maps search URL with address
 * @param address - The address to search for
 * @returns Google Maps search URL
 */
export function getGoogleMapsSearchUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

