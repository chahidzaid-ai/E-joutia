// MapScreen — interactive map for choosing the search center.
//
// This is the heart of the "manual location selection" feature. It merges the
// teammate's map UI (feat/map-ui-integration: the Circle overlay, ListingMarker
// and QuickPreviewModal) with our existing backend + location services so the
// user can pick where to search in three ways:
//
//   1. MANUAL  — tap anywhere on the map (or drag the pin) to set the center.
//   2. GPS     — tap the locate button to center on the device's position.
//   3. (RANDOM fallback lives in NearbyListingsScreen when no center is set.)
//
// A light-blue, semi-transparent circle is centered on the chosen point and
// resizes live as the radius slider moves. Listings inside the radius are
// fetched live from our backend and shown as markers; tapping one opens a
// quick-preview sheet. "Search this area" hands { latitude, longitude, radius }
// back to the app to show the full results list.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import Slider from "@react-native-community/slider";

import ListingMarker from "../components/ListingMarker";
import QuickPreviewModal from "../components/QuickPreviewModal";
import { fetchNearbyListings } from "../services/api";
import {
  PermissionStatus,
  ensureLocation,
} from "../services/locationService";
import { colors, radius as r, spacing } from "../theme";

// Fallback center (Tangier) used when we open the map without a GPS fix.
const DEFAULT_CENTER = { latitude: 35.7595, longitude: -5.834 };

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;

// How long to wait after the user stops moving the pin / slider before we
// refetch listings, so we don't spam the backend on every tiny change.
const FETCH_DEBOUNCE_MS = 400;

// Convert a radius in km into a sensible zoom (latitude/longitude delta) so the
// whole circle stays comfortably in view.
function deltaForRadius(radiusKm) {
  // ~111 km per degree of latitude; show ~3x the diameter.
  const delta = (radiusKm / 111) * 3;
  return Math.min(Math.max(delta, 0.02), 1.5);
}

export default function MapScreen({
  initialLocation = null,
  initialRadius = 10,
  onConfirm,
  onBack,
}) {
  const [center, setCenter] = useState(initialLocation || DEFAULT_CENTER);
  const [searchRadius, setSearchRadius] = useState(initialRadius);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [locating, setLocating] = useState(false);

  const [selectedListing, setSelectedListing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mapRef = useRef(null);
  const debounceRef = useRef(null);
  // Monotonic token so a slow in-flight request can't overwrite a newer one.
  const requestIdRef = useRef(0);

  const initialRegion = {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: deltaForRadius(searchRadius),
    longitudeDelta: deltaForRadius(searchRadius),
  };

  // ---- Live listings fetch (debounced) whenever center/radius changes ----
  const loadListings = useCallback(async (lat, lng, rad) => {
    const requestId = ++requestIdRef.current;
    setLoadingListings(true);
    try {
      const data = await fetchNearbyListings({
        latitude: lat,
        longitude: lng,
        radius: rad,
      });
      // Ignore stale responses.
      if (requestId === requestIdRef.current) {
        setListings(Array.isArray(data) ? data : []);
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setListings([]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingListings(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      loadListings(center.latitude, center.longitude, searchRadius);
    }, FETCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [center.latitude, center.longitude, searchRadius, loadListings]);

  // ---- Map interactions ----
  const moveCenter = useCallback((coordinate, recenterMap = false) => {
    setCenter(coordinate);
    // Picking a new center invalidates the open preview.
    setModalVisible(false);
    setSelectedListing(null);
    if (recenterMap && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: deltaForRadius(searchRadius),
          longitudeDelta: deltaForRadius(searchRadius),
        },
        500
      );
    }
  }, [searchRadius]);

  const handleMapPress = (event) => {
    moveCenter(event.nativeEvent.coordinate);
  };

  const handleUseGps = async () => {
    setLocating(true);
    const result = await ensureLocation();
    setLocating(false);
    if (result.status === PermissionStatus.GRANTED) {
      moveCenter(
        { latitude: result.latitude, longitude: result.longitude },
        true
      );
    }
  };

  const handleMarkerPress = (listing) => {
    setSelectedListing(listing);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedListing(null);
  };

  const handleConfirm = () => {
    onConfirm?.({
      latitude: center.latitude,
      longitude: center.longitude,
      radius: searchRadius,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Live, light-blue, semi-transparent search-area circle. */}
        {searchRadius > 0 && (
          <Circle
            center={center}
            radius={searchRadius * 1000} // km -> meters
            strokeColor={colors.searchCircleStroke}
            fillColor={colors.searchCircleFill}
            strokeWidth={2}
          />
        )}

        {/* Draggable center pin (the chosen search point). */}
        <Marker
          coordinate={center}
          draggable
          onDragEnd={(e) => moveCenter(e.nativeEvent.coordinate)}
          pinColor={colors.primary}
          title="Search center"
          description="Drag or tap the map to move"
        />

        {/* Listings currently inside the radius. */}
        {listings.map((listing) => (
          <ListingMarker
            key={String(listing.id)}
            listing={listing}
            isSelected={selectedListing?.id === listing.id}
            onPress={() => handleMarkerPress(listing)}
          />
        ))}
      </MapView>

      {/* Top bar: back + live result count. */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.iconButton} onPress={onBack} hitSlop={10}>
          <Text style={styles.iconButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.countBadge}>
          {loadingListings ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.countText}>
              {listings.length} item{listings.length === 1 ? "" : "s"} · {searchRadius} km
            </Text>
          )}
        </View>
      </View>

      {/* GPS / locate button. */}
      <TouchableOpacity
        style={styles.gpsButton}
        onPress={handleUseGps}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.gpsButtonText}>📍</Text>
        )}
      </TouchableOpacity>

      {/* Bottom control sheet: radius slider + confirm. */}
      <View style={styles.sheet}>
        <Text style={styles.hint}>
          Tap the map or drag the pin to choose where to search.
        </Text>

        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Search Radius</Text>
          <Text style={styles.sliderValue}>{searchRadius} km</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={MIN_RADIUS_KM}
          maximumValue={MAX_RADIUS_KM}
          step={1}
          value={searchRadius}
          onValueChange={setSearchRadius}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Search this area</Text>
        </TouchableOpacity>
      </View>

      <QuickPreviewModal
        listing={selectedListing}
        visible={modalVisible}
        onClose={handleCloseModal}
        onViewMore={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginRight: spacing.md,
  },
  iconButtonText: { fontSize: 28, color: colors.text, lineHeight: 30 },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: r.pill,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  countText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  gpsButton: {
    position: "absolute",
    right: spacing.lg,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  gpsButtonText: { fontSize: 22 },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 8,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabel: { fontSize: 15, fontWeight: "600", color: colors.text },
  sliderValue: { fontSize: 15, fontWeight: "700", color: colors.primary },
  slider: { width: "100%", height: 40, marginBottom: spacing.sm },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: r.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  confirmText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
