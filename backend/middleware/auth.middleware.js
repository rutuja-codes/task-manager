// ============================================
// middleware/auth.middleware.js — JWT Guard
// ============================================
// WHY THIS FILE?
// This is our SECURITY GUARD 🛡️
// Every protected route (like getting projects, creating tasks)
// must pass through this middleware first.
//
// HOW IT WORKS?
// 1. Angular sends JWT token in request header
// 2. This middleware reads the token
// 3. Verifies it's valid and not expired
// 4. Attaches the user to req.user
// 5. Allows request to continue to the controller
//
// If token is missing or invalid → request is BLOCKED
//
// WHERE IS IT USED?
// → auth.routes.js (for /me and /logout routes)
// → project.routes.js (all routes need login)
// → task.routes.js (all routes need login)
// → user.routes.js (all routes need login)
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// ─── Protect Middleware ───────────────────────
// This function runs BEFORE protected route controllers
// next() = "ok everything is fine, continue to controller"
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Step 1: Get token from request header
    // WHY AUTHORIZATION HEADER?
    // Angular sends token like this:
    // Authorization: Bearer xxxxx.yyyyy.zzzzz
    // 'Bearer' is just a standard prefix for JWT tokens
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Split "Bearer xxxxx.yyyyy.zzzzz" by space
      // [0] = "Bearer", [1] = actual token
      token = req.headers.authorization.split(' ')[1];
    }

    // Step 2: Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.'
      });
    }

    // Step 3: Verify token
    // jwt.verify() does 2 things:
    // 1. Checks if token was signed with our JWT_SECRET
    // 2. Checks if token has not expired
    // If either fails, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: 'user_mongodb_id', iat: 1234567, exp: 1234567 }
    // iat = issued at (when token was created)
    // exp = expiry (when token expires)

    // Step 4: Find user from decoded token id
    // WHY? Token only contains user id.
    // We fetch full user data from DB to attach to request.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    // Step 5: Check if user is still active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    // Step 6: Attach user to request object
    // WHY? Controllers after this middleware can access
    // the logged-in user via req.user
    // Example: req.user.id, req.user.role, req.user.name
    req.user = user;

    // Step 7: Continue to the next middleware or controller
    next();

  } catch (error) {
    // jwt.verify() throws errors for:
    // - 'JsonWebTokenError' = invalid token (tampered)
    // - 'TokenExpiredError' = token has expired
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    next(error);
  }
};

// ─── Authorize Middleware ─────────────────────
// WHY THIS FUNCTION?
// Some routes are only for ADMINS.
// protect() checks if user is logged in.
// authorize() checks if user has the RIGHT ROLE.
//
// Usage in routes:
// router.delete('/project/:id', protect, authorize('admin'), deleteProject)
// This means: must be logged in AND must be admin
//
// ...roles means we can pass multiple roles:
// authorize('admin', 'manager') — either admin or manager can access
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by protect() middleware above
    // Check if user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        // 403 = Forbidden (logged in but not allowed)
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};