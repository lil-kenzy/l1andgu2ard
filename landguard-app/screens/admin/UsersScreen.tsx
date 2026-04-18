import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import { Card } from '../../components/Card';
import Button from '../../components/Button';

const UsersScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState(mockUsers);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Users</Text>
        <TextInput
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.userHeader}>
              <View>
                <Text style={[styles.userName, isDark && styles.userNameDark]}>
                  {item.name}
                </Text>
                <Text style={[styles.userEmail, isDark && styles.userEmailDark]}>
                  {item.email}
                </Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
                <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <Button title="View" onPress={() => {}} size="sm" variant="outline" />
              <Button title="Suspend" onPress={() => {}} size="sm" variant="danger" />
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const getRoleColor = (role: string) => {
  const colors: { [key: string]: string } = {
    buyer: '#bfdbfe',
    seller: '#bbf7d0',
    admin: '#fecaca',
  };
  return colors[role] || '#e5e7eb';
};

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'buyer' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'seller' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  titleDark: { color: '#f3f4f6' },
  searchInput: { marginBottom: 0 },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  userNameDark: { color: '#f3f4f6' },
  userEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  userEmailDark: { color: '#d1d5db' },
  roleBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  roleText: { fontSize: 11, fontWeight: '600', color: '#000' },
  userActions: { flexDirection: 'row', gap: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});

export default UsersScreen;
