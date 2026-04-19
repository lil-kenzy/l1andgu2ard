import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { propertiesAPI, messagesAPI, usersAPI } from '../../lib/api';

const PropertyDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route
}) => {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [reporting, setReporting] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await propertiesAPI.getById(propertyId);
      const data = response.data?.data || mockProperty;
      setProperty(data);
      // Check if already saved
      const savedRes = await propertiesAPI.getSaved().catch(() => ({ data: { data: [] } }));
      const savedIds = (savedRes.data?.data || []).map((p: any) => p._id ?? p.id);
      setIsSaved(savedIds.includes(propertyId));
    } catch {
      setProperty(mockProperty);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    setSavingToggle(true);
    try {
      const res = await propertiesAPI.save(propertyId);
      setIsSaved(res.data?.isSaved ?? !isSaved);
    } catch {
      Alert.alert('Error', 'Could not update saved status. Please try again.');
    } finally {
      setSavingToggle(false);
    }
  };

  const handleContactSeller = async () => {
    if (!property?.seller?._id && !property?.seller) {
      Alert.alert('Unavailable', 'Seller contact is not available for this listing.');
      return;
    }
    const sellerId = property.seller?._id ?? property.seller;
    try {
      const res = await messagesAPI.startConversation(String(sellerId), propertyId);
      const conversationId = res.data?.data?._id;
      if (conversationId) {
        navigation.navigate('Messages', { conversationId, propertyTitle: property.title ?? property.name });
      }
    } catch {
      Alert.alert('Error', 'Could not start conversation. Please try again.');
    }
  };

  const handleReportListing = () => {
    Alert.prompt(
      'Report Listing',
      'Please briefly describe your concern about this listing:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason?.trim()) return;
            setReporting(true);
            try {
              await propertiesAPI.report(propertyId, reason.trim());
              Alert.alert('Reported', 'Your report has been submitted to our team for review. Thank you.');
            } catch {
              Alert.alert('Error', 'Could not submit report. Please try again.');
            } finally {
              setReporting(false);
            }
          }
        }
      ],
      'plain-text'
    );
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

  const p = property ?? mockProperty;
  const sellerName = p.seller?.personalInfo?.fullName ?? p.sellerName ?? 'Verified Seller';
  const isSellerVerified = p.seller?.sellerInfo?.verificationStatus === 'verified' || p.verified;
  const coords = p.centerPoint?.coordinates
    ? `${p.centerPoint.coordinates[1].toFixed(6)}, ${p.centerPoint.coordinates[0].toFixed(6)}`
    : p.center
    ? `${p.center[0]}, ${p.center[1]}`
    : null;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Title + Save */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={2}>
            {p.title ?? p.name}
          </Text>
          <TouchableOpacity
            onPress={handleToggleSave}
            disabled={savingToggle}
            style={styles.saveBtn}
          >
            <Text style={[styles.saveBtnText, isSaved && styles.savedText]}>
              {isSaved ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verification Badge */}
        {isSellerVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✅ Verified Listing</Text>
          </View>
        )}

        {/* Price */}
        <Text style={[styles.price, isDark && styles.priceDark]}>
          ₵{Number(p.price).toLocaleString()}
          {p.type === 'rent' && <Text style={styles.rentLabel}> /yr</Text>}
        </Text>

        {/* Details Card */}
        <Card>
          <DetailRow label="Type" value={p.category ? `${p.category} · ${p.type}` : p.type} isDark={isDark} />
          <DetailRow label="Size" value={p.size ? `${p.size} m²` : '—'} isDark={isDark} />
          <DetailRow
            label="Location"
            value={[p.location?.district, p.location?.region].filter(Boolean).join(', ') || p.gpsAddress || '—'}
            isDark={isDark}
          />
          {p.gpsAddress ? <DetailRow label="GPS Address" value={p.gpsAddress} isDark={isDark} /> : null}
          {coords ? <DetailRow label="Coordinates" value={coords} isDark={isDark} /> : null}
          {p.description ? (
            <View style={styles.descRow}>
              <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>Description</Text>
              <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>{p.description}</Text>
            </View>
          ) : null}
        </Card>

        {/* Seller Card */}
        <Card>
          <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Seller</Text>
          <Text style={[styles.sellerName, isDark && styles.sellerNameDark]}>{sellerName}</Text>
          <Text style={[styles.sellerStatus, isSellerVerified ? styles.sellerVerified : styles.sellerUnverified]}>
            {isSellerVerified ? '✅ Identity Verified' : '⏳ Verification Pending'}
          </Text>
          <Button
            title="💬 Contact Seller"
            onPress={handleContactSeller}
            fullWidth
            style={styles.button}
          />
        </Card>

        {/* Report */}
        <TouchableOpacity
          style={styles.reportRow}
          onPress={handleReportListing}
          disabled={reporting}
        >
          <Text style={styles.reportText}>
            {reporting ? 'Submitting report…' : '🚩 Report suspicious listing'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow: React.FC<{ label: string; value: string; isDark: boolean }> = ({ label, value, isDark }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>{label}</Text>
    <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>{value}</Text>
  </View>
);

const mockProperty = {
  id: '1',
  name: 'Sample Property',
  price: 85000,
  type: 'sale',
  category: 'residential',
  location: { district: 'Teshie', region: 'Greater Accra' },
  size: 500,
  description: 'A prime residential plot in a gated community.',
  verified: true
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: '#1f2937', marginRight: 8 },
  titleDark: { color: '#f3f4f6' },
  saveBtn: { padding: 4 },
  saveBtnText: { fontSize: 24 },
  savedText: {},
  verifiedBadge: { backgroundColor: '#ecfdf5', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  verifiedText: { color: '#065f46', fontSize: 13, fontWeight: '600' },
  price: { fontSize: 26, fontWeight: '800', color: '#3b82f6', marginBottom: 16 },
  priceDark: { color: '#60a5fa' },
  rentLabel: { fontSize: 16, fontWeight: '400' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  descRow: { paddingVertical: 8 },
  detailLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  detailLabelDark: { color: '#9ca3af' },
  detailValue: { fontSize: 13, color: '#1f2937', flex: 2, textAlign: 'right' },
  detailValueDark: { color: '#f3f4f6' },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  sectionLabelDark: { color: '#9ca3af' },
  sellerName: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  sellerNameDark: { color: '#f3f4f6' },
  sellerStatus: { fontSize: 13, marginTop: 2, marginBottom: 10 },
  sellerVerified: { color: '#059669' },
  sellerUnverified: { color: '#d97706' },
  button: { paddingVertical: 10 },
  reportRow: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
  reportText: { color: '#ef4444', fontSize: 14 }
});

export default PropertyDetailScreen;
