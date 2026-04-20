import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';
import { colors, borderRadius } from '@/lib/theme';

/**
 * Slides in from the bottom whenever the device goes offline,
 * and shows a brief "back online" confirmation when reconnected.
 *
 * Uses React Native's AppState + a lightweight fetch ping to detect
 * connectivity without requiring extra packages.
 * Accessibility: accessibilityRole="alert" + accessibilityLiveRegion="assertive".
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [visible, setVisible]   = React.useState(false);
  const translateY = useRef(new Animated.Value(80)).current;
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOnline = useRef(true);

  const show = () => {
    setVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    Animated.timing(translateY, {
      toValue: 80,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const checkConnectivity = async () => {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), 4000);
      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: ctrl.signal,
        cache: 'no-store',
      });
      clearTimeout(id);
      return true;
    } catch {
      return false;
    }
  };

  const update = async () => {
    const online = await checkConnectivity();
    setIsOnline(online);

    if (!online && prevOnline.current) {
      // Just went offline
      if (hideTimer.current) clearTimeout(hideTimer.current);
      show();
    } else if (online && !prevOnline.current) {
      // Just came back online
      show();
      hideTimer.current = setTimeout(hide, 3000);
    }
    prevOnline.current = online;
  };

  useEffect(() => {
    // Poll every 8 s when app is active
    const interval = setInterval(update, 8000);

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') update();
    };
    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      clearInterval(interval);
      sub.remove();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: isOnline ? colors.emerald : colors.crimson },
        { transform: [{ translateY }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={
        isOnline
          ? 'Back online. Syncing your data.'
          : 'You are offline. Actions will sync when reconnected.'
      }
    >
      <Text style={styles.icon}>{isOnline ? '📶' : '⚠️'}</Text>
      <Text style={styles.message} allowFontScaling>
        {isOnline
          ? 'Back online – syncing…'
          : 'Offline – actions will sync when reconnected'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

