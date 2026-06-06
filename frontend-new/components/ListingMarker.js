import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import categories from '../constants/categories';
import colors from '../constants/colors';

export default function ListingMarker({ listing, onPress }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const category = categories[listing.category] || categories.other;
  const markerColor = category.color || colors.markers.other;
  const emoji = category.emoji || '📦';

  return (
    <Marker
      coordinate={{
        latitude: listing.latitude,
        longitude: listing.longitude,
      }}
      onPress={onPress}
      calloutEnabled={false}
    >
      <Animated.View
        style={[
          styles.markerContainer,
          {
            backgroundColor: markerColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.arrow} />
      </Animated.View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
  },
});
