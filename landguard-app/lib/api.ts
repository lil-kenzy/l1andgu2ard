import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

const REFRESH_TOKEN_KEY = 'landguard_refresh_token';

const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('landguard_token');
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

      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        isRefreshing = false;
        await AsyncStorage.multiRemove(['landguard_token', 'landguard_role', REFRESH_TOKEN_KEY]);
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BACKEND_URL}/auth/refresh`, { refreshToken });
        const newAccessToken: string = data.token || data.accessToken;
        if (!newAccessToken) throw new Error('Invalid refresh response');
        const newRefreshToken: string | undefined = data.refreshToken;
        await AsyncStorage.setItem('landguard_token', newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(['landguard_token', 'landguard_role', REFRESH_TOKEN_KEY]);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: any) =>
    apiClient.post('/auth/register', data),
  verifyOtp: (email: string, otp: string) =>
    apiClient.post('/auth/verify-otp', { email, otp }),
  refreshToken: () =>
    apiClient.post('/auth/token-refresh', {}),
  logout: () =>
    apiClient.post('/auth/logout', {}),
};

// Properties endpoints
export const propertiesAPI = {
  getAll: (params?: any) =>
    apiClient.get('/properties', { params }),
  getById: (id: string) =>
    apiClient.get(`/properties/${id}`),
  create: (data: any) =>
    apiClient.post('/properties', data),
  update: (id: string, data: any) =>
    apiClient.put(`/properties/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/properties/${id}`),
  search: (query: string, params?: any) =>
    apiClient.get('/properties/search', { params: { q: query, ...params } }),
};

// Users endpoints
export const usersAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),
  updateProfile: (data: any) =>
    apiClient.put('/users/profile', data),
  uploadProfileImage: (formData: FormData) =>
    apiClient.post('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Transactions endpoints
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

// Notifications endpoints
export const notificationsAPI = {
  getAll: (params?: any) =>
    apiClient.get('/notifications', { params }),
  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`, {}),
  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all', {}),
};

// Analytics endpoints
export const analyticsAPI = {
  getSellerStats: () =>
    apiClient.get('/analytics/seller'),
  getPropertyStats: (propertyId: string) =>
    apiClient.get(`/analytics/properties/${propertyId}`),
};

// Admin endpoints
export const adminAPI = {
  getPendingProperties: () =>
    apiClient.get('/admin/properties-pending'),
  verifyProperty: (id: string, data: { verified: boolean; notes?: string }) =>
    apiClient.patch(`/admin/properties/${id}/verify`, data),
};
