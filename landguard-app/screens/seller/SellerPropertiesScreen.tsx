import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { propertiesAPI } from '../../lib/api';

const STATUS_OPTIONS = [
  { label: 'Available', value: 'available', color: '#059669' },
  { label: 'Under Offer', value: 'under_offer', color: '#d97706' },
  { label: 'Sold', value: 'sold', color: '#6b7280' }
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  available:    { label: 'Available',    color: '#059669' },
  under_offer:  { label: 'Under Offer',  color: '#d97706' },
  sold:         { label: 'Sold',         color: '#6b7280' },
  pending:      { label: 'Pending Review', color: '#6b7280' },
  active:       { label: 'Active',       color: '#059669' },
  inactive:     { label: 'Inactive',     color: '#6b7280' }
};

const SellerPropertiesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTarget, setStatusTarget] = useState<{ id: string; title: string } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchProperties = useCallback(async () => {
    try {
      const response = await propertiesAPI.getMine();
      setProperties(response.data.data || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleStatusChange = async (newStatus: string) => {
    if (!statusTarget) return;
    setUpdatingStatus(true);
    try {
      await propertiesAPI.updateStatus(statusTarget.id, newStatus);
      setProperties((prev) =>
        prev.map((p) => (p.id === statusTarget.id || p._id === statusTarget.id) ? { ...p, status: newStatus } : p)
      );
      setStatusTarget(null);
    } catch (err: any) {
      Alert.alert(
        'Cannot Update Status',
        err?.response?.data?.message || 'Could not update property status.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const id = item.id ?? item._id;
    const statusInfo = STATUS_LABELS[item.status] || { label: item.status, color: '#6b7280' };
    const verif = item.verificationStatus;
    return (
      <Card>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, isDark && styles.textDark]} numberOfLines={1}>
            {item.title ?? item.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '22', borderColor: statusInfo.color }]}>
            <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.itemMeta}>
          {item.price && (
            <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
              ₵{Number(item.price).toLocaleString()}
            </Text>
          )}
          {item.location && (
            <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
              {[item.location.district, item.location.region].filter(Boolean).join(', ')}
            </Text>
          )}
          <Text style={[styles.metaSmall, isDark && styles.metaSmallDark]}>
            {verif === 'verified' ? '✅ Verified' : verif === 'rejected' ? '❌ Rejected' : '⏳ Pending review'}
          </Text>
        </View>

        <View style={styles.metaStats}>
          <Text style={[styles.statText, isDark && styles.metaTextDark]}>👁 {item.views ?? 0} views</Text>
          <Text style={[styles.statText, isDark && styles.metaTextDark]}>❤️ {item.saved ?? item.saves ?? 0} saves</Text>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionBtn, isDark && styles.actionBtnDark]}
            onPress={() => setStatusTarget({ id, title: item.title ?? item.name })}
          >
            <Text style={[styles.actionBtnText, isDark && styles.actionBtnTextDark]}>Change Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, isDark && styles.actionBtnDark]}
            onPress={() => navigation.navigate('EditProperty', { propertyId: id })}
          >
            <Text style={[styles.actionBtnText, isDark && styles.actionBtnTextDark]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>My Properties</Text>
        <Button
          title="+ List New"
          onPress={() => navigation.navigate('List')}
          size="sm"
        />
      </View>

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.centred}>
          <Text style={[styles.emptyText, isDark && styles.textMuted]}>
            No properties yet.{'\n'}Tap "+ List New" to add your first listing.
          </Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id ?? item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchProperties}
          refreshing={loading}
        />
      )}

      {/* Status Change Modal */}
      <Modal visible={!!statusTarget} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, isDark && styles.modalSheetDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              Change Status
            </Text>
            <Text style={[styles.modalSubtitle, isDark && styles.textMuted]} numberOfLines={1}>
              {statusTarget?.title}
            </Text>

            <ScrollView contentContainerStyle={styles.statusOptions}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.statusOption, { borderColor: opt.color }]}
                  onPress={() => handleStatusChange(opt.value)}
                  disabled={updatingStatus}
                >
                  <Text style={[styles.statusOptionText, { color: opt.color }]}>
                    {updatingStatus ? 'Updating…' : opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatusTarget(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  textDark: { color: '#f3f4f6' },
  textMuted: { color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  emptyText: { color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  // Item
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1f2937', marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  itemMeta: { marginBottom: 4 },
  metaText: { fontSize: 13, color: '#374151', marginBottom: 1 },
  metaTextDark: { color: '#d1d5db' },
  metaSmall: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  metaSmallDark: { color: '#9ca3af' },
  metaStats: { flexDirection: 'row', gap: 14, marginBottom: 10, marginTop: 4 },
  statText: { fontSize: 13, color: '#374151' },
  itemActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  actionBtnDark: { borderColor: '#4b5563' },
  actionBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  actionBtnTextDark: { color: '#d1d5db' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  modalSheetDark: { backgroundColor: '#1f2937' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  statusOptions: { gap: 10 },
  statusOption: { paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  statusOptionText: { fontSize: 15, fontWeight: '700' },
  cancelBtn: { marginTop: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#6b7280', fontWeight: '600' }
});

export default SellerPropertiesScreen;
