/**
 * OAuth authentication routes
 * Handles Google and Facebook OAuth flows
 */

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { isProviderConfigured, getConfiguredProviders } = require('../config/passport');

// Frontend URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Generate JWT token for authenticated user
 * @param {object} user - User document
 * @returns {string} - JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Set authentication cookie
 * @param {object} res - Express response
 * @param {string} token - JWT token
 */
function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

/**
 * Handle successful OAuth authentication
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function handleOAuthSuccess(req, res) {
  if (!req.user) {
    return res.redirect(`${FRONTEND_URL}/auth/callback?error=no_user`);
  }

  const token = generateToken(req.user);
  setAuthCookie(res, token);

  // Redirect to frontend with success
  res.redirect(`${FRONTEND_URL}/auth/callback?success=true`);
}

/**
 * Handle OAuth authentication error
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {Function} next - Next middleware
 */
function handleOAuthError(err, req, res, next) {
  console.error('[OAuth] Authentication error:', err.message);
  res.redirect(`${FRONTEND_URL}/auth/callback?error=${encodeURIComponent(err.message)}`);
}

// ==========================================
// GET /api/auth/providers
// Returns list of configured OAuth providers
// ==========================================
router.get('/providers', (req, res) => {
  const providers = getConfiguredProviders();
  res.json({
    providers,
    google: isProviderConfigured('google'),
    facebook: isProviderConfigured('facebook')
  });
});

// ==========================================
// Google OAuth Routes
// ==========================================

// GET /api/auth/google
// Initiates Google OAuth flow
router.get('/google', (req, res, next) => {
  if (!isProviderConfigured('google')) {
    return res.status(503).json({ error: 'Google OAuth is not configured' });
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })(req, res, next);
});

// GET /api/auth/google/callback
// Handles Google OAuth callback
router.get('/google/callback',
  (req, res, next) => {
    if (!isProviderConfigured('google')) {
      return res.redirect(`${FRONTEND_URL}/auth/callback?error=not_configured`);
    }

    passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/auth/callback?error=auth_failed`
    })(req, res, next);
  },
  handleOAuthSuccess,
  handleOAuthError
);

// ==========================================
// Facebook OAuth Routes
// ==========================================

// GET /api/auth/facebook
// Initiates Facebook OAuth flow
router.get('/facebook', (req, res, next) => {
  if (!isProviderConfigured('facebook')) {
    return res.status(503).json({ error: 'Facebook OAuth is not configured' });
  }

  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false
  })(req, res, next);
});

// GET /api/auth/facebook/callback
// Handles Facebook OAuth callback
router.get('/facebook/callback',
  (req, res, next) => {
    if (!isProviderConfigured('facebook')) {
      return res.redirect(`${FRONTEND_URL}/auth/callback?error=not_configured`);
    }

    passport.authenticate('facebook', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/auth/callback?error=auth_failed`
    })(req, res, next);
  },
  handleOAuthSuccess,
  handleOAuthError
);

// ==========================================
// Account Linking Routes
// ==========================================

// POST /api/auth/link/google
// Link Google account to existing user (requires authentication)
router.post('/link/google', (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!isProviderConfigured('google')) {
    return res.status(503).json({ error: 'Google OAuth is not configured' });
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })(req, res, next);
});

// POST /api/auth/link/facebook
// Link Facebook account to existing user (requires authentication)
router.post('/link/facebook', (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!isProviderConfigured('facebook')) {
    return res.status(503).json({ error: 'Facebook OAuth is not configured' });
  }

  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false
  })(req, res, next);
});

module.exports = router;
