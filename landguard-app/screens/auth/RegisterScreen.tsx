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
import { validateEmail, validatePhone } from '../utils/helpers';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      Alert.alert('Success', 'Registration successful! Please sign in.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
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
              Create Account
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Join Landguard to buy, sell, or manage properties
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              error={errors.firstName}
              required
            />

            <TextInput
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChangeText={(text) => updateField('lastName', text)}
              error={errors.lastName}
              required
            />

            <TextInput
              label="Email Address"
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
              keyboardType="email-address"
              required
            />

            <TextInput
              label="Phone Number"
              placeholder="+233 XX XXX XXXX"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              error={errors.phone}
              keyboardType="phone-pad"
              required
            />

            <TextInput
              label="Password"
              placeholder="Enter a strong password"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
              secureTextEntry
              required
            />

            <TextInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
              secureTextEntry
              required
            />

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
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('Login')}
              >
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
    marginBottom: 24,
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
  form: {
    marginBottom: 24,
  },
  registerButton: {
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

export default RegisterScreen;
