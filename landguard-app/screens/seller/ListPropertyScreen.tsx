import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import { propertiesAPI } from '../../lib/api';

const ListPropertyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const validateStep = () => {
    if (step === 1) {
      return form.region && form.district;
    }
    if (step === 2) {
      return form.propertyTitle && form.category && form.size && form.price;
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
      await propertiesAPI.create(form);
      Alert.alert('Success', 'Property listed successfully!');
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
          <StepOne form={form} updateForm={updateForm} isDark={isDark} />
        )}
        {step === 2 && (
          <StepTwo form={form} updateForm={updateForm} isDark={isDark} />
        )}
        {step === 3 && (
          <StepThree form={form} updateForm={updateForm} isDark={isDark} />
        )}
        {step === 4 && (
          <StepFour form={form} isDark={isDark} />
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

const StepOne: React.FC<any> = ({ form, updateForm, isDark }) => (
  <Card>
    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Location</Text>
    <TextInput
      label="Region"
      placeholder="Select region"
      value={form.region}
      onChangeText={(text) => updateForm('region', text)}
      required
    />
    <TextInput
      label="District"
      placeholder="Select district"
      value={form.district}
      onChangeText={(text) => updateForm('district', text)}
      required
    />
  </Card>
);

const StepTwo: React.FC<any> = ({ form, updateForm, isDark }) => (
  <Card>
    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Property Details</Text>
    <TextInput
      label="Property Title"
      value={form.propertyTitle}
      onChangeText={(text) => updateForm('propertyTitle', text)}
      required
    />
    <TextInput
      label="Category"
      placeholder="Residential, Commercial, etc."
      value={form.category}
      onChangeText={(text) => updateForm('category', text)}
      required
    />
    <TextInput
      label="Size (m²)"
      value={form.size}
      onChangeText={(text) => updateForm('size', text)}
      keyboardType="decimal-pad"
      required
    />
    <TextInput
      label="Price (₵)"
      value={form.price}
      onChangeText={(text) => updateForm('price', text)}
      keyboardType="decimal-pad"
      required
    />
  </Card>
);

const StepThree: React.FC<any> = ({ form, updateForm, isDark }) => (
  <Card>
    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Description</Text>
    <TextInput
      label="Description"
      value={form.description}
      onChangeText={(text) => updateForm('description', text)}
      placeholder="Describe your property..."
    />
  </Card>
);

const StepFour: React.FC<any> = ({ form, isDark }) => (
  <Card>
    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>Review</Text>
    <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
      Title: {form.propertyTitle}
    </Text>
    <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
      Price: ₵{form.price}
    </Text>
    <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
      Size: {form.size} m²
    </Text>
  </Card>
);

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
});

export default ListPropertyScreen;
