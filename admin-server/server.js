// Load .env from local directory first, then fall back to parent
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const lusca = require('lusca');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Papa = require('papaparse');
const _ = require('lodash');

// ==================== IN-MEMORY CACHE ====================
const swordCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes cache TTL

  isValid() {
    return this.data && this.timestamp && (Date.now() - this.timestamp < this.ttl);
  },

  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },

  invalidate() {
    this.data = null;
    this.timestamp = null;
  }
};

// Database connection
const connectDB = require('./config/database');

// Models
const Sword = require('./models/Sword');
const User = require('./models/User');
const Changelog = require('./models/Changelog');
const Article = require('./models/Article');

// Spaces configuration
const {
  upload,
  csvUpload,
  uploadToSpaces,
  generateThumbnail,
  calculateMD5,
  generateFilename,
} = require('./config/spaces');

const app = express();
const PORT = process.env.PORT || 3002;

// Trust proxy for production (behind nginx/load balancer)
// This is required for secure cookies to work properly
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Connect to MongoDB
connectDB();

// ==================== SOCIAL MEDIA CRAWLER DETECTION ====================
// User agents for social media crawlers that fetch link previews
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Pinterest',
  'Slackbot',
  'TelegramBot',
  'WhatsApp',
  'Discordbot',
  'Googlebot',
  'bingbot',
  'iMessageLinkPreview',
  'Applebot',
];

function isSocialCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(crawler => ua.includes(crawler.toLowerCase()));
}

