// middleware/auth.js - Authentication Middleware
const { mockUser, isProduction } = require('../config/auth');

/**
 * Middleware to ensure user is authenticated before accessing protected routes
 * In development with mock user enabled, this will always grant access
 */
function ensureAuthenticated(req, res, next) {
  // If user is already authenticated in the session, continue
  if (req.session.user) {
    return next();
  }
  
  // In development, use mock user if enabled
  if (!isProduction && mockUser) {
    req.session.user = mockUser;
    return next();
  }
  
  // User is not authenticated, redirect to login page
  res.redirect('/login');
}

/**
 * Middleware to check if user is already logged in
 * Redirects to dashboard if user is already authenticated
 */
function redirectIfAuthenticated(req, res, next) {
  // If user is already authenticated, redirect to dashboard
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  // Continue with the request if not authenticated
  next();
}

module.exports = {
  ensureAuthenticated,
  redirectIfAuthenticated
};