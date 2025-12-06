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
              <Link to="/admin" className="nav-link">Swords</Link>
              <Link to="/admin/bulk-upload" className="nav-link">Bulk Upload</Link>
              <Link to="/admin/users" className="nav-link">Users</Link>
              <Link to="/admin/changelog" className="nav-link">Changelog</Link>
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
