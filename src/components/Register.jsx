import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/Login.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// SVG icons for OAuth providers (same as Login.jsx)
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

const Register = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authConfig, setAuthConfig] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const recaptchaRef = useRef(null);

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

          // Load reCAPTCHA script if CAPTCHA is enabled
          if (data.captchaEnabled && data.captchaSiteKey) {
            loadRecaptchaScript(data.captchaSiteKey);
          }
        }
      } catch (err) {
        console.error('Failed to fetch auth config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Load reCAPTCHA v3 script dynamically
  const loadRecaptchaScript = (siteKey) => {
    if (document.querySelector('script[src*="recaptcha"]')) return;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.head.appendChild(script);
  };

  // Get CAPTCHA token
  const getCaptchaToken = useCallback(async () => {
    if (!authConfig?.captchaEnabled || !authConfig?.captchaSiteKey) {
      return null;
    }

    try {
      // Wait for grecaptcha to be available
      if (!window.grecaptcha) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (window.grecaptcha) {
        return await window.grecaptcha.execute(authConfig.captchaSiteKey, { action: 'register' });
      }
    } catch (err) {
      console.error('reCAPTCHA error:', err);
    }
    return null;
  }, [authConfig]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      return 'Password must contain at least one letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const validateUsername = (name) => {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(name)) {
      return 'Username must be 3-30 characters (letters, numbers, underscores, hyphens only)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Get CAPTCHA token if enabled
      const captchaToken = await getCaptchaToken();

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, username, captchaToken })
      });

      const data = await response.json();

      if (response.ok) {
        // Show verification message instead of logging in
        if (data.requiresVerification) {
          setRegistrationSuccess(true);
          setRegisteredEmail(email);
        } else {
          // OAuth or already verified - reload to update auth state
          window.location.reload();
        }
      } else {
        // Handle CAPTCHA errors specially
        if (data.code?.startsWith('CAPTCHA_')) {
          setError('Verification failed. Please try again.');
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
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

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <div className="login-overlay" onClick={onClose}>
        <div className="login-modal" onClick={(e) => e.stopPropagation()}>
          <div className="login-header">
            <h2>Check Your Email</h2>
            <button onClick={onClose} className="close-button" aria-label="Close">
              ×
            </button>
          </div>

          <div className="login-form" style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#4caf50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              ✓
            </div>

            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Account created successfully!
            </p>

            <p style={{ color: 'var(--text-secondary)' }}>
              We've sent a verification email to:
            </p>
            <p style={{ fontWeight: '600', marginBottom: '1.5rem' }}>
              {registeredEmail}
            </p>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Please click the link in the email to verify your account and log in.
            </p>

            <div className="form-footer" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="link-button"
                onClick={onSwitchToLogin}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <h2>Create Account</h2>
          <button onClick={onClose} className="close-button" aria-label="Close">
            ×
          </button>
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
              <span>or register with email</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus={!hasAnyOAuth}
                pattern="[a-zA-Z0-9_-]{3,30}"
                title="3-30 characters, letters, numbers, underscores, hyphens only"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                minLength={8}
              />
              <small className="password-hint">
                At least 8 characters with a letter and number
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {authConfig?.captchaEnabled && (
              <p className="recaptcha-notice">
                Protected by reCAPTCHA
              </p>
            )}
          </form>

          <div className="form-footer">
            Already have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
