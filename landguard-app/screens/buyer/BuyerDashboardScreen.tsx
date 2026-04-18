import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { propertiesAPI } from '../../lib/api';
import { ParcelCard } from '../../components/Card';
import Button from '../../components/Button';

interface BuyerDashboardScreenProps {
  navigation: any;
}

const BuyerDashboardScreen: React.FC<BuyerDashboardScreenProps> = ({ navigation }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.getAll({ limit: 10 });
      setProperties(response.data.data || mockProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProperties().then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, isDark && styles.greetingDark]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Find your perfect property
          </Text>
        </View>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParcelCard
            {...item}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEnabled
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
    location: 'Accra, Teshie',
    status: 'available',
    verified: true,
  },
  {
    id: '2',
    name: 'Commercial Space',
    price: 150000,
    size: 1200,
    location: 'Tema, Central',
    status: 'available',
    verified: true,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  greetingDark: {
    color: '#f3f4f6',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  subtitleDark: {
    color: '#d1d5db',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default BuyerDashboardScreen;
