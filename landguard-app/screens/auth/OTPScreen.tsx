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

interface OTPScreenProps {
  navigation: any;
  route: any;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { email, token, role } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOtp(email, otp);
      const { token: newToken, user } = response.data;

      // Update session with verified token
      const { setClientSession } = await import('../lib/auth');
      await setClientSession(role || 'buyer', newToken, user);

      // Navigate to onboarding
      navigation.navigate('Onboarding', { role });
    } catch (error: any) {
      Alert.alert('Verification Failed', error?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Call resend OTP API
      await authAPI.login(email, ''); // This would trigger resending in real implementation
      setTimer(60);
      setCanResend(false);
      Alert.alert('Success', 'OTP has been resent to your email');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Verify OTP
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Enter the 6-digit code sent to {email}
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
              <Text style={styles.timerText}>
                Resend in {timer}s
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  titleDark: {
    color: '#f3f4f6',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  subtitleDark: {
    color: '#d1d5db',
  },
  form: {
    marginBottom: 24,
  },
  otpContainer: {
    marginBottom: 24,
  },
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
  otpInputDark: {
    backgroundColor: '#374151',
    borderColor: '#3b82f6',
    color: '#f3f4f6',
  },
  verifyButton: {
    paddingVertical: 14,
    marginBottom: 20,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 12,
  },
  resendText: {
    color: '#6b7280',
    fontSize: 14,
  },
  resendTextDark: {
    color: '#d1d5db',
  },
  resendButton: {
    paddingVertical: 8,
  },
  timerText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OTPScreen;
