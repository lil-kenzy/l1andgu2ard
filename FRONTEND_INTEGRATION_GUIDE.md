# 🔗 FRONTENDS → BACKEND Integration Checklist

**Backend Status**: ✅ Running at `http://localhost:5000`
**Last Updated**: 2026-04-17 22:15 UTC

---

## ⚡ Quick Start for Frontend Teams

### For Web Developers (Next.js)

1. **Environment Setup** ✅ Done
   ```bash
   # File: landguard-web/.env.local
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. **Update API Client**
   ```typescript
   // lib/api/client.ts
   const API_URL = process.env.NEXT_PUBLIC_API_URL;
   
   // Create fetch wrapper
   const apiFetch = async (endpoint: string, options?: RequestInit) => {
     const response = await fetch(`${API_URL}${endpoint}`, {
       ...options,
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${getAccessToken()}`,
         ...options?.headers,
       },
     });
     
     if (response.status === 401) {
       // Token expired, refresh and retry
       await refreshToken();
       return apiFetch(endpoint, options); // Retry
     }
     
     return response.json();
   };
   ```

3. **Test Connection**
   ```bash
   curl http://localhost:5000/health
   # Expected: { "status": "OK", ... }
   ```

4. **Implement Token Management**
   ```typescript
   // Store in httpOnly cookie or secure localStorage
   // Critical: Implement token refresh on 401 response
   
   async function refreshToken() {
     const response = await fetch(`${API_URL}/auth/refresh`, {
       method: 'POST',
       body: JSON.stringify({ refreshToken: getRefreshToken() }),
     });
     
     const { data } = await response.json();
     setAccessToken(data.accessToken);
     setRefreshToken(data.refreshToken);
   }
   ```

5. **Test Auth Endpoints**
   ```bash
   # Register
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Jane Smith",
       "email": "jane@example.com",
       "phone": "0123456789",
       "ghanaCard": "GHA-123456789-1",
       "password": "SecurePass123"
     }'
   
   # Response includes: userId, emailMask, phoneMask
   # Next: Call GET /api/auth/verify-otp with OTP sent to email
   ```

---

### For Mobile Developers (Expo/React Native)

1. **Environment Setup** ✅ Done
   ```bash
   # File: landguard-app/.env
   API_BASE_URL=http://localhost:5000/api
   
   # For Android Emulator:
   # API_BASE_URL=http://10.0.2.2:5000/api
   
   # For physical device on same network (replace with your IP):
   # API_BASE_URL=http://192.168.x.x:5000/api
   ```

2. **Setup Axios Client**
   ```typescript
   // utils/api.ts
   import axios from 'axios';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
   
   export const apiClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 10000,
   });
   
   // Add token to requests
   apiClient.interceptors.request.use(async (config) => {
     const token = await AsyncStorage.getItem('accessToken');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   
   // Handle token refresh on 401
   apiClient.interceptors.response.use(
     response => response,
     async (error) => {
       if (error.response?.status === 401) {
         const refreshToken = await AsyncStorage.getItem('refreshToken');
         const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
           refreshToken,
         });
         const { accessToken, refreshToken: newRefreshToken } = response.data.data;
         await AsyncStorage.setItem('accessToken', accessToken);
         await AsyncStorage.setItem('refreshToken', newRefreshToken);
         return apiClient(error.config);
       }
       return Promise.reject(error);
     }
   );
   ```

3. **Test Connection**
   ```bash
   # From mobile dev:
   # Test on emulator:
   curl http://10.0.2.2:5000/health
   
   # Test on device (replace IP):
   curl http://192.168.x.x:5000/health
   ```

4. **Store Tokens Securely**
   ```typescript
   // Use react-native-keychain for production
   import * as SecureStore from 'expo-secure-store';
   
   async function saveToken(key: string, value: string) {
     await SecureStore.setItemAsync(key, value);
   }
   
   async function getToken(key: string) {
     return await SecureStore.getItemAsync(key);
   }
   ```

5. **Authenticate User Flow**
   ```typescript
   // 1. Register/Login
   const registerResponse = await apiClient.post('/auth/register', {
     fullName, email, phone, ghanaCard, password,
   });
   
   // 2. Get OTP via email/SMS
   // User receives OTP code
   
   // 3. Verify OTP
   const verifyResponse = await apiClient.post('/auth/verify-otp', {
     userId: registerResponse.data.data.userId,
     otp: userEnteredOtp,
     channel: 'sms', // or 'email'
   });
   
   // 4. Store tokens
   const { accessToken, refreshToken } = verifyResponse.data.data;
   await AsyncStorage.setItem('accessToken', accessToken);
   await AsyncStorage.setItem('refreshToken', refreshToken);
   
   // 5. Ready to make API calls!
   ```

---

## 📡 Real-Time Socket.IO Setup

### Web (Next.js)

```typescript
// lib/socket.ts
import io from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
  auth: {
    token: getAccessToken(), // Set from context/store
  },
});

// Listen for messages
socket.on('message:new', (data) => {
  console.log('New message:', data);
  // Update conversation UI
});

socket.on('property:updated', (data) => {
  console.log('Property updated:', data);
  // Refresh property card
});

socket.on('transaction:status-changed', (data) => {
  console.log('Transaction status:', data);
  // Update transaction list
});
```

### Mobile (React Native)

```typescript
// utils/socket.ts
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.API_BASE_URL?.replace('/api', '');

export async function initializeSocket() {
  const token = await AsyncStorage.getItem('accessToken');
  
  const socket = io(BACKEND_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  
  socket.on('message:new', (data) => {
    // Show notification or update UI
  });
  
  return socket;
}
```

---

## 🔐 Authentication State Management

### Web (Next.js + React Context)

```typescript
// context/AuthContext.tsx
import { createContext, useCallback, useEffect, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      // Fetch user profile
      fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setUser(d.data))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, password }),
    });
    const { data } = await response.json();
    // User gets OTP via email, calls verifyOtp next
    return data;
  }, []);

  const verifyOtp = useCallback(async (userId, otp) => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ userId, otp, channel: 'sms' }),
    });
    const { data } = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setAccessToken(null);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Mobile (Redux/Zustand alternative)

```typescript
// store/authStore.ts - Using Zustand
import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  
  hydrate: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) set({ accessToken: token });
  },
  
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      identifier: email, password,
    });
    return response.data.data;
  },
  
  verifyOtp: async (userId, otp) => {
    const response = await apiClient.post('/auth/verify-otp', {
      userId, otp, channel: 'sms',
    });
    const { accessToken, refreshToken, user } = response.data.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken });
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null });
  },
}));
```

---

## 🎯 Common Tasks

### List Properties with Search
```typescript
// GET /api/properties?search=accra&status=available&page=1&limit=20
const { data, pagination } = await apiClient.get('/properties', {
  params: {
    search: 'accra',
    status: 'available',
    page: 1,
    limit: 20,
  }
});
```

### Create Property (Seller)
```typescript
// POST /api/properties
const response = await apiClient.post('/properties', {
  title: 'Land in Accra',
  description: 'Beautiful plot',
  serialNumber: 'ABC123',
  parcelNumber: '123/456',
  price: 50000,
  location: {
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    gps: { lat: 5.6037, lng: -0.3107 }
  }
}, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Get User Profile
```typescript
// GET /api/users/profile
const { data } = await apiClient.get('/users/profile');
console.log(data); // { personalInfo, role, location, ... }
```

### Send Message
```typescript
// POST /api/messages/:conversationId
const response = await apiClient.post(`/messages/${conversationId}`, {
  content: 'I am interested in this property'
});
```

### List Buyer Dashboard
```typescript
// GET /api/properties?page=1&limit=10 (recent listings)
// + GET /api/messages/conversations (recent chats)
// + GET /api/transactions/:userId (purchase history)

const listings = await apiClient.get('/properties?page=1&limit=10');
const conversations = await apiClient.get('/messages/conversations');
```

### List Seller Dashboard
```typescript
// GET /api/properties (seller's properties)
// + GET /api/transactions (incoming offers)
// + GET /api/users/verification-status (seller status)

const myProperties = await apiClient.get('/properties?seller=me');
const offers = await apiClient.get('/transactions?seller=true');
```

---

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

**Common Status Codes**:
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (token missing/expired)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

**Implement Error Boundary**:
```typescript
export async function handleApiError(error: any) {
  if (error.response?.status === 401) {
    // Token expired - try refresh
    const newToken = await refreshToken();
    return retry(newToken);
  }
  
  if (error.response?.status === 403) {
    // Permission denied
    showNotification('You do not have permission for this action');
    return;
  }
  
  if (error.response?.data?.message) {
    showNotification(error.response.data.message);
  } else {
    showNotification('Something went wrong');
  }
}
```

---

## 📋 Testing Checklist

- [ ] Backend health check passes
- [ ] User registration works
- [ ] OTP verification works
- [ ] Token refresh works
- [ ] Protected endpoints return 401 without token
- [ ] List properties endpoint works
- [ ] Create property endpoint works (seller)
- [ ] User profile fetches correctly
- [ ] Messages send and receive
- [ ] Socket.IO real-time updates work
- [ ] Admin dashboard loads
- [ ] Error handling shows user messages
- [ ] Network switching (online/offline) handled
- [ ] Token persists across app restart
- [ ] Load test with 100+ concurrent users

---

## 🚀 Deployment Notes

**Staging**:
```
NEXT_PUBLIC_BACKEND_URL=https://api-staging.landguard.gov.gh
API_BASE_URL=https://api-staging.landguard.gov.gh/api
```

**Production**:
```
NEXT_PUBLIC_BACKEND_URL=https://api.landguard.gov.gh
API_BASE_URL=https://api.landguard.gov.gh/api
```

Ensure HTTPS in production and SSL certificate is valid.

---

**Created**: 2026-04-17 22:15 UTC
**Backend Ver**: 1.0.0
**Status**: ✅ Ready for Integration
