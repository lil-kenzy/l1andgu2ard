# LANDGUARD Backend API - Complete Integration Guide

## 🚀 Backend Status
✅ Backend Server Running on `http://localhost:5000`
✅ All routes mounted and operational
✅ Socket.IO enabled for real-time features
✅ CORS configured for web and mobile clients

---

## 🔑 Authentication Endpoints

### Register User
```
POST /api/auth/register

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",          // Local 10-digit or +233 format
  "ghanaCard": "GHA-123456789-1",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "User registered. OTP sent to email.",
  "data": {
    "userId": "userId_here",
    "emailMask": "jo***@example.com",
    "phoneMask": "+2331234567***"
  }
}
```

### Login
```
POST /api/auth/login

{
  "identifier": "john@example.com",  // email, phone, or Ghana Card
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "OTP sent to your selected channel",
  "data": {
    "userId": "userId_here",
    "channel": "sms"               // or "email"
  }
}
```

### Verify OTP
```
POST /api/auth/verify-otp

{
  "userId": "userId_here",
  "otp": "123456",
  "channel": "sms"                // or "email"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "userId_here",
      "role": "buyer",
      "fullName": "John Doe"
    }
  }
}
```

### Biometric Login (Optional)
```
POST /api/auth/biometric/login

{
  "signature": "base64_encoded_webauthn_signature"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### Refresh Token
```
POST /api/auth/refresh

