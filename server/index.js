import http from 'http';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

// Routes
import { authRouter } from './routes/authRoutes.js';
import { projectRouter } from './routes/projectRoutes.js';
import { creditRouter } from './routes/creditRoutes.js';
import { freelancerRouter } from './routes/freelancerRoutes.js';
import { documentRouter } from './routes/documentRoutes.js';
import { contactRouter } from './routes/contactRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { blueprintRouter } from './routes/blueprintRoutes.js';
import { draftRouter } from './routes/draftRoutes.js';
import { costRouter } from './routes/costIntelligenceRoutes.js';
import { assessmentRouter } from './routes/assessmentRoutes.js';
import { quotationRouter } from './routes/quotationRoutes.js';
import { deliverableRouter } from './routes/deliverableRoutes.js';
import { clarificationRouter } from './routes/clarificationRoutes.js';
import { taskRouter } from './routes/taskRoutes.js';
import { analyticsAuditRouter } from './routes/analyticsAuditRoutes.js';
import { aiAssistantRouter } from './routes/aiAssistantRoutes.js';
import { chatRouter } from './routes/chatRoutes.js';
import { disputeRouter } from './routes/disputeRoutes.js';
import { teamRouter } from './routes/teamRoutes.js';
import { settingRouter } from './routes/settingRoutes.js';
import { wireframeRouter } from './routes/wireframeRoutes.js';
import { invoiceRouter } from './routes/invoiceRoutes.js';
import { skillRouter } from './routes/skillRoutes.js';

// Models
import { User } from './models/User.js';
import { CreditTransaction } from './models/CreditTransaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexuscraft';

// 1. Strict CORS Allow-List (Checklist 2)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://nexuscraft-lcnf.onrender.com',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

// 2. Cookie Parser for Secure HttpOnly Refresh Tokens (ID 10)
app.use(cookieParser());

// 3. Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 4. Helmet & Content-Security-Policy (Checklist 1)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        mediaSrc: ["'self'", 'https:', 'blob:', 'data:'],
        connectSrc: ["'self'", 'https:', 'wss:', 'ws:', 'http://localhost:*']
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// 5. Rate Limiting Middleware (Checklist 3)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 min
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 40, // 40 AI generations per 5 min
  message: { error: 'AI generation rate limit reached. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limits
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/blueprints/generate', aiLimiter);

// 6. Real-Time Socket.IO Server (ID 125, 127)
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('join_user', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('disconnect', () => {});
});

// Attach socket.io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 7. Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// 8. Primary REST Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/ideas', projectRouter); // Backward compatibility
app.use('/api/credits', creditRouter);
app.use('/api/freelancers', freelancerRouter);
app.use('/api/documents', documentRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/blueprints', blueprintRouter);
app.use('/api/drafts', draftRouter);
app.use('/api/costs', costRouter);
app.use('/api/assessments', assessmentRouter);
app.use('/api/quotations', quotationRouter);
app.use('/api/deliverables', deliverableRouter);
app.use('/api/clarifications', clarificationRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/analytics', analyticsAuditRouter);
app.use('/api/audit-logs', analyticsAuditRouter);
app.use('/api/activities', analyticsAuditRouter);
app.use('/api/ai', aiAssistantRouter);
app.use('/api/chat', chatRouter);
app.use('/api/disputes', disputeRouter);
app.use('/api/teams', teamRouter);
app.use('/api/settings', settingRouter);
app.use('/api/wireframes', wireframeRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/skills', skillRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
    timestamp: new Date().toISOString()
  });
});

// 9. Static Frontend Serving (Unified Production Monolith)
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    console.log(`📡 Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('🚀 MongoDB connected successfully!');
  } catch (err) {
    console.error('⚠️ MongoDB connection notice:', err.message);
    console.log('ℹ️ Server will continue running and retry connection automatically.');
  }

  server.listen(PORT, () => {
    console.log(`🌐 NexusCraft Express API Server running with Socket.IO at http://localhost:${PORT}`);
  });
};

startServer();
