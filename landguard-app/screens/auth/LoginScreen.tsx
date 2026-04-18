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
import { setClientSession } from '../lib/auth';
import { validateEmail } from '../utils/helpers';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
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
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      await setClientSession(role, token, user);
      
      // Navigate to OTP for verification
      navigation.navigate('OTP', { email, token, role });
    } catch (error: any) {
      Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid email or password');
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
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Sign in to continue to Landguard
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
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              keyboardType="email-address"
              required
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
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
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
              Don't have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('Register')}
              >
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
    marginTop: 20,
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
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
  },
  roleButtonText: {
    fontSize: 12,
  },
  form: {
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  footerTextDark: {
    color: '#d1d5db',
  },
  footerLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default LoginScreen;
