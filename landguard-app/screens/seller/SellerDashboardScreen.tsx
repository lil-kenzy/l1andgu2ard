import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { analyticsAPI, usersAPI } from '../../lib/api';

const SellerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [stats, setStats] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, profileRes] = await Promise.all([
        analyticsAPI.getSellerStats().catch(() => null),
        usersAPI.getProfile().catch(() => null)
      ]);

      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }
      if (profileRes?.data?.data?.sellerInfo?.verificationStatus) {
        setVerificationStatus(profileRes.data.data.sellerInfo.verificationStatus);
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  const s = stats || {};

  const VerificationBanner = () => {
    if (verificationStatus === 'verified') {
      return (
        <View style={[styles.banner, styles.bannerVerified]}>
          <Text style={styles.bannerText}>✅ Account Verified — You can list properties</Text>
        </View>
      );
    }
    if (verificationStatus === 'rejected') {
      return (
        <TouchableOpacity
          style={[styles.banner, styles.bannerRejected]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.bannerText}>❌ Verification Rejected — Tap to update your documents</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.banner, styles.bannerPending]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.bannerText}>⏳ Verification Pending (72-hour SLA) — Complete your profile</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Dashboard</Text>

        <VerificationBanner />

        <View style={styles.statsGrid}>
          <StatCard label="Listings" value={s.totalProperties ?? 0} isDark={isDark} />
          <StatCard label="Total Views" value={s.totalViews ?? 0} isDark={isDark} />
          <StatCard label="Saves" value={s.totalSaves ?? 0} isDark={isDark} />
          <StatCard label="Inquiries" value={s.totalInquiries ?? 0} isDark={isDark} />
          <StatCard label="Under Offer" value={s.activeOffers ?? 0} isDark={isDark} />
          <StatCard label="Sold" value={s.sold ?? 0} isDark={isDark} />
        </View>

        <Button
          title="+ List New Property"
          onPress={() => navigation.navigate('List')}
          fullWidth
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{ label: string; value: any; isDark: boolean }> = ({
  label,
  value,
  isDark,
}) => (
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
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  titleDark: { color: '#f3f4f6' },
  banner: { borderRadius: 8, padding: 12, marginBottom: 16 },
  bannerVerified: { backgroundColor: '#d1fae5' },
  bannerPending: { backgroundColor: '#fef9c3' },
  bannerRejected: { backgroundColor: '#fee2e2' },
  bannerText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: '#f9fafb', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  statCardDark: { backgroundColor: '#1f2937', borderColor: '#374151' },
  statLabel: { fontSize: 13, color: '#6b7280' },
  statLabelDark: { color: '#d1d5db' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  statValueDark: { color: '#60a5fa' },
  button: { paddingVertical: 12 },
});

export default SellerDashboardScreen;
