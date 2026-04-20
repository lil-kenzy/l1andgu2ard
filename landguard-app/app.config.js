// app.config.js — dynamic Expo config that reads env vars at build time.
// EAS Build injects EXPO_PUBLIC_* and any secrets you add in eas.json / EAS dashboard.
// For local dev: create a .env file in this directory (see .env.example).

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'Landguard',
  slug: 'landguard',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTabletMode: true,
    bundleIdentifier: 'com.landguard.app',
    // GoogleService-Info.plist is required for Firebase push notifications on iOS.
    // Add the file to landguard-app/ and reference it here, or set via EAS secret:
    // eas secret:create --scope project --name GOOGLE_SERVICES_PLIST --type file
    ...(process.env.GOOGLE_SERVICES_PLIST && {
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
    }),
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#fff',
    },
    package: 'com.landguard.app',
    // google-services.json is required for Firebase push notifications on Android.
    // Add the file to landguard-app/ and reference it here, or set via EAS secret:
    // eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file
    ...(process.env.GOOGLE_SERVICES_JSON && {
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    }),
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  scheme: 'landguard',
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Landguard to access your location',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Landguard to access your photos',
        cameraPermission: 'Allow Landguard to access your camera',
      },
    ],
    [
      'expo-notifications',
      {
        // icon defaults to the app icon when omitted
        color: '#F59E0B',
      },
    ],
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      // Replace with your real EAS project ID:
      //   npx eas init   (in this directory)
      // This creates the project in your Expo account and writes the real UUID here.
      projectId: 'landguard-app',
    },
  },
};

module.exports = config;
