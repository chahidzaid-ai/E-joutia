import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapScreen from './screens/MapScreen';
import { requestLocationPermission, getCurrentPosition } from './utils/location';
import colors from './constants/colors';

const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Permission de localisation refusee');
        setLoading(false);
        return;
      }

      const position = await getCurrentPosition();
      setUserLocation(position);
      await fetchListings(position.latitude, position.longitude);
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  }

  async function fetchListings(lat, lon) {
    try {
      const url = `${API_BASE_URL}/listings/?user_lat=${lat}&user_lon=${lon}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur reseau');
      }
      const data = await response.json();
      setFilteredListings(data);
    } catch (err) {
      console.error('Fetch listings error:', err);
      setError('Impossible de charger les annonces');
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapScreen
        userLocation={userLocation}
        filteredListings={filteredListings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
