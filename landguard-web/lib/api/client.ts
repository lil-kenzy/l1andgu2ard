import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
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
  getById: (id: string) => apiClient.get(`/properties/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/properties', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/properties/${id}`, data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/properties/${id}/status`, { status }),
  nearby: (params: Record<string, unknown>) => apiClient.get('/geospatial/nearby', { params }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: Record<string, unknown>) => apiClient.patch('/users/profile', data),
  getPublicProfile: (id: string) => apiClient.get(`/users/${id}`),
  verifySeller: (formData: FormData) =>
    apiClient.post('/users/verify-seller', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsAPI = {
  initiate: (data: Record<string, unknown>) => apiClient.post('/transactions/initiate', data),
  confirm: (id: string, data: Record<string, unknown>) => apiClient.post(`/transactions/${id}/confirm`, data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/transactions/${id}/status`, { status }),
  getHistory: (params?: Record<string, unknown>) => apiClient.get('/transactions/history', { params }),
  complete: (id: string) => apiClient.post(`/transactions/${id}/complete`, {}),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesAPI = {
  getConversations: () => apiClient.get('/messages/conversations'),
  getMessages: (id: string) => apiClient.get(`/messages/${id}`),
  sendMessage: (id: string, data: Record<string, unknown>) => apiClient.post(`/messages/${id}`, data),
  markRead: (id: string) => apiClient.patch(`/messages/${id}/read`, {}),
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
  getById: (id: string) => apiClient.get(`/documents/${id}`),
  getExpired: () => apiClient.get('/documents/expired'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
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
  getComplianceReport: (params?: Record<string, unknown>) => apiClient.get('/admin/compliance-report', { params }),
};
