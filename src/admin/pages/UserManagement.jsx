import React, { useState, useEffect } from 'react';
import axios from '../../config/axios.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: 'user'
  });
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (authChecked && currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [authChecked, currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data.users);
      setError('');
    } catch (err) {
      setError('Failed to load users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');

    try {
      await axios.post(`${API_BASE_URL}/users`, newUser);
      setSuccessMessage(`User ${newUser.email} created successfully!`);
      setShowCreateModal(false);
      setNewUser({ email: '', username: '', password: '', role: 'user' });
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    if (!window.confirm(`Change ${user.email} role to ${newRole}?`)) {
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/users/${user.id}`, { role: newRole });
      setSuccessMessage(`User role updated to ${newRole}`);
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Failed to update role: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.email}? This cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/users/${user.id}`);
      setSuccessMessage(`User ${user.email} deleted`);
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      newPassword: '' // Add field for optional password change
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditError('');

    try {
      // Update basic info
      await axios.patch(`${API_BASE_URL}/users/${editingUser.id}`, {
        email: editingUser.email,
        username: editingUser.username,
        role: editingUser.role
      });

      // Update password if provided
      if (editingUser.newPassword) {
        await axios.patch(`${API_BASE_URL}/users/${editingUser.id}/password`, {
          password: editingUser.newPassword
        });
      }

      setSuccessMessage(`User ${editingUser.email} updated successfully!`);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const generateRandomPasswordForEdit = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditingUser({ ...editingUser, newPassword: password });
  };

  // Show loading while checking auth
  if (!authChecked) {
    return <div className="loading">Loading...</div>;
  }

  // Access denied for non-admin users
  if (currentUser?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#fef2f2',
          borderRadius: '8px',
          margin: '2rem'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Access Denied</h2>
          <p style={{ color: '#7f1d1d' }}>Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button onClick={() => setShowCreateModal(true)} className="create-button">
          + Create User
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'editor').length}</div>
          <div className="stat-label">Editors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'user').length}</div>
          <div className="stat-label">Regular Users</div>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="action-button edit"
                    title="Edit user"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleToggleRole(user)}
                    className="action-button toggle-role"
                    title={`Change to ${user.role === 'admin' ? 'user' : 'admin'}`}
                  >
                    {user.role === 'admin' ? '👤 Make User' : '⭐ Make Admin'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="action-button delete"
                    title="Delete user"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="create-user-form">
              {createError && <div className="error-message">{createError}</div>}

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <div className="password-input-group">
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="generate-password-button"
                  >
                    Generate
                  </button>
                </div>
                <small>Minimum 6 characters. Share this password with the user.</small>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="create-user-form">
              {editError && <div className="error-message">{editError}</div>}

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <div className="password-input-group">
                  <input
                    type="text"
                    value={editingUser.newPassword}
                    onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={generateRandomPasswordForEdit}
                    className="generate-password-button"
                  >
                    Generate
                  </button>
                </div>
                <small>Minimum 6 characters if changing password</small>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
