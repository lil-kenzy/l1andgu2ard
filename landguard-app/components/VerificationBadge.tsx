import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { colors, borderRadius } from '@/lib/theme';

interface VerificationBadgeProps {
  /** Whether the entity is verified */
  verified: boolean;
  /** Play stamp animation on mount */
  animate?: boolean;
  style?: object;
}

/**
 * Animated "official stamp" badge.
 * – On mount it plays a scale-from-large + slight rotation spring,
 *   imitating an ink stamp being pressed.
 * – Respects `AccessibilityInfo.isReduceMotionEnabled`.
 * – Announces itself to screen readers.
 */
export function VerificationBadge({
  verified,
  animate = true,
  style,
}: VerificationBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(animate ? 2.5 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const rotateAnim = useRef(new Animated.Value(animate ? -12 : 0)).current;

  useEffect(() => {
    if (!verified || !animate) return;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        scaleAnim.setValue(1);
        opacityAnim.setValue(1);
        rotateAnim.setValue(-12);
        return;
      }

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: -12,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [verified, animate, scaleAnim, opacityAnim, rotateAnim]);

  if (!verified) {
    return (
      <View style={[styles.badge, styles.unverifiedBadge, style]}
        accessible
        accessibilityLabel="Unverified"
        accessibilityRole="text"
      >
        <Text style={[styles.text, styles.unverifiedText]} allowFontScaling>
          Unverified
        </Text>
      </View>
    );
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [-12, 0],
    outputRange: ['-12deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        styles.badge,
        styles.verifiedBadge,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { rotate }],
        },
        style,
      ]}
      accessible
      accessibilityLabel="Verified property"
      accessibilityRole="text"
    >
      <Text style={styles.checkmark} allowFontScaling={false}>✓</Text>
      <Text style={[styles.text, styles.verifiedText]} allowFontScaling>
        Verified
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.35)',
  },
  unverifiedBadge: {
    backgroundColor: colors.gray['100'],
    borderWidth: 1,
    borderColor: colors.gray['300'],
  },
  checkmark: {
    fontSize: 12,
    color: colors.emerald,
    fontWeight: '700',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  verifiedText: {
    color: colors.emeraldDark,
  },
  unverifiedText: {
    color: colors.gray['500'],
  },
});
