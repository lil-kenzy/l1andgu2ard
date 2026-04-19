import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon, Region, MapType } from 'react-native-maps';
import * as Location from 'expo-location';
import { propertiesAPI } from '../../lib/api';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Ghana overview — shows the whole country on first open
const GHANA_OVERVIEW: Region = {
  latitude: 7.9465,
  longitude: -1.0232,
  latitudeDelta: 7.0,
  longitudeDelta: 5.5,
};

interface BuyerMapScreenProps {
  navigation: any;
}

const BuyerMapScreen: React.FC<BuyerMapScreenProps> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const MAP_TYPES: { key: MapType; label: string }[] = [
    { key: 'standard', label: '🗺️ Roads' },
    { key: 'satellite', label: '🛰️ Satellite' },
    { key: 'terrain', label: '⛰️ Terrain' },
    { key: 'hybrid', label: '🌍 Hybrid' },
  ];

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
      const all: any[] = response.data.data || mockMapProperties;
      // Only display admin-approved (verified) listings on the buyer map
      const verified = all.filter(
        (p) => p.verified === true || p.verificationStatus === 'verified',
      );
      setProperties(verified.length > 0 ? verified : mockMapProperties.filter((p: any) => p.verified !== false));
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

  // Map always opens on Ghana overview; user can tap 📍 to zoom to their location
  const initialRegion: Region = GHANA_OVERVIEW;

  // Color-coded pin by status
  const pinColor = (status?: string) => {
    if (status === 'sold') return '#ef4444';         // 🔴 Sold
    if (status === 'under_offer') return '#f59e0b';  // 🟡 Under Offer
    if (status === 'with_building') return '#3b82f6'; // 🔵 With Building
    return '#16a34a';                                 // 🟢 Available (default)
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        mapType={mapType}
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
          const status = property.status === 'active' ? 'available' : property.status;
          const hasBuilding = property.hasBuilding || property.category === 'residential' || property.withBuilding;
          const effectiveStatus = hasBuilding ? 'with_building' : status;
          // Polygon outline for large parcels (> 500 m²)
          const polygon: [number, number][] | undefined = property.boundary?.coordinates?.[0];

          return (
            <React.Fragment key={property._id ?? property.id}>
              {polygon && polygon.length > 2 && (
                <Polygon
                  coordinates={polygon.map(([lng2, lat2]) => ({ latitude: lat2, longitude: lng2 }))}
                  fillColor="rgba(59,130,246,0.1)"
                  strokeColor={pinColor(effectiveStatus)}
                  strokeWidth={2}
                />
              )}
              <Marker
                coordinate={{ latitude: lat, longitude: lng }}
                title={property.title ?? property.name}
                description={`₵${Number(property.price).toLocaleString()}`}
                pinColor={pinColor(effectiveStatus)}
                onPress={() => setSelectedProperty(property)}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Layer toggle */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.layerBar, isDark && styles.layerBarDark]}
        contentContainerStyle={styles.layerBarContent}
      >
        {MAP_TYPES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.layerBtn, mapType === key && styles.layerBtnActive]}
            onPress={() => setMapType(key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.layerBtnText, mapType === key && styles.layerBtnTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={[styles.legend, isDark && styles.legendDark]}>
        {[
          { color: '#16a34a', label: 'Available' },
          { color: '#ef4444', label: 'Sold' },
          { color: '#f59e0b', label: 'Under Offer' },
          { color: '#3b82f6', label: 'W/ Building' },
        ].map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={[styles.legendText, isDark && styles.textDark]}>{label}</Text>
          </View>
        ))}
      </View>

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

      {/* Bottom sheet preview */}
      {selectedProperty && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedProperty(null)}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedProperty(null)}
          />
          <View style={[styles.bottomSheet, isDark && styles.bottomSheetDark]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, isDark && styles.textDark]} numberOfLines={2}>
              {selectedProperty.title ?? selectedProperty.name}
            </Text>
            {selectedProperty.gpsAddress ? (
              <Text style={[styles.sheetGps, isDark && styles.textMutedDark]}>
                📮 {selectedProperty.gpsAddress}
              </Text>
            ) : null}
            <Text style={styles.sheetPrice}>₵{Number(selectedProperty.price).toLocaleString()}</Text>
            <View style={styles.sheetRow}>
              {selectedProperty.size ? (
                <Text style={[styles.sheetMeta, isDark && styles.textMutedDark]}>
                  📐 {selectedProperty.size} m²
                </Text>
              ) : null}
              {(selectedProperty.location?.district || selectedProperty.location?.region) ? (
                <Text style={[styles.sheetMeta, isDark && styles.textMutedDark]}>
                  📍 {[selectedProperty.location.district, selectedProperty.location.region].filter(Boolean).join(', ')}
                </Text>
              ) : null}
            </View>
            {(selectedProperty.verified || selectedProperty.verificationStatus === 'verified') && (
              <Text style={styles.sheetVerified}>✅ Verified by Lands Commission</Text>
            )}
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetBtn}
                onPress={() => {
                  setSelectedProperty(null);
                  navigation.navigate('PropertyDetail', { propertyId: selectedProperty._id ?? selectedProperty.id });
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetBtnText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetBtn, styles.sheetBtnSecondary]}
                onPress={() => setSelectedProperty(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sheetBtnText, styles.sheetBtnTextSecondary]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const mockMapProperties = [
  { id: '1', name: 'Teshie Plot',  center: [5.6037, -0.187],  price: 85000,  verified: true, status: 'available', location: { district: 'Teshie', region: 'Greater Accra' }, gpsAddress: 'GA-001-1234' },
  { id: '2', name: 'Tema Plot',    center: [5.6724,  0.0088], price: 150000, verified: true, status: 'sold',      location: { district: 'Central', region: 'Tema' }, gpsAddress: 'MA-002-5678' },
  { id: '3', name: 'Kumasi Land',  center: [6.6885, -1.6057], price: 95000,  verified: true, status: 'under_offer', location: { district: 'Oduom', region: 'Ashanti' }, gpsAddress: 'AK-003-9012' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  map: { flex: 1 },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  placeholderTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#111827' },
  placeholderText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 8, lineHeight: 22 },
  placeholderCode: { fontFamily: 'monospace', backgroundColor: '#f3f4f6', color: '#1d4ed8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginBottom: 12, fontSize: 13 },
  textDark: { color: '#f9fafb' },
  textMutedDark: { color: '#9ca3af' },
  codeDark: { backgroundColor: '#1f2937', color: '#60a5fa' },
  bold: { fontWeight: '600' },
  link: { color: '#3b82f6', textDecorationLine: 'underline' },
  // Layer toggle
  layerBar: { position: 'absolute', top: 12, left: 0, right: 0 },
  layerBarDark: {},
  layerBarContent: { paddingHorizontal: 12, gap: 6 },
  layerBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: '#e5e7eb',
  },
  layerBtnActive: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
  layerBtnText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  layerBtnTextActive: { color: '#fff', fontWeight: '700' },
  // Legend
  legend: {
    position: 'absolute', bottom: 84, left: 12,
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7,
  },
  legendDark: { backgroundColor: 'rgba(31,41,55,0.92)' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#374151' },
  // Locate button
  locateButton: {
    position: 'absolute', bottom: 24, right: 16,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  locateButtonDark: { backgroundColor: '#1f2937' },
  locateButtonText: { fontSize: 22 },
  // Bottom sheet
  sheetBackdrop: { flex: 1 },
  bottomSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8,
  },
  bottomSheetDark: { backgroundColor: '#1f2937' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sheetGps: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  sheetPrice: { fontSize: 22, fontWeight: '800', color: '#3b82f6', marginBottom: 8 },
  sheetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 6 },
  sheetMeta: { fontSize: 13, color: '#6b7280' },
  sheetVerified: { fontSize: 13, color: '#059669', fontWeight: '600', marginBottom: 14 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  sheetBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#3b82f6', alignItems: 'center' },
  sheetBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#d1d5db' },
  sheetBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  sheetBtnTextSecondary: { color: '#6b7280' },
});

export default BuyerMapScreen;
