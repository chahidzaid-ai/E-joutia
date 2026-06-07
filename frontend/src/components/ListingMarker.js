// ListingMarker — a category-colored map pin for a listing.
//
// Ported from the teammate's map module (feat/map-ui-integration) and adapted
// to our single color system (theme.js) and data shape. It is tolerant of
// listings that have no `category` field (our current backend does not store
// one yet): such listings fall back to the neutral "other" marker.

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";

import categories from "../constants/categories";
import { accent, colors } from "../theme";

export default function ListingMarker({ listing, onPress, isSelected = false }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Appear animation + grow when selected.
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.3 : 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, isSelected]);

  const category = categories[listing.category] || categories.other;
  const markerColor = category.color || colors.markers.other;
  const emoji = category.emoji || "📦";

  return (
    <Marker
      coordinate={{
        latitude: listing.latitude,
        longitude: listing.longitude,
      }}
      onPress={onPress}
      calloutEnabled={false}
      tracksViewChanges={false}
    >
      <Animated.View
        style={[
          styles.markerContainer,
          {
            backgroundColor: markerColor,
            borderColor: isSelected ? accent : colors.white,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <View
          style={[
            styles.arrow,
            { borderTopColor: isSelected ? accent : colors.white },
          ]}
        />
      </Animated.View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  emoji: { fontSize: 18 },
  arrow: {
    position: "absolute",
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.white,
  },
});
