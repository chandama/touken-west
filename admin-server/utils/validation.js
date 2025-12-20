/**
 * Input validation and sanitization utilities
 * Prevents XSS and ensures data integrity
 */

const validator = require('validator');

/**
 * Sanitize a string input by trimming and escaping HTML entities
 * @param {any} input - The input to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  // Trim whitespace
  let clean = input.trim();

  // Escape HTML entities to prevent XSS
  clean = validator.escape(clean);

  return clean;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return validator.isEmail(trimmed) && trimmed.length <= 254;
}

/**
 * Normalize email (lowercase, trim)
 * @param {string} email - Email to normalize
 * @returns {string} - Normalized email
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Validate username format
 * Only allows alphanumeric, underscores, hyphens, 3-30 chars
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid username
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const clean = username.trim();
  return /^[a-zA-Z0-9_-]{3,30}$/.test(clean);
}

/**
 * Validate password strength
 * Minimum 8 chars, at least 1 letter and 1 number
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message?: string }
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true };
}

/**
 * Validate display name (more permissive than username)
 * Allows letters, numbers, spaces, and common punctuation
 * @param {string} displayName - Display name to validate
 * @returns {boolean} - True if valid
 */
function validateDisplayName(displayName) {
  if (!displayName || typeof displayName !== 'string') return false;
  const clean = displayName.trim();
  // Allow 1-50 chars, letters, numbers, spaces, and common punctuation
  return clean.length >= 1 && clean.length <= 50 && /^[\p{L}\p{N}\s._'-]+$/u.test(clean);
}

/**
 * Sanitize OAuth profile data
 * @param {object} profile - OAuth provider profile
 * @returns {object} - Sanitized profile data
 */
function sanitizeOAuthProfile(profile) {
  return {
    id: sanitizeInput(profile.id || ''),
    email: normalizeEmail(profile.emails?.[0]?.value || profile.email || ''),
    displayName: sanitizeInput(profile.displayName || profile.name?.givenName || '').slice(0, 50),
    avatarUrl: profile.photos?.[0]?.value || profile.picture || null
  };
}

/**
 * Generate a secure random token for verification/reset
 * @param {number} length - Token length (default 32)
 * @returns {string} - Random hex token
 */
function generateToken(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Check if a URL is a valid avatar URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid avatar URL
 */
function validateAvatarUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    // Only allow HTTPS and known OAuth avatar hosts
    const allowedHosts = [
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      'graph.facebook.com',
      'pbs.twimg.com',
      'avatars.githubusercontent.com'
    ];
    return parsed.protocol === 'https:' &&
      (allowedHosts.includes(parsed.hostname) || parsed.hostname.endsWith('.googleusercontent.com'));
  } catch {
    return false;
  }
}

module.exports = {
  sanitizeInput,
  validateEmail,
  normalizeEmail,
  validateUsername,
  validatePassword,
  validateDisplayName,
  sanitizeOAuthProfile,
  generateToken,
  validateAvatarUrl
};
