import React from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';

const PropertyAlertsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Your Alerts</Text>
      </View>

      <FlatList
        data={mockAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={[styles.alertTitle, isDark && styles.alertTitleDark]}>
              {item.title}
            </Text>
            <Text style={[styles.alertMessage, isDark && styles.alertMessageDark]}>
              {item.message}
            </Text>
            <Button title="View" onPress={() => {}} size="sm" style={styles.button} />
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const mockAlerts = [
  { id: '1', title: 'New Property Match', message: 'A new property matching your criteria is available' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  titleDark: { color: '#f3f4f6' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  alertTitleDark: { color: '#f3f4f6' },
  alertMessage: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  alertMessageDark: { color: '#d1d5db' },
  button: { marginTop: 8 },
});

export default PropertyAlertsScreen;
