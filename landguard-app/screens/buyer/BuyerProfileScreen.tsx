import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import { clearClientSession } from '../../lib/auth';

const BuyerProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+233 XX XXX XXXX',
  });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    await clearClientSession();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Profile</Text>

        <Card>
          <TextInput
            label="First Name"
            value={profile.firstName}
            onChangeText={(text) => setProfile({ ...profile, firstName: text })}
          />

          <TextInput
            label="Last Name"
            value={profile.lastName}
            onChangeText={(text) => setProfile({ ...profile, lastName: text })}
          />

          <TextInput
            label="Email"
            value={profile.email}
            editable={false}
          />

          <TextInput
            label="Phone"
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
          />

          <Button title="Save Changes" onPress={() => {}} fullWidth style={styles.button} />
        </Card>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  titleDark: { color: '#f3f4f6' },
  button: { marginTop: 16, paddingVertical: 12 },
  logoutButton: { marginTop: 16, paddingVertical: 12 },
});

export default BuyerProfileScreen;
