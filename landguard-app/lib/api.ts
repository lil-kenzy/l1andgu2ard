import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

const ACCESS_TOKEN_KEY  = 'landguard_token';
const REFRESH_TOKEN_KEY = 'landguard_refresh_token';
const ROLE_KEY          = 'landguard_role';
const SESSION_KEY       = 'landguard_session';

const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — attempt token refresh once, then clear session
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

      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        isRefreshing = false;
        await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, ROLE_KEY, REFRESH_TOKEN_KEY, SESSION_KEY]);
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BACKEND_URL}/auth/refresh`, { refreshToken });
        // Backend returns: { success: true, data: { accessToken, refreshToken } }
        const newAccessToken: string  = data?.data?.accessToken  || data?.accessToken  || data?.token;
        const newRefreshToken: string = data?.data?.refreshToken || data?.refreshToken || '';
        if (!newAccessToken) throw new Error('Invalid refresh response');

        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, ROLE_KEY, REFRESH_TOKEN_KEY, SESSION_KEY]);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authAPI = {
  // identifier can be phone number, email, or Ghana Card number
  login: (identifier: string, password: string, role?: string, otpChannel?: string) =>
    apiClient.post('/auth/login', { identifier, password, role, otpChannel }),

  register: (data: {
    fullName: string;
    phone: string;
    ghanaCardNumber: string;
    password: string;
    email?: string;
    role?: string;
    otpChannel?: string;
  }) => apiClient.post('/auth/register', data),

  // userId is the MongoDB _id returned by login/register
  verifyOtp: (userId: string, otp: string, channel?: string) =>
    apiClient.post('/auth/verify-otp', { userId, otp, channel }),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  logoutAll: () =>
    apiClient.post('/auth/logout-all', {}),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (resetToken: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { resetToken, newPassword }),

  // Biometric — store device public key hash on backend after OTP-verified login
  biometricSetup: (publicKey: string) =>
    apiClient.post('/auth/biometric/setup', { publicKey }),

  // Biometric login — sends a stable device-bound signature derived from the stored key
  biometricLogin: (identifier: string, biometricSignature: string) =>
    apiClient.post('/auth/biometric/login', { identifier, biometricSignature }),
};

// ── Properties endpoints ──────────────────────────────────────────────────────
export const propertiesAPI = {
  getAll: (params?: any) =>
    apiClient.get('/properties', { params }),
  getMine: () =>
    apiClient.get('/properties/mine'),
  getById: (id: string) =>
    apiClient.get(`/properties/${id}`),
  create: (data: any) =>
    apiClient.post('/properties', data),
  update: (id: string, data: any) =>
    apiClient.patch(`/properties/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/properties/${id}/status`, { status }),
  delete: (id: string) =>
    apiClient.delete(`/properties/${id}`),
  search: (query: string, params?: any) =>
    apiClient.get('/properties', { params: { q: query, ...params } }),
  nearby: (lng: number, lat: number, radius?: number) =>
    apiClient.get('/geospatial/nearby', { params: { lng, lat, radius } }),
  save: (id: string) =>
    apiClient.post(`/properties/${id}/save`, {}),
  report: (id: string, description: string) =>
    apiClient.post(`/properties/${id}/report`, { description }),
  getSaved: () =>
    apiClient.get('/users/saved-properties'),
};

// ── Alerts (Property area alerts) endpoints ───────────────────────────────────
export const alertsAPI = {
  getAll: () =>
    apiClient.get('/alerts'),
  create: (data: {
    label?: string;
    region?: string;
    district?: string;
    priceMin?: number;
    priceMax?: number;
    category?: string;
    type?: string;
  }) => apiClient.post('/alerts', data),
  delete: (id: string) =>
    apiClient.delete(`/alerts/${id}`),
};

// ── Messages endpoints ────────────────────────────────────────────────────────
export const messagesAPI = {
  getConversations: () =>
    apiClient.get('/messages/conversations'),
  startConversation: (receiverId: string, propertyId?: string) =>
    apiClient.post('/messages/conversations/start', { receiverId, landParcelId: propertyId }),
  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: (conversationId: string, body: string) =>
    apiClient.post(`/messages/conversations/${conversationId}`, { body }),
  markAsRead: (messageId: string) =>
    apiClient.patch(`/messages/${messageId}/read`, {}),
  reportMessage: (messageId: string) =>
    apiClient.post(`/messages/${messageId}/report`, {}),
};

// ── Users endpoints ───────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),
  updateProfile: (data: any) =>
    apiClient.patch('/users/profile', data),
  updateSellerInfo: (data: {
    businessRegNumber?: string;
    tin?: string;
    physicalAddress?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }) => apiClient.patch('/users/seller-info', data),
  uploadProfileImage: (formData: FormData) =>
    apiClient.post('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Transactions endpoints ────────────────────────────────────────────────────
export const transactionsAPI = {
  getAll: (params?: any) =>
    apiClient.get('/transactions', { params }),
  getById: (id: string) =>
    apiClient.get(`/transactions/${id}`),
  create: (data: any) =>
    apiClient.post('/transactions', data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/transactions/${id}/status`, { status }),
};

