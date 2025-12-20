/**
 * Role-based permission middleware
 * Implements hierarchical role system: user < subscriber < editor < admin
 */

// Role hierarchy from lowest to highest privilege
const ROLE_HIERARCHY = ['user', 'subscriber', 'editor', 'admin'];

/**
 * Check if a user's role meets or exceeds the required role level
 * @param {string} userRole - The user's current role
 * @param {string} requiredRole - The minimum required role
 * @returns {boolean} - True if user has sufficient permissions
 */
function hasRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

  // If either role is not found, deny access
  if (userLevel === -1 || requiredLevel === -1) {
    return false;
  }

  return userLevel >= requiredLevel;
}

/**
 * Create middleware that requires a minimum role level
 * @param {string} requiredRole - The minimum required role
 * @returns {Function} - Express middleware function
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasRole(req.user.role, requiredRole)) {
      return res.status(403).json({
        error: `${requiredRole} access required`,
        currentRole: req.user.role,
        requiredRole: requiredRole
      });
    }

    next();
  };
}

// Pre-configured middleware for common role requirements
const requireSubscriber = requireRole('subscriber');
const requireEditor = requireRole('editor');
const requireAdmin = requireRole('admin');

/**
 * Check if user can access media attachments
 * Subscribers and above can view media
 * @param {object} user - User object (may be null for unauthenticated)
 * @returns {boolean} - True if user can access media
 */
function canAccessMedia(user) {
  if (!user) return false;
  return hasRole(user.role, 'subscriber');
}

/**
 * Check if user can access digital library
 * Subscribers and above can access
 * @param {object} user - User object (may be null for unauthenticated)
 * @returns {boolean} - True if user can access library
 */
function canAccessLibrary(user) {
  if (!user) return false;
  return hasRole(user.role, 'subscriber');
}

/**
 * Check if user can manage users
 * Only admins can manage users
 * @param {object} user - User object (may be null for unauthenticated)
 * @returns {boolean} - True if user can manage users
 */
function canManageUsers(user) {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Check if user can access admin panel
 * Editors and admins can access
 * @param {object} user - User object (may be null for unauthenticated)
 * @returns {boolean} - True if user can access admin
 */
function canAccessAdmin(user) {
  if (!user) return false;
  return hasRole(user.role, 'editor');
}

/**
 * Middleware to filter MediaAttachments based on user role
 * Used on sword endpoints to hide media from non-subscribers
 */
function filterMediaForRole(req, res, next) {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json to filter media
  res.json = function (data) {
    if (!canAccessMedia(req.user)) {
      // Filter out MediaAttachments for non-subscribers
      if (Array.isArray(data)) {
        data = data.map(item => {
          if (item && item.MediaAttachments !== undefined) {
            return { ...item, MediaAttachments: 'NA' };
          }
          return item;
        });
      } else if (data && data.MediaAttachments !== undefined) {
        data = { ...data, MediaAttachments: 'NA' };
      }
    }
    return originalJson(data);
  };

  next();
}

/**
 * Get role display name for UI
 * @param {string} role - Role key
 * @returns {string} - Human-readable role name
 */
function getRoleDisplayName(role) {
  const displayNames = {
    user: 'User',
    subscriber: 'Subscriber',
    editor: 'Editor',
    admin: 'Administrator'
  };
  return displayNames[role] || role;
}

/**
 * Get all available roles (for admin UI)
 * @returns {Array} - Array of role objects
 */
function getAllRoles() {
  return ROLE_HIERARCHY.map(role => ({
    key: role,
    name: getRoleDisplayName(role),
    level: ROLE_HIERARCHY.indexOf(role)
  }));
}

module.exports = {
  ROLE_HIERARCHY,
  hasRole,
  requireRole,
  requireSubscriber,
  requireEditor,
  requireAdmin,
  canAccessMedia,
  canAccessLibrary,
  canManageUsers,
  canAccessAdmin,
  filterMediaForRole,
  getRoleDisplayName,
  getAllRoles
};
