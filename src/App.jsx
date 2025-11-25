import React, { useState, useEffect } from 'react';
import './styles/theme.css';
import './styles/App.css';
import SearchBar from './components/SearchBar.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import AdvancedFilterGroups from './components/AdvancedFilterGroups.jsx';
import SwordTable from './components/SwordTable.jsx';
import SwordDetail from './components/SwordDetail.jsx';
import DarkModeToggle from './components/DarkModeToggle.jsx';
import Login from './components/Login.jsx';
import useSwordData from './hooks/useSwordData.js';
import useDocumentMeta from './hooks/useDocumentMeta.js';
import { parseSearchInput, matchesSearchTerms } from './utils/searchParser.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const SITE_URL = 'https://nihonto-db.com';

function App() {
  const { swords, loading, error } = useSwordData();
  const [searchTags, setSearchTags] = useState([]);
  const [filters, setFilters] = useState({
    school: '',
    smith: '',
    type: '',
    authentication: '',
    province: '',
    hasMedia: ''
  });
  const [filterGroups, setFilterGroups] = useState([]);
  const [selectedSword, setSelectedSword] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Dynamic meta tags for SEO
  useDocumentMeta({
    title: selectedSword
      ? `${selectedSword.Smith || 'Unknown Smith'} ${selectedSword.Type || 'Sword'} - Touken West`
      : `Touken West - Japanese Sword Database | ${swords.length.toLocaleString()} Historical Blades`,
    description: selectedSword
      ? `${selectedSword.Type || 'Japanese sword'} by ${selectedSword.Smith || 'unknown smith'}${selectedSword.School ? ` of ${selectedSword.School} school` : ''}${selectedSword.Authentication ? `. ${selectedSword.Authentication}` : ''}. View details, dimensions, and provenance.`
      : 'Searchable database of historical Japanese swords. Browse Juyo, Tokubetsu Juyo, and other authenticated nihonto with detailed records of smiths, schools, and provenance.',
    canonicalUrl: SITE_URL,
    ogType: selectedSword ? 'article' : 'website'
  });

  // Check authentication status
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
      console.error('Logout failed:', error);
    }
  };

  // Helper function to check if authentication matches
  const checkAuthenticationMatch = (sword, authenticationFilter) => {
    if (authenticationFilter === '') return true;
    if (!sword.Authentication) return false;

    const authStr = String(sword.Authentication);
    switch (authenticationFilter) {
      case 'Juyo':
        return /Juyo\s+(\d{1,2}|XX)/.test(authStr);
      case 'Tokubetsu Juyo':
        return /Tokubetsu Juyo\s+(\d{1,2}|XX)/.test(authStr);
      case 'Hozon':
        return authStr.includes('Hozon') && !authStr.includes('Tokubetsu Hozon');
      default:
        return authStr.includes(authenticationFilter);
    }
  };

  // Helper function to check if a sword matches all filters in a group
  const checkGroupMatch = (sword, group) => {
    // Check group search tags (all tags must match - AND logic)
    const matchesGroupSearch = !group.searchTags || group.searchTags.length === 0 ||
      group.searchTags.every(tag => {
        const lowerTag = tag.toLowerCase();
        return Object.values(sword).some(value =>
          String(value).toLowerCase().includes(lowerTag)
        );
      });

    const matchesSchool = group.school === '' || sword.School === group.school;
    const matchesSmith = group.smith === '' || sword.Smith === group.smith;
    const matchesType = group.type === '' || sword.Type === group.type;
    const matchesAuthentication = checkAuthenticationMatch(sword, group.authentication);
    const matchesProvince = group.province === '' || sword.Province === group.province;

    return matchesGroupSearch && matchesSchool && matchesSmith && matchesType && matchesAuthentication && matchesProvince;
  };

  const filteredSwords = swords.filter(sword => {
    // Multi-tag search with AND logic and quoted phrase support
    // All search tags must match for the sword to be included
    const matchesSearch = searchTags.length === 0 || searchTags.every(tag => {
      // Parse tag for quoted and unquoted terms
      const { quoted, unquoted } = parseSearchInput(tag);

      // Check if any field in the sword matches the search terms
      return Object.values(sword).some(value => {
        return matchesSearchTerms(value, quoted, unquoted);
      });
    });

    // Base filters (AND logic)
    const matchesSchool = filters.school === '' || sword.School === filters.school;
    const matchesSmith = filters.smith === '' || sword.Smith === filters.smith;
    const matchesType = filters.type === '' || sword.Type === filters.type;
    const matchesAuthentication = checkAuthenticationMatch(sword, filters.authentication);
    const matchesProvince = filters.province === '' || sword.Province === filters.province;

    // Media filter (only applies when user is logged in)
    const matchesMedia = filters.hasMedia === '' || (filters.hasMedia === 'true'
      ? (sword.MediaAttachments && sword.MediaAttachments !== 'NA' && sword.MediaAttachments !== '[]')
      : (!sword.MediaAttachments || sword.MediaAttachments === 'NA' || sword.MediaAttachments === '[]')
    );

    const matchesBaseFilters = matchesSchool && matchesSmith && matchesType && matchesAuthentication && matchesProvince && matchesMedia;

    // Advanced filter groups (OR logic between groups, AND logic within each group)
    // If no filter groups exist, this passes automatically
    const matchesFilterGroups = filterGroups.length === 0 || filterGroups.some(group => {
      // Skip empty groups (groups with no active filters)
      const hasSearchTags = group.searchTags && group.searchTags.length > 0;
      const hasOtherFilters = Object.entries(group).some(([key, value]) =>
        key !== 'searchTags' && value !== ''
      );
      const hasActiveFilters = hasSearchTags || hasOtherFilters;
      if (!hasActiveFilters) return false;

      return checkGroupMatch(sword, group);
    });

    return matchesSearch && matchesBaseFilters && matchesFilterGroups;
  });

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-text">
            <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="header-logo" />
            <div className="header-title-group">
              <h1>Touken West</h1>
              <p>Japanese Sword Database - {swords.length.toLocaleString()} Historical Blades</p>
            </div>
          </div>
          <div className="header-actions">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            {user ? (
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="login-button">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {loading && <div className="loading">Loading sword data...</div>}
      {error && <div className="error">Error loading data: {error}</div>}

      {!loading && !error && (
        <div className="main-content">
          <div className="controls">
            <SearchBar
              searchTags={searchTags}
              onSearchTagsChange={setSearchTags}
              swords={swords}
            />
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              swords={swords}
              searchTags={searchTags}
              user={user}
            />
            <AdvancedFilterGroups
              filterGroups={filterGroups}
              onFilterGroupsChange={setFilterGroups}
              swords={swords}
              searchTags={searchTags}
              baseFilters={filters}
            />
          </div>

          <div className="results-info">
            Showing {filteredSwords.length.toLocaleString()} of {swords.length.toLocaleString()} swords
          </div>

          <div className="content-area">
            <SwordTable
              swords={filteredSwords}
              onSwordSelect={setSelectedSword}
              selectedSword={selectedSword}
            />
            {selectedSword && (
              <SwordDetail
                sword={selectedSword}
                onClose={() => setSelectedSword(null)}
                user={user}
              />
            )}
          </div>
        </div>
      )}

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
