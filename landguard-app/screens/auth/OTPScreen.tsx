import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { authAPI } from '../lib/api';
import { setClientSession } from '../lib/auth';
import type { AppRole } from '../types';

interface OTPScreenProps {
  navigation: any;
  route: any;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  // userId is the MongoDB _id returned by login/register
  const { userId, role, channel = 'email', hint } = route.params || {};
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(60);
  const [canResend, setCanResend] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0) setCanResend(true);
    return undefined;
  }, [timer, canResend]);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOtp(userId, otp, channel);
      // Backend returns: { success, data: { accessToken, refreshToken, user } }
      const { accessToken, refreshToken, user } = response.data?.data || response.data;

      await setClientSession(
        (user?.role || role) as AppRole,
        accessToken,
        user,
        refreshToken
      );

      // Route to the correct role home
      navigation.reset({
        index: 0,
        routes: [{ name: resolveHome(user?.role || role) }],
      });
    } catch (error: any) {
      Alert.alert('Verification Failed', error?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userId) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      navigation.navigate('Login');
      return;
    }
    setLoading(true);
    try {
      // Re-trigger login to generate a fresh OTP — user still needs to enter password,
      // so we just tell them to go back to the login screen.
      Alert.alert('Resend OTP', 'Please go back and log in again to receive a new OTP code.');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
      setTimer(60);
      setCanResend(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Verify OTP</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Enter the 6-digit code sent via {channel?.toUpperCase()}
            {hint ? ` to ${hint}` : ''}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            <RNTextInput
              style={[styles.otpInput, isDark && styles.otpInputDark]}
              placeholder="000000"
              placeholderTextColor={isDark ? '#9ca3af' : '#d1d5db'}
              maxLength={6}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              editable={!loading}
            />
          </View>

          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            loading={loading}
            fullWidth
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, isDark && styles.resendTextDark]}>
              Didn't receive the code?
            </Text>
            {canResend ? (
              <Button
                title="Resend OTP"
                onPress={handleResendOTP}
                variant="outline"
                size="sm"
                style={styles.resendButton}
              />
            ) : (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function resolveHome(role: string | undefined): string {
  switch (role) {
    case 'seller':        return 'SellerTabs';
    case 'admin':
    case 'government_admin': return 'AdminTabs';
    default:             return 'BuyerTabs';
  }
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  containerDark:  { backgroundColor: '#111827' },
  scrollContent:  { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  header:         { marginBottom: 32, marginTop: 40 },
  title:          { fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  titleDark:      { color: '#f3f4f6' },
  subtitle:       { fontSize: 16, color: '#6b7280' },
  subtitleDark:   { color: '#d1d5db' },
  form:           { marginBottom: 24 },
  otpContainer:   { marginBottom: 24 },
  otpInput: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  otpInputDark:     { backgroundColor: '#374151', borderColor: '#3b82f6', color: '#f3f4f6' },
  verifyButton:     { paddingVertical: 14, marginBottom: 20 },
  resendContainer:  { alignItems: 'center', gap: 12 },
  resendText:       { color: '#6b7280', fontSize: 14 },
  resendTextDark:   { color: '#d1d5db' },
  resendButton:     { paddingVertical: 8 },
  timerText:        { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
});

export default OTPScreen;
