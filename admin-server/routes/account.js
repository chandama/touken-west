/**
 * Account management routes
 * Handles user profile, settings, and account operations
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const {
  sanitizeInput,
  validateEmail,
  normalizeEmail,
  validateUsername,
  validatePassword,
  validateDisplayName,
  generateToken
} = require('../utils/validation');

// JWT verification middleware (imported from server.js or separate auth module)
// This will be attached when the router is mounted

// ==========================================
// GET /api/account
// Get current user's profile
// ==========================================
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken -resetToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        authMethod: user.authMethod,
        emailVerified: user.emailVerified,
        hasPassword: !!user.password,
        linkedAccounts: {
          google: !!user.googleId,
          facebook: !!user.facebookId
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('[Account] Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ==========================================
// PATCH /api/account
// Update user profile (username, displayName)
// ==========================================
router.patch('/', async (req, res) => {
  try {
    const { username, displayName } = req.body;
    const updates = {};

    // Validate and update username
    if (username !== undefined) {
      const cleanUsername = sanitizeInput(username);
      if (!validateUsername(cleanUsername)) {
        return res.status(400).json({
          error: 'Invalid username. Must be 3-30 characters, alphanumeric, underscores, or hyphens only.'
        });
      }

      // Check uniqueness
      const existingUser = await User.findOne({
        username: cleanUsername,
        _id: { $ne: req.user.id }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      updates.username = cleanUsername;
    }

    // Validate and update display name
    if (displayName !== undefined) {
      const cleanDisplayName = sanitizeInput(displayName);
      if (cleanDisplayName && !validateDisplayName(cleanDisplayName)) {
        return res.status(400).json({
          error: 'Invalid display name. Must be 1-50 characters.'
        });
      }
      updates.displayName = cleanDisplayName || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetToken');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Account] Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==========================================
// PATCH /api/account/email
// Change email address (requires verification)
// ==========================================
router.patch('/email', async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    // Validate new email
    const cleanEmail = normalizeEmail(newEmail);
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Get current user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password for local auth users
    if (user.authMethod === 'local' || user.password) {
      if (!password) {
        return res.status(400).json({ error: 'Password required to change email' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }

    // Check if email is already taken
    const existingUser = await User.findOne({
      email: cleanEmail,
      _id: { $ne: req.user.id }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Generate verification token
    const verificationToken = generateToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // For now, update email directly (email verification can be added later)
    // In production, you'd send a verification email instead
    await User.findByIdAndUpdate(req.user.id, {
      email: cleanEmail,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry
    });

    // TODO: Send verification email
    // await sendVerificationEmail(cleanEmail, verificationToken);

    res.json({
      message: 'Email updated. Please verify your new email address.',
      email: cleanEmail
    });
  } catch (err) {
    console.error('[Account] Change email error:', err);
    res.status(500).json({ error: 'Failed to change email' });
  }
});

// ==========================================
// PATCH /api/account/password
// Change password (local auth users only)
// ==========================================
router.patch('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can change password
    if (user.authMethod !== 'local' && !user.password) {
      return res.status(400).json({
        error: 'Cannot change password for OAuth-only accounts. Set a password first.'
      });
    }

    // Verify current password
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      authMethod: 'local' // Ensure auth method is set to local
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('[Account] Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ==========================================
// POST /api/account/set-password
// Set password for OAuth users who don't have one
// ==========================================
router.post('/set-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has a password
    if (user.password) {
      return res.status(400).json({
        error: 'Password already set. Use change password instead.'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword
    });

    res.json({ message: 'Password set successfully' });
  } catch (err) {
    console.error('[Account] Set password error:', err);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// ==========================================
// DELETE /api/account
// Delete user account
// ==========================================
router.delete('/', async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        error: 'Please confirm account deletion by setting confirmation to "DELETE_MY_ACCOUNT"'
      });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password for users with local auth
    if (user.password) {
      if (!password) {
        return res.status(400).json({ error: 'Password required to delete account' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }

    // Prevent deleting admin accounts (safety measure)
    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Admin accounts cannot be self-deleted. Contact another admin.'
      });
    }

    // Delete the user
    await User.findByIdAndDelete(req.user.id);

    // Clear auth cookie
    res.clearCookie('token');

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('[Account] Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ==========================================
// POST /api/account/verify-email
// Verify email with token
// ==========================================
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('[Account] Verify email error:', err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// ==========================================
// POST /api/account/resend-verification
// Resend verification email
// ==========================================
router.post('/resend-verification', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(req.user.id, {
      verificationToken,
      verificationTokenExpiry
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('[Account] Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// ==========================================
// GET /api/account/linked
// Get linked OAuth accounts
// ==========================================
router.get('/linked', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('googleId facebookId authMethod');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      google: !!user.googleId,
      facebook: !!user.facebookId,
      primaryMethod: user.authMethod
    });
  } catch (err) {
    console.error('[Account] Get linked accounts error:', err);
    res.status(500).json({ error: 'Failed to get linked accounts' });
  }
});

// ==========================================
// DELETE /api/account/unlink/:provider
// Unlink an OAuth account
// ==========================================
router.delete('/unlink/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const validProviders = ['google', 'facebook'];

    if (!validProviders.includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const idField = `${provider}Id`;

    // Check if this is their only login method
    const hasPassword = !!user.password;
    const hasGoogle = !!user.googleId;
    const hasFacebook = !!user.facebookId;
    const loginMethods = [hasPassword, hasGoogle, hasFacebook].filter(Boolean).length;

    if (loginMethods <= 1) {
      return res.status(400).json({
        error: 'Cannot unlink your only login method. Set a password or link another account first.'
      });
    }

    // Unlink the account
    const updates = { [idField]: null };

    // If unlinking primary auth method, switch to local or another provider
    if (user.authMethod === provider) {
      if (hasPassword) {
        updates.authMethod = 'local';
      } else if (provider === 'google' && hasFacebook) {
        updates.authMethod = 'facebook';
      } else if (provider === 'facebook' && hasGoogle) {
        updates.authMethod = 'google';
      }
    }

    await User.findByIdAndUpdate(req.user.id, updates);

    res.json({ message: `${provider} account unlinked successfully` });
  } catch (err) {
    console.error('[Account] Unlink account error:', err);
    res.status(500).json({ error: 'Failed to unlink account' });
  }
});

module.exports = router;
