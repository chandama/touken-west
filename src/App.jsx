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
import { matchesPeriodFilter } from './utils/periodUtils.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const SITE_URL = 'https://nihonto-db.com';

function App() {
  const { swords, totalCount, loading, isFullyLoaded, error } = useSwordData();
  const [searchTags, setSearchTags] = useState([]);
  const [filters, setFilters] = useState({
    school: '',
    smith: '',
    type: '',
    authentication: '',
    province: '',
    hasMedia: '',
    nagasaMin: '',
    nagasaMax: '',
    periods: [] // Array of selected period IDs
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Dynamic meta tags for SEO
  // Only update title after data loads to avoid "0 Historical Blades" in search results
  useDocumentMeta({
    title: selectedSword
      ? `${selectedSword.Smith || 'Unknown Smith'} ${selectedSword.Type || 'Sword'} - Nihonto DB`
      : swords.length > 0
        ? `Nihonto DB - Japanese Sword Database | ${swords.length.toLocaleString()} Historical Blades`
        : null, // Keep static HTML title until data loads
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

    // Nagasa (length) filter for group
    const matchesNagasa = (() => {
      const nagasaMin = group.nagasaMin || '';
      const nagasaMax = group.nagasaMax || '';
      if (nagasaMin === '' && nagasaMax === '') return true;
      if (!sword.Nagasa) return false;
      const nagasa = parseFloat(sword.Nagasa);
      if (isNaN(nagasa)) return false;
      if (nagasaMin !== '' && nagasa < parseFloat(nagasaMin)) return false;
      if (nagasaMax !== '' && nagasa > parseFloat(nagasaMax)) return false;
      return true;
    })();

    // Period filter for group
    const matchesPeriod = matchesPeriodFilter(sword.Period, group.periods || []);

    return matchesGroupSearch && matchesSchool && matchesSmith && matchesType && matchesAuthentication && matchesProvince && matchesNagasa && matchesPeriod;
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

    // Nagasa (length) filter
    const matchesNagasa = (() => {
      if (filters.nagasaMin === '' && filters.nagasaMax === '') return true;
      if (!sword.Nagasa) return false;
      const nagasa = parseFloat(sword.Nagasa);
      if (isNaN(nagasa)) return false;
      if (filters.nagasaMin !== '' && nagasa < parseFloat(filters.nagasaMin)) return false;
      if (filters.nagasaMax !== '' && nagasa > parseFloat(filters.nagasaMax)) return false;
      return true;
    })();

    // Period filter
    const matchesPeriod = matchesPeriodFilter(sword.Period, filters.periods);

    const matchesBaseFilters = matchesSchool && matchesSmith && matchesType && matchesAuthentication && matchesProvince && matchesMedia && matchesNagasa && matchesPeriod;

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
              <p>Japanese Sword Database - {(totalCount || swords.length).toLocaleString()} Historical Blades</p>
            </div>
          </div>
          <div className="header-actions">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            <a href="/provinces" className="provinces-link">
              Province Map
            </a>
            {user && (
              <a href="/library" className="library-link">
                Digital Library
              </a>
            )}
            {user ? (
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
                      <button onClick={() => { handleLogout(); setShowUserDropdown(false); }} className="user-dropdown-logout">
                        Logout
                      </button>
                    </div>
                  </>
                )}
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
      {!loading && !isFullyLoaded && (
        <div className="loading-background">Loading complete database...</div>
      )}
      {error && <div className="error">Error loading data: {error}</div>}

      {!loading && !error && (
        <div className="main-content">
          <div className="controls">
            <SearchBar
              searchTags={searchTags}
              onSearchTagsChange={setSearchTags}
              swords={swords}
            />
            <div className="filter-panels-container">
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
