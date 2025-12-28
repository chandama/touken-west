import React, { useState, useEffect, useMemo } from 'react';
import './styles/Chronology.css';
import '../styles/theme.css';
import '../styles/App.css';
import Header from '../components/Header.jsx';
import Login from '../components/Login.jsx';
import Footer from '../components/Footer.jsx';
import SchoolTimeline from './components/SchoolTimeline.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { SCHOOL_PERIODS, PERIODS, getTraditions, searchSchools } from '../data/schoolPeriods.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const SITE_URL = 'https://nihonto-db.com';

const ROLE_HIERARCHY = ['user', 'subscriber', 'editor', 'admin'];

const TRADITION_COLORS = {
  Yamashiro: '#5B8BD4',
  Bizen: '#E07B7B',
  Yamato: '#9B7BD4',
  Soshu: '#6BD4A0',
  Mino: '#D4A86B',
  Bitchu: '#D46BA8',
  Bingo: '#6BC4D4',
  Hoki: '#A8D46B',
  Chikuzen: '#D4916B',
  Higo: '#916BD4',
  Bungo: '#6B91D4',
  Satsuma: '#D46B91',
  Dewa: '#6BD4B8',
  Echizen: '#B86BD4',
  Echigo: '#D4B86B',
  Kaga: '#6BA8D4',
  Suruga: '#D46BC4',
  Inaba: '#8BD46B',
  'Ko-Kyo': '#D4D46B',
  Various: '#9E9E9E',
};

function ChronologyApp() {
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useDocumentMeta({
    title: 'Gokaden Timeline - Nihonto DB',
    description: 'Interactive timeline visualization of Japanese sword schools. Compare schools across historical periods from Heian to Edo.',
    canonicalUrl: `${SITE_URL}/chronology`,
    ogType: 'website'
  });

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
        // Not logged in
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const canAccessLibrary = () => {
    if (!user) return false;
    const userLevel = ROLE_HIERARCHY.indexOf(user.role);
    const requiredLevel = ROLE_HIERARCHY.indexOf('subscriber');
    return userLevel >= requiredLevel;
  };

  const traditions = useMemo(() => getTraditions(), []);

  const filteredSchools = useMemo(() => {
    let schools = SCHOOL_PERIODS;

    if (selectedTradition) {
      schools = schools.filter(s => s.tradition === selectedTradition);
    }

    if (searchQuery) {
      schools = searchSchools(searchQuery).filter(s =>
        !selectedTradition || s.tradition === selectedTradition
      );
    }

    return schools.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedTradition]);

  const handleSchoolToggle = (school) => {
    setSelectedSchools(prev => {
      const isSelected = prev.some(s => s.name === school.name);
      if (isSelected) {
        return prev.filter(s => s.name !== school.name);
      }
      return [...prev, school];
    });
  };

  const handleSelectAll = () => {
    const newSelections = filteredSchools.filter(
      school => !selectedSchools.some(s => s.name === school.name)
    );
    setSelectedSchools(prev => [...prev, ...newSelections]);
  };

  const handleClearAll = () => {
    if (selectedTradition || searchQuery) {
      setSelectedSchools(prev =>
        prev.filter(s => !filteredSchools.some(f => f.name === s.name))
      );
    } else {
      setSelectedSchools([]);
    }
  };

  return (
    <div className="ChronologyApp">
      <Header
        variant="subpage"
        currentPage="chronology"
        subtitle="Gokaden Timeline - Major Swordmaking Schools"
        user={user}
        canAccessLibrary={canAccessLibrary()}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <div className="chronology-container">
        <aside className="chronology-sidebar">
          <div className="sidebar-section">
            <h3>Search Schools</h3>
            <input
              type="text"
              className="school-search-input"
              placeholder="Search by name, tradition, province..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sidebar-section">
            <h3>Filter by Tradition</h3>
            <select
              className="tradition-select"
              value={selectedTradition}
              onChange={(e) => setSelectedTradition(e.target.value)}
            >
              <option value="">All Traditions</option>
              {traditions.map(tradition => (
                <option key={tradition} value={tradition}>{tradition}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-section schools-list-section">
            <div className="schools-list-header">
              <h3>Schools ({filteredSchools.length})</h3>
              <div className="schools-list-actions">
                <button onClick={handleSelectAll} className="btn-link">Select All</button>
                <button onClick={handleClearAll} className="btn-link">Clear</button>
              </div>
            </div>
            <div className="schools-list">
              {filteredSchools.map(school => {
                const isSelected = selectedSchools.some(s => s.name === school.name);
                return (
                  <label key={school.name} className={`school-item ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSchoolToggle(school)}
                    />
                    <span className="school-name">{school.name}</span>
                    <span className="school-years">{school.startYear}-{school.endYear}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedSchools.length > 0 && (
            <div className="sidebar-section selected-section">
              <h3>Selected ({selectedSchools.length})</h3>
              <div className="selected-schools">
                {selectedSchools.map(school => (
                  <div
                    key={school.name}
                    className="selected-school-tag"
                    style={{ backgroundColor: TRADITION_COLORS[school.tradition] || '#9E9E9E' }}
                  >
                    <span>{school.name}</span>
                    <button onClick={() => handleSchoolToggle(school)}>&times;</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="chronology-main">
          {selectedSchools.length === 0 ? (
            <div className="timeline-placeholder">
              <h2>Select Schools to Compare</h2>
              <p>Use the sidebar to search and select schools. Their active periods will be displayed on the timeline.</p>
              <div className="quick-start">
                <h4>Quick Start Suggestions:</h4>
                <div className="quick-start-buttons">
                  <button onClick={() => {
                    const gokaden = SCHOOL_PERIODS.filter(s =>
                      [
                        // Yamashiro
                        'Sanjo', 'Awataguchi', 'Rai', 'Hasebe', 'Nobukuni',
                        // Bizen
                        'Ko-Bizen', 'Osafune', 'Ko-Ichimonji', 'Fukuoka Ichimonji', 'Yoshioka Ichimonji', 'Katayama Ichimonji',
                        // Soshu
                        'Soshu',
                        // Mino
                        'Shizu', 'Naoe Shizu',
                        // Yamato
                        'Tegai', 'Shikkake', 'Taima', 'Hosho', 'Ko-Senjuin', 'Chu-Senjuin'
                      ].includes(s.name)
                    );
                    setSelectedSchools(gokaden);
                  }}>
                    Major Gokaden Schools
                  </button>
                  <button onClick={() => {
                    const yamashiro = SCHOOL_PERIODS.filter(s => s.tradition === 'Yamashiro');
                    setSelectedSchools(yamashiro);
                  }}>
                    Yamashiro Tradition
                  </button>
                  <button onClick={() => {
                    const bizen = SCHOOL_PERIODS.filter(s => s.tradition === 'Bizen');
                    setSelectedSchools(bizen);
                  }}>
                    Bizen Tradition
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <SchoolTimeline schools={selectedSchools} periods={PERIODS} />
          )}
        </main>
      </div>

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => {
            setShowLogin(false);
            window.location.reload();
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default ChronologyApp;
