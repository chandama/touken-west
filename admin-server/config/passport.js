/**
 * Passport.js OAuth configuration
 * Configures Google and Facebook OAuth strategies
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const { sanitizeOAuthProfile, validateAvatarUrl } = require('../utils/validation');

/**
 * Initialize Passport with OAuth strategies
 * @param {object} app - Express app instance
 */
function initializePassport(app) {
  // Initialize Passport middleware
  app.use(passport.initialize());

  // Serialize user ID to session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Configure Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      scope: ['profile', 'email'],
      state: true // Enable state parameter for CSRF protection
    }, handleOAuthCallback('google', 'googleId')));

    console.log('[Passport] Google OAuth strategy configured');
  } else {
    console.log('[Passport] Google OAuth not configured (missing credentials)');
  }

  // Configure Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
      enableProof: true, // Security feature
      state: true // Enable state parameter for CSRF protection
    }, handleOAuthCallback('facebook', 'facebookId')));

    console.log('[Passport] Facebook OAuth strategy configured');
  } else {
    console.log('[Passport] Facebook OAuth not configured (missing credentials)');
  }
}

/**
 * Create OAuth callback handler for a provider
 * @param {string} provider - OAuth provider name ('google' or 'facebook')
 * @param {string} idField - Field name for provider ID ('googleId' or 'facebookId')
 * @returns {Function} - Passport verify callback
 */
function handleOAuthCallback(provider, idField) {
  return async (accessToken, refreshToken, profile, done) => {
    try {
      // Debug: Log raw profile from OAuth provider
      console.log(`[Passport] ${provider} raw profile:`, JSON.stringify({
        id: profile.id,
        emails: profile.emails,
        email: profile.email,
        displayName: profile.displayName,
        name: profile.name
      }, null, 2));

      // Sanitize profile data from OAuth provider
      const sanitized = sanitizeOAuthProfile(profile);

      if (!sanitized.id) {
        return done(new Error('OAuth profile missing ID'), null);
      }

      // Check if user already exists with this OAuth ID
      let user = await User.findOne({ [idField]: sanitized.id });

      if (user) {
        // User exists with this OAuth account - update any changed profile data
        const updates = {};
        if (sanitized.displayName && !user.displayName) {
          updates.displayName = sanitized.displayName;
        }
        if (sanitized.avatarUrl && validateAvatarUrl(sanitized.avatarUrl) && !user.avatarUrl) {
          updates.avatarUrl = sanitized.avatarUrl;
        }

        if (Object.keys(updates).length > 0) {
          user = await User.findByIdAndUpdate(user._id, updates, { new: true });
        }

        return done(null, user);
      }

      // Check if user exists with this email (link accounts)
      if (sanitized.email) {
        user = await User.findOne({ email: sanitized.email });

        if (user) {
          // Link OAuth account to existing user
          const linkUpdates = {
            [idField]: sanitized.id,
            emailVerified: true // OAuth emails are verified by provider
          };

          // Update profile data if not already set
          if (sanitized.displayName && !user.displayName) {
            linkUpdates.displayName = sanitized.displayName;
          }
          if (sanitized.avatarUrl && validateAvatarUrl(sanitized.avatarUrl) && !user.avatarUrl) {
            linkUpdates.avatarUrl = sanitized.avatarUrl;
          }

          user = await User.findByIdAndUpdate(user._id, linkUpdates, { new: true });
          return done(null, user);
        }
      }

      // Create new user
      // For Facebook in development mode, email might not be available
      // Generate a placeholder that user can update later
      if (!sanitized.email) {
        if (provider === 'facebook') {
          // Generate placeholder email for Facebook users without email permission
          sanitized.email = `fb_${sanitized.id}@placeholder.nihonto-db.com`;
          console.log(`[Passport] Facebook user without email, using placeholder: ${sanitized.email}`);
        } else {
          return done(new Error('OAuth profile missing email'), null);
        }
      }

      // Generate username from email or display name
      const baseUsername = sanitized.displayName
        ? sanitized.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
        : sanitized.email.split('@')[0].replace(/[^a-z0-9]/g, '');

      // Ensure unique username
      let username = baseUsername.slice(0, 20);
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername.slice(0, 17)}${counter}`;
        counter++;
        if (counter > 999) {
          username = `user${Date.now()}`;
          break;
        }
      }

      // Check if this is a placeholder email (Facebook without email permission)
      const isPlaceholderEmail = sanitized.email.includes('@placeholder.nihonto-db.com');

      // Create new user with OAuth data
      user = new User({
        email: sanitized.email,
        username: username,
        [idField]: sanitized.id,
        authMethod: provider,
        emailVerified: !isPlaceholderEmail, // Placeholder emails need verification
        displayName: sanitized.displayName || username,
        avatarUrl: validateAvatarUrl(sanitized.avatarUrl) ? sanitized.avatarUrl : null,
        role: 'user', // Default role for new users
        password: null // No password for OAuth users
      });

      await user.save();
      return done(null, user);

    } catch (err) {
      console.error(`[Passport] ${provider} OAuth error:`, err);
      return done(err, null);
    }
  };
}

/**
 * Check if a provider is configured
 * @param {string} provider - Provider name ('google' or 'facebook')
 * @returns {boolean} - True if provider is configured
 */
function isProviderConfigured(provider) {
  switch (provider) {
    case 'google':
      return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    case 'facebook':
      return !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
    default:
      return false;
  }
}

/**
 * Get configured providers list
 * @returns {Array} - Array of configured provider names
 */
function getConfiguredProviders() {
  const providers = [];
  if (isProviderConfigured('google')) providers.push('google');
  if (isProviderConfigured('facebook')) providers.push('facebook');
  return providers;
}

module.exports = {
  initializePassport,
  isProviderConfigured,
  getConfiguredProviders
};
