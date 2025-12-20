import React, { useEffect, useState } from 'react';

/**
 * OAuth callback handler component
 * Handles redirect from OAuth provider and shows success/error state
 */
const OAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success === 'true') {
      setStatus('success');
      setMessage('Sign in successful! Redirecting...');
      // Redirect to home after a brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else if (error) {
      setStatus('error');
      const errorMessages = {
        'auth_failed': 'Authentication failed. Please try again.',
        'not_configured': 'This login method is not configured.',
        'no_user': 'Unable to retrieve user information.',
        'default': `Authentication error: ${decodeURIComponent(error)}`
      };
      setMessage(errorMessages[error] || errorMessages.default);
    } else {
      // No params - might be a direct visit
      setStatus('error');
      setMessage('Invalid callback. Please try signing in again.');
    }
  }, []);

  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--bg-color, #f5f5f5)',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-color, white)',
        borderRadius: '12px',
        padding: '2rem 3rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        {status === 'processing' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e0e0e0',
              borderTopColor: 'var(--primary-color, #007bff)',
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {status === 'success' && (
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#4caf50',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px'
          }}>
            ✓
          </div>
        )}

        {status === 'error' && (
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#f44336',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px'
          }}>
            ✕
          </div>
        )}

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-color, #333)',
          margin: '0 0 1.5rem'
        }}>
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={handleRetry}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary-color, #007bff)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-hover, #0056b3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-color, #007bff)'}
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
