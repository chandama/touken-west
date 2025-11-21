import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SwordList from './pages/SwordList.jsx';
import SwordEdit from './pages/SwordEdit.jsx';
import Changelog from './pages/Changelog.jsx';
import './styles/admin.css';

function AdminApp() {
  return (
    <BrowserRouter>
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>
              <Link to="/admin" className="admin-logo">
                Touken West - Admin Dashboard
              </Link>
            </h1>
            <nav className="admin-nav">
              <Link to="/admin" className="nav-link">Swords</Link>
              <Link to="/admin/changelog" className="nav-link">Changelog</Link>
              <a href="/" target="_blank" rel="noopener noreferrer" className="nav-link">
                View Site →
              </a>
            </nav>
          </div>
        </header>

        <main className="admin-main">
          <Routes>
            <Route path="/admin" element={<SwordList />} />
            <Route path="/admin/sword/:index" element={<SwordEdit />} />
            <Route path="/admin/changelog" element={<Changelog />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default AdminApp;
