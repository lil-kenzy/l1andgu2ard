/**
 * socket.ts
 * Socket.IO client wrapper for the LANDGUARD web portal.
 *
 * Mirrors the mobile app's lib/socket.ts but uses localStorage instead of
 * AsyncStorage for token retrieval.
 *
 * Usage (in a Client Component):
 *   import { connectSocket, disconnectSocket, onNotification } from '@/lib/socket';
 *
 *   useEffect(() => {
 *     const token = localStorage.getItem('authToken') || '';
 *     connectSocket(token);
 *     const unsub = onNotification((n) => console.log(n));
 *     return () => { unsub(); disconnectSocket(); };
 *   }, []);
 */

import { io, Socket } from 'socket.io-client';
import { SESSION_KEYS } from './auth/session';
import { getBackendBaseUrl } from './api/base';

// getBackendBaseUrl() already strips any trailing /api suffix and returns the
// root server URL, which is what Socket.IO connects to.
const BACKEND_WS_URL = getBackendBaseUrl();

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
    reconnectionDelay: 2000,
  });

  _socket.on('connect', () => {
    console.log('[socket] connected:', _socket?.id);
    if (userId) {
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

// ── Event types ───────────────────────────────────────────────────────────────

export type PropertyStatusPayload = {
  propertyId: string;
  status: 'pending' | 'verified' | 'rejected' | 'sold' | 'available';
  title?: string;
  updatedAt: string;
};

export type NewSubmissionPayload = {
  propertyId: string;
  title?: string;
  submittedAt: string;
};

export type NotificationPayload = {
  _id?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: string;
  read: boolean;
  createdAt: string;
};

// ── Event subscriptions ───────────────────────────────────────────────────────

/** Subscribe to property status changes. Returns an unsubscribe function. */
export function onPropertyStatus(cb: (payload: PropertyStatusPayload) => void): () => void {
  _socket?.on('property:status-changed', cb);
  return () => { _socket?.off('property:status-changed', cb); };
}

/** Subscribe to new property submissions (admin room). Returns an unsubscribe function. */
export function onNewSubmission(cb: (payload: NewSubmissionPayload) => void): () => void {
  _socket?.on('property:new-submission', cb);
  return () => { _socket?.off('property:new-submission', cb); };
}

/** Subscribe to real-time in-app notifications. Returns an unsubscribe function. */
export function onNotification(cb: (payload: NotificationPayload) => void): () => void {
  _socket?.on('notification:new', cb);
  return () => { _socket?.off('notification:new', cb); };
}

/** Subscribe to admin stats updates. Returns an unsubscribe function. */
export function onAdminStatsUpdate(cb: (payload: Record<string, unknown>) => void): () => void {
  _socket?.on('admin:stats-update', cb);
  return () => { _socket?.off('admin:stats-update', cb); };
}

// ── Auto-connect helper using localStorage session ────────────────────────────

/**
 * Reads the stored JWT from localStorage and opens a Socket.IO connection.
 * Safe to call only in Client Components (uses window).
 */
export function connectSocketFromStorage(): Socket | null {
  if (typeof window === 'undefined') return null;

  const token =
    localStorage.getItem(SESSION_KEYS.tokenPrimary) ||
    localStorage.getItem(SESSION_KEYS.tokenAlt1) ||
    localStorage.getItem(SESSION_KEYS.tokenAlt2) ||
    '';

  if (!token) return null;
  return connectSocket(token);
}
