import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
export type { AxiosError } from 'axios';
import { getBackendBaseUrl } from './base';
import { SESSION_KEYS, clearClientSession } from '../auth/session';

const BASE_URL = `${getBackendBaseUrl()}/api`;

const REFRESH_TOKEN_KEY = 'lg_refresh_token';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(SESSION_KEYS.tokenPrimary) ||
    localStorage.getItem(SESSION_KEYS.tokenAlt1) ||
    localStorage.getItem(SESSION_KEYS.tokenAlt2) ||
    ''
  );
}

function getRefreshToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
}

function storeTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEYS.tokenPrimary, accessToken);
  localStorage.setItem(SESSION_KEYS.tokenAlt1, accessToken);
  localStorage.setItem(SESSION_KEYS.tokenAlt2, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — attempt token refresh once, then give up
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else if (token) {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        clearClientSession();
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken: string = data.token || data.accessToken;
        if (!newAccessToken) throw new Error('Invalid refresh response');
        const newRefreshToken: string | undefined = data.refreshToken;
        storeTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearClientSession();
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: Record<string, unknown>) => apiClient.post('/auth/register', data),
  login: (data: Record<string, unknown>) => apiClient.post('/auth/login', data),
  verifyOtp: (data: Record<string, unknown>) => apiClient.post('/auth/verify-otp', data),
  refreshToken: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout', {}),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: Record<string, unknown>) => apiClient.post('/auth/reset-password', data),
};

// ── Properties ────────────────────────────────────────────────────────────────
export const propertiesAPI = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/properties', { params }),
  getMine: () => apiClient.get('/properties/mine'),
  getById: (id: string) => apiClient.get(`/properties/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/properties', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/properties/${id}`, data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/properties/${id}/status`, { status }),
  nearby: (params: Record<string, unknown>) => apiClient.get('/geospatial/nearby', { params }),
  save: (id: string) => apiClient.post(`/properties/${id}/save`, {}),
  getSaved: () => apiClient.get('/users/saved-properties'),
  report: (id: string, description: string) => apiClient.post(`/properties/${id}/report`, { description }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: Record<string, unknown>) => apiClient.patch('/users/profile', data),
  updateSellerInfo: (data: {
    businessRegNumber?: string;
    tin?: string;
    physicalAddress?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }) => apiClient.patch('/users/seller-info', data),
  getPublicProfile: (id: string) => apiClient.get(`/users/${id}`),
  verifySeller: (formData: FormData) =>
    apiClient.post('/users/verify-seller', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsAPI = {
  initiate: (data: Record<string, unknown>) => apiClient.post('/transactions/initiate', data),
  confirm: (id: string, data?: Record<string, unknown>) => apiClient.post(`/transactions/${id}/confirm`, data || {}),
  getById: (id: string) => apiClient.get(`/transactions/${id}`),
  updateStatus: (id: string, status: string, note?: string) => apiClient.patch(`/transactions/${id}/status`, { status, note }),
  getHistory: (params?: Record<string, unknown>) => apiClient.get('/transactions/history', { params }),
  complete: (id: string) => apiClient.post(`/transactions/${id}/complete`, {}),
  cancel: (id: string, reason?: string) => apiClient.post(`/transactions/${id}/cancel`, { reason }),
  uploadDocument: (id: string, data: Record<string, unknown>) => apiClient.post(`/transactions/${id}/upload-document`, data),
  /** Returns ownership certificate — locked until platform fee is paid and transaction is completed */
  ownershipCertificate: (id: string) => apiClient.get(`/transactions/${id}/ownership-certificate`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  /** Preview platform fee for a given amount */
  calculateFee: (amount: number, currency = 'GHS') =>
    apiClient.get('/payments/fee-calculate', { params: { amount, currency } }),
  /** Initialize a Paystack payment — returns authorization_url */
  initialize: (transactionId: string, email?: string) =>
    apiClient.post('/payments/initialize', { transactionId, email }),
  /** Verify payment after redirect from Paystack */
  verify: (reference: string) => apiClient.get(`/payments/verify/${encodeURIComponent(reference)}`),
  /** Place funds into escrow hold */
  initiateEscrow: (transactionId: string) =>
    apiClient.post('/payments/escrow/initiate', { transactionId }),
  /** Release escrow to seller */
  releaseEscrow: (transactionId: string) =>
    apiClient.post('/payments/escrow/release', { transactionId }),
  /** Check escrow state */
  escrowStatus: (transactionId: string) =>
    apiClient.get('/payments/escrow/status', { params: { transactionId } }),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesAPI = {
  getConversations: () => apiClient.get('/messages/conversations'),
  /** Open or reuse a conversation. Pass landParcelId to attach property context. */
  startConversation: (receiverId: string, landParcelId?: string) =>
    apiClient.post('/messages/conversations/start', { receiverId, landParcelId }),
  getMessages: (conversationId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: (conversationId: string, data: Record<string, unknown>) =>
    apiClient.post(`/messages/conversations/${conversationId}`, data),
  markRead: (messageId: string) => apiClient.patch(`/messages/${messageId}/read`, {}),
  reportMessage: (messageId: string) => apiClient.post(`/messages/${messageId}/report`, {}),
};

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alertsAPI = {
  getAll: () => apiClient.get('/alerts'),
  create: (data: Record<string, unknown>) => apiClient.post('/alerts', data),
  delete: (id: string) => apiClient.delete(`/alerts/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/notifications', { params }),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.patch('/notifications/read-all', {}),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentsAPI = {
  upload: (formData: FormData) =>
    apiClient.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  triggerOcr: (id: string) => apiClient.post('/documents/ocr', { documentId: id }),
  getAll: () => apiClient.get('/documents'),
  getById: (id: string) => apiClient.get(`/documents/${id}`),
  getExpired: () => apiClient.get('/documents/expired'),
  /** Fetch a short-lived access URL with watermark metadata for secure viewing */
  viewDocument: (id: string) => apiClient.get(`/documents/${id}/view`),
};

