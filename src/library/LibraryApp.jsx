import React, { useState, useEffect, useMemo } from 'react';
import './styles/Library.css';
import '../styles/theme.css';
import '../styles/App.css';
import SearchBar from '../components/SearchBar.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import AdvancedFilterGroups from '../components/AdvancedFilterGroups.jsx';
import DarkModeToggle from '../components/DarkModeToggle.jsx';
import Login from '../components/Login.jsx';
import LibraryGallery from './components/LibraryGallery.jsx';
import LibraryLightbox from './components/LibraryLightbox.jsx';
import useSwordData from '../hooks/useSwordData.js';
import { hasValidMedia } from '../utils/mediaUtils.js';
import { parseSearchInput, matchesSearchTerms } from '../utils/searchParser.js';
import { matchesPeriodFilter } from '../utils/periodUtils.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function LibraryApp() {
  const { swords, loading, error } = useSwordData();

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Filter state (same as App.jsx but with hasMedia forced to 'true')
  const [searchTags, setSearchTags] = useState([]);
  const [filters, setFilters] = useState({
    school: '',
    smith: '',
    type: '',
    authentication: '',
    province: '',
    hasMedia: 'true', // Always true for library
    nagasaMin: '',
    nagasaMax: '',
    periods: []
  });
  const [filterGroups, setFilterGroups] = useState([]);

  // Lightbox state
  const [selectedSwordIndex, setSelectedSwordIndex] = useState(null);

  // User dropdown state
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Not logged in - show login modal
          setShowLogin(true);
        }
      } catch (error) {
        // Not logged in - show login modal
        setShowLogin(true);
      } finally {
        setAuthLoading(false);
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

  // Pre-filter swords to only those with valid media
  const swordsWithMedia = useMemo(() => {
    return swords.filter(hasValidMedia);
  }, [swords]);

  // Helper function to check if authentication matches (same as App.jsx)
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

  // Helper function to check if a sword matches all filters in a group (same as App.jsx)
  const checkGroupMatch = (sword, group) => {
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

    const matchesPeriod = matchesPeriodFilter(sword.Period, group.periods || []);

    return matchesGroupSearch && matchesSchool && matchesSmith && matchesType &&
           matchesAuthentication && matchesProvince && matchesNagasa && matchesPeriod;
  };

  // Filter swords (same logic as App.jsx)
  const filteredSwords = useMemo(() => {
    return swordsWithMedia.filter(sword => {
      // Multi-tag search with AND logic and quoted phrase support
      const matchesSearch = searchTags.length === 0 || searchTags.every(tag => {
        const { quoted, unquoted } = parseSearchInput(tag);
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

      const matchesBaseFilters = matchesSchool && matchesSmith && matchesType &&
                                 matchesAuthentication && matchesProvince && matchesNagasa && matchesPeriod;

      // Advanced filter groups (OR logic between groups, AND logic within each group)
      const matchesFilterGroups = filterGroups.length === 0 || filterGroups.some(group => {
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
  }, [swordsWithMedia, searchTags, filters, filterGroups]);

  // Handle URL query params for direct linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const swordId = params.get('sword');
    if (swordId && filteredSwords.length > 0) {
      const index = filteredSwords.findIndex(s => String(s.Index) === swordId);
      if (index !== -1) {
        setSelectedSwordIndex(index);
      }
    }
  }, [filteredSwords]);

  // Update URL when sword selected
  useEffect(() => {
    if (selectedSwordIndex !== null && filteredSwords[selectedSwordIndex]) {
      const sword = filteredSwords[selectedSwordIndex];
      const url = new URL(window.location);
      url.searchParams.set('sword', sword.Index);
      window.history.replaceState({}, '', url);
    } else if (selectedSwordIndex === null) {
      const url = new URL(window.location);
      url.searchParams.delete('sword');
      window.history.replaceState({}, '', url);
    }
  }, [selectedSwordIndex, filteredSwords]);

  // Navigation handlers
  const handleSwordSelect = (sword) => {
    const index = filteredSwords.findIndex(s => s.Index === sword.Index);
    setSelectedSwordIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedSwordIndex(null);
  };

  const handlePrevSword = () => {
    if (selectedSwordIndex > 0) {
      setSelectedSwordIndex(selectedSwordIndex - 1);
    }
  };

  const handleNextSword = () => {
    if (selectedSwordIndex < filteredSwords.length - 1) {
      setSelectedSwordIndex(selectedSwordIndex + 1);
    }
  };

  const handleLoginSuccess = async () => {
    // Re-check auth after login
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShowLogin(false);
      }
    } catch (error) {
      console.error('Error checking auth after login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setShowLogin(true);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="LibraryApp">
        <div className="library-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Auth required - show login modal
  if (!user) {
    return (
      <div className="LibraryApp">
        <header className="subpage-header">
          <div className="subpage-header-content">
            <div className="subpage-header-text">
              <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="subpage-header-logo" />
              <div className="subpage-header-title">
                <h1>Touken West - Nihontō Database</h1>
                <p>Nihontō Media Library</p>
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
                      <span className="mobile-nav-link active">Digital Library</span>
                      <a href="/articles" className="mobile-nav-link">Articles</a>
                    </div>
                  </>
                )}
              </div>
              {/* Desktop nav links */}
              <a href="/" className="header-nav-link">
                Sword Database
              </a>
              <a href="/provinces" className="header-nav-link">
                Province Map
              </a>
              <span className="header-nav-link active">
                Digital Library
              </span>
              <a href="/articles" className="header-nav-link">
                Articles
              </a>
            </div>
          </div>
        </header>

        <div className="library-auth-required">
          <h2>Login Required</h2>
          <p>Please log in to access the Digital Library</p>
        </div>

        {showLogin && (
          <Login
            onClose={() => {
              setShowLogin(false);
              window.location.href = '/';
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className="LibraryApp">
      <header className="subpage-header">
        <div className="subpage-header-content">
          <div className="subpage-header-text">
            <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="subpage-header-logo" />
            <div className="subpage-header-title">
              <h1>Touken West - Nihontō Database</h1>
              <p>Nihontō Media Library - {swordsWithMedia.length.toLocaleString()} Catalogued Items</p>
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
                    <span className="mobile-nav-link active">Digital Library</span>
                    <a href="/articles" className="mobile-nav-link">Articles</a>
                  </div>
                </>
              )}
            </div>
            {/* Desktop nav links */}
            <a href="/" className="header-nav-link">
              Sword Database
            </a>
            <a href="/provinces" className="header-nav-link">
              Province Map
            </a>
            <span className="header-nav-link active">
              Digital Library
            </span>
            <a href="/articles" className="header-nav-link">
              Articles
            </a>
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
          </div>
        </div>
      </header>

      {loading && <div className="loading">Loading sword data...</div>}
      {error && <div className="error">Error loading data: {error}</div>}

      {!loading && !error && (
        <div className="library-content">
          <div className="library-controls">
            <SearchBar
              searchTags={searchTags}
              onSearchTagsChange={setSearchTags}
              swords={swordsWithMedia}
            />
            <div className="filter-panels-container">
              <FilterPanel
                filters={filters}
                onFilterChange={(newFilters) => {
                  // Force hasMedia to always be 'true'
                  setFilters({ ...newFilters, hasMedia: 'true' });
                }}
                swords={swordsWithMedia}
                searchTags={searchTags}
                user={user}
                hideMediaFilter={true}
              />
              <AdvancedFilterGroups
                filterGroups={filterGroups}
                onFilterGroupsChange={setFilterGroups}
                swords={swordsWithMedia}
                searchTags={searchTags}
                baseFilters={filters}
              />
            </div>
          </div>

          <div className="library-results-info">
            Showing {filteredSwords.length.toLocaleString()} of {swordsWithMedia.length.toLocaleString()} swords with images
          </div>

          <LibraryGallery
            swords={filteredSwords}
            onSwordSelect={handleSwordSelect}
          />

          {selectedSwordIndex !== null && filteredSwords[selectedSwordIndex] && (
            <LibraryLightbox
              sword={filteredSwords[selectedSwordIndex]}
              onClose={handleCloseLightbox}
              onPrev={handlePrevSword}
              onNext={handleNextSword}
              hasPrev={selectedSwordIndex > 0}
              hasNext={selectedSwordIndex < filteredSwords.length - 1}
              currentIndex={selectedSwordIndex}
              totalCount={filteredSwords.length}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default LibraryApp;
