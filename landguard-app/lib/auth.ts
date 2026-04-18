import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppRole, UserSession } from '../types';

const SESSION_KEY = 'landguard_session';
const TOKEN_KEY = 'landguard_token';
const ROLE_KEY = 'landguard_role';

export async function getClientSession(): Promise<UserSession | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const role = await AsyncStorage.getItem(ROLE_KEY);

    if (!token || !role) {
      return null;
    }

    return {
      role: normalizeRole(role),
      token,
    };
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

export async function setClientSession(
  role: AppRole,
  token: string,
  user?: UserSession['user']
): Promise<void> {
  try {
    const normalizedRole = normalizeRole(role);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [ROLE_KEY, normalizedRole || ''],
      [SESSION_KEY, JSON.stringify({ role: normalizedRole, token, user })],
    ]);
  } catch (error) {
    console.error('Error setting session:', error);
  }
}

export async function clearClientSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([SESSION_KEY, TOKEN_KEY, ROLE_KEY]);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

export function normalizeRole(input: string | AppRole | null): AppRole {
  if (!input || typeof input !== 'string') return null;
  const normalized = input.toLowerCase().trim();
  if (['buyer', 'seller', 'admin', 'government'].includes(normalized)) {
    return normalized as AppRole;
  }
  return null;
}

export function getRoleHome(role: AppRole): string {
  switch (role) {
    case 'buyer':
      return '/buyer/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'government':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

export function isRoleValid(role: AppRole): boolean {
  return ['buyer', 'seller', 'admin', 'government'].includes(role || '');
}
