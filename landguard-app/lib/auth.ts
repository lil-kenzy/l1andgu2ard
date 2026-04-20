import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppRole, UserSession } from '../types';

const SESSION_KEY       = 'landguard_session';
const TOKEN_KEY         = 'landguard_token';
const REFRESH_TOKEN_KEY = 'landguard_refresh_token';
const ROLE_KEY          = 'landguard_role';

export async function getClientSession(): Promise<UserSession | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const role  = await AsyncStorage.getItem(ROLE_KEY);

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
  accessToken: string,
  user?: UserSession['user'],
  refreshToken?: string
): Promise<void> {
  try {
    const normalizedRole = normalizeRole(role);
    const pairs: [string, string][] = [
      [TOKEN_KEY,  accessToken],
      [ROLE_KEY,   normalizedRole || ''],
      [SESSION_KEY, JSON.stringify({ role: normalizedRole, token: accessToken, user })],
    ];
    if (refreshToken) {
      pairs.push([REFRESH_TOKEN_KEY, refreshToken]);
    }
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Error setting session:', error);
  }
}

export async function clearClientSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([SESSION_KEY, TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY]);
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
