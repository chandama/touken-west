import React, { useState, useEffect } from 'react';
import '../styles/Login.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Email verification page
 * Handles the verification token from email links
 */
const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email link.');
      return;
    }

    verifyToken(token);
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
        if (data.code === 'INVALID_TOKEN') {
          setEmail(data.email || '');
        }
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setStatus('verifying');
    setMessage('Sending new verification email...');

    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('New verification email sent! Check your inbox.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to resend verification');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="login-overlay" style={{ cursor: 'default' }}>
      <div className="login-modal" style={{ textAlign: 'center' }}>
        <div className="login-header" style={{ justifyContent: 'center' }}>
          <h2>
            {status === 'verifying' && 'Verifying...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
        </div>

        <div className="login-form">
          {status === 'verifying' && (
            <div style={{ padding: '2rem' }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #d4af37',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ padding: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#4caf50',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '2rem'
              }}>
                ✓
              </div>
              <p>{message}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Redirecting you to the home page...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div style={{ padding: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#f44336',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '2rem'
              }}>
                ✕
              </div>
              <p style={{ color: '#c33' }}>{message}</p>

              {email && (
                <button
                  onClick={handleResend}
                  className="submit-button"
                  style={{ marginTop: '1rem' }}
                >
                  Resend Verification Email
                </button>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <a href="/" style={{ color: 'var(--primary-color)' }}>
                  Return to Home
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
