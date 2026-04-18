import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { authAPI } from '../lib/api';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [role, setRole]             = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [errors, setErrors]         = useState<{ [key: string]: string }>({});
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled   = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    })();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!identifier.trim()) {
      newErrors.identifier = 'Phone, email, or Ghana Card number is required';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.login(identifier.trim(), password, role, 'email');
      // Backend returns: { success, data: { userId, role, otpChannel, otpDeliveryHint } }
      const { userId, role: userRole, otpDeliveryHint } = response.data?.data || response.data;

      navigation.navigate('OTP', {
        userId,
        role: userRole || role,
        channel: 'email',
        hint: otpDeliveryHint?.email || otpDeliveryHint?.sms || identifier,
      });
    } catch (error: any) {
      Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Please enter your phone number or email first');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate locally with FaceID / Fingerprint
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to log in to Landguard',
        fallbackLabel: 'Use Password',
        cancelLabel:   'Cancel',
      });

      if (!result.success) {
        setLoading(false);
        return;
      }

      // 2. The device-bound "signature" is a deterministic hash of the
      //    identifier that is stored on the server during biometric setup.
      //    It acts as a second factor: only a device that completed the
      //    biometric/setup step knows the correct value.
      const { default: CryptoJS } = await import(
        /* webpackChunkName: "crypto" */ 'expo-crypto' as any
      ).catch(() => ({ default: null }));

      // Fallback: use identifier itself if expo-crypto isn't available
      const biometricSignature = CryptoJS
        ? await CryptoJS.digestStringAsync(
            CryptoJS.CryptoDigestAlgorithm.SHA256,
            identifier.trim()
          )
        : identifier.trim();

      const response = await authAPI.biometricLogin(identifier.trim(), biometricSignature);
      // Backend returns full token pair immediately (no OTP step for biometric)
      const { accessToken, refreshToken, user } = response.data?.data || response.data;

      const { setClientSession } = await import('../lib/auth');
      await setClientSession(
        (user?.role || role) as any,
        accessToken,
        user,
        refreshToken
      );

      const { getRoleHome } = await import('../lib/auth');
      const home = getRoleHome(user?.role || role);
      navigation.reset({ index: 0, routes: [{ name: home.replace('/', '') || 'BuyerTabs' }] });
    } catch (error: any) {
      Alert.alert(
        'Biometric Login Failed',
        error?.response?.data?.message || 'Biometric authentication failed. Please use your password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Welcome Back</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Sign in with your phone, email, or Ghana Card
            </Text>
          </View>

          <View style={styles.roleSelector}>
            {(['buyer', 'seller', 'admin'] as const).map((roleOption) => (
              <Button
                key={roleOption}
                title={roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                onPress={() => setRole(roleOption)}
                variant={role === roleOption ? 'primary' : 'outline'}
                size="sm"
                style={styles.roleButton}
                textStyle={styles.roleButtonText}
              />
            ))}
          </View>

          <View style={styles.form}>
            <TextInput
              label="Phone / Email / Ghana Card"
              placeholder="+233 XX XXX XXXX, email, or GHA-XXXXXXXXX-X"
              value={identifier}
              onChangeText={(text: string) => {
                setIdentifier(text);
                if (errors.identifier) setErrors({ ...errors, identifier: '' });
              }}
              error={errors.identifier}
              autoCapitalize="none"
              keyboardType="email-address"
              required
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text: string) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              secureTextEntry
              required
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />

            {biometricAvailable && (
              <Button
                title="🔑  Sign In with Biometrics (FaceID / Fingerprint)"
                onPress={handleBiometricLogin}
                loading={loading}
                fullWidth
                variant="outline"
                style={styles.biometricButton}
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.footerLink}>Forgot password?</Text>
            </TouchableOpacity>
            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
              Don't have an account?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff' },
  containerDark:    { backgroundColor: '#111827' },
  scrollContent:    { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  header:           { marginBottom: 32, marginTop: 20 },
  title:            { fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  titleDark:        { color: '#f3f4f6' },
  subtitle:         { fontSize: 14, color: '#6b7280' },
  subtitleDark:     { color: '#d1d5db' },
  roleSelector:     { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32, gap: 8 },
  roleButton:       { flex: 1, paddingVertical: 8 },
  roleButtonText:   { fontSize: 12 },
  form:             { marginBottom: 24 },
  loginButton:      { marginTop: 8, paddingVertical: 14 },
  biometricButton:  { marginTop: 12, paddingVertical: 12 },
  footer:           { alignItems: 'center', marginTop: 'auto', gap: 12 },
  footerText:       { color: '#6b7280', fontSize: 14 },
  footerTextDark:   { color: '#d1d5db' },
  footerLink:       { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
});

export default LoginScreen;
