import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Profile page - View and edit user profile information
 */
const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.patch(`${API_BASE}/account`, {
        username: username !== user?.username ? username : undefined,
        displayName: displayName !== user?.displayName ? displayName : undefined
      });

      if (response.data.message) {
        setMessage({ type: 'success', text: response.data.message });
        await checkAuth(); // Refresh user data
        setEditing(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const names = {
      user: 'User',
      subscriber: 'Subscriber',
      editor: 'Editor',
      admin: 'Administrator'
    };
    return names[role] || role;
  };

  const getAuthMethodDisplay = (method) => {
    const methods = {
      local: 'Email & Password',
      google: 'Google',
      facebook: 'Facebook'
    };
    return methods[method] || method;
  };

  return (
    <div className="account-page">
      <h1>Profile</h1>

      {message && (
        <div className={`account-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="account-card">
        <div className="account-card-header">
          <h2>Account Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="account-edit-btn"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                pattern="[a-zA-Z0-9_-]{3,30}"
                title="3-30 characters, letters, numbers, underscores, hyphens only"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="displayName">Display Name (optional)</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setEditing(false);
                  setUsername(user?.username || '');
                  setDisplayName(user?.displayName || '');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="account-info-list">
            <div className="account-info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="account-info-item">
              <span className="info-label">Username</span>
              <span className="info-value">{user?.username}</span>
            </div>
            {user?.displayName && (
              <div className="account-info-item">
                <span className="info-label">Display Name</span>
                <span className="info-value">{user?.displayName}</span>
              </div>
            )}
            <div className="account-info-item">
              <span className="info-label">Role</span>
              <span className="info-value role-badge">{getRoleDisplayName(user?.role)}</span>
            </div>
            <div className="account-info-item">
              <span className="info-label">Sign-in Method</span>
              <span className="info-value">{getAuthMethodDisplay(user?.authMethod)}</span>
            </div>
            <div className="account-info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {user?.avatarUrl && (
        <div className="account-card">
          <h2>Profile Picture</h2>
          <div className="avatar-preview">
            <img src={user.avatarUrl} alt="Profile" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
