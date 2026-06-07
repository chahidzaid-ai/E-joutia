// Location permission + current-position service built on expo-location.
//
// Responsibilities (Member 1):
//   - Request foreground GPS permission.
//   - Retrieve current latitude/longitude.
//   - Reverse-geocode to a human-readable city when possible.
//
// All functions return plain objects so screens can branch on `status`
// without dealing with exceptions.

import * as Location from "expo-location";

export const PermissionStatus = {
  GRANTED: "granted",
  DENIED: "denied",
  ERROR: "error",
};

/**
 * Ask the user for foreground location permission.
 * @returns {Promise<{status: string}>}
 */
export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return {
      status:
        status === "granted"
          ? PermissionStatus.GRANTED
          : PermissionStatus.DENIED,
    };
  } catch (error) {
    return { status: PermissionStatus.ERROR, message: error?.message };
  }
}

/**
 * Get the device's current coordinates.
 * Assumes permission has already been granted.
 * @returns {Promise<{success: boolean, latitude?: number, longitude?: number, message?: string}>}
 */
export async function getCurrentLocation() {
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      success: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    return { success: false, message: error?.message ?? "Unable to get location." };
  }
}

/**
 * Convenience: request permission AND fetch coordinates in one call.
 * @returns {Promise<{status: string, latitude?: number, longitude?: number, message?: string}>}
 */
export async function ensureLocation() {
  const permission = await requestLocationPermission();
  if (permission.status !== PermissionStatus.GRANTED) {
    return permission; // DENIED or ERROR
  }
  const coords = await getCurrentLocation();
  if (!coords.success) {
    return { status: PermissionStatus.ERROR, message: coords.message };
  }
  return {
    status: PermissionStatus.GRANTED,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

/**
 * Reverse-geocode coordinates into a readable "City, Country" label.
 * Returns null if it cannot be resolved (caller should fall back to coords).
 * @returns {Promise<string|null>}
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!results || results.length === 0) return null;
    const place = results[0];
    const city = place.city || place.subregion || place.region;
    const country = place.country;
    return [city, country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}

/**
 * Great-circle distance (Haversine) between two coordinates, in kilometers.
 *
 * Single client-side source for distance math: the map module previously
 * shipped its own copy in `utils/location.js`; that logic now lives here so
 * there is exactly one implementation on the frontend (the backend keeps its
 * own authoritative copy in `listings/utils.py`).
 *
 * @returns {number} distance in km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
