const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it using JWT_SECRET, and attaches the decoded
 * user document to req.user for downstream route handlers.
 *
 * Returns 401 if:
 *  - No Authorization header is present
 *  - The token is missing / malformed
 *  - The token is invalid or expired
 *  - The user no longer exists in the database
 */
const auth = async (req, res, next) => {
  try {
    // 1. Extract the Authorization header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No Authorization header provided.',
      });
    }

    // 2. Expect format: "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token must use Bearer scheme.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is missing.',
      });
    }

    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch the user to ensure they still exist
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User associated with this token no longer exists.',
      });
    }

    // 5. Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    // Unexpected errors
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

module.exports = auth;
