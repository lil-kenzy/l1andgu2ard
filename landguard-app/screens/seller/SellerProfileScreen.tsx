import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import { usersAPI, documentsAPI } from '../../lib/api';
import { clearClientSession } from '../../lib/auth';

const SellerProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');

  // Document expiry tracking
  const [docExpiry, setDocExpiry] = useState<Record<string, { expiresAt?: Date; uploadedAt?: Date; expired?: boolean; daysLeft?: number }>>({});

  // Personal info (read-only)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Seller-specific
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [tin, setTin] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    Promise.all([
      usersAPI.getProfile(),
      documentsAPI.getAll().catch(() => ({ data: { data: [] } }))
    ]).then(([profileRes, docsRes]) => {
      const d = profileRes.data.data;
      if (d) {
        setFullName(d.personalInfo?.fullName ?? '');
        setPhone(d.personalInfo?.phoneNumber ?? '');
        setEmail(d.personalInfo?.email ?? '');
        setVerificationStatus(d.sellerInfo?.verificationStatus ?? 'pending');
        setBusinessRegNumber(d.sellerInfo?.businessRegNumber ?? '');
        setTin(d.sellerInfo?.tin ?? '');
        setPhysicalAddress(d.sellerInfo?.physicalAddress ?? '');
        setBankName(d.sellerInfo?.bankAccount?.bankName ?? '');
        setAccountNumber(d.sellerInfo?.bankAccount?.accountNumber ?? '');
        setAccountName(d.sellerInfo?.bankAccount?.accountName ?? '');
      }
      const docs: Array<{ documentType: string; expiresAt?: string; createdAt?: string }> = docsRes.data?.data ?? [];
      const expiryMap: typeof docExpiry = {};
      for (const doc of docs) {
        if (!doc.documentType) continue;
        const expiresAt = doc.expiresAt ? new Date(doc.expiresAt) : undefined;
        const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000) : undefined;
        expiryMap[doc.documentType] = {
          expiresAt,
          uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
          expired: daysLeft !== undefined ? daysLeft < 0 : false,
          daysLeft,
        };
      }
      setDocExpiry(expiryMap);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersAPI.updateSellerInfo({
        businessRegNumber: businessRegNumber.trim() || undefined,
        tin: tin.trim() || undefined,
        physicalAddress: physicalAddress.trim() || undefined,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        accountName: accountName.trim() || undefined
      });
      Alert.alert('Saved', 'Your seller information has been updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not save changes.');
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
        <View style={styles.centred}><ActivityIndicator size="large" color="#3b82f6" /></View>
      </SafeAreaView>
    );
  }

  const verificationBadge = () => {
    if (verificationStatus === 'verified') {
      return <View style={[styles.badge, styles.badgeVerified]}><Text style={styles.badgeText}>✅ Verified Seller</Text></View>;
    }
    if (verificationStatus === 'rejected') {
      return <View style={[styles.badge, styles.badgeRejected]}><Text style={styles.badgeText}>❌ Verification Rejected</Text></View>;
    }
    return <View style={[styles.badge, styles.badgePending]}><Text style={styles.badgeText}>⏳ Pending Verification (72-hr SLA)</Text></View>;
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Seller Profile</Text>

        {verificationBadge()}

        {/* Personal Info (read-only) */}
        <Card>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Personal Information</Text>
          <TextInput label="Full Name (Ghana Card)" value={fullName} editable={false} />
          <TextInput label="Phone Number" value={phone} editable={false} />
          <TextInput label="Email" value={email || 'Not provided'} editable={false} />
        </Card>

        {/* Seller-specific info */}
        <Card>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Business Details</Text>
          <TextInput
            label="Business Registration Number (optional — corporate only)"
            placeholder="e.g. CS-12345"
            value={businessRegNumber}
            onChangeText={setBusinessRegNumber}
          />
          <TextInput
            label="Tax Identification Number / TIN (optional)"
            placeholder="e.g. P0012345678"
            value={tin}
            onChangeText={setTin}
            autoCapitalize="characters"
          />
          <TextInput
            label="Physical Address"
            placeholder="Your verifiable physical address"
            value={physicalAddress}
            onChangeText={setPhysicalAddress}
          />
        </Card>

        {/* Bank account / payout details */}
        <Card>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Payout Details</Text>
          <Text style={[styles.hint, isDark && styles.hintDark]}>
            Required for digital payouts. Leave blank if you prefer cash/meetup payment.
          </Text>
          <TextInput
            label="Bank Name"
            placeholder="e.g. GCB Bank"
            value={bankName}
            onChangeText={setBankName}
          />
          <TextInput
            label="Account Number"
            placeholder="XXXXXXXXXXXX"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
          <TextInput
            label="Account Name"
            placeholder="Name on the account"
            value={accountName}
            onChangeText={setAccountName}
          />
        </Card>

        {/* Mandatory Documents section */}
        <Card>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Mandatory Documents</Text>
          <Text style={[styles.hint, isDark && styles.hintDark]}>
            Upload these documents to complete seller verification. Documents are encrypted and reviewed by the Lands Commission (72-hour SLA).
          </Text>
          {MANDATORY_DOCS.map((doc) => {
            const exp = docExpiry[doc.key];
            const isExpired = exp?.expired ?? false;
            const daysLeft = exp?.daysLeft;
            const showWarning = daysLeft !== undefined && daysLeft <= 90;
            return (
              <View key={doc.key} style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={[styles.docLabel, isDark && styles.docLabelDark]}>
                    {doc.required ? '📄 ' : '📄 (Optional) '}{doc.label}
                  </Text>
                  {isExpired && (
                    <Text style={styles.docExpiredText}>⚠️ Expired — re-upload required</Text>
                  )}
                  {!isExpired && showWarning && daysLeft !== undefined && (
                    <Text style={styles.docWarningText}>
                      ⏰ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''} — renew soon
                    </Text>
                  )}
                  {exp?.uploadedAt && !isExpired && !showWarning && (
                    <Text style={[styles.docMetaText, isDark && styles.hintDark]}>
                      ✅ Uploaded {exp.uploadedAt.toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.uploadBtn, isExpired && styles.uploadBtnExpired, isDark && styles.uploadBtnDark]}
                  onPress={() => Alert.alert(
                    isExpired ? 'Re-upload Document' : 'Upload Document',
                    `Please use the Document Vault screen to ${isExpired ? 're-upload' : 'upload'} "${doc.label}".`,
                    [{ text: 'OK' }]
                  )}
                >
                  <Text style={[styles.uploadBtnText, isExpired && styles.uploadBtnExpiredText]}>
                    {isExpired ? 'Re-upload' : exp?.uploadedAt ? 'Replace' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </Card>

        <Button
          title={saving ? 'Saving…' : 'Save Changes'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          style={styles.button}
        />

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

const MANDATORY_DOCS = [
  { key: 'land_title', label: 'Land Title Certificate / Deed of Assignment', required: true },
  { key: 'ghana_card', label: 'Ghana Card of Registered Owner(s)', required: true },
  { key: 'consent_letter', label: 'Consent Letter (if inherited property)', required: false },
  { key: 'building_permit', label: 'Building Permit (if structures on property)', required: false }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 36 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  titleDark: { color: '#f3f4f6' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 10 },
  sectionTitleDark: { color: '#f3f4f6' },
  hint: { fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 18 },
  hintDark: { color: '#9ca3af' },
  badge: { borderRadius: 8, padding: 10, marginBottom: 14, alignItems: 'center' },
  badgeVerified: { backgroundColor: '#d1fae5' },
  badgePending: { backgroundColor: '#fef9c3' },
  badgeRejected: { backgroundColor: '#fee2e2' },
  badgeText: { fontWeight: '600', fontSize: 13, color: '#1f2937' },
  docRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 8 },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 13, color: '#374151', flexWrap: 'wrap' },
  docLabelDark: { color: '#d1d5db' },
  docExpiredText: { fontSize: 11, color: '#dc2626', marginTop: 2, fontWeight: '600' },
  docWarningText: { fontSize: 11, color: '#d97706', marginTop: 2 },
  docMetaText: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  uploadBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f9fafb' },
  uploadBtnDark: { borderColor: '#374151', backgroundColor: '#1f2937' },
  uploadBtnExpired: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  uploadBtnText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  uploadBtnExpiredText: { color: '#dc2626' },
  button: { marginTop: 8, paddingVertical: 12 },
  logoutButton: { marginTop: 12, paddingVertical: 12 }
});

export default SellerProfileScreen;
