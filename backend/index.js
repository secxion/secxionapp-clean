 import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/index.js';
import mongoose from 'mongoose';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';

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
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP if not configured
  frameguard: { action: 'deny' }, // Set X-Frame-Options to 'DENY'
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(xss());
app.use(mongoSanitize());

app.use('/api', router);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res) => {
    res.setHeader('X-Frame-Options', 'DENY'); // Add X-Frame-Options header
  },
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const db = mongoose.connection;
    console.log(`✅ MongoDB Connected at ${db.host}:${db.port}/${db.name}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log('🌐 Allowed origins:', allowedOrigins);
    });
  })
  .catch((err) => {
    console.error('❌ DB Connection Failed:', err.message);
    process.exit(1);
  });