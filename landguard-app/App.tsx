import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getClientSession, getRoleHome } from './lib/auth';
import type { AppRole } from './types';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import OTPScreen from './screens/auth/OTPScreen';
import OnboardingScreen from './screens/auth/OnboardingScreen';

// Buyer Screens
import BuyerDashboardScreen from './screens/buyer/BuyerDashboardScreen';
import BuyerMapScreen from './screens/buyer/BuyerMapScreen';
import PropertySearchScreen from './screens/buyer/PropertySearchScreen';
import PropertyDetailScreen from './screens/buyer/PropertyDetailScreen';
import PropertyAlertsScreen from './screens/buyer/PropertyAlertsScreen';
import BuyerProfileScreen from './screens/buyer/BuyerProfileScreen';

// Seller Screens
import SellerDashboardScreen from './screens/seller/SellerDashboardScreen';
import ListPropertyScreen from './screens/seller/ListPropertyScreen';
import SellerPropertiesScreen from './screens/seller/SellerPropertiesScreen';
import SellerAnalyticsScreen from './screens/seller/SellerAnalyticsScreen';
import SellerProfileScreen from './screens/seller/SellerProfileScreen';

// Admin Screens
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import VerificationsScreen from './screens/admin/VerificationsScreen';
import DisputesScreen from './screens/admin/DisputesScreen';
import UsersScreen from './screens/admin/UsersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

function BuyerBottomTabs() {
  const colorScheme = useColorScheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={BuyerDashboardScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Map"
        component={BuyerMapScreen}
        options={{
          title: 'Map',
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="Search"
        component={PropertySearchScreen}
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={PropertyAlertsScreen}
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={BuyerProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function BuyerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BuyerTabs"
        component={BuyerBottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ title: 'Property Details' }}
      />
    </Stack.Navigator>
  );
}

function SellerBottomTabs() {
  const colorScheme = useColorScheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={SellerDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="List"
        component={ListPropertyScreen}
        options={{ title: 'List Property' }}
      />
      <Tab.Screen
        name="Properties"
        component={SellerPropertiesScreen}
        options={{ title: 'My Properties' }}
      />
      <Tab.Screen
        name="Analytics"
        component={SellerAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen
        name="Profile"
        component={SellerProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function SellerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SellerTabs"
        component={SellerBottomTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AdminBottomTabs() {
  const colorScheme = useColorScheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Verifications"
        component={VerificationsScreen}
        options={{ title: 'Verifications' }}
      />
      <Tab.Screen
        name="Disputes"
        component={DisputesScreen}
        options={{ title: 'Disputes' }}
      />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{ title: 'Users' }}
      />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminTabs"
        component={AdminBottomTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getClientSession();
      setSession(currentSession);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return null; // Or show a splash screen
  }

  const renderRoleStack = (role: AppRole) => {
    switch (role) {
      case 'buyer':
        return <BuyerStack />;
      case 'seller':
        return <SellerStack />;
      case 'admin':
      case 'government':
        return <AdminStack />;
      default:
        return <AuthStack />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {session ? renderRoleStack(session.role) : <AuthStack />}
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
