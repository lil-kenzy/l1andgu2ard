# LANDGUARD Backend API

A comprehensive backend API for Ghana's national land registry and property marketplace platform.

## Features

- **Property Management**: CRUD operations for land parcels and properties
- **User Authentication**: JWT-based authentication with role-based access
- **Transaction Processing**: Secure property transaction handling
- **File Upload**: AWS S3 integration for images and documents
- **Geospatial Queries**: Location-based property search
- **Real-time Notifications**: Socket.io integration for live updates
- **Analytics Dashboard**: Admin analytics and reporting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **Real-time**: Socket.io
- **Validation**: Express-validator
- **Security**: Helmet, CORS, bcryptjs

## Project Structure

```
landguard-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/             # Route handlers (TODO)
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── error.js            # Error handling
│   │   ├── upload.js           # File upload middleware
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── Property.js         # Property schema
│   │   ├── User.js             # User schema
│   │   ├── Transaction.js      # Transaction schema
│   │   └── Notification.js     # Notification schema
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── properties.js       # Property CRUD routes
│   │   ├── users.js            # User management routes
│   │   ├── transactions.js     # Transaction routes
│   │   ├── uploads.js          # File upload routes
│   │   ├── notifications.js    # Notification routes
│   │   └── analytics.js        # Analytics routes
│   ├── utils/
│   │   ├── jwt.js              # JWT utilities
│   │   ├── geolocation.js      # Geospatial utilities
│   │   └── response.js         # Response formatting
│   └── server.js               # Main server file
├── uploads/                    # Local file uploads (dev)
├── .env.example               # Environment variables template
├── package.json               # Dependencies
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- AWS S3 account (for file storage)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd landguard-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/landguard

   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-token-secret

   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET=your-s3-bucket-name
   AWS_REGION=us-east-1

   GHANA_CARD_API_KEY=your-ghana-card-api-key
   SMS_API_KEY=your-sms-service-api-key
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-ghana-card` - Verify Ghana Card
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property (seller only)
- `PUT /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner only)
- `GET /api/properties/nearby` - Get nearby properties

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload avatar
- `POST /api/users/verify-seller` - Submit seller verification
- `GET /api/users/verification-status` - Get verification status
- `GET /api/users/:id` - Get user by ID (public profile)

### Transactions
- `POST /api/transactions/initiate` - Initiate transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id/status` - Update transaction status
- `POST /api/transactions/:id/upload-document` - Upload document
- `GET /api/transactions/user/:userId` - Get user's transactions
- `POST /api/transactions/:id/complete` - Complete transaction
- `POST /api/transactions/:id/cancel` - Cancel transaction

### File Uploads
- `POST /api/uploads/property-images` - Upload property images
- `POST /api/uploads/verification-documents` - Upload verification docs
- `POST /api/uploads/transaction-documents` - Upload transaction docs
- `DELETE /api/uploads/:fileId` - Delete uploaded file
- `GET /api/uploads/presigned-url` - Get presigned URL

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/send` - Send notification (admin)
- `GET /api/notifications/settings` - Get notification settings
- `PUT /api/notifications/settings` - Update settings

### Analytics (Admin Only)
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/properties` - Property analytics
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/transactions` - Transaction analytics
- `GET /api/analytics/regional` - Regional analytics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Data Models

### Property
```javascript
{
  title: String,
  description: String,
  price: Number,
  propertyType: Enum['land', 'house', 'apartment', 'commercial', 'industrial'],
  transactionType: Enum['sale', 'lease', 'rental'],
  location: {
    address: String,
    region: String,
    coordinates: [Number, Number] // [longitude, latitude]
  },
  size: Number, // in square meters
  features: [String],
  images: [String], // URLs
  seller: ObjectId,
  isVerified: Boolean,
  isAvailable: Boolean
}
```

### User
```javascript
{
  name: String,
  email: String,
  phone: String,
  password: String, // hashed
  role: Enum['buyer', 'seller', 'admin'],
  avatar: String, // URL
  ghanaCardNumber: String,
  isVerified: Boolean,
  verificationDocuments: [String], // URLs
  isActive: Boolean
}
```

### Transaction
```javascript
{
  property: ObjectId,
  buyer: ObjectId,
  seller: ObjectId,
  amount: Number,
  status: Enum['initiated', 'payment_pending', 'completed', 'cancelled'],
  transactionType: String,
  documents: [{
    type: String,
    url: String,
    uploadedBy: ObjectId
  }]
}
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Testing
```bash
npm test
```

### Code Style
- Use ESLint for code linting
- Follow standard JavaScript naming conventions
- Use async/await for asynchronous operations
- Include JSDoc comments for functions

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-jwt-secret
AWS_ACCESS_KEY_ID=your-production-aws-key
AWS_SECRET_ACCESS_KEY=your-production-aws-secret
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start src/server.js --name landguard-backend
pm2 startup
pm2 save
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@landguard.gov.gh or create an issue in the repository.