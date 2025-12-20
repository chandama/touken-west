import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Settings page - Email change and account deletion
 */
const Settings = () => {
  const { user, checkAuth } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.patch(`${API_BASE}/account/email`, {
        newEmail,
        password: emailPassword
      });

      setMessage({ type: 'success', text: response.data.message });
      setNewEmail('');
      setEmailPassword('');
      await checkAuth();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to change email'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirm !== 'DELETE_MY_ACCOUNT') {
      setMessage({
        type: 'error',
        text: 'Please type DELETE_MY_ACCOUNT to confirm'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.delete(`${API_BASE}/account`, {
        data: {
          password: deletePassword,
          confirmation: deleteConfirm
        }
      });

      // Redirect to home after deletion
      window.location.href = '/';
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to delete account'
      });
      setLoading(false);
    }
  };

  const needsPassword = user?.authMethod === 'local' || user?.hasPassword;

  // Check if user has a placeholder email (Facebook without email permission)
  const hasPlaceholderEmail = user?.email?.includes('@placeholder.nihonto-db.com');

  return (
    <div className="account-page">
      <h1>Settings</h1>

      {message && (
        <div className={`account-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Placeholder Email Warning */}
      {hasPlaceholderEmail && (
        <div className="account-card warning">
          <h2>Email Required</h2>
          <p className="account-card-desc">
            Your account was created via Facebook but we couldn't access your email address.
            Please add a valid email address below to receive important notifications and
            enable password-based login as a backup.
          </p>
        </div>
      )}

      {/* Email Change */}
      <div className="account-card">
        <h2>{hasPlaceholderEmail ? 'Add Email Address' : 'Change Email'}</h2>
        {!hasPlaceholderEmail && (
          <p className="account-card-desc">
            Current email: <strong>{user?.email}</strong>
          </p>
        )}

        <form onSubmit={handleEmailChange} className="account-form">
          <div className="form-group">
            <label htmlFor="newEmail">New Email Address</label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          {needsPassword && (
            <div className="form-group">
              <label htmlFor="emailPassword">Current Password</label>
              <input
                id="emailPassword"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Delete Account */}
      <div className="account-card danger">
        <h2>Delete Account</h2>
        <p className="account-card-desc">
          Permanently delete your account and all associated data.
          This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="danger-btn"
          >
            Delete My Account
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="account-form">
            <div className="warning-box">
              <strong>Warning:</strong> This will permanently delete your account,
              including your profile and all associated data.
            </div>

            {needsPassword && (
              <div className="form-group">
                <label htmlFor="deletePassword">Enter your password</label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="deleteConfirm">
                Type <code>DELETE_MY_ACCOUNT</code> to confirm
              </label>
              <input
                id="deleteConfirm"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE_MY_ACCOUNT"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="danger-btn" disabled={loading}>
                {loading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeleteConfirm('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
