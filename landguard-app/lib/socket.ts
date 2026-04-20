/**
 * socket.ts
 * Socket.IO client wrapper for the LANDGUARD mobile app.
 *
 * Usage:
 *   import { connectSocket, disconnectSocket, onPropertyStatus, onNotification } from './socket';
 *
 *   // After login
 *   connectSocket(accessToken, userId);
 *
 *   // Subscribe to real-time events
 *   const unsub = onPropertyStatus((payload) => { ... });
 *   return () => unsub(); // cleanup in useEffect
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_WS_URL =
  (process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000/api')
    .replace('/api', '');   // strip /api — socket.io attaches at root

let _socket: Socket | null = null;

// ── Connection ────────────────────────────────────────────────────────────────

export function connectSocket(token: string, userId?: string): Socket {
  if (_socket?.connected) return _socket;

  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }

  _socket = io(BACKEND_WS_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  });

  _socket.on('connect', () => {
    console.log('[socket] connected:', _socket?.id);
    if (userId) {
      // Server auto-joins user-{userId} room on connect via JWT decode,
      // but we also send it explicitly for robustness.
      _socket?.emit('join-user', userId);
    }
  });

  _socket.on('connect_error', (err) => {
    console.warn('[socket] connect error:', err.message);
  });

  _socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected:', reason);
  });

  return _socket;
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}

export function getSocket(): Socket | null {
  return _socket;
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export function joinPropertyRoom(propertyId: string) {
  _socket?.emit('join-property', propertyId);
}

export function leavePropertyRoom(propertyId: string) {
  _socket?.emit('leave-property', propertyId);
}

// ── Event subscriptions ───────────────────────────────────────────────────────

export type PropertyStatusPayload = {
  propertyId:  string;
  status:      'pending' | 'verified' | 'rejected' | 'sold' | 'available';
  title?:      string;
  updatedAt:   string;
};

export type NewSubmissionPayload = {
  propertyId:  string;
  title?:      string;
  submittedAt: string;
};

export type NotificationPayload = {
  _id?:      string;
  type:      string;
  title:     string;
  message:   string;
  data?:     Record<string, unknown>;
  priority?: string;
  read:      boolean;
  createdAt: string;
};

/**
 * Subscribe to property status changes (verified, rejected, sold, etc.)
 * Returns an unsubscribe function.
 */
export function onPropertyStatus(cb: (payload: PropertyStatusPayload) => void): () => void {
  _socket?.on('property:status-changed', cb);
  return () => { _socket?.off('property:status-changed', cb); };
}

/**
 * Subscribe to new property submissions (admin room only).
 * Returns an unsubscribe function.
 */
export function onNewSubmission(cb: (payload: NewSubmissionPayload) => void): () => void {
  _socket?.on('property:new-submission', cb);
  return () => { _socket?.off('property:new-submission', cb); };
}

/**
 * Subscribe to real-time in-app notifications delivered to this user.
 * Returns an unsubscribe function.
 */
export function onNotification(cb: (payload: NotificationPayload) => void): () => void {
  _socket?.on('notification:new', cb);
  return () => { _socket?.off('notification:new', cb); };
}

/**
 * Subscribe to admin stats updates (pending verifications count, etc.)
 * Returns an unsubscribe function.
 */
export function onAdminStatsUpdate(cb: (payload: Record<string, unknown>) => void): () => void {
  _socket?.on('admin:stats-update', cb);
  return () => { _socket?.off('admin:stats-update', cb); };
}

// ── Auto-connect helper using stored token ────────────────────────────────────

const ACCESS_TOKEN_KEY = 'landguard_token';
const SESSION_KEY      = 'landguard_session';

export async function connectSocketFromStorage(): Promise<Socket | null> {
  try {
    const [token, sessionStr] = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, SESSION_KEY])
      .then((pairs) => pairs.map((p) => p[1]));
    if (!token) return null;
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    return connectSocket(token, session?.userId);
  } catch {
    return null;
  }
}
