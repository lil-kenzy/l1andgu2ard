import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon, LatLng } from 'react-native-maps';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import { propertiesAPI } from '../../lib/api';
import { lookupGhanaPostAddress } from '../../lib/ghanaPost';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Show the whole country so sellers can navigate to their parcel from any region
const GHANA_REGION = {
  latitude: 7.9465,
  longitude: -1.0232,
  latitudeDelta: 7.0,
  longitudeDelta: 5.5,
};

const ListPropertyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    digitalAddress: '',
    propertyTitle: '',
    region: '',
    district: '',
    transactionType: 'sale',
    category: '',
    size: '',
    price: '',
    description: '',
    negotiable: false,
    contactMethod: 'phone',
  });
  const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null); // last-tapped point coordinates
  const [lookingUp, setLookingUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  // --- GhanaPostGPS lookup ---
  const handleGpsLookup = async () => {
    if (!form.digitalAddress.trim()) {
      Alert.alert('Validation', 'Enter a GhanaPostGPS digital address first.');
      return;
    }
    setLookingUp(true);
    const result = await lookupGhanaPostAddress(form.digitalAddress);
    setLookingUp(false);

    if (!result) {
      Alert.alert(
        'Lookup failed',
        'Could not resolve this GPS address. Check the address or your Ghana Post API key.',
      );
      return;
    }

    // Auto-fill region/district from API response
    const updatedForm = { ...form };
    if (result.regionName && !form.region) updatedForm.region = result.regionName;
    if (result.districtName && !form.district) updatedForm.district = result.districtName;
    setForm(updatedForm);

    // If API returned coordinates and we have no polygon yet, seed a default region centre
    if (result.latitude && result.longitude && polygonPoints.length === 0) {
      Alert.alert(
        'Location found',
        `${result.regionName}, ${result.districtName}${result.streetName ? '\n' + result.streetName : ''}\n\nTap the map to draw your land boundary.`,
      );
    } else if (!result.latitude) {
      Alert.alert('Address resolved', `Region: ${result.regionName}\nDistrict: ${result.districtName}`);
    }
  };

  // --- Polygon drawing ---
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedPoint(coordinate);
    setPolygonPoints((prev) => [...prev, coordinate]);
  };

  const undoLastPoint = () => {
    setPolygonPoints((prev) => prev.slice(0, -1));
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
    setSelectedPoint(null);
  };

  // --- Step validation ---
  const validateStep = () => {
    if (step === 1) {
      return !!(form.region && form.district);
    }
    if (step === 2) {
      return !!(form.propertyTitle && form.category && form.size && form.price);
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await propertiesAPI.create({
        ...form,
        polygon: polygonPoints.map((p) => [p.latitude, p.longitude]),
        latitude: selectedPoint?.latitude ?? polygonPoints[0]?.latitude,
        longitude: selectedPoint?.longitude ?? polygonPoints[0]?.longitude,
      });
      Alert.alert(
        'Submitted for Review',
        'Your property has been submitted and is pending admin verification. It will be listed once approved.',
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to list property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>List Property</Text>
        <Text style={[styles.stepIndicator, isDark && styles.stepIndicatorDark]}>
          Step {step} of 4
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 && (
          <StepOne
            form={form}
            updateForm={updateForm}
            isDark={isDark}
            polygonPoints={polygonPoints}
            selectedPoint={selectedPoint}
            lookingUp={lookingUp}
            onGpsLookup={handleGpsLookup}
            onMapPress={handleMapPress}
            onUndo={undoLastPoint}
            onClear={clearPolygon}
          />
        )}
        {step === 2 && (
          <StepTwo form={form} updateForm={updateForm} isDark={isDark} />
        )}
        {step === 3 && (
          <StepThree form={form} updateForm={updateForm} isDark={isDark} />
        )}
        {step === 4 && (
          <StepFour form={form} polygonPoints={polygonPoints} isDark={isDark} />
        )}

        <View style={styles.buttons}>
          {step > 1 && (
            <Button
              title="Back"
              onPress={() => setStep(step - 1)}
              variant="outline"
              fullWidth
              style={styles.button}
            />
          )}
          {step < 4 ? (
            <Button
              title="Next"
              onPress={handleNextStep}
              fullWidth
              style={styles.button}
            />
          ) : (
            <Button
              title="Publish"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={styles.button}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Step 1: Location + GPS lookup + polygon drawing ─────────────────────────
const StepOne: React.FC<{
  form: any;
  updateForm: (field: string, value: any) => void;
  isDark: boolean;
  polygonPoints: LatLng[];
  selectedPoint: LatLng | null;
  lookingUp: boolean;
  onGpsLookup: () => void;
  onMapPress: (event: any) => void;
  onUndo: () => void;
  onClear: () => void;
}> = ({ form, updateForm, isDark, polygonPoints, selectedPoint, lookingUp, onGpsLookup, onMapPress, onUndo, onClear }) => (
  <Card>
    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Location</Text>

    {/* GhanaPostGPS digital address */}
    <View style={styles.row}>
      <View style={styles.flex1}>
        <TextInput
          label="GhanaPostGPS Address"
          placeholder="e.g. GA-123-4567"
          value={form.digitalAddress}
          onChangeText={(text: string) => updateForm('digitalAddress', text)}
          autoCapitalize="characters"
        />
      </View>
      <TouchableOpacity
        style={[styles.lookupBtn, isDark && styles.lookupBtnDark]}
        onPress={onGpsLookup}
        disabled={lookingUp}
        activeOpacity={0.7}
      >
        {lookingUp ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.lookupBtnText}>Lookup</Text>
        )}
      </TouchableOpacity>
    </View>

    <TextInput
      label="Region"
      placeholder="e.g. Greater Accra"
      value={form.region}
      onChangeText={(text: string) => updateForm('region', text)}
      required
    />
    <TextInput
      label="District"
      placeholder="e.g. Ayawaso West"
      value={form.district}
      onChangeText={(text: string) => updateForm('district', text)}
      required
    />

    {/* Polygon / location drawing map */}
    <Text style={[styles.mapLabel, isDark && styles.mapLabelDark]}>
      Mark your land on the map
      {polygonPoints.length === 0
        ? ' — tap a point to select location or draw a boundary'
        : polygonPoints.length < 3
        ? ` — ${polygonPoints.length} point${polygonPoints.length > 1 ? 's' : ''} (add ${3 - polygonPoints.length} more for polygon)`
        : ` — polygon: ${polygonPoints.length} points`}
    </Text>

    {GOOGLE_MAPS_API_KEY ? (
      <MapView
        style={styles.map}
        initialRegion={GHANA_REGION}
        onPress={onMapPress}
      >
        {polygonPoints.map((point, index) => (
          <Marker
            key={index}
            coordinate={point}
            pinColor="#3b82f6"
            title={`Point ${index + 1}`}
          />
        ))}
        {polygonPoints.length >= 3 && (
          <Polygon
            coordinates={polygonPoints}
            strokeColor="#3b82f6"
            fillColor="rgba(59,130,246,0.18)"
            strokeWidth={2}
          />
        )}
      </MapView>
    ) : (
      <View style={[styles.mapPlaceholder, isDark && styles.mapPlaceholderDark]}>
        <Text style={[styles.mapPlaceholderText, isDark && styles.mapPlaceholderTextDark]}>
          Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to enable map location picker
        </Text>
      </View>
    )}

    {/* Lat/Lng readout */}
    {selectedPoint && (
      <View style={[styles.coordsBox, isDark && styles.coordsBoxDark]}>
        <Text style={[styles.coordsText, isDark && styles.coordsTextDark]}>
          📍 Lat: {selectedPoint.latitude.toFixed(6)}  Lng: {selectedPoint.longitude.toFixed(6)}
        </Text>
      </View>
    )}

    <View style={styles.mapActions}>
      <TouchableOpacity
        style={[styles.mapBtn, isDark && styles.mapBtnDark]}
        onPress={onUndo}
        disabled={polygonPoints.length === 0}
        activeOpacity={0.7}
      >
        <Text style={[styles.mapBtnText, isDark && styles.mapBtnTextDark]}>Undo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.mapBtn, isDark && styles.mapBtnDark]}
        onPress={onClear}
        disabled={polygonPoints.length === 0}
        activeOpacity={0.7}
      >
        <Text style={[styles.mapBtnText, isDark && styles.mapBtnTextDark]}>Clear</Text>
      </TouchableOpacity>
    </View>
  </Card>
);

