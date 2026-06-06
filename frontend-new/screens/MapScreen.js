import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import ListingMarker from '../components/ListingMarker';
import QuickPreviewModal from '../components/QuickPreviewModal';
import colors from '../constants/colors';

const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = 0.05;

export default function MapScreen({ userLocation, filteredListings = [], radius = 5 }) {
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null);

  // Center / auto-fit the map whenever location or listings change
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    if (filteredListings.length > 0) {
      const coords = [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        ...filteredListings.map((l) => ({
          latitude: l.latitude,
          longitude: l.longitude,
        })),
      ];
      mapRef.current.fitToCoordinates(coords, {
        // leave room at the bottom so the modal doesn't cover markers
        edgePadding: { top: 80, right: 80, bottom: 320, left: 80 },
        animated: true,
      });
    } else {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        1000
      );
    }
  }, [userLocation, filteredListings]);

  function handleMarkerPress(listing) {
    setSelectedListing(listing);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setSelectedListing(null);
  }

  function handleViewMore() {
    console.log('View more:', selectedListing?.title);
  }

  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    : {
        latitude: 35.7595,
        longitude: -5.834,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Search radius circle (from Membre 1's `radius`) */}
        {userLocation && radius > 0 && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={radius * 1000} // km -> meters
            strokeColor="rgba(30,136,229,0.5)"
            fillColor="rgba(30,136,229,0.1)"
            strokeWidth={2}
          />
        )}

        {/* Listing markers */}
        {(filteredListings || []).map((listing) => (
          <ListingMarker
            key={listing.id}
            listing={listing}
            isSelected={selectedListing?.id === listing.id}
            onPress={() => handleMarkerPress(listing)}
          />
        ))}
      </MapView>

      {/* Count badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {filteredListings.length} annonce
          {filteredListings.length !== 1 ? 's' : ''}
          {radius ? ` · ${radius} km` : ''}
        </Text>
      </View>

      {/* Empty state */}
      {filteredListings.length === 0 && (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyText}>Aucune annonce dans ce rayon</Text>
        </View>
      )}

      <QuickPreviewModal
        listing={selectedListing}
        visible={modalVisible}
        onClose={handleCloseModal}
        onViewMore={handleViewMore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  countBadge: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  countText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  emptyBanner: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyText: { color: colors.white, fontSize: 14 },
});
