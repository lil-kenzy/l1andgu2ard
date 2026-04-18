import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { propertiesAPI } from '../../lib/api';

const PropertyDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await propertiesAPI.getById(propertyId);
      setProperty(response.data.data || mockProperty);
    } catch (error) {
      setProperty(mockProperty);
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
        <Card>
          <Text style={[styles.title, isDark && styles.titleDark]}>{property?.name}</Text>
          <Text style={[styles.price, isDark && styles.priceDark]}>
            ₵{property?.price?.toLocaleString()}
          </Text>
          <Text style={[styles.detail, isDark && styles.detailDark]}>
            Location: {property?.location}
          </Text>
          <Text style={[styles.detail, isDark && styles.detailDark]}>
            Size: {property?.size} m²
          </Text>

          <Button title="Make an Offer" onPress={() => {}} fullWidth style={styles.button} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const mockProperty = {
  id: '1',
  name: 'Sample Property',
  price: 85000,
  location: 'Accra',
  size: 500,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  titleDark: { color: '#f3f4f6' },
  price: { fontSize: 20, fontWeight: '700', color: '#3b82f6', marginBottom: 16 },
  priceDark: { color: '#60a5fa' },
  detail: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  detailDark: { color: '#d1d5db' },
  button: { marginTop: 16, paddingVertical: 12 },
});

export default PropertyDetailScreen;
