import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

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

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('landguard_token');
      AsyncStorage.removeItem('landguard_role');
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
