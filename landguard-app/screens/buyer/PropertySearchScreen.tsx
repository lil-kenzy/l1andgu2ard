import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import { ParcelCard } from '../../components/Card';
import Button from '../../components/Button';
import { propertiesAPI, alertsAPI } from '../../lib/api';

const REGIONS = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo'];
const CATEGORIES = [
  { label: 'All Types', value: '' },
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Vacant Land', value: 'vacant' }
];
const SALE_TYPES = [
  { label: 'All', value: '' },
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' }
];

interface Filters {
  region: string;
  district: string;
  category: string;
  saleType: string;
  priceMin: string;
  priceMax: string;
}

const DEFAULT_FILTERS: Filters = { region: '', district: '', category: '', saleType: '', priceMin: '', priceMax: '' };

const PropertySearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [savingSearch, setSavingSearch] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const doSearch = useCallback(async (q: string, f: Filters) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params: any = {};
      if (q.trim()) params.q = q.trim();
      if (f.region) params.region = f.region;
      if (f.district) params.district = f.district;
      if (f.category) params.propertyType = f.category;
      if (f.saleType) params.type = f.saleType;
      if (f.priceMin) params.priceMin = Number(f.priceMin);
      if (f.priceMax) params.priceMax = Number(f.priceMax);

      const res = await propertiesAPI.getAll(params);
      setResults(res.data?.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => doSearch(searchQuery, filters);

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setFiltersVisible(false);
    doSearch(searchQuery, pendingFilters);
  };

  const handleClearFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setFiltersVisible(false);
    doSearch(searchQuery, DEFAULT_FILTERS);
  };

  const handleSaveSearch = async () => {
    if (!searchQuery.trim() && !Object.values(filters).some(Boolean)) {
      Alert.alert('Nothing to save', 'Enter a search query or set filters first.');
      return;
    }
    setSavingSearch(true);
    try {
      const alertData: Record<string, unknown> = {};
      if (searchQuery.trim()) alertData.query = searchQuery.trim();
      if (filters.region) alertData.region = filters.region;
      if (filters.district) alertData.district = filters.district;
      if (filters.category) alertData.propertyType = filters.category;
      if (filters.saleType) alertData.listingType = filters.saleType;
      if (filters.priceMin) alertData.priceMin = Number(filters.priceMin);
      if (filters.priceMax) alertData.priceMax = Number(filters.priceMax);
      await alertsAPI.create(alertData);
      Alert.alert('Saved ✅', 'You'll be notified when new matching properties are listed.');
    } catch {
      Alert.alert('Error', 'Could not save search. Please try again.');
    } finally {
      setSavingSearch(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search by location, region, GPS…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.filterBtn, isDark && styles.filterBtnDark, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => { setPendingFilters(filters); setFiltersVisible(true); }}
          >
            <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
              {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
            </Text>
          </TouchableOpacity>
        </View>
        <Button title="Search" onPress={handleSearch} size="sm" style={styles.searchButton} />
        {hasSearched && (
          <Button
            title={savingSearch ? 'Saving…' : '🔔 Save Search'}
            onPress={handleSaveSearch}
            variant="secondary"
            size="sm"
            style={styles.saveSearchButton}
          />
        )}
      </View>

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centred}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>No properties found. Try different filters.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id ?? item.id}
          renderItem={({ item }) => (
            <ParcelCard
              id={item._id ?? item.id}
              name={item.title ?? item.name}
              price={item.price}
              size={item.size}
              location={[item.location?.district, item.location?.region].filter(Boolean).join(', ') || item.gpsAddress}
              status={item.status === 'active' ? 'available' : item.status}
              verified={item.verified}
              onPress={() => navigation.navigate('PropertyDetail', { propertyId: item._id ?? item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled
        />
      )}

      {/* Filter Modal */}
      <Modal visible={filtersVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, isDark && styles.containerDark]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.titleDark]}>Filters</Text>
            <TouchableOpacity onPress={() => setFiltersVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>Region</Text>
            <View style={styles.chips}>
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, pendingFilters.region === r && styles.chipActive]}
                  onPress={() => setPendingFilters((p) => ({ ...p, region: p.region === r ? '' : r }))}
                >
                  <Text style={[styles.chipText, pendingFilters.region === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>District</Text>
            <TextInput
              placeholder="Enter district name"
              value={pendingFilters.district}
              onChangeText={(t) => setPendingFilters((p) => ({ ...p, district: t }))}
              containerStyle={styles.filterInput}
            />

            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>Property Type</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.chip, pendingFilters.category === c.value && styles.chipActive]}
                  onPress={() => setPendingFilters((p) => ({ ...p, category: c.value }))}
                >
                  <Text style={[styles.chipText, pendingFilters.category === c.value && styles.chipTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>Listing Type</Text>
            <View style={styles.chips}>
              {SALE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.chip, pendingFilters.saleType === t.value && styles.chipActive]}
                  onPress={() => setPendingFilters((p) => ({ ...p, saleType: t.value }))}
                >
                  <Text style={[styles.chipText, pendingFilters.saleType === t.value && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>Price Range (₵)</Text>
            <View style={styles.priceRow}>
              <TextInput
                placeholder="Min price"
                value={pendingFilters.priceMin}
                onChangeText={(t) => setPendingFilters((p) => ({ ...p, priceMin: t.replace(/[^0-9]/g, '') }))}
                containerStyle={[styles.filterInput, styles.priceInput]}
                keyboardType="numeric"
              />
              <Text style={[styles.priceDash, isDark && styles.filterLabelDark]}>–</Text>
              <TextInput
                placeholder="Max price"
                value={pendingFilters.priceMax}
                onChangeText={(t) => setPendingFilters((p) => ({ ...p, priceMax: t.replace(/[^0-9]/g, '') }))}
                containerStyle={[styles.filterInput, styles.priceInput]}
                keyboardType="numeric"
              />
            </View>

            <Button title="Apply Filters" onPress={handleApplyFilters} fullWidth style={styles.applyBtn} />
            <Button title="Clear All" onPress={handleClearFilters} variant="secondary" fullWidth />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, marginBottom: 0 },
  searchButton: { marginTop: 8 },
  saveSearchButton: { marginTop: 6 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  filterBtnDark: { backgroundColor: '#374151', borderColor: '#4b5563' },
  filterBtnActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  filterBtnText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  filterBtnTextActive: { color: '#2563eb' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#6b7280', fontSize: 15, textAlign: 'center' },
  emptyTextDark: { color: '#9ca3af' },
  // Modal
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  titleDark: { color: '#f3f4f6' },
  modalClose: { fontSize: 20, color: '#6b7280', paddingHorizontal: 8 },
  modalContent: { padding: 20 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  filterLabelDark: { color: '#d1d5db' },
  filterInput: { marginBottom: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#2563eb', fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceInput: { flex: 1 },
  priceDash: { fontSize: 16, color: '#6b7280' },
  applyBtn: { marginTop: 24, marginBottom: 8 }
});

export default PropertySearchScreen;
