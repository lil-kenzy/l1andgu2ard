import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { analyticsAPI } from '../../lib/api';

const SellerAnalyticsScreen: React.FC = ({ navigation }: any) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getSellerStats()
      .then((res) => setStats(res.data?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centred}><ActivityIndicator size="large" color="#3b82f6" /></View>
      </SafeAreaView>
    );
  }

  const s = stats || {};
  const propertyRows: any[] = s.properties || [];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Analytics</Text>

        {/* Overview */}
        <View style={styles.overviewGrid}>
          <StatCard label="Total Views" value={s.totalViews ?? 0} isDark={isDark} />
          <StatCard label="Total Saves" value={s.totalSaves ?? 0} isDark={isDark} />
          <StatCard label="Inquiries" value={s.totalInquiries ?? 0} isDark={isDark} />
          <StatCard label="Listings" value={s.totalProperties ?? 0} isDark={isDark} />
        </View>

        {/* Per-property breakdown */}
        {propertyRows.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Per Listing</Text>
            {propertyRows.map((p: any) => (
              <Card key={p.id}>
                <Text style={[styles.propTitle, isDark && styles.textDark]} numberOfLines={1}>{p.title}</Text>
                <View style={styles.propStats}>
                  <Text style={[styles.propStat, isDark && styles.propStatDark]}>👁 {p.views} views</Text>
                  <Text style={[styles.propStat, isDark && styles.propStatDark]}>❤️ {p.saves} saves</Text>
                  <Text style={[styles.propStat, isDark && styles.propStatDark]}>💬 {p.inquiries} inquiries</Text>
                </View>
                <View style={[styles.statusRow]}>
                  <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
                    Status: {p.status}
                  </Text>
                  <Text style={[styles.priceText, isDark && styles.priceTextDark]}>
                    ₵{Number(p.price).toLocaleString()}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {propertyRows.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No analytics yet. List a property to see stats here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{ label: string; value: any; isDark: boolean }> = ({ label, value, isDark }) => (
  <View style={[styles.statCard, isDark && styles.statCardDark]}>
    <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>{label}</Text>
    <Text style={[styles.statValue, isDark && styles.statValueDark]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  titleDark: { color: '#f3f4f6' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 8, marginBottom: 8 },
  sectionTitleDark: { color: '#f3f4f6' },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '47%', backgroundColor: '#f9fafb', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  statCardDark: { backgroundColor: '#1f2937', borderColor: '#374151' },
  statLabel: { fontSize: 13, color: '#6b7280' },
  statLabelDark: { color: '#d1d5db' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  statValueDark: { color: '#60a5fa' },
  propTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 },
  textDark: { color: '#f3f4f6' },
  propStats: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 6 },
  propStat: { fontSize: 13, color: '#374151' },
  propStatDark: { color: '#d1d5db' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusText: { fontSize: 12, color: '#6b7280' },
  statusTextDark: { color: '#9ca3af' },
  priceText: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  priceTextDark: { color: '#60a5fa' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  emptyTextDark: { color: '#9ca3af' }
});

export default SellerAnalyticsScreen;
