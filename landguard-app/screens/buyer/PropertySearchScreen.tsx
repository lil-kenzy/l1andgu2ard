import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import { ParcelCard } from '../../components/Card';

const PropertySearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(mockSearchResults);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TextInput
          placeholder="Search properties, location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParcelCard
            {...item}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled
      />
    </SafeAreaView>
  );
};

const mockSearchResults = [
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
  searchInput: { marginBottom: 0 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});

export default PropertySearchScreen;
