import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, borderRadius, shadows } from '@/lib/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'amber' | 'emerald' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 120 });
  };

  const variantStyles = {
    primary:  styles.primaryButton,
    secondary:styles.secondaryButton,
    outline:  styles.outlineButton,
    danger:   styles.dangerButton,
    amber:    styles.amberButton,
    emerald:  styles.emeraldButton,
    ghost:    styles.ghostButton,
  };

  const sizeStyles = {
    sm: styles.smallButton,
    md: styles.mediumButton,
    lg: styles.largeButton,
  };

  const variantTextStyles = {
    primary:  styles.primaryText,
    secondary:styles.secondaryText,
    outline:  styles.outlineText,
    danger:   styles.dangerText,
    amber:    styles.amberText,
    emerald:  styles.emeraldText,
    ghost:    styles.ghostText,
  };

  const sizeTextStyles = {
    sm: styles.smallText,
    md: styles.mediumText,
    lg: styles.largeText,
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessible
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        animatedStyle,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabledButton,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text
          style={[
            variantTextStyles[variant],
            sizeTextStyles[size],
            disabled && styles.disabledText,
            textStyle,
          ]}
          allowFontScaling
        >
          {title}
        </Text>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  // ─── Variants ─────────────────────────────────────────
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  secondaryButton: {
    backgroundColor: colors.gray['100'],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: colors.crimson,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  amberButton: {
    backgroundColor: colors.amber,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  emeraldButton: {
    backgroundColor: colors.emerald,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Disabled ─────────────────────────────────────────
  disabledButton: {
    opacity: 0.5,
  },

  // ─── Text colours ─────────────────────────────────────
  primaryText:  { color: '#fff', fontWeight: '600' },
  secondaryText:{ color: colors.gray['800'], fontWeight: '600' },
  outlineText:  { color: colors.primary, fontWeight: '600' },
  dangerText:   { color: '#fff', fontWeight: '600' },
  amberText:    { color: '#fff', fontWeight: '600' },
  emeraldText:  { color: '#fff', fontWeight: '600' },
  ghostText:    { color: colors.primary, fontWeight: '600' },
  disabledText: { color: colors.gray['400'] },

  // ─── Sizes ────────────────────────────────────────────
  smallButton:  { paddingVertical: 6, paddingHorizontal: 12 },
  mediumButton: { paddingVertical: 8, paddingHorizontal: 16 },
  largeButton:  { paddingVertical: 12, paddingHorizontal: 20 },
  smallText:    { fontSize: 12 },
  mediumText:   { fontSize: 14 },
  largeText:    { fontSize: 16 },

  fullWidth: { width: '100%' },
});

export default Button;

