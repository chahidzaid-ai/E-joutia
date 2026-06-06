import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import ListingMarker from '../components/ListingMarker';
import QuickPreviewModal from '../components/QuickPreviewModal';

const LATITUDE_DELTA = 0.015;
const LONGITUDE_DELTA = 0.015;

export default function MapScreen({ userLocation, filteredListings }) {
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (userLocation && mapRef.current) {
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
  }, [userLocation]);

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
        latitude: 33.5731,
        longitude: -7.5898,
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
        {filteredListings.map((listing) => (
          <ListingMarker
            key={listing.id}
            listing={listing}
            onPress={() => handleMarkerPress(listing)}
          />
        ))}
      </MapView>

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
});
