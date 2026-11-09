require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const progressRoutes = require('./routes/progressRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const communityRoutes = require('./routes/communityRoutes');
const battleGroundRoutes = require('./routes/battleGroundRoutes');
const setupMultiplayer = require('./socket/multiplayerHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── 1. CORS — first so every response (including errors) carries headers ─────
const ALLOWED_ORIGINS = [
  'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow no-origin requests (curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // pre-flight

// ─── 2. Body parsers ──────────────────────────────────────────────────────────
// Raw body for the Clerk webhook (must precede express.json())
app.use('/api/auth/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── 3. Routes ────────────────────────────────────────────────────────────────
// Authentication is handled per-route by authMiddleware (custom JWKS verifier).
// No global Clerk middleware — it was crashing on every request when
// CLERK_SECRET_KEY was absent, causing HTTP 500 on all endpoints.
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/evaluate', geminiRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/battleground', battleGroundRoutes);

// Health check
app.get('/api', (req, res) => {
  res.send('Codo Leveling API is running (Supabase + Clerk)');
});

// ─── 4. Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Re-apply CORS so the browser can read error response bodies
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (res.headersSent) return next(err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'UNKNOWN_ERROR',
  });
});

// ─── 5. Socket.io ─────────────────────────────────────────────────────────────
setupMultiplayer(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