// ── GhanaPostGPS ──────────────────────────────────────────────────────────────
// All GhanaPost calls now go through the backend proxy (keeps API key server-side).
export const ghanaPostAPI = {
  /** Look up a digital address → coordinates (server-side proxy) */
  lookup: (address: string) => apiClient.get('/geocoding/ghanapost/lookup', { params: { address } }),
  /** Coordinates → digital address (server-side proxy) */
  reverse: (lat: number, lng: number) => apiClient.get('/geocoding/ghanapost/reverse', { params: { lat, lng } }),
  /** Validate a digital address format + existence */
  validate: (address: string) => apiClient.post('/geocoding/ghanapost/validate', { address }),
};

// ── Geocoding ─────────────────────────────────────────────────────────────────
export const geocodingAPI = {
  /** Coordinates → human-readable address (Google Geocoding) */
  reverse: (lat: number, lng: number) => apiClient.get('/geocoding/reverse', { params: { lat, lng } }),
  /** Address text → coordinates (Google Geocoding) */
  forward: (address: string) => apiClient.get('/geocoding/forward', { params: { address } }),
  /** Address autocomplete suggestions (Google Places) */
  places: (input: string, opts?: { lat?: number; lng?: number; radius?: number }) =>
    apiClient.get('/geocoding/places', { params: { input, ...opts } }),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getSellerStats: () => apiClient.get('/analytics/seller'),
  getPropertyStats: (propertyId: string) => apiClient.get(`/analytics/properties/${propertyId}`),
};

export const adminAPI = {  getDashboard: () => apiClient.get('/admin/dashboard'),
  getUsers: (params?: Record<string, unknown>) => apiClient.get('/admin/users', { params }),
  suspendUser: (id: string, data: Record<string, unknown>) => apiClient.patch(`/admin/users/${id}/suspend`, data),
  unsuspendUser: (id: string) => apiClient.patch(`/admin/users/${id}/unsuspend`, {}),
  getFraudAlerts: (params?: Record<string, unknown>) => apiClient.get('/admin/fraud-alerts', { params }),
  triageFraudAlert: (id: string, data: Record<string, unknown>) => apiClient.patch(`/admin/fraud-alerts/${id}`, data),
  getDisputes: (params?: Record<string, unknown>) => apiClient.get('/admin/disputes', { params }),
  resolveDispute: (id: string, data: Record<string, unknown>) => apiClient.patch(`/admin/disputes/${id}/resolve`, data),
  getAuditLogs: (params?: Record<string, unknown>) => apiClient.get('/admin/audit-logs', { params }),
  getOfficers: (params?: Record<string, unknown>) => apiClient.get('/admin/officers', { params }),
  createOfficer: (data: Record<string, unknown>) => apiClient.post('/admin/officers', data),
  getRegistry: (params?: Record<string, unknown>) => apiClient.get('/admin/registry', { params }),
  getSettings: () => apiClient.get('/admin/settings'),
  saveSetting: (data: Record<string, unknown>) => apiClient.post('/admin/settings', data),
  getPendingProperties: () => apiClient.get('/admin/properties-pending'),
  verifyProperty: (id: string, data: Record<string, unknown>) => apiClient.patch(`/admin/properties/${id}/verify`, data),
  bulkVerify: (data: { ids: string[]; verified: boolean; notes?: string }) => apiClient.post('/admin/properties/bulk-verify', data),
  getComplianceReport: (params?: Record<string, unknown>) => apiClient.get('/admin/compliance-report', { params }),
};
