import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import { clearClientSession } from '../../lib/auth';
import { usersAPI, transactionsAPI } from '../../lib/api';

const FAQ_ITEMS = [
  { q: 'How do I verify my identity?', a: 'Go to Settings → Identity Verification and upload your Ghana Card.' },
  { q: 'Is my data safe?', a: 'All data is encrypted at rest and in transit using AES-256 and TLS 1.3.' },
  { q: 'How do I dispute a transaction?', a: 'Open the transaction record and tap "Raise Dispute". Our team responds within 48h.' },
];

const BuyerProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    region: '',
    district: ''
  });
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    Promise.all([
      usersAPI.getProfile(),
      transactionsAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } })),
    ]).then(([profileRes, txRes]) => {
      const u = profileRes.data?.data;
      if (u) {
        setProfile({
          fullName: u.personalInfo?.fullName ?? '',
          email:    u.personalInfo?.email    ?? '',
          phone:    u.personalInfo?.phoneNumber ?? '',
          region:   u.location?.region        ?? '',
          district: u.location?.district      ?? ''
        });
        setVerificationStatus(u.kycStatus ?? u.verificationStatus ?? u.personalInfo?.niaVerified ? 'verified' : 'unverified');
      }
      const txData = txRes.data?.data ?? [];
      setTransactions(txData.slice(0, 5));
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

  const verificationColor = verificationStatus === 'verified' ? '#059669' : verificationStatus === 'pending' ? '#d97706' : '#6b7280';
  const verificationLabel = verificationStatus === 'verified' ? '✅ Identity Verified' : verificationStatus === 'pending' ? '⏳ Verification Pending' : '⚠️ Not Verified';

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

        {/* Verification Status */}
        <View style={[styles.verificationCard, isDark && styles.verificationCardDark, { borderColor: verificationColor }]}>
          <Text style={[styles.verificationStatus, { color: verificationColor }]}>{verificationLabel}</Text>
          {verificationStatus !== 'verified' && (
            <Text style={[styles.verificationHint, isDark && styles.textMuted]}>
              Complete NIA identity verification to unlock full access.
            </Text>
          )}
        </View>

        {/* Personal Info */}
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

        {/* Transaction History */}
        <Text style={[styles.sectionTitle, isDark && styles.titleDark]}>📋 Transaction History</Text>
        <Card>
          {transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <View key={tx._id ?? tx.id} style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={[styles.txId, isDark && styles.titleDark]}>#{(tx._id ?? tx.id ?? '').toString().slice(-6)}</Text>
                  <Text style={[styles.txProp, isDark && styles.textMuted]} numberOfLines={1}>
                    {tx.property?.title ?? tx.property?.name ?? 'Property'}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>₵{Number(tx.amount ?? tx.price ?? 0).toLocaleString()}</Text>
                  <Text style={[styles.txStatus, { color: tx.status === 'completed' ? '#059669' : '#d97706' }]}>
                    {tx.status ?? 'pending'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, isDark && styles.textMuted]}>No transactions yet.</Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions')}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>View All Transactions →</Text>
          </TouchableOpacity>
        </Card>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, isDark && styles.titleDark]}>❓ FAQ</Text>
        <Card>
          {FAQ_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setFaqOpen(faqOpen === idx ? null : idx)}
              style={styles.faqItem}
              activeOpacity={0.8}
            >
              <View style={styles.faqQuestion}>
                <Text style={[styles.faqQ, isDark && styles.titleDark]}>{item.q}</Text>
                <Text style={[styles.faqChevron, isDark && styles.textMuted]}>{faqOpen === idx ? '▲' : '▼'}</Text>
              </View>
              {faqOpen === idx && (
                <Text style={[styles.faqA, isDark && styles.textMuted]}>{item.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Support / Contact */}
        <Text style={[styles.sectionTitle, isDark && styles.titleDark]}>🆘 Support</Text>
        <Card>
          <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL('mailto:support@landguard.app')} activeOpacity={0.8}>
            <Text style={[styles.supportLabel, isDark && styles.titleDark]}>📧 Email Support</Text>
            <Text style={styles.supportValue}>support@landguard.app</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL('tel:+233302000000')} activeOpacity={0.8}>
            <Text style={[styles.supportLabel, isDark && styles.titleDark]}>📞 Call Us</Text>
            <Text style={styles.supportValue}>+233 30 200 0000</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL('https://landguard.app/help')} activeOpacity={0.8}>
            <Text style={[styles.supportLabel, isDark && styles.titleDark]}>🌐 Help Centre</Text>
            <Text style={styles.supportValue}>landguard.app/help</Text>
          </TouchableOpacity>
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
  textMuted: { color: '#9ca3af' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1f2937', marginTop: 20, marginBottom: 10 },
  // Verification
  verificationCard: {
    borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  verificationCardDark: { backgroundColor: '#1f2937' },
  verificationStatus: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  verificationHint: { fontSize: 13, color: '#6b7280' },
  // Transactions
  txRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  txInfo: { flex: 1 },
  txRight: { alignItems: 'flex-end' },
  txId: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  txProp: { fontSize: 12, color: '#6b7280' },
  txAmount: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  txStatus: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  emptyText: { fontSize: 14, color: '#6b7280', paddingVertical: 8 },
  viewAllBtn: { marginTop: 10, alignItems: 'center' },
  viewAllText: { fontSize: 13, color: '#3b82f6', fontWeight: '600' },
  // FAQ
  faqItem: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1, paddingRight: 8 },
  faqChevron: { fontSize: 12, color: '#6b7280' },
  faqA: { fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 20 },
  // Support
  supportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  supportLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  supportValue: { fontSize: 13, color: '#3b82f6' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e5e7eb' },
  button: { marginTop: 16, paddingVertical: 12 },
  logoutButton: { marginTop: 16, paddingVertical: 12 }
});

export default BuyerProfileScreen;
