import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SwordList from './pages/SwordList.jsx';
import SwordEdit from './pages/SwordEdit.jsx';
import SwordCreate from './pages/SwordCreate.jsx';
import BulkUpload from './pages/BulkUpload.jsx';
import Changelog from './pages/Changelog.jsx';
import UserManagement from './pages/UserManagement.jsx';
import ArticleList from './pages/ArticleList.jsx';
import ArticleCreate from './pages/ArticleCreate.jsx';
import ArticleEdit from './pages/ArticleEdit.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import DarkModeToggle from '../components/DarkModeToggle.jsx';
import './styles/admin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function AdminApp() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch current user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <BrowserRouter>
      <ProtectedRoute requireAdmin={true} allowEditor={true}>
        <div className={`admin-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>
              <Link to="/admin" className="admin-logo">
                Touken West - Admin Dashboard
              </Link>
            </h1>
            <nav className="admin-nav">
              <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
              <div className="admin-actions-dropdown">
                <button
                  className="nav-link actions-dropdown-btn"
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  aria-expanded={showActionsDropdown}
                >
                  Actions
                  <svg viewBox="0 0 24 24" fill="currentColor" className="dropdown-arrow">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
                {showActionsDropdown && (
                  <>
                    <div className="actions-dropdown-backdrop" onClick={() => setShowActionsDropdown(false)} />
                    <div className="actions-dropdown-menu">
                      <Link to="/admin" className="actions-dropdown-item" onClick={() => setShowActionsDropdown(false)}>
                        Swords
                      </Link>
                      <Link to="/admin/articles" className="actions-dropdown-item" onClick={() => setShowActionsDropdown(false)}>
                        Articles
                      </Link>
                      <Link to="/admin/bulk-upload" className="actions-dropdown-item" onClick={() => setShowActionsDropdown(false)}>
                        Bulk Upload
                      </Link>
                      <Link to="/admin/users" className="actions-dropdown-item" onClick={() => setShowActionsDropdown(false)}>
                        Users
                      </Link>
                      <Link to="/admin/changelog" className="actions-dropdown-item" onClick={() => setShowActionsDropdown(false)}>
                        Changelog
                      </Link>
                    </div>
                  </>
                )}
              </div>
              <a href="/" target="_blank" rel="noopener noreferrer" className="nav-link">
                View Site →
              </a>
              {user && (
                <div className="user-menu">
                  <button
                    className="user-avatar-button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    aria-label="User menu"
                    aria-expanded={showUserDropdown}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="user-avatar-icon">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </button>
                  {showUserDropdown && (
                    <>
                      <div className="user-dropdown-backdrop" onClick={() => setShowUserDropdown(false)} />
                      <div className="user-dropdown">
                        <div className="user-dropdown-email">{user.email}</div>
                        <div className="user-dropdown-role">{user.role}</div>
                        <button onClick={() => { handleLogout(); setShowUserDropdown(false); }} className="user-dropdown-logout">
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="admin-main">
          <Routes>
            <Route path="/admin" element={<SwordList />} />
            <Route path="/admin/create" element={<SwordCreate />} />
            <Route path="/admin/bulk-upload" element={<BulkUpload />} />
            <Route path="/admin/sword/:index" element={<SwordEdit />} />
            <Route path="/admin/articles" element={<ArticleList />} />
            <Route path="/admin/articles/create" element={<ArticleCreate />} />
            <Route path="/admin/articles/:slug" element={<ArticleEdit />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/changelog" element={<Changelog />} />
          </Routes>
        </main>
      </div>
      </ProtectedRoute>
    </BrowserRouter>
  );
}

export default AdminApp;
