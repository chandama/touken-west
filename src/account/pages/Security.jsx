import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Security page - Password management and linked accounts
 */
const Security = () => {
  const { user, checkAuth } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/account/linked`);
      setLinkedAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch linked accounts:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);

    try {
      const endpoint = user?.hasPassword ? '/account/password' : '/account/set-password';
      const payload = user?.hasPassword
        ? { currentPassword, newPassword }
        : { newPassword };

      const response = await axios.patch(`${API_BASE}${endpoint}`, payload);

      setMessage({ type: 'success', text: response.data.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await checkAuth();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (provider) => {
    if (!window.confirm(`Are you sure you want to unlink your ${provider} account?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.delete(`${API_BASE}/account/unlink/${provider}`);
      setMessage({ type: 'success', text: `${provider} account unlinked successfully` });
      await fetchLinkedAccounts();
      await checkAuth();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to unlink account'
      });
    } finally {
      setLoading(false);
    }
  };

  const isOAuthOnly = user?.authMethod !== 'local' && !user?.hasPassword;

  return (
    <div className="account-page">
      <h1>Security</h1>

      {message && (
        <div className={`account-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Password Management */}
      <div className="account-card">
        <h2>{user?.hasPassword ? 'Change Password' : 'Set Password'}</h2>
        {isOAuthOnly && (
          <p className="account-card-desc">
            You signed up with {user?.authMethod}. Set a password to also be able to
            sign in with email and password.
          </p>
        )}

        <form onSubmit={handlePasswordChange} className="account-form">
          {user?.hasPassword && (
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
            <small>At least 8 characters with a letter and number</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Saving...' : user?.hasPassword ? 'Change Password' : 'Set Password'}
          </button>
        </form>
      </div>

      {/* Linked Accounts */}
      <div className="account-card">
        <h2>Linked Accounts</h2>
        <p className="account-card-desc">
          Connect additional accounts for easier sign-in.
        </p>

        <div className="linked-accounts-list">
          <div className="linked-account-item">
            <div className="linked-account-info">
              <span className="linked-account-icon google">G</span>
              <span className="linked-account-name">Google</span>
            </div>
            {linkedAccounts?.google ? (
              <button
                onClick={() => handleUnlink('google')}
                className="secondary-btn small"
                disabled={loading}
              >
                Unlink
              </button>
            ) : (
              <a
                href={`${API_BASE}/auth/google`}
                className="primary-btn small"
              >
                Link
              </a>
            )}
          </div>

          <div className="linked-account-item">
            <div className="linked-account-info">
              <span className="linked-account-icon facebook">f</span>
              <span className="linked-account-name">Facebook</span>
            </div>
            {linkedAccounts?.facebook ? (
              <button
                onClick={() => handleUnlink('facebook')}
                className="secondary-btn small"
                disabled={loading}
              >
                Unlink
              </button>
            ) : (
              <a
                href={`${API_BASE}/auth/facebook`}
                className="primary-btn small"
              >
                Link
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
