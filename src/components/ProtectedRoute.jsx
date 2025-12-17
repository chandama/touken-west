import React, { useEffect, useState } from 'react';
import '../styles/Login.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const ProtectedRoute = ({ children, requireAdmin = false, allowEditor = false }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check if user has required role
  const hasRequiredRole = (userRole) => {
    if (!requireAdmin) return true; // No admin required, any authenticated user is fine
    if (userRole === 'admin') return true; // Admin always has access
    if (allowEditor && userRole === 'editor') return true; // Editor allowed if allowEditor is true
    return false;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // If required role not met, deny access
        if (!hasRequiredRole(data.user.role)) {
          setUser(null);
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
        // Check if user has required role
        if (!hasRequiredRole(data.user.role)) {
          const requiredRole = allowEditor ? 'Editor or Admin' : 'Admin';
          setError(`${requiredRole} access required`);
          setIsLoggingIn(false);
          return;
        }

        setUser(data.user);
        setShowLogin(false);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
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

  if (!user) {
    return (
      <div className="login-overlay">
        <div className="login-modal">
          <div className="login-header">
            <h2>{requireAdmin ? (allowEditor ? 'Editor Login Required' : 'Admin Login Required') : 'Login Required'}</h2>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </button>

            {requireAdmin && (
              <div className="form-footer" style={{ marginTop: '1rem' }}>
                <small style={{ color: '#666' }}>
                  {allowEditor ? 'Editor or Admin' : 'Admin'} credentials required to access this area
                </small>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