{
  "refreshToken": "refresh_token_here"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

### Logout
```
POST /api/auth/logout
Header: "Authorization: Bearer access_token_here"

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🏡 Property Endpoints

### List Properties (with search/filter)
```
GET /api/properties?search=query&page=1&limit=20&status=available

Response:
{
  "success": true,
  "data": [
    {
      "_id": "propertyId",
      "title": "Land in Accra",
      "description": "...",
      "serialNumber": "ABC123",
      "parcelNumber": "123/456",
      "price": 50000,
      "seller": { "fullName": "John Doe" },
      "location": { "region": "Greater Accra", "district": "Accra Metropolitan" },
      "views": 45,
      "createdAt": "2026-01-15T10:00:00Z",
      "verificationStatus": "verified"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}
```

### Get Property Detail
```
GET /api/properties/:propertyId

Response: Single property object with seller details
```

### Create Property (Sellers Only)
```
POST /api/properties
Header: "Authorization: Bearer access_token_here"

{
  "title": "Land for Sale",
  "description": "Beautiful land plot",
  "serialNumber": "ABC123",
  "parcelNumber": "123/456",
  "price": 50000,
  "size": 500,
  "sizeUnit": "sqm",
  "location": {
    "region": "Greater Accra",
    "district": "Accra Metropolitan",
    "gps": { "lat": 5.6037, "lng": -0.3107 }
  }
}

Response:
{
  "success": true,
  "data": { "propertyId": "...", "status": "pending" }
}
```

### Update Property (Seller Only)
```
PATCH /api/properties/:propertyId
Header: "Authorization: Bearer access_token_here"

{
  "title": "Updated Title",
  "price": 55000
}
```

### Update Property Status (Seller or Admin)
```
PATCH /api/properties/:propertyId/status

{
  "status": "available | under_offer | sold | rented"
}
```

---

## 👤 User Profile Endpoints

### Get Current User Profile
```
GET /api/users/profile
Header: "Authorization: Bearer access_token_here"

Response:
{
  "success": true,
  "data": {
    "id": "userId",
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+233123456789",
      "ghanaCardNumber": "GHA-123456789-1"
    },
    "role": "buyer",
    "location": { "region": "...", "district": "..." },
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

### Update Profile
```
PATCH /api/users/profile
Header: "Authorization: Bearer access_token_here"

{
  "fullName": "Jane Doe",
  "region": "Ashanti",
  "district": "Kumasi"
}
```

### Verify as Seller (Submit Documents)
```
POST /api/users/verify-seller
Header: "Authorization: Bearer access_token_here"
Content-Type: multipart/form-data

FormData:
- documents: [file1, file2, file3]  // business license, ID proof, etc.

Response:
{
  "success": true,
  "message": "Documents submitted for verification",
  "data": { "status": "pending_review" }
}
```

### Get User Public Profile
```
GET /api/users/:userId

Response: Public profile (limited fields)
```

---

## 💳 Transaction Endpoints

### Initiate Transaction
```
POST /api/transactions/initiate
Header: "Authorization: Bearer access_token_here"

{
  "propertyId": "...",
  "buyerMessage": "Interested in purchasing"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "...",
    "escrowAmount": 5000,  // 10% of property price
    "status": "initiated"
  }
}
```

### Confirm Transaction
```
POST /api/transactions/:transactionId/confirm

{
  "paymentReference": "PAYSTACK_REF_123"
}

Response:
{
  "success": true,
  "message": "Transaction confirmed, escrow held"
}
```

### Upload Transaction Document
```
POST /api/transactions/:transactionId/upload-document
Content-Type: multipart/form-data

FormData:
- document: file
- type: "survey_report | title_deed | proof_of_payment"

Response:
{
  "success": true,
  "data": { "documentId": "..." }
}
```

### Complete Transaction
```
POST /api/transactions/:transactionId/complete

Response:
{
  "success": true,
  "message": "Transaction completed, escrow released to seller"
}
```

---

## 💬 Messaging Endpoints

### Get Conversations
```
GET /api/messages/conversations
Header: "Authorization: Bearer access_token_here"

Response:
{
  "success": true,
  "data": [
    {
      "conversationId": "...",
      "otherParty": { "fullName": "...", "avatar": "..." },
      "lastMessage": "...",
      "unreadCount": 3,
      "updatedAt": "2026-04-17T22:00:00Z"
    }
  ]
}
```

### Get Conversation Messages
```
GET /api/messages/:conversationId?page=1&limit=50

Response:
{
  "success": true,
  "data": [
    {
      "messageId": "...",
      "sender": { "id": "...", "fullName": "..." },
      "content": "Are you interested in discussing this property?",
      "readAt": "2026-04-17T22:05:00Z",
      "createdAt": "2026-04-17T22:00:00Z"
    }
  ]
}
```

### Send Message
```
POST /api/messages/:conversationId
Header: "Authorization: Bearer access_token_here"

{
  "content": "Yes, I'm interested in the property"
}

Response:
{
  "success": true,
  "data": { "messageId": "..." }
}
```

### Real-Time Socket.IO Events
```javascript
// Client-side subscription
socket.on('message:new', (data) => {
  // data = { conversationId, message: {...} }
});

socket.on('property:updated', (data) => {
  // data = { propertyId, status, timestamp }
});

socket.on('transaction:status-changed', (data) => {
  // data = { transactionId, status }
});
```

---

## 📊 Admin Dashboard Endpoints

### Admin Dashboard Metrics
```
GET /api/admin/dashboard
Header: "Authorization: Bearer access_token_here"
Note: Requires admin role

Response:
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalProperties": 3400,
      "disputes": 12,
      "fraudAlerts": 5
    },
    "recentActivity": [...]
  }
}
```

### List Users (Admin)
```
GET /api/admin/users?page=1&limit=20&role=seller&search=query

Response: Paginated user list with sorting
```

### Suspend User (Admin)
```
PATCH /api/admin/users/:userId/suspend

{
  "reason": "Suspicious activity detected"
}
```

### List Fraud Alerts (Admin)
```
GET /api/admin/fraud-alerts?status=new&page=1&limit=20

Response: List of fraud alerts with details
```

### Resolve Dispute (Admin)
```
PATCH /api/admin/disputes/:disputeId/resolve

{
  "status": "resolved",
  "resolution": "Property parcel awarded to complainant",
  "parcelsFreezed": ["propertyId1", "propertyId2"]
}
```

### Export Property Registry
```
GET /api/admin/registry?format=geojson

Response: GeoJSON FeatureCollection of all properties
```

### Get Audit Logs (Admin)
```
GET /api/admin/audit-logs?userId=...&action=...&page=1&limit=50

Response: Immutable audit trail of all system actions
```

---

## 🔄 Background Workers (Not Yet Callable via API)

The following workers run automatically:

1. **DocumentExpiryChecker** (Daily)
   - Sends alerts for documents expiring in 30/7/1 days

2. **FraudDetectionEngine** (Every 6 hours)
   - Scans for duplicate GPS locations, price volatility, suspicious account patterns

3. **NotificationDigest** (Daily)
   - Sends consolidated email digest to users

4. **DataBackupSync** (Hourly)
   - Backs up critical data to secondary storage

5. **OfflineSyncQueue** (On Reconnect)
   - Syncs offline actions when connection restored

---

## 🔌 Frontend Integration Checklist

### Web (Next.js)
- ✅ `.env.local` created with `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
- [ ] Update `lib/api.ts` to use environment variable
- [ ] Implement refresh token rotation in fetch interceptor
- [ ] Store tokens in httpOnly cookies (secure) or localStorage

### Mobile (Expo/React Native)
- ✅ `.env` created with `API_BASE_URL=http://localhost:5000/api`
- [ ] Update axios interceptor to use environment variable
- [ ] Implement token refresh logic
- [ ] Store tokens in AsyncStorage with device check

### Error Handling
```javascript
// Standard error response format from backend
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"  // If applicable
  "stack": "..."        // Dev mode only
}
```

---

## 📝 External Integration Points (Production Setup Required)

### ✅ SMS/Email Provider
- **File**: `lib/auth.ts` → OTP delivery function
- **Needed**: Twilio, Vonage, or local provider credentials
- **Actions**: Wire SMS send for 6-digit OTP

### ✅ Ghana Card Verification (NIA)
- **File**: `routes/auth.js` → `/register` endpoint
- **Needed**: NIA Ghana Card API credentials
- **Actions**: Validate Ghana Card before account creation

### ✅ Payment Gateway Webhooks
- **File**: `routes/payments.js` → `/webhook` endpoint
- **Needed**: Paystack, Hubtel, or Zeepay API keys
- **Actions**: Listen for payment confirmations, release escrow

### ✅ Media Upload (S3/Azure)
- **File**: `middleware/upload.js` → Multer configuration
- **Needed**: AWS S3 or Azure Blob Storage credentials
- **Actions**: Store property images, documents, avatars

### ✅ OCR & Virus Scanning
- **File**: `routes/documents.js` → OCR and scan triggers
- **Needed**: Google Cloud Vision API, ClamAV server
- **Actions**: Extract text from documents, scan for malware

---

## 🧪 Quick Test Commands

```bash
# Test health check
curl http://localhost:5000/health

# Test API root
curl http://localhost:5000/api

# Test auth (POST register)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "ghanaCard": "GHA-123456789-1",
    "password": "TestPass123"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Solution**: Install MongoDB locally or use MongoDB Atlas
```
Windows: https://www.mongodb.com/try/download/community
Mac: brew install mongodb-community
Linux: apt-get install mongodb
```

### CORS Error on Frontend
**Solution**: Verify `MONGODB_URI` and `CLIENT_URL` in backend `.env`

### Token Expired Error
**Solution**: Implement automatic refresh token logic in frontend

### Port 5000 Already in Use
**Solution**: `netstat -ano | findstr :5000` (Windows) then kill process or change PORT in `.env`

---

## 📞 Support
All endpoints documented. For any issues, check server logs or create issue on GitHub.

Generated: 2026-04-17 22:15 UTC
