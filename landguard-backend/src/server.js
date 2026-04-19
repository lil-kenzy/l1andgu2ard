const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const documentsRoutes = require('./routes/documents');
const geospatialRoutes = require('./routes/geospatial');
const messagesRoutes = require('./routes/messages');
const notificationsRoutes = require('./routes/notifications');
const paymentsRoutes = require('./routes/payments');
const transactionsRoutes = require('./routes/transactions');
const uploadsRoutes = require('./routes/uploads');
const verificationQueueRoutes = require('./routes/verificationQueue');
const alertsRoutes = require('./routes/alerts');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error');

// Import services
const { initSocket } = require('./services/socketService');
const { verifyToken } = require('./utils/tokens');

const app = express();
const server = createServer(app);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19000',
  'http://localhost:19006',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Expo LAN/tunnel origin in development
    if (
      process.env.NODE_ENV !== 'production' &&
      (origin.startsWith('exp://') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('http://172.'))
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Socket.IO setup for real-time features
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (
        process.env.NODE_ENV !== 'production' &&
        (origin.startsWith('exp://') ||
          origin.startsWith('http://192.168.') ||
          origin.startsWith('http://10.') ||
          origin.startsWith('http://172.'))
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/geospatial', geospatialRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/verification-queue', verificationQueueRoutes);
app.use('/api/alerts', alertsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'LANDGUARD API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      users: '/api/users',
      admin: '/api/admin',
      analytics: '/api/analytics',
      documents: '/api/documents',
      geospatial: '/api/geospatial',
      messages: '/api/messages',
      notifications: '/api/notifications',
      payments: '/api/payments',
      transactions: '/api/transactions',
      uploads: '/api/uploads',
      verificationQueue: '/api/verification-queue'
    }
  });
});

// Socket.IO connection handling
// ── JWT auth middleware ───────────────────────────────────────────────────────
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    // Allow unauthenticated connections (e.g. public map viewers) but mark them
    socket.data.authenticated = false;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    socket.data.userId = decoded.id || decoded.sub;
    socket.data.role   = decoded.role;
    socket.data.authenticated = true;
    next();
  } catch {
    // Invalid token — allow as guest
    socket.data.authenticated = false;
    next();
  }
});

io.on('connection', (socket) => {
  const { userId, role, authenticated } = socket.data;

  if (authenticated && userId) {
    // Every authenticated user joins their own personal room
    socket.join(`user-${userId}`);

    // Admins and government admins join the shared admin room
    if (role === 'admin' || role === 'government_admin') {
      socket.join('admin');
    }
  }

  // Join property room for real-time listing updates (any visitor)
  socket.on('join-property', (propertyId) => {
    if (typeof propertyId === 'string' && propertyId.length <= 64) {
      socket.join(`property-${propertyId}`);
    }
  });

  // Leave property room
  socket.on('leave-property', (propertyId) => {
    socket.leave(`property-${propertyId}`);
  });

  // Handle property view updates
  socket.on('property-view', (propertyId) => {
    socket.to(`property-${propertyId}`).emit('property-updated', {
      propertyId,
      type: 'view',
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Register io instance with socketService so other modules can emit events
initSocket(io);

// Global error handling
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/landguard';

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Ensure 2dsphere indexes exist for geospatial queries
    // (Mongoose schema-level declarations handle this automatically on first sync,
    //  but we also create them imperatively here so Atlas picks them up immediately.)
    await mongoose.connection.db.collection('properties').createIndex(
      { geometry: '2dsphere' },
      { sparse: true }
    );
    await mongoose.connection.db.collection('properties').createIndex(
      { centerPoint: '2dsphere' },
      { sparse: true }
    );
    console.log('Geospatial indexes created');
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Running in development mode without database. Install MongoDB locally or set MONGODB_URI to a valid URI.');
      console.warn('   For Windows: Install MongoDB from https://www.mongodb.com/try/download/community');
      console.warn('   Or use WSL2: apt-get install mongodb');
    }
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`
🚀 LANDGUARD Backend Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 MongoDB: Connected
⚡ Socket.IO: Enabled
🔒 CORS: Configured
📋 Health Check: http://localhost:${PORT}/health
📖 API Docs: http://localhost:${PORT}/api
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

startServer();

module.exports = { app, server, io };