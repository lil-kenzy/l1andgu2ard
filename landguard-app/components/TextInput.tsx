import React, { useRef } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  useColorScheme,
  Animated,
} from 'react-native';
import { colors, borderRadius, glass } from '@/lib/theme';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  /** Use glassmorphism style */
  glassy?: boolean;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  containerStyle,
  required = false,
  glassy = false,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animated border colour on focus
  const focusAnim = useRef(new Animated.Value(0)).current;
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.crimson : isDark ? colors.gray['600'] : colors.gray['300'],
      error ? colors.crimson : colors.emerald,
    ],
  });

  const handleFocus = () =>
    Animated.timing(focusAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  const handleBlur = () =>
    Animated.timing(focusAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();

  const glassStyle = isDark ? glass.dark : glass.light;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[styles.label, isDark && styles.labelDark]}
          allowFontScaling
          accessibilityRole="text"
        >
          {label}
          {required && (
            <Text style={styles.required} accessibilityLabel="required">
              {' '}*
            </Text>
          )}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputWrapper,
          glassy && { ...glassStyle, borderRadius: borderRadius.md },
          { borderColor },
          { borderWidth: 1 },
        ]}
      >
        <RNTextInput
          {...props}
          style={[
            styles.input,
            isDark && styles.inputDark,
            glassy && styles.inputGlass,
            { borderWidth: 0 },
          ]}
          placeholderTextColor={isDark ? colors.gray['500'] : colors.gray['400']}
          onFocus={(e) => { handleFocus(); props.onFocus?.(e); }}
          onBlur={(e)  => { handleBlur();  props.onBlur?.(e);  }}
          accessible
          accessibilityLabel={label}
          accessibilityHint={props.placeholder}
          accessibilityState={{ disabled: props.editable === false }}
          allowFontScaling
        />
      </Animated.View>
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert" allowFontScaling>
          {error}
        </Text>
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
    marginBottom: 6,
    color: colors.gray['700'],
  },
  labelDark: {
    color: colors.gray['300'],
  },
  required: {
    color: colors.crimson,
  },
  inputWrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputDark: {
    backgroundColor: colors.dark.surface,
    color: colors.dark.text,
  },
  inputGlass: {
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: colors.crimson,
  },
  errorText: {
    color: colors.crimson,
    fontSize: 12,
    marginTop: 4,
  },
});

export default TextInput;

