const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    sparse: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Optional for OAuth users
  },
  role: {
    type: String,
    enum: ['user', 'subscriber', 'editor', 'admin'],
    default: 'user'
  },

  // OAuth fields
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  facebookId: {
    type: String,
    sparse: true,
    index: true
  },
  authMethod: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },

  // Email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpiry: {
    type: Date
  },

  // Password reset
  resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  },

  // Profile fields
  displayName: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String
  },

  // Analytics
  analytics: {
    lastLogin: { type: Date, default: null },
    loginCount: { type: Number, default: 0 },
    lastActivity: { type: Date, default: null },
    lastIp: { type: String, default: null },
    lastUserAgent: { type: String, default: null },
    lastDevice: {
      browser: String,
      os: String,
      device: String  // 'desktop', 'mobile', 'tablet'
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

module.exports = mongoose.model('User', userSchema);
