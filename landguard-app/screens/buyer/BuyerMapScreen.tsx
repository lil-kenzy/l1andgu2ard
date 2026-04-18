import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { propertiesAPI } from '../../lib/api';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface BuyerMapScreenProps {
  navigation: any;
}

const BuyerMapScreen: React.FC<BuyerMapScreenProps> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.data.data || mockMapProperties);
    } catch (error) {
      setProperties(mockMapProperties);
    } finally {
      setLoading(false);
    }
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
            "Maps SDK for Android" and "Maps SDK for iOS".
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 5.6037,
          longitude: -0.1870,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            coordinate={{
              latitude: property.center[0],
              longitude: property.center[1],
            }}
            title={property.name}
            description={`₵${property.price}`}
            onPress={() =>
              navigation.navigate('PropertyDetail', { propertyId: property.id })
            }
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
};

const mockMapProperties = [
  {
    id: '1',
    name: 'Teshie Plot',
    center: [5.6037, -0.1870],
    price: 85000,
  },
  {
    id: '2',
    name: 'Tema Plot',
    center: [5.6724, 0.0088],
    price: 150000,
  },
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
});

export default BuyerMapScreen;

