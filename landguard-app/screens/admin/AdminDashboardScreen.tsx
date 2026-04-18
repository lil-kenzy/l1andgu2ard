import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';

const AdminDashboardScreen: React.FC = ({ navigation }: any) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Admin Dashboard</Text>

        <StatCard label="Total Users" value="1,234" isDark={isDark} />
        <StatCard label="Pending Verifications" value="45" isDark={isDark} />
        <StatCard label="Active Disputes" value="8" isDark={isDark} />
        <StatCard label="Total Transactions" value="567" isDark={isDark} />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{ label: string; value: string; isDark: boolean }> = ({
  label,
  value,
  isDark,
}) => (
  <Card>
    <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    <Text style={[styles.value, isDark && styles.valueDark]}>{value}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  titleDark: { color: '#f3f4f6' },
  label: { fontSize: 14, color: '#6b7280' },
  labelDark: { color: '#d1d5db' },
  value: { fontSize: 24, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  valueDark: { color: '#60a5fa' },
});

export default AdminDashboardScreen;
