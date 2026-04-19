import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  useColorScheme,
  TouchableOpacity,
  Text,
  Image,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, glass, shadows, borderRadius } from '@/lib/theme';

/* ─── Base Card ─────────────────────────────────────────── */

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevated = true,
  accessibilityLabel,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const inner = (
    <Animated.View
      style={[
        styles.card,
        isDark && styles.cardDark,
        elevated && shadows.md,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      {inner}
    </View>
  );
};

/* ─── Glass Card ────────────────────────────────────────── */

interface GlassCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  depth?: 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
}

/**
 * Frosted-glass card.
 * On iOS it uses a fallback semi-transparent surface since expo-blur is not
 * installed. On Android a similar rgba approach is used.
 * Includes Reanimated press-scale animation and layered shadows for 3-D depth.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  depth = 'md',
  accessibilityLabel,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const depthShadow = { sm: shadows.sm, md: shadows.lg, lg: shadows.deep }[depth];
  const glassStyle = isDark ? glass.dark : glass.light;

  const inner = (
    <Animated.View
      style={[
        glassStyle,
        depthShadow,
        styles.glassInner,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      {inner}
    </View>
  );
};

/* ─── Parcel Card ───────────────────────────────────────── */

interface ParcelCardProps {
  id: string;
  name: string;
  price: number;
  size: number;
  location: string;
  status: 'available' | 'under_offer' | 'sold' | 'disputed';
  verified: boolean;
  image?: string;
  onPress?: () => void;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({
  id,
  name,
  price,
  size,
  location,
  status,
  verified,
  image,
  onPress,
}) => {
  const getStatusColor = (s: string): string => {
    const map: Record<string, string> = {
      available:   colors.emerald,
      under_offer: colors.amber,
      sold:        '#6366f1',
      disputed:    colors.crimson,
    };
    return map[s] ?? colors.gray['500'];
  };

  return (
    <Card onPress={onPress} style={styles.parcelCard} accessibilityLabel={`Property: ${name}, ${location}`}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.parcelImage}
          resizeMode="cover"
          accessibilityLabel={`Image of ${name}`}
        />
      ) : (
        <View style={[styles.parcelImage, { backgroundColor: colors.gray['200'] }]}
          accessible={false}
        />
      )}

      <View style={styles.parcelContent}>
        <View style={styles.parcelHeader}>
          <Text style={styles.parcelName} numberOfLines={1} allowFontScaling>
            {name}
          </Text>
          {verified && (
            <Text
              style={styles.verifiedBadge}
              accessibilityLabel="Verified property"
              allowFontScaling
            >
              ✓ Verified
            </Text>
          )}
        </View>

        <Text style={styles.location} numberOfLines={1} allowFontScaling>
          {location}
        </Text>

        <View style={styles.parcelDetails}>
          <Text style={styles.price} allowFontScaling>
            ₵{price.toLocaleString()}
          </Text>
          <Text style={styles.size} allowFontScaling>
            {size} m²
          </Text>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}
          accessibilityLabel={`Status: ${status.replace('_', ' ')}`}
        >
          <Text style={styles.statusText} allowFontScaling>
            {status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
    </Card>
  );
};

/* ─── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: 12,
  },
  cardDark: {
    backgroundColor: colors.dark.surface,
  },
  glassInner: {
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  parcelCard: {
    overflow: 'hidden',
    padding: 0,
  },
  parcelImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.gray['200'],
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    marginBottom: 0,
  },
  parcelContent: {
    flex: 1,
    padding: 12,
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  parcelName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#d1fae5',
    color: colors.emeraldDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  parcelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  size: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});

