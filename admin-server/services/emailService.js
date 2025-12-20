/**
 * Email Service
 * Handles sending verification and notification emails using Resend
 */

const { Resend } = require('resend');

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@nihonto-db.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Check if email service is configured
 * @returns {boolean}
 */
function isEmailConfigured() {
  return !!resend;
}

/**
 * Send verification email to new user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @param {string} username - User's username
 * @returns {Promise<object>} - Send result
 */
async function sendVerificationEmail(email, token, username) {
  if (!isEmailConfigured()) {
    console.log('[Email] Service not configured, skipping verification email');
    return { skipped: true };
  }

  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Verify your Nihonto Database account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Nihonto Database</h1>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="margin-top: 0; color: #1a1a2e;">Welcome, ${username}!</h2>

            <p>Thank you for registering. Please verify your email address to complete your account setup.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}"
                 style="display: inline-block; background: #d4af37; color: #1a1a2e; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #666;">
              ${verifyUrl}
            </p>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Nihonto Database, ${username}!

Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
      `.trim()
    });

    console.log(`[Email] Verification email sent to ${email}`);
    return result;
  } catch (err) {
    console.error('[Email] Failed to send verification email:', err);
    throw err;
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 * @param {string} username - User's username
 * @returns {Promise<object>} - Send result
 */
async function sendPasswordResetEmail(email, token, username) {
  if (!isEmailConfigured()) {
    console.log('[Email] Service not configured, skipping password reset email');
    return { skipped: true };
  }

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Reset your Nihonto Database password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Nihonto Database</h1>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="margin-top: 0; color: #1a1a2e;">Password Reset Request</h2>

            <p>Hi ${username}, we received a request to reset your password.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; background: #d4af37; color: #1a1a2e; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #666;">
              ${resetUrl}
            </p>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request

Hi ${username}, we received a request to reset your password.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
      `.trim()
    });

    console.log(`[Email] Password reset email sent to ${email}`);
    return result;
  } catch (err) {
    console.error('[Email] Failed to send password reset email:', err);
    throw err;
  }
}

/**
 * Send email change verification
 * @param {string} newEmail - New email address to verify
 * @param {string} token - Verification token
 * @param {string} username - User's username
 * @returns {Promise<object>} - Send result
 */
async function sendEmailChangeVerification(newEmail, token, username) {
  if (!isEmailConfigured()) {
    console.log('[Email] Service not configured, skipping email change verification');
    return { skipped: true };
  }

  const verifyUrl = `${FRONTEND_URL}/verify-email-change?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: newEmail,
      subject: 'Verify your new email address - Nihonto Database',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Nihonto Database</h1>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="margin-top: 0; color: #1a1a2e;">Verify New Email Address</h2>

            <p>Hi ${username}, please verify this new email address for your account.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}"
                 style="display: inline-block; background: #d4af37; color: #1a1a2e; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Verify New Email
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              If you didn't request this change, please ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Verify New Email Address

Hi ${username}, please verify this new email address for your account.

Click the link below to verify:

${verifyUrl}

This link will expire in 24 hours.

If you didn't request this change, please ignore this email.
      `.trim()
    });

    console.log(`[Email] Email change verification sent to ${newEmail}`);
    return result;
  } catch (err) {
    console.error('[Email] Failed to send email change verification:', err);
    throw err;
  }
}

module.exports = {
  isEmailConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerification
};
