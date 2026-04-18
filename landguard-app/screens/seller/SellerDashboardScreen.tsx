import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { analyticsAPI } from '../../lib/api';

const SellerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await analyticsAPI.getSellerStats();
      setStats(response.data || mockStats);
    } catch (error) {
      setStats(mockStats);
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

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Dashboard</Text>

        <StatCard label="Total Properties" value={stats?.totalProperties || 0} isDark={isDark} />
        <StatCard label="Total Views" value={stats?.totalViews || 0} isDark={isDark} />
        <StatCard label="Active Offers" value={stats?.activeOffers || 0} isDark={isDark} />
        <StatCard label="Total Revenue" value={`₵${stats?.revenue || 0}`} isDark={isDark} />

        <Button
          title="List New Property"
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
  <Card>
    <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>{label}</Text>
    <Text style={[styles.statValue, isDark && styles.statValueDark]}>{value}</Text>
  </Card>
);

const mockStats = {
  totalProperties: 5,
  totalViews: 150,
  activeOffers: 2,
  revenue: 50000,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  titleDark: { color: '#f3f4f6' },
  statLabel: { fontSize: 14, color: '#6b7280' },
  statLabelDark: { color: '#d1d5db' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  statValueDark: { color: '#60a5fa' },
  button: { marginTop: 16, paddingVertical: 12 },
});

export default SellerDashboardScreen;
