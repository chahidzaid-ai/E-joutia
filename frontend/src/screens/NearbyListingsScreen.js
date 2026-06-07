// NearbyListingsScreen — renders the results returned by the backend.
//
// Receives { latitude, longitude, radius } and calls the API service.
// Shows a Facebook Marketplace–style 2-column grid with a location header.

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ListingCard from "../components/ListingCard";
import { fetchNearbyListings } from "../services/api";
import { colors, radius as r, spacing } from "../theme";

// Demo area where the sample listings live (Tangier). Used as a fallback so
// products are always shown even when the user's real GPS location has none.
const DEMO_LOCATION = { latitude: 35.76, longitude: -5.83 };
const FALLBACK_RADIUS_KM = 100;

export default function NearbyListingsScreen({ params, onBack }) {
  const { latitude, longitude, radius } = params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);
  const [usedFallback, setUsedFallback] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsedFallback(false);
    try {
      let lat = latitude;
      let lng = longitude;
      let fallback = false;

      // No GPS location? Start from the demo area.
      if (lat == null || lng == null) {
        lat = DEMO_LOCATION.latitude;
        lng = DEMO_LOCATION.longitude;
        fallback = true;
      }

      let data = await fetchNearbyListings({
        latitude: lat,
        longitude: lng,
        radius: fallback ? FALLBACK_RADIUS_KM : radius,
      });

      // Real location returned nothing nearby -> fall back to the demo area
      // so the user always sees products.
      if ((!data || data.length === 0) && !fallback) {
        data = await fetchNearbyListings({
          latitude: DEMO_LOCATION.latitude,
          longitude: DEMO_LOCATION.longitude,
          radius: FALLBACK_RADIUS_KM,
        });
        fallback = true;
      }

      setListings(data || []);
      setUsedFallback(fallback);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          "Could not reach the server. Check your API URL and that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radius]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onBack} hitSlop={10}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLocation} numberOfLines={1}>
            📍 Tangier, Morocco · {radius} km
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Finding items near you…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.muted}>
            No products available right now. Pull to retry.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.column}
          renderItem={({ item }) => <ListingCard listing={item} />}
          ListHeaderComponent={
            <View>
              {usedFallback && (
                <View style={styles.banner}>
                  <Text style={styles.bannerText}>
                    Showing sample products near Tangier (no items found at your
                    exact location).
                  </Text>
                </View>
              )}
              <Text style={styles.resultsCount}>
                {listings.length} result{listings.length === 1 ? "" : "s"} nearby
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: {
    fontSize: 30,
    color: colors.text,
    width: 24,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerLocation: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  muted: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: r.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  listContent: {
    padding: spacing.sm,
  },
  column: {
    justifyContent: "space-between",
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  banner: {
    backgroundColor: "#E7F3FF",
    borderRadius: r.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    marginTop: spacing.sm,
  },
  bannerText: {
    fontSize: 13,
    color: colors.primaryDark,
  },
});
