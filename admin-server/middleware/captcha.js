/**
 * reCAPTCHA v3 verification middleware
 * Verifies CAPTCHA tokens to prevent spam registrations
 *
 * NOTE: This is only used for manual email/password registration.
 * OAuth (Google, Facebook) doesn't need CAPTCHA because:
 * - Users must authenticate with a real account from the provider
 * - OAuth providers have their own bot/spam detection
 * - Creating fake OAuth accounts is much harder than fake email registrations
 */

const https = require('https');

// reCAPTCHA configuration
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// Score threshold (0.0 - 1.0, higher is more likely human)
const SCORE_THRESHOLD = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;

/**
 * Verify reCAPTCHA token with Google
 * @param {string} token - reCAPTCHA response token
 * @param {string} remoteip - Client IP address (optional)
 * @returns {Promise<object>} - Verification result
 */
async function verifyRecaptcha(token, remoteip) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: token,
      ...(remoteip && { remoteip })
    }).toString();

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error('Failed to parse reCAPTCHA response'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Check if reCAPTCHA is configured
 * @returns {boolean} - True if configured
 */
function isRecaptchaConfigured() {
  return !!RECAPTCHA_SECRET;
}

/**
 * Middleware to verify reCAPTCHA token
 * Use this ONLY on manual email/password registration, NOT on OAuth routes.
 * Expects 'captchaToken' in request body
 */
async function verifyCaptcha(req, res, next) {
  // Skip in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[Captcha] Skipping verification (development mode)');
    return next();
  }

  // Check if configured for production
  if (!isRecaptchaConfigured()) {
    return res.status(503).json({
      error: 'CAPTCHA verification is not configured'
    });
  }

  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({
      error: 'CAPTCHA verification required',
      code: 'CAPTCHA_MISSING'
    });
  }

  try {
    // Get client IP for additional verification
    const clientIp = req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection.remoteAddress;

    const result = await verifyRecaptcha(captchaToken, clientIp);

    if (!result.success) {
      console.warn('[Captcha] Verification failed:', result['error-codes']);
      return res.status(400).json({
        error: 'CAPTCHA verification failed',
        code: 'CAPTCHA_FAILED',
        details: result['error-codes']
      });
    }

    // Check score threshold for v3
    if (result.score !== undefined && result.score < SCORE_THRESHOLD) {
      console.warn(`[Captcha] Low score: ${result.score} (threshold: ${SCORE_THRESHOLD})`);
      return res.status(400).json({
        error: 'CAPTCHA verification failed - suspicious activity detected',
        code: 'CAPTCHA_LOW_SCORE'
      });
    }

    // Check action matches expected (optional)
    if (result.action && req.body.captchaAction && result.action !== req.body.captchaAction) {
      console.warn(`[Captcha] Action mismatch: ${result.action} !== ${req.body.captchaAction}`);
      return res.status(400).json({
        error: 'CAPTCHA action mismatch',
        code: 'CAPTCHA_ACTION_MISMATCH'
      });
    }

    // Attach verification result to request for logging
    req.captchaResult = {
      score: result.score,
      action: result.action,
      hostname: result.hostname
    };

    next();
  } catch (err) {
    console.error('[Captcha] Verification error:', err);
    return res.status(500).json({
      error: 'CAPTCHA verification failed',
      code: 'CAPTCHA_ERROR'
    });
  }
}

/**
 * Optional CAPTCHA middleware - only verifies if token is provided
 * Useful for endpoints that may or may not require CAPTCHA
 */
async function optionalCaptcha(req, res, next) {
  if (!req.body.captchaToken) {
    return next();
  }
  return verifyCaptcha(req, res, next);
}

module.exports = {
  verifyCaptcha,
  optionalCaptcha,
  isRecaptchaConfigured,
  verifyRecaptcha
};
