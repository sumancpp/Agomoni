import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import authRouter from './modules/auth/auth.controller.js';
import profileRouter from './modules/users/profile.controller.js';
import datingRouter from './modules/dating/dating.controller.js';
import chatRouter from './modules/chat/chat.controller.js';
import paymentsRouter from './modules/payments/payments.controller.js';
import lostFoundRouter from './modules/lost-found/lost-found.controller.js';
import memoryRouter from './modules/memory/memory.controller.js';
import emergencyRouter from './modules/emergency/emergency.controller.js';
import musicRouter from './modules/music/music.controller.js';
import calendarRouter from './modules/calendar/calendar.controller.js';
import notificationsRouter from './modules/notifications/notifications.controller.js';
import adminRouter from './modules/admin/admin.controller.js';
import { errorHandler } from './common/middleware/error.middleware.js';
import { authenticate } from './common/middleware/auth.middleware.js';
import config from './config/index.js';

export const app = express();

// Trust reverse proxy (Render, Heroku, Cloudflare, etc.) for X-Forwarded-For rate-limiting
app.set('trust proxy', 1);

// Root route for ping / health status / deployment checks
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agomoni API',
    version: '1.0.0',
    health: '/health',
    timestamp: new Date(),
  });
});

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
  })
);

// Compression & Logging
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS Configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:4000',
      'http://localhost:3000',
    ].filter(Boolean);

    // Always allow configured CLIENT_URL and localhost
    if (allowedOrigins.some((o) => origin === o || (typeof o === 'string' && origin.startsWith(o)))) {
      return callback(null, true);
    }

    // Allow all Vercel preview and production deployments (including agomoni-web.vercel.app)
    if (origin.endsWith('.vercel.app') || origin === 'https://agomoni-web.vercel.app') {
      return callback(null, true);
    }

    // In development, allow everything
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`Blocked by CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-id', 'Accept'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  skip: (req) =>
    req.path.includes('/stats/live-users') ||
    req.path.includes('/calendar/active'),
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', generalLimiter);

// Ensure uploads folders exist and are served robustly across environments
const candidateUploadDirs = [
  path.resolve(config.UPLOAD_DIR || 'uploads'),
  path.resolve(process.cwd(), 'apps/api/uploads'),
  path.resolve(process.cwd(), 'uploads'),
  path.resolve(__dirname, '../../uploads'),
  path.resolve(__dirname, '../../../uploads'),
];

const primaryUploadsDir = candidateUploadDirs[0];

for (const dir of candidateUploadDirs) {
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  }
  if (fs.existsSync(dir)) {
    app.use('/uploads', express.static(dir));
  }
}

// Fallback file resolver for /uploads/:filename to handle multi-directory structures & Render restarts
app.get('/uploads/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  for (const dir of candidateUploadDirs) {
    const fullPath = path.resolve(dir, filename);
    if (fs.existsSync(fullPath)) {
      return res.sendFile(fullPath);
    }
  }

  return res.status(404).send('File not found');
});

// Multer storage for secure image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, primaryUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `agomoni-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// POST /api/v1/upload (Secure image upload)
app.post('/api/v1/upload', authenticate, upload.single('image'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/dating', datingRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/lost-found', lostFoundRouter);
app.use('/api/v1/memories', memoryRouter);
app.use('/api/v1/emergency', emergencyRouter);
app.use('/api/v1/music', musicRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/admin', adminRouter);

// Real Active Visitors Presence Tracker (in-memory heartbeat registry)
const activeVisitors = new Map<string, number>();

// Live active real visitors count
app.get('/api/v1/stats/live-users', (req, res) => {
  const visitorId =
    (req.query.sessionId as string) ||
    req.headers['x-session-id'] as string ||
    req.ip ||
    'visitor-default';

  const now = Date.now();
  activeVisitors.set(visitorId, now);

  // Expire any inactive session older than 25 seconds
  for (const [id, lastSeen] of activeVisitors.entries()) {
    if (now - lastSeen > 25000) {
      activeVisitors.delete(id);
    }
  }

  // 100% real active count (minimum 1 representing the current active visitor)
  const realCount = Math.max(activeVisitors.size, 1);

  return res.json({
    success: true,
    count: realCount,
    timestamp: new Date(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Agomoni API', timestamp: new Date() });
});

// 404 Not Found Handler for Unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling
app.use(errorHandler);

export default app;
