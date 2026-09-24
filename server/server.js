const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./middleware/errorHandler');
const { initDatabase } = require('./config/db');

// Load environment variables (.env.local has priority, then .env)
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Production-ready CORS configuration
const rawClientUrls = (process.env.CLIENT_URL || process.env.CORS_ORIGIN || '').trim();
const allowedOrigins = rawClientUrls
  ? rawClientUrls.split(',').map(s => s.trim().replace(/\/+$/, ''))
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (curl, server-to-server, health checks)
    if (!origin) return callback(null, true);

    // If wildcard is specified
    if (rawClientUrls === '*' || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Match exact configured origins
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Always permit localhost development origins
    if (normalizedOrigin.startsWith('http://localhost') || normalizedOrigin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }

    // For preview deployments (e.g. *.vercel.app, *.netlify.app, *.onrender.com)
    if (
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.endsWith('.netlify.app') ||
      normalizedOrigin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }

    callback(null, true); // Permissive fallback to prevent breaking valid clients
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create runtime uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check endpoints for cloud load balancers & monitoring
const handleHealthCheck = (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'HeritageLens AI', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    groqConfigured: !!process.env.GROQ_API_KEY
  });
};

app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// Mount API routes
const heritageRoutes = require('./routes/heritageRoutes');
const demoRoutes = require('./routes/demoRoutes');

app.use('/api/heritage', heritageRoutes);
app.use('/api/demo', demoRoutes);

// Unified Production Hosting: Serve static React client if built (e.g. on Render/Railway/VPS)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  
  // SPA Fallback: Direct non-API route requests to React index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Production warnings & notifications
if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
  console.warn("WARNING: Neither GEMINI_API_KEY nor GROQ_API_KEY is configured. Vision features will rely on Exact Hash & Perceptual matching.");
}

// Prewarm local visual matching service
const localVisionMatcher = require('./services/localVisionMatcher');

// Initialize optional database & start server
initDatabase().catch(err => console.error('[Database] Init notice:', err.message));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[HeritageLens AI] Backend listening on 0.0.0.0:${PORT}`);
  console.log(`[HeritageLens AI] Allowed client origins:`, allowedOrigins);
  localVisionMatcher.prewarm();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[HeritageLens AI] SIGTERM received. Closing HTTP server cleanly...');
  server.close(() => console.log('[HeritageLens AI] Process terminated.'));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[HeritageLens AI] Unhandled Rejection at:', promise, 'reason:', reason);
});
