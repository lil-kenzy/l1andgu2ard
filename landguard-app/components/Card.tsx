import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  useColorScheme,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevated = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      style={[
        styles.card,
        isDark && styles.cardDark,
        elevated && styles.elevated,
        style,
      ]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
};

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
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      available: '#10b981',
      under_offer: '#f59e0b',
      sold: '#6366f1',
      disputed: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <Card onPress={onPress} style={styles.parcelCard}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.parcelImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.parcelImage, { backgroundColor: '#e5e7eb' }]} />
      )}

      <View style={styles.parcelContent}>
        <View style={styles.parcelHeader}>
          <Text style={styles.parcelName} numberOfLines={1}>
            {name}
          </Text>
          {verified && (
            <Text style={styles.verifiedBadge}>✓ Verified</Text>
          )}
        </View>

        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>

        <View style={styles.parcelDetails}>
          <Text style={styles.price}>₵{price.toLocaleString()}</Text>
          <Text style={styles.size}>{size} m²</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(status) },
          ]}
        >
          <Text style={styles.statusText}>
            {status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parcelCard: {
    overflow: 'hidden',
  },
  parcelImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  parcelContent: {
    flex: 1,
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
    color: '#1f2937',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 13,
    color: '#6b7280',
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
    color: '#3b82f6',
  },
  size: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
