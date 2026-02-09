// frontend/src/app/services/geocoding.ts

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    country_code?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Geocodes an address string using OpenStreetMap Nominatim API.
 * @param address The address string to geocode.
 * @returns A promise resolving to { latitude: number, longitude: number } or null if not found.
 */
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!address || address.trim() === '') {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data: NominatimResult[] = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

/**
 * Reverse geocodes coordinates (latitude, longitude) to get country code using OpenStreetMap Nominatim API.
 * @param latitude The latitude.
 * @param longitude The longitude.
 * @returns A promise resolving to the country code (e.g., "SG") or null if not found.
 */
export async function reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<string | null> {
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`
    );
    const data: NominatimResult = await response.json();

    if (data && data.address && data.address.country_code) {
      return data.address.country_code.toUpperCase();
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}
