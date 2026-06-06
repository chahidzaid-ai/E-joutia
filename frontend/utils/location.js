import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * Request location permission from the user.
 * Returns true if permission granted, false otherwise.
 */
export async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission de localisation',
          message: 'E-Joutia a besoin de votre position pour afficher les annonces proches.',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'Autoriser',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }
  // iOS handles permission via Info.plist and system prompt
  return true;
}

/**
 * Get the current device position.
 * Returns a Promise resolving to { latitude, longitude }.
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