// ─── Step 2: Property details ─────────────────────────────────────────────────
const StepTwo: React.FC<any> = ({ form, updateForm, isDark }) => (
  <Card>
    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Property Details</Text>
    <TextInput
      label="Property Title"
      value={form.propertyTitle}
      onChangeText={(text: string) => updateForm('propertyTitle', text)}
      required
    />
    <TextInput
      label="Category"
      placeholder="Residential, Commercial, etc."
      value={form.category}
      onChangeText={(text: string) => updateForm('category', text)}
      required
    />
    <TextInput
      label="Size (m²)"
      value={form.size}
      onChangeText={(text: string) => updateForm('size', text)}
      keyboardType="decimal-pad"
      required
    />
    <TextInput
      label="Price (₵)"
      value={form.price}
      onChangeText={(text: string) => updateForm('price', text)}
      keyboardType="decimal-pad"
      required
    />
  </Card>
);

// ─── Step 3: Description ──────────────────────────────────────────────────────
const StepThree: React.FC<any> = ({ form, updateForm, isDark }) => (
  <Card>
    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Description</Text>
    <TextInput
      label="Description"
      value={form.description}
      onChangeText={(text: string) => updateForm('description', text)}
      placeholder="Describe your property..."
    />
  </Card>
);

// ─── Step 4: Review ───────────────────────────────────────────────────────────
const StepFour: React.FC<any> = ({ form, polygonPoints, isDark }) => {
  const firstPoint = polygonPoints[0] as LatLng | undefined;
  return (
    <Card>
      <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Review</Text>
      {form.digitalAddress ? (
        <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
          GPS Address: {form.digitalAddress}
        </Text>
      ) : null}
      <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
        Location: {form.district}, {form.region}
      </Text>
      {firstPoint ? (
        <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
          Coordinates: {firstPoint.latitude.toFixed(6)}, {firstPoint.longitude.toFixed(6)}
        </Text>
      ) : null}
      <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
        Title: {form.propertyTitle}
      </Text>
      <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
        Price: ₵{form.price}
      </Text>
      <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
        Size: {form.size} m²
      </Text>
      <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
        Polygon boundary: {polygonPoints.length} point{polygonPoints.length !== 1 ? 's' : ''} captured
      </Text>
      <View style={styles.pendingNotice}>
        <Text style={styles.pendingNoticeText}>
          ⏳ After submission your listing will be reviewed by an admin before it appears publicly.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  titleDark: { color: '#f3f4f6' },
  stepIndicator: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  stepIndicatorDark: { color: '#d1d5db' },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  stepTitleDark: { color: '#f3f4f6' },
  reviewText: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  reviewTextDark: { color: '#d1d5db' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  button: { flex: 1, paddingVertical: 12 },
  // GPS lookup row
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  flex1: { flex: 1 },
  lookupBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  lookupBtnDark: { backgroundColor: '#2563eb' },
  lookupBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  // Map
  mapLabel: { fontSize: 13, color: '#374151', marginBottom: 6, marginTop: 4 },
  mapLabelDark: { color: '#d1d5db' },
  map: { height: 260, borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  mapPlaceholder: {
    height: 260,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 8,
  },
  mapPlaceholderDark: { backgroundColor: '#1f2937' },
  mapPlaceholderText: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  mapPlaceholderTextDark: { color: '#6b7280' },
  mapActions: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  mapBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  mapBtnDark: { borderColor: '#4b5563' },
  mapBtnText: { fontSize: 14, color: '#374151' },
  mapBtnTextDark: { color: '#d1d5db' },
  // Lat/lng readout
  coordsBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  coordsBoxDark: { backgroundColor: '#1e3a5f' },
  coordsText: { fontSize: 12, color: '#1e40af', fontFamily: 'monospace' },
  coordsTextDark: { color: '#93c5fd' },
  // Pending review notice on step 4
  pendingNotice: {
    marginTop: 12,
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    padding: 10,
  },
  pendingNoticeText: { fontSize: 12, color: '#713f12', lineHeight: 18 },
});

export default ListPropertyScreen;

