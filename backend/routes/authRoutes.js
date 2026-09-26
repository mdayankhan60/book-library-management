const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ─── Helper: generate JWT ─────────────────────────────────────────────────────

/**
 * Generate a signed JWT that expires in 7 days.
 * @param {string} userId - MongoDB ObjectId string of the user
 * @returns {string} Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * Body: { name, email, password, confirmPassword }
 *
 * Validations:
 *  - name:            required, min 2 chars
 *  - email:           required, valid format
 *  - password:        required, min 6 chars
 *  - confirmPassword: required, must match password
 *  - email must not already be registered
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // ── Field presence checks ──────────────────────────────────────────────────
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters long.');
    }

    if (!email || typeof email !== 'string') {
      errors.push('Email is required.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Please provide a valid email address.');
      }
    }

    if (!password || typeof password !== 'string') {
      errors.push('Password is required.');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    if (!confirmPassword) {
      errors.push('Confirm password is required.');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // ── Normalize inputs ───────────────────────────────────────────────────────
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // ── Check for duplicate email ──────────────────────────────────────────────
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // ── Hash password ──────────────────────────────────────────────────────────
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ── Create user ────────────────────────────────────────────────────────────
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
    });

    // ── Generate token ─────────────────────────────────────────────────────────
    const token = generateToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome!',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);

    // Mongoose duplicate key (race condition safety net)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the account. Please try again.',
    });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

/**
 * Login an existing user.
 *
 * Body: { email, password }
 *
 * Validations:
 *  - email:    required, valid format
 *  - password: required
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Field presence checks ──────────────────────────────────────────────────
    const errors = [];

    if (!email || typeof email !== 'string') {
      errors.push('Email is required.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Please provide a valid email address.');
      }
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      errors.push('Password is required.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ── Find user ──────────────────────────────────────────────────────────────
    // We explicitly select the password field here (it is not excluded by default).
    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user) {
      // Use a generic message to avoid user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Compare password ───────────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Generate token ─────────────────────────────────────────────────────────
    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
});

module.exports = router;