// ── Notifications endpoints ───────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params?: any) =>
    apiClient.get('/notifications', { params }),
  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`, {}),
  markAllAsRead: () =>
    apiClient.put('/notifications/read-all', {}),
  delete: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
  getSettings: () =>
    apiClient.get('/notifications/settings'),
  updateSettings: (data: { email?: boolean; sms?: boolean; push?: boolean }) =>
    apiClient.put('/notifications/settings', data)
};

// ── Push token ────────────────────────────────────────────────────────────────
export const pushAPI = {
  registerToken: (fcmToken: string) =>
    apiClient.post('/users/push-token', { fcmToken })
};

// ── Analytics endpoints ───────────────────────────────────────────────────────
export const analyticsAPI = {
  getSellerStats: () =>
    apiClient.get('/analytics/seller'),
  getPropertyStats: (propertyId: string) =>
    apiClient.get(`/analytics/properties/${propertyId}`),
};

// ── Admin endpoints ───────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () =>
    apiClient.get('/admin/dashboard'),
  getUsers: (params?: any) =>
    apiClient.get('/admin/users', { params }),
  suspendUser: (id: string, data: { reason?: string }) =>
    apiClient.patch(`/admin/users/${id}/suspend`, data),
  unsuspendUser: (id: string) =>
    apiClient.patch(`/admin/users/${id}/unsuspend`, {}),
  getFraudAlerts: (params?: any) =>
    apiClient.get('/admin/fraud-alerts', { params }),
  triageFraudAlert: (id: string, data: any) =>
    apiClient.patch(`/admin/fraud-alerts/${id}`, data),
  getDisputes: (params?: any) =>
    apiClient.get('/admin/disputes', { params }),
  resolveDispute: (id: string, data: any) =>
    apiClient.patch(`/admin/disputes/${id}/resolve`, data),
  getAuditLogs: (params?: any) =>
    apiClient.get('/admin/audit-logs', { params }),
  getOfficers: (params?: any) =>
    apiClient.get('/admin/officers', { params }),
  createOfficer: (data: any) =>
    apiClient.post('/admin/officers', data),
  getRegistry: (params?: any) =>
    apiClient.get('/admin/registry', { params }),
  getSettings: () =>
    apiClient.get('/admin/settings'),
  saveSetting: (data: any) =>
    apiClient.post('/admin/settings', data),
  getPendingProperties: () =>
    apiClient.get('/admin/properties-pending'),
  verifyProperty: (id: string, data: { verified: boolean; notes?: string }) =>
    apiClient.patch(`/admin/properties/${id}/verify`, data),
  bulkVerify: (data: { ids: string[]; verified: boolean; notes?: string }) =>
    apiClient.post('/admin/properties/bulk-verify', data),
  getComplianceReport: (params?: any) =>
    apiClient.get('/admin/compliance-report', { params }),
};

// ── GhanaPostGPS ──────────────────────────────────────────────────────────────
// All GhanaPost calls go through the backend proxy (keeps API key server-side).
export const ghanaPostAPI = {
  /** Look up a digital address → coordinates */
  lookup: (address: string) =>
    apiClient.get('/geocoding/ghanapost/lookup', { params: { address } }),
  /** Coordinates → digital address */
  reverse: (lat: number, lng: number) =>
    apiClient.get('/geocoding/ghanapost/reverse', { params: { lat, lng } }),
  /** Validate a digital address format + existence */
  validate: (address: string) =>
    apiClient.post('/geocoding/ghanapost/validate', { address }),
};

// ── Geocoding ─────────────────────────────────────────────────────────────────
export const geocodingAPI = {
  /** Coordinates → human-readable address (Google Geocoding) */
  reverse: (lat: number, lng: number) =>
    apiClient.get('/geocoding/reverse', { params: { lat, lng } }),
  /** Address text → coordinates (Google Geocoding) */
  forward: (address: string) =>
    apiClient.get('/geocoding/forward', { params: { address } }),
  /** Address autocomplete suggestions (Google Places) */
  places: (input: string, opts?: { lat?: number; lng?: number; radius?: number }) =>
    apiClient.get('/geocoding/places', { params: { input, ...opts } }),
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
  verify: (reference: string) =>
    apiClient.get(`/payments/verify/${encodeURIComponent(reference)}`),
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


// ── Documents endpoints ───────────────────────────────────────────────────────
export const documentsAPI = {
  getAll: () =>
    apiClient.get('/documents'),
  upload: (formData: FormData) =>
    apiClient.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  triggerOcr: (id: string) =>
    apiClient.post('/documents/ocr', { documentId: id }),
  getById: (id: string) =>
    apiClient.get(`/documents/${id}`),
  getExpired: () =>
    apiClient.get('/documents/expired'),
  /** Fetch a short-lived access URL with watermark metadata for secure viewing */
  viewDocument: (id: string) =>
    apiClient.get(`/documents/${id}/view`),
};
