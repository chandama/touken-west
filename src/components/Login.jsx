import React, { useState, useEffect } from 'react';
import '../styles/Login.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// SVG icons for OAuth providers
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '8px' }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '8px' }}>
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Login = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authConfig, setAuthConfig] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Fetch auth configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
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
    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Reload to update auth state
        window.location.reload();
      } else {
        // Handle specific error codes
        if (data.code === 'OAUTH_ONLY_ACCOUNT') {
          setError(data.error);
        } else if (data.code === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true);
          setError(data.error);
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setResendMessage('');

    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent! Check your inbox.');
        setError('');
      } else {
        setResendMessage(data.error || 'Failed to resend verification');
      }
    } catch (err) {
      setResendMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE}/auth/facebook`;
  };

  const hasGoogleAuth = authConfig?.providers?.includes('google');
  const hasFacebookAuth = authConfig?.providers?.includes('facebook');
  const hasAnyOAuth = hasGoogleAuth || hasFacebookAuth;

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <h2>Log In</h2>
          <button onClick={onClose} className="close-button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="login-form">
          {error && <div className="error-message">{error}</div>}

          {resendMessage && (
            <div className={resendMessage.includes('sent') ? 'success-message' : 'error-message'}>
              {resendMessage}
            </div>
          )}

          {needsVerification && !resendMessage.includes('sent') && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="submit-button"
              disabled={loading}
              style={{ marginBottom: '1rem' }}
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}

          {/* OAuth Buttons */}
          {hasAnyOAuth && (
            <div className="oauth-buttons">
              {hasGoogleAuth && (
                <button
                  type="button"
                  className="oauth-button google"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              )}
              {hasFacebookAuth && (
                <button
                  type="button"
                  className="oauth-button facebook"
                  onClick={handleFacebookLogin}
                  disabled={loading}
                >
                  <FacebookIcon />
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

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!hasAnyOAuth}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="form-footer">
            Don't have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToRegister}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
