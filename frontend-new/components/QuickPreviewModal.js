import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import colors from '../constants/colors';

const MODAL_HEIGHT = 320;

export default function QuickPreviewModal({ listing, visible, onClose, onViewMore }) {
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!listing) {
    return null;
  }

  const distanceText =
    listing.distance != null ? `A ${listing.distance.toFixed(1)} km de vous` : '';

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.handle} />

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {listing.photo ? (
        <Image source={{ uri: listing.photo }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>Photo produit</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>

        <Text style={styles.price}>
          {listing.price} {listing.currency || 'DH'}
        </Text>

        {distanceText ? <Text style={styles.distance}>{distanceText}</Text> : null}

        <TouchableOpacity style={styles.viewMoreButton} onPress={onViewMore}>
          <Text style={styles.viewMoreText}>Voir plus</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonText: { fontSize: 16, color: colors.text, fontWeight: '600' },
  photo: { width: '100%', height: 120, borderRadius: 12, marginBottom: 12 },
  photoPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoPlaceholderText: { fontSize: 14, color: colors.textSecondary },
  content: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  price: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  distance: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  viewMoreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewMoreText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
