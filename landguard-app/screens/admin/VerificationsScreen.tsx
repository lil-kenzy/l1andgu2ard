import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';

const VerificationsScreen: React.FC = () => {
  const [verifications, setVerifications] = useState(mockVerifications);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleVerify = (id: string) => {
    Alert.alert('Verified', 'Property has been verified');
    setVerifications(verifications.filter((v) => v.id !== id));
  };

  const handleReject = (id: string) => {
    Alert.alert('Rejected', 'Property verification has been rejected');
    setVerifications(verifications.filter((v) => v.id !== id));
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Pending Verifications</Text>
      </View>

      <FlatList
        data={verifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={[styles.itemTitle, isDark && styles.itemTitleDark]}>
              {item.propertyName}
            </Text>
            <Text style={[styles.itemSubtitle, isDark && styles.itemSubtitleDark]}>
              {item.ownerName}
            </Text>
            <View style={styles.buttons}>
              <Button
                title="Verify"
                onPress={() => handleVerify(item.id)}
                size="sm"
                style={styles.button}
              />
              <Button
                title="Reject"
                onPress={() => handleReject(item.id)}
                variant="danger"
                size="sm"
                style={styles.button}
              />
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const mockVerifications = [
  { id: '1', propertyName: 'Residential Plot', ownerName: 'John Doe' },
  { id: '2', propertyName: 'Commercial Space', ownerName: 'Jane Smith' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  titleDark: { color: '#f3f4f6' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  itemTitleDark: { color: '#f3f4f6' },
  itemSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  itemSubtitleDark: { color: '#d1d5db' },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: { flex: 1, paddingVertical: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});

export default VerificationsScreen;
