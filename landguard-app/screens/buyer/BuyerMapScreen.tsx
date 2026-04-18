import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { propertiesAPI } from '../../lib/api';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Accra fallback centre
const ACCRA: Region = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

interface BuyerMapScreenProps {
  navigation: any;
}

const BuyerMapScreen: React.FC<BuyerMapScreenProps> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    requestUserLocation();
    fetchProperties();
  }, []);

  const requestUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      // permission denied or unavailable — keep Accra fallback
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.data.data || mockMapProperties);
    } catch {
      setProperties(mockMapProperties);
    } finally {
      setLoading(false);
    }
  };

  const centerOnUser = () => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.placeholderContainer}>
          <Text style={[styles.placeholderTitle, isDark && styles.textDark]}>
            🗺️ Map Not Configured
          </Text>
          <Text style={[styles.placeholderText, isDark && styles.textMutedDark]}>
            To enable the map, set your Google Maps API key:
          </Text>
          <Text style={[styles.placeholderCode, isDark && styles.codeDark]}>
            EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
          </Text>
          <Text style={[styles.placeholderText, isDark && styles.textMutedDark]}>
            in your <Text style={styles.bold}>landguard-app/.env</Text> file.{'\n\n'}
            Get a key at{' '}
            <Text style={styles.link}>console.cloud.google.com</Text>
            {' '}and enable{'\n'}
            &quot;Maps SDK for Android&quot; and &quot;Maps SDK for iOS&quot;.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const initialRegion: Region = userLocation
    ? { ...userLocation, latitudeDelta: 0.1, longitudeDelta: 0.1 }
    : ACCRA;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your location"
            pinColor="#3b82f6"
          />
        )}

        {/* Property markers */}
        {properties.map((property) => {
          const lat = property.center?.[0] ?? property.location?.coordinates?.[1] ?? property.lat;
          const lng = property.center?.[1] ?? property.location?.coordinates?.[0] ?? property.lng;
          if (!lat || !lng) return null;
          return (
            <Marker
              key={property._id ?? property.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={property.title ?? property.name}
              description={`₵${property.price}`}
              onPress={() =>
                navigation.navigate('PropertyDetail', {
                  propertyId: property._id ?? property.id,
                })
              }
            />
          );
        })}
      </MapView>

      {/* Center-on-me button */}
      {userLocation && (
        <TouchableOpacity
          style={[styles.locateButton, isDark && styles.locateButtonDark]}
          onPress={centerOnUser}
          activeOpacity={0.8}
        >
          <Text style={styles.locateButtonText}>📍</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const mockMapProperties = [
  { id: '1', name: 'Teshie Plot',  center: [5.6037, -0.187],  price: 85000  },
  { id: '2', name: 'Tema Plot',    center: [5.6724,  0.0088], price: 150000 },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  map: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  placeholderCode: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    color: '#1d4ed8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
  },
  textDark: {
    color: '#f9fafb',
  },
  textMutedDark: {
    color: '#9ca3af',
  },
  codeDark: {
    backgroundColor: '#1f2937',
    color: '#60a5fa',
  },
  bold: {
    fontWeight: '600',
  },
  link: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  locateButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locateButtonDark: {
    backgroundColor: '#1f2937',
  },
  locateButtonText: {
    fontSize: 22,
  },
});

export default BuyerMapScreen;


