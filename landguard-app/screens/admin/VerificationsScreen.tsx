import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { adminAPI } from '../../lib/api';

interface PendingProperty {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  verificationStatus?: string;
  seller?: { personalInfo?: { fullName?: string } };
  location?: { region?: string; district?: string };
  digitalAddress?: string;
  price?: number;
  size?: string;
}

const VerificationsScreen: React.FC = () => {
  const [verifications, setVerifications] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionIds, setActionIds] = useState<string[]>([]); // IDs currently being actioned
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingProperties();
      setVerifications(res.data.data || mockVerifications);
    } catch {
      setVerifications(mockVerifications);
    } finally {
      setLoading(false);
    }
  };

  const itemId = (item: PendingProperty) => item._id ?? item.id ?? '';
  const itemTitle = (item: PendingProperty) => item.title ?? item.name ?? 'Untitled';

  const handleDecision = async (item: PendingProperty, approved: boolean) => {
    const id = itemId(item);
    if (!id) return;
    setActionIds((prev) => [...prev, id]);
    try {
      await adminAPI.verifyProperty(id, { verified: approved });
      setVerifications((prev) => prev.filter((v) => itemId(v) !== id));
      Alert.alert(approved ? 'Approved' : 'Rejected', `"${itemTitle(item)}" has been ${approved ? 'approved and will now appear in listings' : 'rejected'}.`);
    } catch {
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setActionIds((prev) => prev.filter((x) => x !== id));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Pending Verifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Pending Verifications</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {verifications.length} application{verifications.length !== 1 ? 's' : ''} awaiting review
        </Text>
      </View>

      {verifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            ✅ No pending verifications.
          </Text>
        </View>
      ) : (
        <FlatList
          data={verifications}
          keyExtractor={(item) => itemId(item)}
          renderItem={({ item }) => {
            const id = itemId(item);
            const busy = actionIds.includes(id);
            return (
              <Card>
                <Text style={[styles.itemTitle, isDark && styles.itemTitleDark]}>
                  {itemTitle(item)}
                </Text>
                {item.seller?.personalInfo?.fullName ? (
                  <Text style={[styles.itemSubtitle, isDark && styles.itemSubtitleDark]}>
                    Seller: {item.seller.personalInfo.fullName}
                  </Text>
                ) : null}
                {(item.location?.district || item.location?.region) ? (
                  <Text style={[styles.itemMeta, isDark && styles.itemMetaDark]}>
                    📍 {[item.location.district, item.location.region].filter(Boolean).join(', ')}
                  </Text>
                ) : null}
                {item.digitalAddress ? (
                  <Text style={[styles.itemMeta, isDark && styles.itemMetaDark]}>
                    GPS: {item.digitalAddress}
                  </Text>
                ) : null}
                {item.price ? (
                  <Text style={[styles.itemMeta, isDark && styles.itemMetaDark]}>
                    Price: ₵{item.price.toLocaleString()}
                  </Text>
                ) : null}
                {item.size ? (
                  <Text style={[styles.itemMeta, isDark && styles.itemMetaDark]}>
                    Size: {item.size}
                  </Text>
                ) : null}

                {busy ? (
                  <ActivityIndicator size="small" color="#3b82f6" style={styles.busyIndicator} />
                ) : (
                  <View style={styles.buttons}>
                    <Button
                      title="Approve"
                      onPress={() => handleDecision(item, true)}
                      size="sm"
                      style={styles.button}
                    />
                    <Button
                      title="Reject"
                      onPress={() => handleDecision(item, false)}
                      variant="danger"
                      size="sm"
                      style={styles.button}
                    />
                  </View>
                )}
              </Card>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const mockVerifications: PendingProperty[] = [
  { id: '1', title: 'Residential Plot', seller: { personalInfo: { fullName: 'John Doe' } }, location: { district: 'Ayawaso West', region: 'Greater Accra' }, price: 85000, size: '0.25 acres' },
  { id: '2', title: 'Commercial Space', seller: { personalInfo: { fullName: 'Jane Smith' } }, location: { district: 'Osu', region: 'Greater Accra' }, price: 220000, size: '0.40 acres' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  titleDark: { color: '#f3f4f6' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  subtitleDark: { color: '#9ca3af' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  emptyTextDark: { color: '#9ca3af' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  itemTitleDark: { color: '#f3f4f6' },
  itemSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  itemSubtitleDark: { color: '#d1d5db' },
  itemMeta: { fontSize: 13, color: '#9ca3af', marginBottom: 1 },
  itemMetaDark: { color: '#6b7280' },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: { flex: 1, paddingVertical: 8 },
  busyIndicator: { marginTop: 12 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});

export default VerificationsScreen;
