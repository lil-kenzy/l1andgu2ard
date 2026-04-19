import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, ParcelCard } from '../../components/Card';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { propertiesAPI, alertsAPI } from '../../lib/api';

const REGIONS = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Volta', 'Northern'];

type Tab = 'saved' | 'alerts';

const PropertyAlertsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [savedProps, setSavedProps] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newAlert, setNewAlert] = useState({ label: '', region: '', district: '', priceMin: '', priceMax: '', category: '', type: '' });
  const [saving, setSaving] = useState(false);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await propertiesAPI.getSaved();
      setSavedProps(res.data?.data || []);
    } catch {
      setSavedProps([]);
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await alertsAPI.getAll();
      setAlerts(res.data?.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
    fetchAlerts();
  }, [fetchSaved, fetchAlerts]);

  const handleDeleteAlert = async (id: string) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await alertsAPI.delete(id);
            setAlerts((prev) => prev.filter((a) => a._id !== id));
          } catch {
            Alert.alert('Error', 'Could not delete alert.');
          }
        }
      }
    ]);
  };

  const handleCreateAlert = async () => {
    if (!newAlert.region && !newAlert.district) {
      Alert.alert('Validation', 'Please specify at least a region or district for the alert.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {};
      if (newAlert.label) payload.label = newAlert.label;
      if (newAlert.region) payload.region = newAlert.region;
      if (newAlert.district) payload.district = newAlert.district;
      if (newAlert.category) payload.category = newAlert.category;
      if (newAlert.type) payload.type = newAlert.type;
      if (newAlert.priceMin) payload.priceMin = Number(newAlert.priceMin);
      if (newAlert.priceMax) payload.priceMax = Number(newAlert.priceMax);

      const res = await alertsAPI.create(payload);
      setAlerts((prev) => [res.data.data, ...prev]);
      setCreateModalVisible(false);
      setNewAlert({ label: '', region: '', district: '', priceMin: '', priceMax: '', category: '', type: '' });
      setActiveTab('alerts');
    } catch {
      Alert.alert('Error', 'Could not create alert. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderSavedTab = () => {
    if (loadingSaved) {
      return <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />;
    }
    if (!savedProps.length) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, isDark && styles.textDark]}>No saved properties</Text>
          <Text style={[styles.emptySubtitle, isDark && styles.textMutedDark]}>Tap ❤️ on a listing to save it here.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={savedProps}
        keyExtractor={(item) => item._id ?? item.id}
        renderItem={({ item }) => (
          <ParcelCard
            id={item._id ?? item.id}
            name={item.title ?? item.name}
            price={item.price}
            size={item.size}
            location={[item.location?.district, item.location?.region].filter(Boolean).join(', ')}
            status={item.status === 'active' ? 'available' : item.status}
            verified={item.verified}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item._id ?? item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    );
  };

  const renderAlertsTab = () => {
    if (loadingAlerts) {
      return <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />;
    }
    return (
      <>
        <Button
          title="+ New Area Alert"
          onPress={() => setCreateModalVisible(true)}
          style={styles.newAlertBtn}
        />
        {!alerts.length ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>No alerts set up</Text>
            <Text style={[styles.emptySubtitle, isDark && styles.textMutedDark]}>
              Create an alert and we'll notify you when a matching property is listed.
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.alertRow}>
                  <View style={styles.alertInfo}>
                    <Text style={[styles.alertTitle, isDark && styles.textDark]}>
                      {item.label || `${item.region || item.district || 'Any area'} alert`}
                    </Text>
                    <Text style={[styles.alertMeta, isDark && styles.textMutedDark]}>
                      {[item.region, item.district].filter(Boolean).join(', ') || 'Anywhere in Ghana'}
                    </Text>
                    {(item.priceMin || item.priceMax) && (
                      <Text style={[styles.alertMeta, isDark && styles.textMutedDark]}>
                        Price: {item.priceMin ? `₵${Number(item.priceMin).toLocaleString()}` : '—'}
                        {' – '}
                        {item.priceMax ? `₵${Number(item.priceMax).toLocaleString()}` : '∞'}
                      </Text>
                    )}
                    {item.category && item.category !== 'any' && (
                      <Text style={[styles.alertMeta, isDark && styles.textMutedDark]}>
                        Type: {item.category}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAlert(item._id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, isDark && styles.tabBarDark]}>
        {(['saved', 'alerts'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, isDark && styles.tabTextDark, activeTab === tab && styles.tabTextActive]}>
              {tab === 'saved' ? '❤️  Saved' : '🔔  Alerts'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'saved' ? renderSavedTab() : renderAlertsTab()}
      </ScrollView>

      {/* Create Alert Modal */}
      <Modal visible={createModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, isDark && styles.containerDark]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>New Area Alert</Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <TextInput
              label="Alert Name (optional)"
              placeholder="e.g. Accra family home"
              value={newAlert.label}
              onChangeText={(t) => setNewAlert((p) => ({ ...p, label: t }))}
            />
            <Text style={[styles.filterLabel, isDark && styles.textMutedDark]}>Region</Text>
            <View style={styles.chips}>
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, newAlert.region === r && styles.chipActive]}
                  onPress={() => setNewAlert((p) => ({ ...p, region: p.region === r ? '' : r }))}
                >
                  <Text style={[styles.chipText, newAlert.region === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              label="District (optional)"
              placeholder="e.g. Ayawaso West"
              value={newAlert.district}
              onChangeText={(t) => setNewAlert((p) => ({ ...p, district: t }))}
            />
            <View style={styles.priceRow}>
              <TextInput
                label="Min Price (₵)"
                placeholder="0"
                value={newAlert.priceMin}
                onChangeText={(t) => setNewAlert((p) => ({ ...p, priceMin: t.replace(/[^0-9]/g, '') }))}
                containerStyle={styles.priceInput}
                keyboardType="numeric"
              />
              <TextInput
                label="Max Price (₵)"
                placeholder="No limit"
                value={newAlert.priceMax}
                onChangeText={(t) => setNewAlert((p) => ({ ...p, priceMax: t.replace(/[^0-9]/g, '') }))}
                containerStyle={styles.priceInput}
                keyboardType="numeric"
              />
            </View>
            <Button
              title={saving ? 'Creating…' : 'Create Alert'}
              onPress={handleCreateAlert}
              fullWidth
              style={styles.createBtn}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabBarDark: { borderBottomColor: '#374151' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tabTextDark: { color: '#9ca3af' },
  tabTextActive: { color: '#3b82f6', fontWeight: '700' },
  scrollContent: { paddingBottom: 24 },
  listContent: { paddingHorizontal: 20, paddingTop: 8 },
  loader: { marginTop: 32 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1f2937', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  textDark: { color: '#f3f4f6' },
  textMutedDark: { color: '#9ca3af' },
  newAlertBtn: { marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  alertInfo: { flex: 1, marginRight: 8 },
  alertTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  alertMeta: { fontSize: 13, color: '#6b7280', marginBottom: 1 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  // Modal
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  modalClose: { fontSize: 20, color: '#6b7280', paddingHorizontal: 8 },
  modalContent: { padding: 20 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 8, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#2563eb', fontWeight: '600' },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceInput: { flex: 1 },
  createBtn: { marginTop: 8 }
});

export default PropertyAlertsScreen;