// Generate HTML page with Open Graph meta tags for crawlers
function generateOgHtml({ title, description, image, url, type = 'article', siteName = 'Nihonto DB' }) {
  const safeTitle = (title || siteName).replace(/"/g, '&quot;');
  const safeDesc = (description || '').replace(/"/g, '&quot;');
  const safeImage = image || 'https://nihonto-db.com/og-image.png';
  const safeUrl = url || 'https://nihonto-db.com';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:site_name" content="${siteName}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${safeUrl}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />

  <!-- iMessage -->
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <link rel="canonical" href="${safeUrl}" />
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
  <script>window.location.href = "${safeUrl}";</script>
</body>
</html>`;
}

// Request logging middleware - log ALL requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Compression middleware - compress all responses
app.use(compression({
  level: 6, // Balanced compression level (1-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Compress JSON and text responses
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Rate limiting (higher limit in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ==================== SOCIAL CRAWLER OG ROUTES ====================
// These routes serve HTML with Open Graph tags for social media crawlers
// Must be before static file serving in production

const SITE_URL = process.env.SITE_URL || 'https://nihonto-db.com';

// Article pages - serve OG tags for crawlers
app.get('/articles/:slug', async (req, res, next) => {
  // Only handle crawler requests
  if (!isSocialCrawler(req.get('User-Agent'))) {
    return next();
  }

  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!article) {
      return next(); // Let the SPA handle 404
    }

    const html = generateOgHtml({
      title: `${article.title} - Nihonto DB`,
      description: article.summary || article.title,
      image: article.coverImage?.url || `${SITE_URL}/og-image.png`,
      url: `${SITE_URL}/articles/${article.slug}`,
      type: 'article'
    });

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('Error generating OG tags for article:', error);
    return next();
  }
});

// Articles list page
app.get('/articles', (req, res, next) => {
  if (!isSocialCrawler(req.get('User-Agent'))) {
    return next();
  }

  const html = generateOgHtml({
    title: 'Articles - Nihonto DB',
    description: 'Research articles, historical studies, and educational content about Japanese swords, smiths, and traditions.',
    image: `${SITE_URL}/og-image.png`,
    url: `${SITE_URL}/articles`,
    type: 'website'
  });

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

// Province map page
app.get('/provinces', (req, res, next) => {
  if (!isSocialCrawler(req.get('User-Agent'))) {
    return next();
  }

  const html = generateOgHtml({
    title: 'Ancient Provinces - Nihonto DB',
    description: 'Interactive map of historical Japanese provinces (Gokishichidō). Explore sword-making traditions by region.',
    image: `${SITE_URL}/og-image.png`,
    url: `${SITE_URL}/provinces`,
    type: 'website'
  });

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

// Digital library page
app.get('/library', (req, res, next) => {
  if (!isSocialCrawler(req.get('User-Agent'))) {
    return next();
  }

  const html = generateOgHtml({
    title: 'Digital Library - Nihonto DB',
    description: 'Japanese sword image archive. Browse high-quality photographs of authenticated nihonto.',
    image: `${SITE_URL}/og-image.png`,
    url: `${SITE_URL}/library`,
    type: 'website'
  });

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

// Home page
app.get('/', (req, res, next) => {
  if (!isSocialCrawler(req.get('User-Agent'))) {
    return next();
  }

  const html = generateOgHtml({
    title: 'Nihonto DB - Japanese Sword Database',
    description: 'Searchable database of historical Japanese swords. Browse Juyo, Tokubetsu Juyo, and other authenticated nihonto with detailed records of smiths, schools, and provenance.',
    image: `${SITE_URL}/og-image.png`,
    url: SITE_URL,
    type: 'website'
  });

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

// Session middleware (required for lusca CSRF)
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CSRF protection middleware - exclude auth routes that don't need protection
// (login/register/logout don't have sessions to protect from CSRF)
const csrfProtection = lusca.csrf();
app.use((req, res, next) => {
  // Skip CSRF for auth routes - they don't have sessions to protect
  const csrfExemptPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout'
  ];
  if (csrfExemptPaths.includes(req.path)) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// CSRF token endpoint - must be after CSRF middleware
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('⚠️  WARNING: JWT_SECRET is not set or too short. Use a secure secret in production!');
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse search input into quoted and unquoted terms
 */
function parseSearchInput(input) {
  if (!input || typeof input !== 'string') {
    return { quoted: [], unquoted: [] };
  }

  const quoted = [];
  const unquoted = [];
  const regex = /"([^"]*)"|(\S+)/g;

  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      const phrase = match[1].trim();
      if (phrase) quoted.push(phrase);
    } else if (match[2] !== undefined) {
      const word = match[2].trim();
      if (word) unquoted.push(word);
    }
  }

  return { quoted, unquoted };
}

/**
 * Build MongoDB search query from search terms
 */
function buildSearchQuery(searchTerms) {
  if (!searchTerms || searchTerms.length === 0) {
    return {};
  }

  const conditions = searchTerms.map(term => {
    const { quoted, unquoted } = parseSearchInput(term);
    const termConditions = [];

    // Build regex patterns for each field
    const searchFields = ['Smith', 'Mei', 'School', 'Type', 'Description', 'Authentication', 'Province', 'Period'];

    if (quoted.length > 0) {
      quoted.forEach(phrase => {
        const safePhrase = _.escapeRegExp(phrase);
        const quotedConditions = searchFields.map(field => ({
          [field]: { $regex: new RegExp(`\\b${safePhrase}\\b`, 'i') }
        }));
        // Also check if the phrase is a number matching Index
        const indexNum = parseInt(phrase, 10);
        if (!isNaN(indexNum)) {
          quotedConditions.push({ Index: indexNum });
        }
        termConditions.push({ $or: quotedConditions });
      });
    }

    if (unquoted.length > 0) {
      unquoted.forEach(word => {
        const safeWord = _.escapeRegExp(word);
        const unquotedConditions = searchFields.map(field => ({
          [field]: { $regex: new RegExp(safeWord, 'i') }
        }));
        // Also check if the word is a number matching Index
        const indexNum = parseInt(word, 10);
        if (!isNaN(indexNum) && word === String(indexNum)) {
          unquotedConditions.push({ Index: indexNum });
        }
        termConditions.push({ $or: unquotedConditions });
      });
    }

    return { $and: termConditions };
  });

  return { $and: conditions };
}

/**
 * Add changelog entry
 */
async function addChangelogEntry(swordIndex, swordData, changes, actionType = 'edit', userId = null) {
  const entry = new Changelog({
    timestamp: new Date(),
    actionType,
    swordIndex,
    swordSmith: swordData.Smith || 'Unknown',
    swordType: swordData.Type || 'Unknown',
    changes: Object.entries(changes).map(([field, { before, after }]) => ({
      field,
      before: before || '(empty)',
      after: after || '(empty)'
    })),
    userId,
  });

  await entry.save();
  return entry;
}

// ==================== AUTHENTICATION MIDDLEWARE ====================

function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

// Middleware to require editor OR admin role (for content management)
function requireEditor(req, res, next) {
  if (!['editor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Editor privileges required.' });
  }
  next();
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Admin server running',
    database: 'MongoDB',
    storage: 'DigitalOcean Spaces'
  });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Ensure all inputs are strings to prevent NoSQL injection
    if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedUsername = username.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email: { $eq: sanitizedEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: sanitizedEmail,
      username: sanitizedUsername,
      password: hashedPassword,
      role: 'user',
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({
      success: true,
      user: { id: newUser._id, email: newUser.email, username: newUser.username, role: newUser.role },
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Ensure all inputs are strings to prevent NoSQL injection
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: { $eq: sanitizedEmail } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({
      success: true,
      user: { id: user._id, email: user.email, username: user.username, role: user.role },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER MANAGEMENT ROUTES ====================

// Helper function to find user by _id or custom id field
const findUserById = async (id) => {
  const mongoose = require('mongoose');

  // Ensure id is a string to prevent NoSQL injection
  if (typeof id !== "string") {
    return null;
  }

  // Try MongoDB ObjectId first (must be valid AND 24 chars)
  if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
    const user = await User.findById(id);
    if (user) return user;
  }

  // Fall back to custom id field (for legacy users)
  return await User.findOne({ id: { $eq: id } });
};

// Get all users (Admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    // Transform to include id for frontend compatibility
    // Use custom id field if it exists, otherwise use _id
    const usersWithId = users.map(user => {
      const userObj = user.toObject();
      userObj.id = userObj.id || userObj._id.toString();
      return userObj;
    });
    res.json({ users: usersWithId });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create user (Admin only)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, username, password, role = 'user' } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Ensure all inputs are strings to prevent NoSQL injection
    if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedUsername = username.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email: { $eq: sanitizedEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: sanitizedEmail,
      username: sanitizedUsername,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (Admin only)
app.patch('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, role } = req.body;

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email && email !== user.email) {
      // Ensure email is a string to prevent NoSQL injection
      if (typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Sanitize and validate email
      const sanitizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const existingUser = await User.findOne({ email: { $eq: sanitizedEmail } });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
      user.email = sanitizedEmail;
    }

    if (username) {
      if (typeof username !== 'string') {
        return res.status(400).json({ error: 'Invalid username format' });
      }
      user.username = username.trim();
    }
    if (role && ['user', 'admin'].includes(role)) user.role = role;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user password (Admin only)
app.patch('/api/users/:id/password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: `User ${user.email} deleted` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SWORD ROUTES ====================

// Get all swords with pagination and filtering
app.get('/api/swords', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      school = '',
      smith = '',
      type = '',
      authentication = '',
      province = '',
      hasMedia = ''
    } = req.query;

    let searchTerms = req.query.search || [];
    if (typeof searchTerms === 'string') {
      searchTerms = searchTerms ? [searchTerms] : [];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Check if this is a "get all" request with no filters (most common case)
    const isFullListRequest = !school && !smith && !type && !authentication && !province && !hasMedia &&
      searchTerms.length === 0 && limitNum >= 20000;

    // Use cache for full list requests
    if (isFullListRequest && swordCache.isValid()) {
      console.log('Serving sword list from cache');

      // Set cache headers for browser caching (5 min public, 1 hour stale-while-revalidate)
      res.set({
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'ETag': `"swords-${swordCache.timestamp}"`,
        'Last-Modified': new Date(swordCache.timestamp).toUTCString()
      });

      return res.json(swordCache.data);
    }

    // Build query
    const query = {};

    // Search terms
    if (searchTerms.length > 0) {
      Object.assign(query, buildSearchQuery(searchTerms));
    }

    // Filter by school
    if (school && typeof school === 'string') {
      query.School = { $eq: school };
    }

    // Filter by smith
    if (smith && typeof smith === 'string') {
      query.Smith = { $eq: smith };
    }

    // Filter by type
    if (type && typeof type === 'string') {
      query.Type = { $eq: type };
    }

    // Filter by authentication
    if (authentication) {
      // Use regex to match authentication patterns like "Juyo 45", "Tokubetsu Juyo 12", etc.
      const safeAuth = _.escapeRegExp(authentication);
      query.Authentication = { $regex: new RegExp(safeAuth, 'i') };
    }

    // Filter by province
    if (province && typeof province === 'string') {
      query.Province = { $eq: province };
    }

    // Filter by media status
    if (hasMedia === 'true') {
      query.MediaAttachments = { $nin: ['NA', '[]', '', null] };
    } else if (hasMedia === 'false') {
      query.$or = [
        { MediaAttachments: 'NA' },
        { MediaAttachments: '[]' },
        { MediaAttachments: '' },
        { MediaAttachments: null },
      ];
    }

    // Count total
    const total = await Sword.countDocuments(query);

    // Paginate
    const skip = (pageNum - 1) * limitNum;

    const swords = await Sword.find(query)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const responseData = {
      swords,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };

    // Cache full list responses
    if (isFullListRequest) {
      console.log(`Caching sword list (${swords.length} swords)`);
      swordCache.set(responseData);

      // Set cache headers
      res.set({
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'ETag': `"swords-${swordCache.timestamp}"`,
        'Last-Modified': new Date(swordCache.timestamp).toUTCString()
      });
    } else {
      // Shorter cache for filtered requests
      res.set({
        'Cache-Control': 'public, max-age=60'
      });
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching swords:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fast initial load endpoint - returns first page quickly for SEO
app.get('/api/swords/initial', async (req, res) => {
  try {
    // Return first 100 swords with minimal processing for fast initial render
    const swords = await Sword.find({})
      .sort({ Index: 1 })
      .limit(100)
      .lean();

    const total = await Sword.estimatedDocumentCount();

    // Aggressive caching for initial load
    res.set({
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'ETag': `"initial-${Date.now()}"`,
    });

    res.json({
      swords,
      total,
      isInitial: true,
    });
  } catch (error) {
    console.error('Error fetching initial swords:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get filter options
app.get('/api/filters', async (req, res) => {
  try {
    const schools = await Sword.distinct('School');
    const types = await Sword.distinct('Type');
    const smiths = await Sword.distinct('Smith');
    const authentications = await Sword.distinct('Authentication');
    const provinces = await Sword.distinct('Province');

    res.json({
      schools: schools.filter(s => s && s !== 'NA').sort(),
      types: types.filter(t => t && t !== 'NA').sort(),
      smiths: smiths.filter(s => s && s !== 'NA').sort(),
      authentications: authentications.filter(a => a && a !== 'NA').sort(),
      provinces: provinces.filter(p => p && p !== 'NA').sort(),
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single sword by index
app.get('/api/swords/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const sword = await Sword.findOne({ Index: { $eq: index } }).lean();

    if (!sword) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    // Parse media attachments and normalize format
    // Handles both object format [{url: "...", ...}] and string format ["/path/to/file"]
    if (sword.MediaAttachments && sword.MediaAttachments !== 'NA') {
      try {
        const parsed = JSON.parse(sword.MediaAttachments);
        sword.MediaAttachmentsArray = Array.isArray(parsed)
          ? parsed.map(item => typeof item === 'string' ? { url: item } : item)
          : [];
      } catch {
        sword.MediaAttachmentsArray = [];
      }
    } else {
      sword.MediaAttachmentsArray = [];
    }

    res.json(sword);
  } catch (error) {
    console.error('Error fetching sword:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload media for a sword (Admin only)
app.post('/api/swords/:index/media', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { index } = req.params;
    const { category, caption, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Uploading media for sword ${index}:`, {
      filename: file.originalname,
      category,
      caption
    });

    const sword = await Sword.findOne({ Index: { $eq: index } });
    if (!sword) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    // Parse existing media attachments
    let mediaAttachments = [];
    if (sword.MediaAttachments && sword.MediaAttachments !== 'NA') {
      try {
        mediaAttachments = JSON.parse(sword.MediaAttachments);
        if (!Array.isArray(mediaAttachments)) {
          mediaAttachments = [];
        }
      } catch {
        mediaAttachments = [];
      }
    }

    // Calculate MD5 checksum
    const uploadedFileMD5 = calculateMD5(file.buffer);
    console.log(`Uploaded file MD5: ${uploadedFileMD5}`);

    // Check for duplicate
    const duplicate = mediaAttachments.find(attachment => attachment.md5 === uploadedFileMD5);
    if (duplicate) {
      console.log(`Duplicate file detected for sword ${index}. MD5: ${uploadedFileMD5}`);
      return res.status(409).json({
        error: 'Duplicate file',
        message: 'This file has already been uploaded to this sword record',
        existingAttachment: duplicate
      });
    }

    // Generate unique filename
    const filename = generateFilename(file.originalname);

    // Upload original to Spaces
    const fileKey = `images/originals/${filename}`;
    const fileUrl = await uploadToSpaces(file.buffer, fileKey, file.mimetype);

    // Generate and upload thumbnail if image
    let thumbnailUrl = null;
    if (file.mimetype.startsWith('image/')) {
      const thumbnailBuffer = await generateThumbnail(file.buffer);
      const thumbnailKey = `images/thumbnails/thumb-${filename}`;
      thumbnailUrl = await uploadToSpaces(thumbnailBuffer, thumbnailKey, 'image/jpeg');
    }

    // Add new attachment
    const newAttachment = {
      url: fileUrl,
      thumbnailUrl,
      category: category || 'Other',
      caption: caption || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      uploadedAt: new Date().toISOString(),
      filename,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      md5: uploadedFileMD5,
    };

    mediaAttachments.push(newAttachment);

    // Update sword record
    sword.MediaAttachments = JSON.stringify(mediaAttachments);
    await sword.save();

    // Log to changelog
    await addChangelogEntry(index, sword, {
      MediaAttachments: {
        before: `${mediaAttachments.length - 1} attachment(s)`,
        after: `Added: ${newAttachment.category} - ${newAttachment.caption || newAttachment.filename}`
      }
    }, 'media_upload', req.user.id);

    console.log(`Successfully uploaded media for sword ${index}`);

    res.json({
      success: true,
      file: newAttachment,
      sword: sword.toObject(),
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove media from sword (Admin only)
app.delete('/api/swords/:index/media', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { index } = req.params;
    const { filename } = req.body;

    console.log('Removing media from sword %s:', index, filename);

    const sword = await Sword.findOne({ Index: { $eq: index } });
    if (!sword) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    // Parse and filter media attachments
    let mediaAttachments = [];
    if (sword.MediaAttachments && sword.MediaAttachments !== 'NA') {
      try {
        mediaAttachments = JSON.parse(sword.MediaAttachments);
      } catch {
        mediaAttachments = [];
      }
    }

    // Find the attachment being removed
    const removedAttachment = mediaAttachments.find(m => m.filename === filename);

    // Filter out the attachment
    const filteredAttachments = mediaAttachments.filter(m => m.filename !== filename);

    sword.MediaAttachments = filteredAttachments.length > 0
      ? JSON.stringify(filteredAttachments)
      : 'NA';

    await sword.save();

    // Note: Files in Spaces are not deleted to prevent accidental data loss
    // Implement S3 DeleteObject if you want to actually delete files

    // Log to changelog
    if (removedAttachment) {
      await addChangelogEntry(index, sword, {
        MediaAttachments: {
          before: `${mediaAttachments.length} attachment(s)`,
          after: `Removed: ${removedAttachment.category} - ${removedAttachment.caption || removedAttachment.filename}`
        }
      }, 'media_delete', req.user.id);
    }

    console.log(`Successfully removed media from sword ${index}`);

    res.json({ success: true, sword: sword.toObject() });
  } catch (error) {
    console.error('Error removing media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new sword (Admin only)
app.post('/api/swords', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newSwordData = req.body;

    // Find highest existing index - use aggregation to convert string to number for proper sorting
    const maxIndexResult = await Sword.aggregate([
      { $addFields: { indexNum: { $toInt: "$Index" } } },
      { $sort: { indexNum: -1 } },
      { $limit: 1 },
      { $project: { Index: 1 } }
    ]);
    const maxIndex = maxIndexResult.length > 0 ? parseInt(maxIndexResult[0].Index) : 0;
    const newIndex = (maxIndex + 1).toString();

    // Create new sword
    const newSword = new Sword({
      Index: newIndex,
      School: newSwordData.School || 'NA',
      Smith: newSwordData.Smith || 'Unknown',
      Mei: newSwordData.Mei || 'Mumei',
      Type: newSwordData.Type || 'NA',
      Nagasa: newSwordData.Nagasa || 'NA',
      Sori: newSwordData.Sori || 'NA',
      Moto: newSwordData.Moto || 'NA',
      Saki: newSwordData.Saki || 'NA',
      Nakago: newSwordData.Nakago || 'NA',
      Ana: newSwordData.Ana || 'NA',
      Length: newSwordData.Length || 'NA',
      Hori: newSwordData.Hori || 'NA',
      Authentication: newSwordData.Authentication || 'NA',
      Province: newSwordData.Province || 'NA',
      Period: newSwordData.Period || 'NA',
      References: newSwordData.References || 'NA',
      Description: newSwordData.Description || 'NA',
      Attachments: newSwordData.Attachments || 'NA',
      Tags: newSwordData.Tags || '',
      MediaAttachments: 'NA'
    });

    await newSword.save();

    // Invalidate cache since sword list changed
    swordCache.invalidate();

    // Log to changelog
    const changes = {};
    Object.keys(newSword.toObject()).forEach(field => {
      if (field !== 'Index' && field !== '_id' && field !== '__v' && field !== 'createdAt' && field !== 'updatedAt' && newSword[field] !== 'NA' && newSword[field] !== '') {
        changes[field] = {
          before: '(new sword)',
          after: newSword[field]
        };
      }
    });

    await addChangelogEntry(newIndex, newSword, changes, 'new_sword', req.user.id);

    console.log(`Created new sword with index ${newIndex}`);

    res.json({ success: true, sword: newSword.toObject() });
  } catch (error) {
    console.error('Error creating sword:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update sword metadata (Admin only)
app.patch('/api/swords/:index', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { index } = req.params;
    const updates = req.body;

    const sword = await Sword.findOne({ Index: { $eq: index } });
    if (!sword) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    // Track changes
    const changes = {};

    const allowedFields = [
      'School', 'Smith', 'Mei', 'Type', 'Nagasa', 'Sori',
      'Moto', 'Saki', 'Nakago', 'Ana', 'Length', 'Hori',
      'Authentication', 'Province', 'Period', 'References',
      'Description', 'Attachments', 'Tags'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        const oldValue = sword[field] || '';
        const newValue = updates[field] || '';

        if (oldValue !== newValue) {
          changes[field] = { before: oldValue, after: newValue };
          sword[field] = newValue;
        }
      }
    });

    // Only save if there were actual changes
    if (Object.keys(changes).length > 0) {
      await sword.save();

      // Invalidate cache since sword data changed
      swordCache.invalidate();

      await addChangelogEntry(index, sword, changes, 'edit', req.user.id);
      console.log(`Updated sword ${index} with ${Object.keys(changes).length} changes`);
    }

    res.json({ success: true, sword: sword.toObject() });
  } catch (error) {
    console.error('Error updating sword:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete sword (Admin only)
app.delete('/api/swords/:index', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { index } = req.params;

    console.log(`Attempting to delete sword ${index}`);

    const sword = await Sword.findOne({ Index: { $eq: index } });
    if (!sword) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    // Note: Files in Spaces are not deleted to prevent accidental data loss
    // Implement S3 DeleteObject if you want to actually delete files

    await Sword.deleteOne({ Index: { $eq: index } });

    // Invalidate cache since sword list changed
    swordCache.invalidate();

    // Log to changelog
    await addChangelogEntry(index, sword, {
      Record: {
        before: `${sword.Smith} - ${sword.Type}`,
        after: '(deleted)'
      }
    }, 'delete', req.user.id);

    console.log(`Successfully deleted sword ${index}`);

    res.json({ success: true, message: 'Sword record deleted successfully' });
  } catch (error) {
    console.error('Error deleting sword:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk upload swords from CSV (Admin only) - Legacy endpoint
app.post('/api/swords/bulk', authenticateToken, requireAdmin, csvUpload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    console.log('Processing bulk upload CSV:', file.originalname);

    // Parse CSV
    const csvContent = file.buffer.toString('utf8');
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
      return res.status(400).json({
        error: 'CSV parsing failed',
        details: parsed.errors
      });
    }

    const uploadData = parsed.data;

    if (uploadData.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    console.log(`Parsed ${uploadData.length} sword records from CSV`);

    // Track results
    const results = {
      total: uploadData.length,
      created: 0,
      skipped: 0,
      duplicates: 0,
      errors: [],
      newSwords: [],
      duplicateDetails: []
    };

    // Get max index - use aggregation to convert string to number for proper sorting
    const maxIndexResult = await Sword.aggregate([
      { $addFields: { indexNum: { $toInt: "$Index" } } },
      { $sort: { indexNum: -1 } },
      { $limit: 1 },
      { $project: { Index: 1 } }
    ]);
    let maxIndex = maxIndexResult.length > 0 ? parseInt(maxIndexResult[0].Index) : 0;

    // Process each row
    for (let i = 0; i < uploadData.length; i++) {
      const row = uploadData[i];
      const rowNum = i + 1;

      try {
        // Skip empty rows
        const hasData = Object.values(row).some(val => val && val.trim() !== '');
        if (!hasData) {
          results.skipped++;
          console.log(`Row ${rowNum}: Skipped (empty row)`);
          continue;
        }

        // Build sword data
        const swordData = {
          Smith: row.Smith?.trim() || 'Unknown',
          Mei: row.Mei?.trim() || 'Mumei',
          Type: row.Type?.trim() || 'NA',
          Nagasa: row.Nagasa?.trim() || 'NA',
        };

        // Check for duplicates
        const existing = await Sword.findOne({
          Smith: { $eq: swordData.Smith },
          Mei: { $eq: swordData.Mei },
          Type: { $eq: swordData.Type },
          Nagasa: { $eq: swordData.Nagasa },
        });

        if (existing) {
          results.duplicates++;
          results.duplicateDetails.push({
            row: rowNum,
            csvData: `${swordData.Smith} ${swordData.Mei} (${swordData.Type})`,
            existingIndex: existing.Index
          });
          console.log(`Row ${rowNum}: Duplicate found - matches Index ${existing.Index}`);
          continue;
        }

        // Create new sword
        maxIndex++;
        const newSword = new Sword({
          Index: maxIndex.toString(),
          School: row.School?.trim() || 'NA',
          Smith: swordData.Smith,
          Mei: swordData.Mei,
          Type: swordData.Type,
          Nagasa: swordData.Nagasa,
          Sori: row.Sori?.trim() || 'NA',
          Moto: row.Moto?.trim() || 'NA',
          Saki: row.Saki?.trim() || 'NA',
          Nakago: row.Nakago?.trim() || 'NA',
          Ana: row.Ana?.trim() || 'NA',
          Length: row.Length?.trim() || 'NA',
          Hori: row.Hori?.trim() || 'NA',
          Authentication: row.Authentication?.trim() || 'NA',
          Province: row.Province?.trim() || 'NA',
          Period: row.Period?.trim() || 'NA',
          References: row.References?.trim() || 'NA',
          Description: row.Description?.trim() || 'NA',
          Attachments: row.Attachments?.trim() || 'NA',
          Tags: row.Tags?.trim() || '',
          MediaAttachments: 'NA'
        });

        await newSword.save();
        results.newSwords.push(newSword);
        results.created++;

        console.log(`Row ${rowNum}: Created sword ${newSword.Index} - ${newSword.Smith} ${newSword.Mei}`);

        // Log to changelog
        const changes = {};
        Object.keys(newSword.toObject()).forEach(field => {
          if (field !== 'Index' && field !== '_id' && field !== '__v' && field !== 'createdAt' && field !== 'updatedAt' && field !== 'MediaAttachments' &&
              newSword[field] !== 'NA' && newSword[field] !== '') {
            changes[field] = {
              before: '(new sword)',
              after: newSword[field]
            };
          }
        });

        await addChangelogEntry(newSword.Index, newSword, changes, 'new_sword', req.user.id);

      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: row,
          error: error.message
        });
        console.error(`Row ${rowNum}: Error -`, error.message);
      }
    }

    console.log(`Bulk upload complete: ${results.created} swords created`);

    // Invalidate cache if any swords were created
    if (results.created > 0) {
      swordCache.invalidate();
    }

    // Return summary
    res.json({
      success: true,
      results: {
        total: results.total,
        created: results.created,
        skipped: results.skipped,
        duplicates: results.duplicates,
        errors: results.errors.length,
        errorDetails: results.errors.length > 0 ? results.errors : undefined,
        duplicateDetails: results.duplicates > 0 ? results.duplicateDetails : undefined,
        newSwords: results.newSwords.map(s => ({
          Index: s.Index,
          Smith: s.Smith,
          Mei: s.Mei,
          Type: s.Type
        }))
      }
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Preview bulk upload - parse CSV and check for duplicates without importing
app.post('/api/swords/bulk/preview', authenticateToken, requireAdmin, (req, res, next) => {
  csvUpload.single('file')(req, res, (err) => {
    if (err) {
      console.error('CSV upload error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    console.log('Previewing bulk upload CSV:', file.originalname);

    // Parse CSV
    const csvContent = file.buffer.toString('utf8');
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
      return res.status(400).json({
        error: 'CSV parsing failed',
        details: parsed.errors
      });
    }

    const uploadData = parsed.data;

    if (uploadData.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    console.log(`Parsed ${uploadData.length} sword records from CSV for preview`);

    // Track results
    const results = {
      total: uploadData.length,
      skipped: 0,
      duplicates: [],
      nonDuplicates: []
    };

    // Process each row to check for duplicates
    for (let i = 0; i < uploadData.length; i++) {
      const row = uploadData[i];
      const rowNum = i + 2; // +2 because row 1 is header, and we're 0-indexed

      // Skip empty rows
      const hasData = Object.values(row).some(val => val && val.trim() !== '');
      if (!hasData) {
        results.skipped++;
        continue;
      }

      // Build sword data from CSV
      const swordData = {
        School: row.School?.trim() || 'NA',
        Smith: row.Smith?.trim() || 'Unknown',
        Mei: row.Mei?.trim() || 'Mumei',
        Type: row.Type?.trim() || 'NA',
        Nagasa: row.Nagasa?.trim() || 'NA',
        Sori: row.Sori?.trim() || 'NA',
        Moto: row.Moto?.trim() || 'NA',
        Saki: row.Saki?.trim() || 'NA',
        Nakago: row.Nakago?.trim() || 'NA',
        Ana: row.Ana?.trim() || 'NA',
        Length: row.Length?.trim() || 'NA',
        Hori: row.Hori?.trim() || 'NA',
        Authentication: row.Authentication?.trim() || 'NA',
        Province: row.Province?.trim() || 'NA',
        Period: row.Period?.trim() || 'NA',
        References: row.References?.trim() || 'NA',
        Description: row.Description?.trim() || 'NA',
        Attachments: row.Attachments?.trim() || 'NA',
        Tags: row.Tags?.trim() || ''
      };

      // Check for duplicates with fuzzy matching
      // Exact matches required: Smith, School, Type
      // Fuzzy matches: Mei, Authentication (substring, case/whitespace insensitive)
      // Measurements (all must match within 0.1cm): Nagasa, Nakago, Sori, Moto, Saki

      // Normalize string for comparison: lowercase, remove whitespace, normalize kanji variants
      const normalizeForMatch = (str) => {
        if (!str) return '';
        return str
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/國/g, '国')  // Normalize traditional to simplified kanji
          .replace(/\[.*?\]/g, '') // Remove bracketed annotations like [来国長]
          .replace(/\(.*?\)/g, ''); // Remove parenthetical annotations like (再刃)
      };

      // Parse measurement to number for comparison
      const parseMeasurement = (val) => {
        if (!val || val === 'NA' || val === 'N/A' || val === 'N/a') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      };

      // Check if two measurements match within tolerance (0.1cm)
      // If either value is null/NA, we skip that check (return true)
      const measurementMatches = (csv, db) => {
        if (csv === null || db === null) return true; // Skip if either is NA
        return Math.abs(csv - db) <= 0.1;
      };

      const csvMeiNorm = normalizeForMatch(swordData.Mei);
      const csvAuthNorm = normalizeForMatch(swordData.Authentication);
      const csvNagasa = parseMeasurement(swordData.Nagasa);
      const csvNakago = parseMeasurement(swordData.Nakago);
      const csvSori = parseMeasurement(swordData.Sori);
      const csvMoto = parseMeasurement(swordData.Moto);
      const csvSaki = parseMeasurement(swordData.Saki);

      // Find potential matches by Smith (exact), School (exact), and Type (exact) first
      const potentialMatches = await Sword.find({
        Smith: { $eq: swordData.Smith },
        School: { $eq: swordData.School },
        Type: { $eq: swordData.Type }
      }).lean();

      // Find best match based on fuzzy criteria
      let existing = null;
      for (const sword of potentialMatches) {
        const dbMeiNorm = normalizeForMatch(sword.Mei);
        const dbAuthNorm = normalizeForMatch(sword.Authentication);
        const dbNagasa = parseMeasurement(sword.Nagasa);
        const dbNakago = parseMeasurement(sword.Nakago);
        const dbSori = parseMeasurement(sword.Sori);
        const dbMoto = parseMeasurement(sword.Moto);
        const dbSaki = parseMeasurement(sword.Saki);

        // Mei match: one contains the other (handles cases like "有成" vs "有成 (再刃)")
        const meiMatch = csvMeiNorm && dbMeiNorm &&
          (csvMeiNorm.includes(dbMeiNorm) || dbMeiNorm.includes(csvMeiNorm));

        // Auth match: one contains the other (handles partial matches)
        const authMatch = csvAuthNorm && dbAuthNorm &&
          (csvAuthNorm.includes(dbAuthNorm) || dbAuthNorm.includes(csvAuthNorm));

        // Measurements match: all must be within 0.1cm (or skipped if NA)
        const nagasaMatch = measurementMatches(csvNagasa, dbNagasa);
        const nakagoMatch = measurementMatches(csvNakago, dbNakago);
        const soriMatch = measurementMatches(csvSori, dbSori);
        const motoMatch = measurementMatches(csvMoto, dbMoto);
        const sakiMatch = measurementMatches(csvSaki, dbSaki);
        const allMeasurementsMatch = nagasaMatch && nakagoMatch && soriMatch && motoMatch && sakiMatch;

        // Consider it a duplicate if Mei matches AND (Auth matches OR all measurements match)
        if (meiMatch && (authMatch || allMeasurementsMatch)) {
          existing = sword;
          break;
        }
      }

      // If no match by Mei, also try matching by measurements + Auth (for cases where Mei differs significantly)
      if (!existing) {
        for (const sword of potentialMatches) {
          const dbAuthNorm = normalizeForMatch(sword.Authentication);
          const dbNagasa = parseMeasurement(sword.Nagasa);
          const dbNakago = parseMeasurement(sword.Nakago);
          const dbSori = parseMeasurement(sword.Sori);
          const dbMoto = parseMeasurement(sword.Moto);
          const dbSaki = parseMeasurement(sword.Saki);

          const authMatch = csvAuthNorm && dbAuthNorm &&
            (csvAuthNorm.includes(dbAuthNorm) || dbAuthNorm.includes(csvAuthNorm));

          const nagasaMatch = measurementMatches(csvNagasa, dbNagasa);
          const nakagoMatch = measurementMatches(csvNakago, dbNakago);
          const soriMatch = measurementMatches(csvSori, dbSori);
          const motoMatch = measurementMatches(csvMoto, dbMoto);
          const sakiMatch = measurementMatches(csvSaki, dbSaki);
          const allMeasurementsMatch = nagasaMatch && nakagoMatch && soriMatch && motoMatch && sakiMatch;

          // Match if both Auth and all measurements match
          if (authMatch && allMeasurementsMatch) {
            existing = sword;
            break;
          }
        }
      }

      if (existing) {
        results.duplicates.push({
          row: rowNum,
          data: swordData,
          existing: existing
        });
      } else {
        results.nonDuplicates.push({
          row: rowNum,
          data: swordData
        });
      }
    }

    console.log(`Preview complete: ${results.nonDuplicates.length} new, ${results.duplicates.length} duplicates`);

    res.json(results);

  } catch (error) {
    console.error('Error in bulk preview:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import swords from preview - selective import based on user decisions
app.post('/api/swords/bulk/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { swords } = req.body;

    if (!swords || !Array.isArray(swords) || swords.length === 0) {
      return res.status(400).json({ error: 'No swords provided for import' });
    }

    console.log(`Importing ${swords.length} swords from bulk preview`);

    const results = {
      created: 0,
      errors: 0,
      errorDetails: [],
      newSwords: []
    };

    // Get max index - use aggregation to convert string to number for proper sorting
    const maxIndexResult = await Sword.aggregate([
      { $addFields: { indexNum: { $toInt: "$Index" } } },
      { $sort: { indexNum: -1 } },
      { $limit: 1 },
      { $project: { Index: 1 } }
    ]);
    let maxIndex = maxIndexResult.length > 0 ? parseInt(maxIndexResult[0].Index) : 0;
    console.log(`Starting bulk import from index ${maxIndex + 1}`);

    // Process each sword
    for (let i = 0; i < swords.length; i++) {
      const swordData = swords[i];

      try {
        maxIndex++;
        const newSword = new Sword({
          Index: maxIndex.toString(),
          School: swordData.School || 'NA',
          Smith: swordData.Smith || 'Unknown',
          Mei: swordData.Mei || 'Mumei',
          Type: swordData.Type || 'NA',
          Nagasa: swordData.Nagasa || 'NA',
          Sori: swordData.Sori || 'NA',
          Moto: swordData.Moto || 'NA',
          Saki: swordData.Saki || 'NA',
          Nakago: swordData.Nakago || 'NA',
          Ana: swordData.Ana || 'NA',
          Length: swordData.Length || 'NA',
          Hori: swordData.Hori || 'NA',
          Authentication: swordData.Authentication || 'NA',
          Province: swordData.Province || 'NA',
          Period: swordData.Period || 'NA',
          References: swordData.References || 'NA',
          Description: swordData.Description || 'NA',
          Attachments: swordData.Attachments || 'NA',
          Tags: swordData.Tags || '',
          MediaAttachments: 'NA'
        });

        await newSword.save();
        results.created++;
        results.newSwords.push({
          Index: newSword.Index,
          Smith: newSword.Smith,
          Mei: newSword.Mei,
          Type: newSword.Type
        });

        console.log(`Created sword ${newSword.Index} - ${newSword.Smith} ${newSword.Mei}`);

        // Log to changelog
        const changes = {};
        Object.keys(newSword.toObject()).forEach(field => {
          if (field !== 'Index' && field !== '_id' && field !== '__v' && field !== 'createdAt' && field !== 'updatedAt' && field !== 'MediaAttachments' &&
              newSword[field] !== 'NA' && newSword[field] !== '') {
            changes[field] = {
              before: '(new sword)',
              after: newSword[field]
            };
          }
        });

        await addChangelogEntry(newSword.Index, newSword, changes, 'new_sword', req.user.id);

      } catch (error) {
        results.errors++;
        results.errorDetails.push({
          row: i + 1,
          data: `${swordData.Smith} ${swordData.Mei}`,
          error: error.message
        });
        console.error(`Error importing sword:`, error.message);
      }
    }

    console.log(`Bulk import complete: ${results.created} swords created, ${results.errors} errors`);

    // Invalidate cache if any swords were created
    if (results.created > 0) {
      swordCache.invalidate();
    }

    res.json(results);

  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHANGELOG ROUTES ====================

// Get changelog entries
app.get('/api/changelog', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Changelog.countDocuments();
    const entries = await Changelog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      entries,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching changelog:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ARTICLE ROUTES ====================

// Configure multer for PDF uploads (larger file size limit)
const pdfUpload = require('multer')({
  storage: require('multer').memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});

// Public: Get published articles with pagination
app.get('/api/articles', async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '', search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const articles = await Article.find(query)
      .select('-htmlContent -images') // Exclude heavy content for list
      .sort({ publishedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public: Get article categories with counts
app.get('/api/articles/categories', async (req, res) => {
  try {
    const categories = await Article.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories.map(c => ({ category: c._id, count: c.count })));
  } catch (error) {
    console.error('Error fetching article categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public: Get single published article by slug
app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      status: 'published'
    }).lean();

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Parse images JSON
    if (article.images) {
      try {
        article.imagesArray = JSON.parse(article.images);
      } catch {
        article.imagesArray = [];
      }
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all articles (including drafts)
app.get('/api/admin/articles', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', category = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const articles = await Article.find(query)
      .select('-htmlContent -images')
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get single article by slug (including drafts)
app.get('/api/admin/articles/:slug', authenticateToken, requireEditor, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).lean();

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Parse images JSON
    if (article.images) {
      try {
        article.imagesArray = JSON.parse(article.images);
      } catch {
        article.imagesArray = [];
      }
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create article
app.post('/api/admin/articles', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { title, contentType, category, summary, author, tags } = req.body;

    if (!title || !contentType) {
      return res.status(400).json({ error: 'Title and content type are required' });
    }

    if (!['html', 'pdf'].includes(contentType)) {
      return res.status(400).json({ error: 'Content type must be html or pdf' });
    }

    // Generate slug from title
    let slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure unique slug
    let counter = 1;
    let uniqueSlug = slug;
    while (await Article.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const article = new Article({
      slug: uniqueSlug,
      title,
      contentType,
      category: category || 'General',
      summary: summary || '',
      author: author || '',
      tags: tags || [],
      createdBy: req.user.id,
      lastEditedBy: req.user.id
    });

    await article.save();

    console.log(`Article created: ${uniqueSlug} by user ${req.user.id}`);

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update article
app.patch('/api/admin/articles/:slug', authenticateToken, requireEditor, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const { title, summary, author, category, tags, htmlContent } = req.body;

    if (title !== undefined) article.title = title;
    if (summary !== undefined) article.summary = summary;
    if (author !== undefined) article.author = author;
    if (category !== undefined) article.category = category;
    if (tags !== undefined) article.tags = tags;
    if (htmlContent !== undefined && article.contentType === 'html') {
      article.htmlContent = htmlContent;
    }

    article.lastEditedBy = req.user.id;

    await article.save();

    console.log(`Article updated: ${req.params.slug} by user ${req.user.id}`);

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete article
app.delete('/api/admin/articles/:slug', authenticateToken, requireEditor, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    console.log(`Article deleted: ${req.params.slug} by user ${req.user.id}`);

    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Upload PDF for article
app.post('/api/admin/articles/:slug/pdf', authenticateToken, requireEditor, pdfUpload.single('file'), async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.contentType !== 'pdf') {
      return res.status(400).json({ error: 'Article is not PDF type' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const md5 = calculateMD5(file.buffer);
    const filename = generateFilename(file.originalname);
    const fileKey = `articles/pdfs/${filename}`;

    const fileUrl = await uploadToSpaces(file.buffer, fileKey, 'application/pdf');

    article.pdfFile = {
      url: fileUrl,
      filename,
      originalFilename: file.originalname,
      fileSize: file.size,
      uploadedAt: new Date(),
      md5
    };

    article.lastEditedBy = req.user.id;
    await article.save();

    console.log(`PDF uploaded for article: ${req.params.slug}`);

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Upload image for HTML article
app.post('/api/admin/articles/:slug/images', authenticateToken, requireEditor, upload.single('file'), async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.contentType !== 'html') {
      return res.status(400).json({ error: 'Article is not HTML type' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse existing images
    let images = [];
    try {
      images = JSON.parse(article.images || '[]');
    } catch {
      images = [];
    }

    const md5 = calculateMD5(file.buffer);

    // Check for duplicate
    if (images.find(img => img.md5 === md5)) {
      return res.status(409).json({ error: 'Duplicate image' });
    }

    const filename = generateFilename(file.originalname);
    const fileKey = `articles/images/${filename}`;
    const fileUrl = await uploadToSpaces(file.buffer, fileKey, file.mimetype);

    // Generate thumbnail (skip for SVG - they're already scalable and Sharp doesn't handle them)
    let thumbnailUrl = null;
    if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
      const thumbBuffer = await generateThumbnail(file.buffer);
      const thumbKey = `articles/images/thumb-${filename}`;
      thumbnailUrl = await uploadToSpaces(thumbBuffer, thumbKey, 'image/jpeg');
    } else if (file.mimetype === 'image/svg+xml') {
      // For SVG, use the original as thumbnail (it scales perfectly)
      thumbnailUrl = fileUrl;
    }

    const newImage = {
      url: fileUrl,
      thumbnailUrl,
      filename,
      originalFilename: file.originalname,
      caption: req.body.caption || '',
      uploadedAt: new Date().toISOString(),
      md5
    };

    images.push(newImage);
    article.images = JSON.stringify(images);
    article.lastEditedBy = req.user.id;
    await article.save();

    console.log(`Image uploaded for article: ${req.params.slug}`);

    res.json({ success: true, image: newImage, article });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete image from article
app.delete('/api/admin/articles/:slug/images/:filename', authenticateToken, requireEditor, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Parse existing images
    let images = [];
    try {
      images = JSON.parse(article.images || '[]');
    } catch {
      images = [];
    }

    const imageIndex = images.findIndex(img => img.filename === req.params.filename);
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }

    images.splice(imageIndex, 1);
    article.images = JSON.stringify(images);
    article.lastEditedBy = req.user.id;
    await article.save();

    console.log(`Image deleted from article: ${req.params.slug}`);

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Upload cover image
app.post('/api/admin/articles/:slug/cover', authenticateToken, requireEditor, upload.single('file'), async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = generateFilename(file.originalname);
    const fileKey = `articles/covers/${filename}`;
    const fileUrl = await uploadToSpaces(file.buffer, fileKey, file.mimetype);

    // Generate thumbnail (skip for SVG - they're already scalable and Sharp doesn't handle them)
    let thumbnailUrl = null;
    if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
      const thumbBuffer = await generateThumbnail(file.buffer);
      const thumbKey = `articles/covers/thumb-${filename}`;
      thumbnailUrl = await uploadToSpaces(thumbBuffer, thumbKey, 'image/jpeg');
    } else if (file.mimetype === 'image/svg+xml') {
      // For SVG, use the original as thumbnail (it scales perfectly)
      thumbnailUrl = fileUrl;
    }

    article.coverImage = {
      url: fileUrl,
      thumbnailUrl,
      filename
    };

    article.lastEditedBy = req.user.id;
    await article.save();

    console.log(`Cover image uploaded for article: ${req.params.slug}`);

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Publish article
app.post('/api/admin/articles/:slug/publish', authenticateToken, requireEditor, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Validate article has content
    if (article.contentType === 'pdf' && !article.pdfFile?.url) {
      return res.status(400).json({ error: 'PDF article must have a PDF file uploaded before publishing' });
    }

    if (article.contentType === 'html' && !article.htmlContent?.trim()) {
      return res.status(400).json({ error: 'HTML article must have content before publishing' });
    }

    article.status = 'published';
    article.publishedAt = new Date();
    article.lastEditedBy = req.user.id;
    await article.save();

    console.log(`Article published: ${req.params.slug}`);

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Unpublish article
app.post('/api/admin/articles/:slug/unpublish', authenticateToken, requireEditor, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.status = 'draft';
    article.lastEditedBy = req.user.id;
    await article.save();

    console.log(`Article unpublished: ${req.params.slug}`);

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error unpublishing article:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== GLOBAL ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.message);
  console.error('Stack:', err.stack);

  // Return 403 for CSRF token errors
  if (err.message && err.message.toLowerCase().includes('csrf')) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Admin server running on http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: MongoDB`);
  console.log(`   Storage: DigitalOcean Spaces\n`);
});
