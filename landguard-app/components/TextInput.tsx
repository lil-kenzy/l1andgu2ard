import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  useColorScheme,
} from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  containerStyle,
  required = false,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <RNTextInput
        {...props}
        style={[
          styles.input,
          isDark && styles.inputDark,
          error && styles.inputError,
        ]}
        placeholderTextColor={isDark ? '#9ca3af' : '#d1d5db'}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  labelDark: {
    color: '#d1d5db',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#f3f4f6',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default TextInput;
