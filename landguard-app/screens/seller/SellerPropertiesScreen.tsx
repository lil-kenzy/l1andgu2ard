import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParcelCard } from '../../components/Card';
import { propertiesAPI } from '../../lib/api';

const SellerPropertiesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>(mockProperties);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.data.data || mockProperties);
    } catch (error) {
      setProperties(mockProperties);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>My Properties</Text>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParcelCard
            {...item}
            onPress={() => navigation.navigate('Detail', { propertyId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const mockProperties = [
  {
    id: '1',
    name: 'Residential Plot',
    price: 85000,
    size: 500,
    location: 'Accra',
    status: 'available',
    verified: true,
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  titleDark: { color: '#f3f4f6' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});

export default SellerPropertiesScreen;
