import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SwordList from './pages/SwordList.jsx';
import SwordEdit from './pages/SwordEdit.jsx';
import SwordCreate from './pages/SwordCreate.jsx';
import BulkUpload from './pages/BulkUpload.jsx';
import Changelog from './pages/Changelog.jsx';
import UserManagement from './pages/UserManagement.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import DarkModeToggle from '../components/DarkModeToggle.jsx';
import './styles/admin.css';

function AdminApp() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

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
      <ProtectedRoute requireAdmin={true}>
        <div className={`admin-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>
              <Link to="/admin" className="admin-logo">
                Touken West - Admin Dashboard
              </Link>
            </h1>
            <nav className="admin-nav">
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
              <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            </nav>
          </div>
        </header>

        <main className="admin-main">
          <Routes>
            <Route path="/admin" element={<SwordList />} />
            <Route path="/admin/create" element={<SwordCreate />} />
            <Route path="/admin/bulk-upload" element={<BulkUpload />} />
            <Route path="/admin/sword/:index" element={<SwordEdit />} />
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
