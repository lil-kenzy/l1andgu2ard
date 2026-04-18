import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';

const DisputesScreen: React.FC = () => {
  const [disputes, setDisputes] = useState(mockDisputes);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleResolve = (id: string) => {
    Alert.alert('Resolved', 'Dispute has been resolved');
    setDisputes(disputes.filter((d) => d.id !== id));
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Active Disputes</Text>
      </View>

      <FlatList
        data={disputes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.severity === 'high' ? '#fecaca' : '#fde047' },
              ]}
            >
              <Text style={styles.statusText}>{item.severity.toUpperCase()}</Text>
            </View>
            <Text style={[styles.itemTitle, isDark && styles.itemTitleDark]}>
              {item.title}
            </Text>
            <Text style={[styles.itemSubtitle, isDark && styles.itemSubtitleDark]}>
              {item.description}
            </Text>
            <Button
              title="Review Details"
              onPress={() => handleResolve(item.id)}
              size="sm"
              style={styles.button}
              fullWidth
            />
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const mockDisputes = [
  { id: '1', title: 'Boundary Dispute', description: 'Conflict over property boundaries', severity: 'high' },
  { id: '2', title: 'Payment Issue', description: 'Non-payment dispute', severity: 'medium' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  titleDark: { color: '#f3f4f6' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#000' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  itemTitleDark: { color: '#f3f4f6' },
  itemSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  itemSubtitleDark: { color: '#d1d5db' },
  button: { marginTop: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});

export default DisputesScreen;
