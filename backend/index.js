 import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/index.js';
import mongoose from 'mongoose';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(origin => origin.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP if not configured
  frameguard: { action: 'deny' }, // Set X-Frame-Options to 'DENY'
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Configure session middleware for CSRF protection
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax',
  },
}));

app.use(xss());
app.use(mongoSanitize());

app.use('/api', router);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error handling middleware for catching errors from async route handlers
app.use((err, req, res, next) => {
  // Only handle API errors as JSON
  if (req.baseUrl.startsWith('/api') || req.path.startsWith('/api')) {
    const statusCode = err.status || 500;
    console.error('❌ API Error:', {
      status: statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });
    return res.status(statusCode).json({
      message: err.message || 'Internal server error',
      status: statusCode,
      success: false,
    });
  }
  // Pass non-API errors to next handler
  next(err);
});

// Serve static files only in production mode
const buildPath = path.join(__dirname, 'build');
if (process.env.NODE_ENV === 'production' && fs.existsSync(buildPath)) {
  app.use(express.static(buildPath, {
    setHeaders: (res) => {
      res.setHeader('X-Frame-Options', 'DENY');
    },
  }));

  // Serve index.html for SPA routing in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Development mode: return 404 for unmatched routes instead of serving HTML
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(404).json({ 
        error: 'Not found', 
        message: 'API endpoint not found. Use /api/* for backend APIs.',
        path: req.path 
      });
    }
  });
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const db = mongoose.connection;
    console.log(`✅ MongoDB Connected`);
    console.log(`   Host: ${db.host}`);
    console.log(`   Port: ${db.port}`);
    console.log(`   Database: ${db.name}`);
    console.log(`   URI: ${process.env.MONGODB_URI}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log('🌐 Allowed origins:', allowedOrigins);
    });
  })
  .catch((err) => {
    console.error('❌ DB Connection Failed:', err.message);
    process.exit(1);
  });