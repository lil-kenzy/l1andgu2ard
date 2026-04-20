import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { authAPI } from '../lib/api';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    phone:           '',
    ghanaCardNumber: '',
    password:        '',
    confirmPassword: '',
    role:            'buyer' as 'buyer' | 'seller',
    otpChannel:      'sms' as 'sms' | 'email',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<{ [key: string]: string }>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.ghanaCardNumber.trim()) {
      newErrors.ghanaCardNumber = 'Ghana Card number is required';
    } else if (!/^GHA-\d{9}-\d$/.test(formData.ghanaCardNumber.trim().toUpperCase())) {
      newErrors.ghanaCardNumber = 'Format must be GHA-XXXXXXXXX-X';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.register({
        fullName:        formData.fullName.trim(),
        phone:           formData.phone.trim(),
        ghanaCardNumber: formData.ghanaCardNumber.trim().toUpperCase(),
        password:        formData.password,
        email:           formData.email.trim() || undefined,
        role:            formData.role,
        otpChannel:      formData.otpChannel,
      });

      // Backend returns: { success, data: { userId, role, otpChannel, otpDeliveryHint, niaVerification } }
      const { userId, role: userRole, otpDeliveryHint, niaVerification } =
        response.data?.data || response.data;

      if (niaVerification?.sandbox) {
        Alert.alert(
          'Sandbox Mode',
          'Ghana Card verified in sandbox (no live NIA check). Configure NIA_API_URL for production.',
          [{ text: 'Continue' }]
        );
      }

      navigation.navigate('OTP', {
        userId,
        role:    userRole || formData.role,
        channel: formData.otpChannel,
        hint:    formData.otpChannel === 'sms'
          ? otpDeliveryHint?.sms
          : otpDeliveryHint?.email || formData.email,
      });
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.response?.data?.message || error?.response?.data?.details || 'Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Create Account</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Join Landguard — Ghana's National Land Registry
            </Text>
          </View>

          {/* Role selector */}
          <View style={styles.roleRow}>
            <Text style={[styles.label, isDark && styles.labelDark]}>I am a:</Text>
            <View style={styles.roleButtons}>
              {(['buyer', 'seller'] as const).map((r) => (
                <Button
                  key={r}
                  title={r.charAt(0).toUpperCase() + r.slice(1)}
                  onPress={() => updateField('role', r)}
                  variant={formData.role === r ? 'primary' : 'outline'}
                  size="sm"
                  style={styles.roleBtn}
                />
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Full Name"
              placeholder="Kwame Mensah"
              value={formData.fullName}
              onChangeText={(t: string) => updateField('fullName', t)}
              error={errors.fullName}
              required
            />

            <TextInput
              label="Phone Number"
              placeholder="+233 XX XXX XXXX"
              value={formData.phone}
              onChangeText={(t: string) => updateField('phone', t)}
              error={errors.phone}
              keyboardType="phone-pad"
              required
            />

            <TextInput
              label="Ghana Card Number"
              placeholder="GHA-XXXXXXXXX-X"
              value={formData.ghanaCardNumber}
              onChangeText={(t: string) => updateField('ghanaCardNumber', t.toUpperCase())}
              error={errors.ghanaCardNumber}
              autoCapitalize="characters"
              required
            />

            <TextInput
              label="Email Address (optional)"
              placeholder="kwame@example.com"
              value={formData.email}
              onChangeText={(t: string) => updateField('email', t)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChangeText={(t: string) => updateField('password', t)}
              error={errors.password}
              secureTextEntry
              required
            />

            <TextInput
              label="Confirm Password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChangeText={(t: string) => updateField('confirmPassword', t)}
              error={errors.confirmPassword}
              secureTextEntry
              required
            />

            {/* OTP channel */}
            <Text style={[styles.label, isDark && styles.labelDark]}>Send OTP via:</Text>
            <View style={styles.roleRow}>
              <View style={styles.roleButtons}>
                {(['sms', 'email'] as const).map((ch) => (
                  <Button
                    key={ch}
                    title={ch.toUpperCase()}
                    onPress={() => updateField('otpChannel', ch)}
                    variant={formData.otpChannel === ch ? 'primary' : 'outline'}
                    size="sm"
                    style={styles.roleBtn}
                  />
                ))}
              </View>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
              Already have an account?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
                Sign in
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  containerDark:  { backgroundColor: '#111827' },
  scrollContent:  { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  header:         { marginBottom: 24, marginTop: 20 },
  title:          { fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  titleDark:      { color: '#f3f4f6' },
  subtitle:       { fontSize: 14, color: '#6b7280' },
  subtitleDark:   { color: '#d1d5db' },
  label:          { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  labelDark:      { color: '#d1d5db' },
  roleRow:        { marginBottom: 16 },
  roleButtons:    { flexDirection: 'row', gap: 8 },
  roleBtn:        { flex: 1, paddingVertical: 8 },
  form:           { marginBottom: 24 },
  registerButton: { marginTop: 8, paddingVertical: 14 },
  footer:         { alignItems: 'center', marginTop: 'auto' },
  footerText:     { color: '#6b7280', fontSize: 14 },
  footerTextDark: { color: '#d1d5db' },
  footerLink:     { color: '#3b82f6', fontWeight: '600' },
});

export default RegisterScreen;
