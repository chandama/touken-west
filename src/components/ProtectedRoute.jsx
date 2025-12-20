import React, { useEffect, useState } from 'react';
import '../styles/Login.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Role hierarchy from lowest to highest privilege
const ROLE_HIERARCHY = ['user', 'subscriber', 'editor', 'admin'];

/**
 * ProtectedRoute component with role-based access control
 *
 * Props:
 * - requiredRole: Minimum role required (e.g., 'subscriber', 'editor', 'admin')
 * - requireAdmin: Legacy prop - requires 'admin' role
 * - allowEditor: Legacy prop - if requireAdmin, also allows 'editor'
 * - showUpgradePrompt: Show upgrade message instead of login for insufficient role
 */
const ProtectedRoute = ({
  children,
  requiredRole = null,
  requireAdmin = false,
  allowEditor = false,
  showUpgradePrompt = false
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authConfig, setAuthConfig] = useState(null);
  const [insufficientRole, setInsufficientRole] = useState(false);

  // Determine the effective required role
  const getEffectiveRequiredRole = () => {
    if (requiredRole) return requiredRole;
    if (requireAdmin && allowEditor) return 'editor';
    if (requireAdmin) return 'admin';
    return null; // Any authenticated user
  };

  // Check if user has required role using hierarchy
  const hasRequiredRole = (userRole) => {
    const effectiveRole = getEffectiveRequiredRole();
    if (!effectiveRole) return true; // No specific role required

    const userLevel = ROLE_HIERARCHY.indexOf(userRole);
    const requiredLevel = ROLE_HIERARCHY.indexOf(effectiveRole);

    if (userLevel === -1 || requiredLevel === -1) return false;
    return userLevel >= requiredLevel;
  };

  // Get display name for a role
  const getRoleDisplayName = (role) => {
    const names = {
      user: 'User',
      subscriber: 'Subscriber',
      editor: 'Editor',
      admin: 'Administrator'
    };
    return names[role] || role;
  };

  useEffect(() => {
    checkAuth();
    fetchAuthConfig();
  }, []);

  const fetchAuthConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/config`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAuthConfig(data);
      }
    } catch (err) {
      console.error('Failed to fetch auth config:', err);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Check if user has required role
        if (!hasRequiredRole(data.user.role)) {
          setInsufficientRole(true);
        }
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);

        // Check if user has required role
        if (!hasRequiredRole(data.user.role)) {
          setInsufficientRole(true);
        } else {
          setInsufficientRole(false);
        }
      } else {
        // Handle OAuth-only account
        if (data.code === 'OAUTH_ONLY_ACCOUNT') {
          setError(data.error);
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE}/auth/facebook`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // User is logged in but doesn't have required role
  if (user && insufficientRole) {
    const effectiveRole = getEffectiveRequiredRole();
    return (
      <div className="login-overlay">
        <div className="login-modal">
          <div className="login-header">
            <h2>Access Restricted</h2>
          </div>

          <div className="login-form" style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              This content requires <strong>{getRoleDisplayName(effectiveRole)}</strong> access.
            </p>

            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              You are currently logged in as <strong>{user.email}</strong> with <strong>{getRoleDisplayName(user.role)}</strong> access.
            </p>

            {effectiveRole === 'subscriber' && (
              <p style={{ marginBottom: '1.5rem' }}>
                <a
                  href="/account/subscription"
                  style={{
                    color: 'var(--primary-color, #007bff)',
                    textDecoration: 'underline'
                  }}
                >
                  Upgrade your account
                </a>
                {' '}to access this content.
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a
                href="/"
                className="submit-button"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    const effectiveRole = getEffectiveRequiredRole();
    const hasGoogleAuth = authConfig?.providers?.includes('google');
    const hasFacebookAuth = authConfig?.providers?.includes('facebook');
    const hasAnyOAuth = hasGoogleAuth || hasFacebookAuth;

    return (
      <div className="login-overlay">
        <div className="login-modal">
          <div className="login-header">
            <h2>
              {effectiveRole
                ? `${getRoleDisplayName(effectiveRole)} Login Required`
                : 'Login Required'}
            </h2>
          </div>

          <div className="login-form">
            {error && <div className="error-message">{error}</div>}

            {/* OAuth Buttons */}
            {hasAnyOAuth && (
              <div className="oauth-buttons">
                {hasGoogleAuth && (
                  <button
                    type="button"
                    className="oauth-button google"
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                  >
                    Continue with Google
                  </button>
                )}
                {hasFacebookAuth && (
                  <button
                    type="button"
                    className="oauth-button facebook"
                    onClick={handleFacebookLogin}
                    disabled={isLoggingIn}
                  >
                    Continue with Facebook
                  </button>
                )}
              </div>
            )}

            {hasAnyOAuth && (
              <div className="auth-divider">
                <span>or</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="protected-email">Email</label>
                <input
                  id="protected-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={!hasAnyOAuth}
                />
              </div>

              <div className="form-group">
                <label htmlFor="protected-password">Password</label>
                <input
                  id="protected-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-button" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            {effectiveRole && (
              <div className="form-footer" style={{ marginTop: '1rem' }}>
                <small style={{ color: '#666' }}>
                  {getRoleDisplayName(effectiveRole)} access required for this area
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
