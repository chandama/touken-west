import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/Articles.css';
import '../styles/theme.css';
import '../styles/App.css';
import Header from '../components/Header.jsx';
import ArticleListPage from './pages/ArticleListPage.jsx';
import ArticleViewPage from './pages/ArticleViewPage.jsx';
import Footer from '../components/Footer.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Role hierarchy for permission checks
const ROLE_HIERARCHY = ['user', 'subscriber', 'editor', 'admin'];

function ArticlesApp() {
  const [user, setUser] = useState(null);

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

  // Check if user can access the Digital Library (subscriber or higher)
  const canAccessLibrary = () => {
    if (!user) return false;
    const userLevel = ROLE_HIERARCHY.indexOf(user.role);
    const requiredLevel = ROLE_HIERARCHY.indexOf('subscriber');
    return userLevel >= requiredLevel;
  };

  return (
    <BrowserRouter>
      <div className="ArticlesApp">
        <Header
          variant="subpage"
          currentPage="articles"
          subtitle="Research & Educational Resources"
          user={user}
          canAccessLibrary={canAccessLibrary()}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
        />

        <main className="articles-main">
          <Routes>
            <Route path="/articles" element={<ArticleListPage />} />
            <Route path="/articles/:slug" element={<ArticleViewPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default ArticlesApp;
