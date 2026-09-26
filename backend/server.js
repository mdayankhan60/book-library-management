const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// CORS – allow requests from the frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Health-check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Book Library Management API is running',
    version: '1.0.0',
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A user with that ${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired, please log in again',
    });
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Default / unhandled error
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── MongoDB Connection & Server Start ────────────────────────────────────────

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀  Server is running on port ${PORT} — http://localhost:${PORT}`);
    console.log(`📚  Book Library Management API ready`);
    console.log(`🌐  Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
};

const hasValidMongoUri =
  MONGODB_URI &&
  (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'));

if (hasValidMongoUri) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('✅  MongoDB Atlas connected successfully via Mongoose');
      startServer();
    })
    .catch((err) => {
      console.warn('⚠️  Could not connect to MongoDB Atlas:', err.message);
      console.log('🔄  Falling back to Local Storage mode (backend/data/local_db.json)');
      startServer();
    });
} else {
  console.log('ℹ️   MONGODB_URI not configured with MongoDB Atlas credentials.');
  console.log('📁  Running in Local Storage mode (backend/data/local_db.json)');
  console.log('💡  To connect MongoDB Atlas: set MONGODB_URI in backend/.env');
  startServer();
}

module.exports = app;
