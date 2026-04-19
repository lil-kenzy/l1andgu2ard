import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import { clearClientSession } from '../../lib/auth';
import { usersAPI } from '../../lib/api';

const BuyerProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    region: '',
    district: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    usersAPI.getProfile()
      .then((res) => {
        const u = res.data?.data;
        if (u) {
          setProfile({
            fullName: u.personalInfo?.fullName ?? '',
            email:    u.personalInfo?.email    ?? '',
            phone:    u.personalInfo?.phoneNumber ?? '',
            region:   u.location?.region        ?? '',
            district: u.location?.district      ?? ''
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile({
        fullName: profile.fullName,
        email:    profile.email,
        phone:    profile.phone,
        region:   profile.region,
        district: profile.district
      });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await clearClientSession();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>My Profile</Text>

        <Card>
          <TextInput
            label="Full Name"
            value={profile.fullName}
            onChangeText={(t) => setProfile({ ...profile, fullName: t })}
          />
          <TextInput
            label="Email"
            value={profile.email}
            onChangeText={(t) => setProfile({ ...profile, email: t })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Phone"
            value={profile.phone}
            editable={false}
          />
          <TextInput
            label="Region"
            value={profile.region}
            onChangeText={(t) => setProfile({ ...profile, region: t })}
          />
          <TextInput
            label="District"
            value={profile.district}
            onChangeText={(t) => setProfile({ ...profile, district: t })}
          />
          <Button
            title={saving ? 'Saving…' : 'Save Changes'}
            onPress={handleSave}
            fullWidth
            style={styles.button}
          />
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
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  titleDark: { color: '#f3f4f6' },
  button: { marginTop: 16, paddingVertical: 12 },
  logoutButton: { marginTop: 16, paddingVertical: 12 }
});

export default BuyerProfileScreen;
