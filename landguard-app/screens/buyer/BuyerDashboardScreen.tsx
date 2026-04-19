import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { propertiesAPI } from '../../lib/api';
import { ParcelCard } from '../../components/Card';

interface BuyerDashboardScreenProps {
  navigation: any;
}

type QuickFilter = 'available' | 'with_building' | 'verified';

const QUICK_FILTERS: { key: QuickFilter; label: string; emoji: string }[] = [
  { key: 'available', label: 'Available Now', emoji: '🟢' },
  { key: 'with_building', label: 'With Building', emoji: '🏠' },
  { key: 'verified', label: 'Verified Sellers', emoji: '✅' },
];

const BuyerDashboardScreen: React.FC<BuyerDashboardScreenProps> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<QuickFilter[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchProperties = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { limit: 20 };
      if (activeFilters.includes('available')) params.status = 'active';
      if (activeFilters.includes('verified')) params.verified = true;
      if (activeFilters.includes('with_building')) params.hasBuilding = true;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const response = await propertiesAPI.getAll(params);
      const data: any[] = response.data.data || mockProperties;
      setProperties(data);
      // Featured = first 4 verified listings
      setFeatured(data.filter((p: any) => p.verified || p.verificationStatus === 'verified').slice(0, 4));
    } catch {
      setProperties(mockProperties);
      setFeatured(mockProperties.slice(0, 2));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProperties().then(() => setRefreshing(false));
  }, [fetchProperties]);

  const toggleFilter = (key: QuickFilter) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  };

  const handleSearch = () => fetchProperties();

  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, isDark && styles.textDark]}>Welcome Back 👋</Text>
        <Text style={[styles.subtitle, isDark && styles.textMuted]}>Find your perfect land in Ghana</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Region, District, Land Type, Price…"
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Quick filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {QUICK_FILTERS.map(({ key, label, emoji }) => {
          const active = activeFilters.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, active && styles.filterChipActive, isDark && styles.filterChipDark, active && isDark && styles.filterChipActiveDark]}
              onPress={() => toggleFilter(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {emoji} {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Featured listings */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>⭐ Featured Listings</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featured.map((item) => (
              <TouchableOpacity
                key={item._id ?? item.id}
                style={[styles.featuredCard, isDark && styles.featuredCardDark]}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item._id ?? item.id })}
                activeOpacity={0.85}
              >
                <Text style={[styles.featuredName, isDark && styles.textDark]} numberOfLines={2}>
                  {item.title ?? item.name}
                </Text>
                <Text style={styles.featuredPrice}>
                  ₵{Number(item.price).toLocaleString()}
                </Text>
                <Text style={[styles.featuredLocation, isDark && styles.textMuted]} numberOfLines={1}>
                  📍 {[item.location?.district, item.location?.region].filter(Boolean).join(', ') || item.gpsAddress || '—'}
                </Text>
                {(item.verified || item.verificationStatus === 'verified') && (
                  <Text style={styles.featuredBadge}>✅ Verified</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.sectionTitle, isDark && styles.textDark, { paddingHorizontal: 20, paddingTop: 8 }]}>
        🏡 All Listings
      </Text>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id ?? item.id}
        renderItem={({ item }) => (
          <ParcelCard
            id={item._id ?? item.id}
            name={item.title ?? item.name}
            price={item.price}
            size={item.size}
            location={[item.location?.district, item.location?.region].filter(Boolean).join(', ') || item.gpsAddress || '—'}
            status={item.status === 'active' ? 'available' : item.status}
            verified={item.verified}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item._id ?? item.id })}
          />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        scrollEnabled
      />
    </SafeAreaView>
  );
};

const mockProperties = [
  { id: '1', name: 'Residential Plot', price: 85000, size: 500, location: { district: 'Teshie', region: 'Greater Accra' }, status: 'available', verified: true },
  { id: '2', name: 'Commercial Space', price: 150000, size: 1200, location: { district: 'Central', region: 'Tema' }, status: 'available', verified: true },
  { id: '3', name: 'Farm Land', price: 45000, size: 2000, location: { district: 'Ejisu', region: 'Ashanti' }, status: 'available', verified: false },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  textDark: { color: '#f3f4f6' },
  textMuted: { color: '#9ca3af' },
  // Search
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    overflow: 'hidden',
  },
  searchContainerDark: { backgroundColor: '#1f2937', borderColor: '#374151' },
  searchInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1f2937' },
  searchInputDark: { color: '#f3f4f6' },
  searchBtn: { paddingHorizontal: 14, paddingVertical: 11 },
  searchBtnText: { fontSize: 18 },
  // Quick filters
  filtersRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  filterChipDark: { backgroundColor: '#1f2937', borderColor: '#374151' },
  filterChipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  filterChipActiveDark: { backgroundColor: '#1e3a5f', borderColor: '#3b82f6' },
  filterChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  filterChipTextActive: { color: '#2563eb', fontWeight: '700' },
  // Featured
  section: { paddingLeft: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 10 },
  featuredCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    backgroundColor: 'rgba(239,246,255,0.85)',
    padding: 14,
    // Glassmorphic shadow
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredCardDark: { backgroundColor: 'rgba(30,58,95,0.7)', borderColor: 'rgba(96,165,250,0.3)' },
  featuredName: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 },
  featuredPrice: { fontSize: 18, fontWeight: '800', color: '#3b82f6', marginBottom: 4 },
  featuredLocation: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  featuredBadge: { fontSize: 11, color: '#059669', fontWeight: '600' },
  listContent: { paddingBottom: 24 },
});

export default BuyerDashboardScreen;
