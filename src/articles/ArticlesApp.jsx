import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/Articles.css';
import '../styles/theme.css';
import '../styles/App.css';
import DarkModeToggle from '../components/DarkModeToggle.jsx';
import ArticleListPage from './pages/ArticleListPage.jsx';
import ArticleViewPage from './pages/ArticleViewPage.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function ArticlesApp() {
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Check authentication (optional for articles, but shows user menu if logged in)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        // Not logged in - that's fine for articles
      }
    };
    checkAuth();
  }, []);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <BrowserRouter>
      <div className="ArticlesApp">
        <header className="subpage-header">
          <div className="subpage-header-content">
            <div className="subpage-header-text">
              <a href="/">
                <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="subpage-header-logo" />
              </a>
              <div className="subpage-header-title">
                <h1>Articles</h1>
                <p>Research & Educational Resources</p>
              </div>
            </div>
            <div className="subpage-header-actions">
              <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

              {/* Mobile hamburger menu */}
              <div className="mobile-menu">
                <button
                  className="mobile-menu-button"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  aria-label="Navigation menu"
                  aria-expanded={showMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="mobile-menu-icon">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                  </svg>
                </button>
                {showMobileMenu && (
                  <>
                    <div className="mobile-menu-backdrop" onClick={() => setShowMobileMenu(false)} />
                    <div className="mobile-menu-dropdown">
                      <a href="/" className="mobile-nav-link">Sword Database</a>
                      <a href="/provinces" className="mobile-nav-link">Province Map</a>
                      <a href="/library" className="mobile-nav-link">Digital Library</a>
                      <span className="mobile-nav-link active">Articles</span>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop nav links */}
              <a href="/" className="header-nav-link">Sword Database</a>
              <a href="/provinces" className="header-nav-link">Province Map</a>
              <a href="/library" className="header-nav-link">Digital Library</a>
              <span className="header-nav-link active">Articles</span>

              {/* User menu */}
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
                        {(user.role === 'admin' || user.role === 'editor') && (
                          <a href="/admin/articles" className="user-dropdown-admin">
                            Manage Articles
                          </a>
                        )}
                        {user.role === 'admin' && (
                          <a href="/admin" className="user-dropdown-admin">
                            Admin Panel
                          </a>
                        )}
                        <button onClick={() => { handleLogout(); setShowUserDropdown(false); }} className="user-dropdown-logout">
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="articles-main">
          <Routes>
            <Route path="/articles" element={<ArticleListPage />} />
            <Route path="/articles/:slug" element={<ArticleViewPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default ArticlesApp;
