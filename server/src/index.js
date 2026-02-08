import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { connectDB } from './config/database.js';
import logger from './config/logger.js';
import { requestId, requestLogger } from './middleware/logging.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Request ID middleware (must be first)
app.use(requestId);

// Security Middleware
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent MongoDB injection

// CORS with validation
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// CSRF Protection (after cookie parser, before routes)
const {
  generateToken, // generates a secret + token pair
  doubleCsrfProtection, // middleware for CSRF protection
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'your-csrf-secret-change-this',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// CSRF token endpoint
app.get('/api/v1/csrf-token', (req, res) => {
  const csrfToken = generateToken(req, res);
  res.json({ csrfToken });
});

// Apply CSRF protection to all routes except public auth endpoints
app.use((req, res, next) => {
  // Skip CSRF for public auth endpoints and GET requests (GET is safe by design)
  if (
    req.method === 'GET' ||
    req.method === 'HEAD' ||
    req.method === 'OPTIONS' ||
    req.path === '/api/v1/auth/login' ||
    req.path === '/api/v1/auth/register' ||
    req.path === '/api/v1/auth/refresh' ||
    req.path === '/api/v1/csrf-token'
  ) {
    return next();
  }
  doubleCsrfProtection(req, res, next);
});

// API Routes with versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFound);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
