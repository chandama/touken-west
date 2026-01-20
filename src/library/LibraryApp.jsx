import React, { useState, useEffect, useMemo } from 'react';
import './styles/Library.css';
import '../styles/theme.css';
import '../styles/App.css';
import SearchBar from '../components/SearchBar.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import AdvancedFilterGroups from '../components/AdvancedFilterGroups.jsx';
import Header from '../components/Header.jsx';
import Login from '../components/Login.jsx';
import LibraryGallery from './components/LibraryGallery.jsx';
import LibraryLightbox from './components/LibraryLightbox.jsx';
import useSwordData from '../hooks/useSwordData.js';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { hasValidMedia, parseMediaAttachments, hasTranslationPdf } from '../utils/mediaUtils.js';
import { parseSearchInput, matchesSearchTerms } from '../utils/searchParser.js';
import { matchesPeriodFilter } from '../utils/periodUtils.js';
import { parseUrlFilters, updateUrlWithFilters } from '../utils/urlFilters.js';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import Footer from '../components/Footer.jsx';

const SITE_URL = 'https://nihonto-db.com';

function LibraryAppContent() {
  const { swords, loading, error } = useSwordData();
  const { user, loading: authLoading, logout, canAccessLibrary, isEditor } = useAuth();

  // Show login modal state
  const [showLogin, setShowLogin] = useState(false);

  // Parse initial state from URL parameters
  const initialParams = new URLSearchParams(window.location.search);
  const initialUrlState = parseUrlFilters(initialParams);

  // If there's a sword parameter, add it as a quoted search term
  const swordParam = initialParams.get('sword');
  const initialSearchTags = swordParam
    ? [...initialUrlState.searchTags, `"${swordParam}"`]
    : initialUrlState.searchTags;

  // Filter state (same as App.jsx but with hasMedia forced to 'true')
  const [searchTags, setSearchTags] = useState(initialSearchTags);
  const [filters, setFilters] = useState({
    ...initialUrlState.filters,
    hasMedia: 'true', // Always true for library, override URL value
  });
  const [filterGroups, setFilterGroups] = useState([]);

  // Lightbox state
  const [selectedSwordIndex, setSelectedSwordIndex] = useState(null);


  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Set meta tags for SEO
  useDocumentMeta({
    title: 'Digital Library - Nihonto DB',
    description: 'Browse high-quality images of authenticated Japanese swords. Explore photographs of Juyo, Tokubetsu Juyo, and other certified nihonto.',
    canonicalUrl: `${SITE_URL}/library`,
    ogType: 'website'
  });

  // Show login modal if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLogin(true);
    }
  }, [authLoading, user]);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Update URL when filters or search tags change
  useEffect(() => {
    updateUrlWithFilters(filters, searchTags);
  }, [filters, searchTags]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlState = parseUrlFilters(params);

      // If there's a sword parameter, add it as a quoted search term
      const swordParam = params.get('sword');
      const newSearchTags = swordParam
        ? [...urlState.searchTags, `"${swordParam}"`]
        : urlState.searchTags;

      setFilters({
        ...urlState.filters,
        hasMedia: 'true', // Always force hasMedia to true for library
      });
      setSearchTags(newSearchTags);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // Compute library stats: total images and translations for filtered results
  const libraryStats = useMemo(() => {
    let totalImages = 0;
    let translationCount = 0;

    filteredSwords.forEach(sword => {
      const media = parseMediaAttachments(sword.MediaAttachments);
      totalImages += media.length;
      if (hasTranslationPdf(sword)) {
        translationCount++;
      }
    });

    return { totalImages, translationCount };
  }, [filteredSwords]);

  // Update URL when sword selected (keeps sword parameter in sync with lightbox)
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

  const handleLoginSuccess = () => {
    setShowLogin(false);
    // AuthContext will automatically update user state
  };

  const handleLogout = async () => {
    await logout();
    setShowLogin(true);
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
        <Header
          variant="subpage"
          currentPage="library"
          subtitle="Nihontō Media Library"
          user={null}
          canAccessLibrary={false}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
        />

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

  // User logged in but doesn't have subscriber access
  if (!canAccessLibrary()) {
    return (
      <div className="LibraryApp">
        <Header
          variant="subpage"
          currentPage="library"
          subtitle="Nihontō Media Library"
          user={user}
          canAccessLibrary={false}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
        />

        <div className="library-auth-required">
          <h2>Access Restricted</h2>
          <p>You don't have access to this page, please reach out to <a href="mailto:support@nihonto-db.com">support@nihonto-db.com</a> if you have any questions.</p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-color, #007bff)',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="LibraryApp">
      <Header
        variant="subpage"
        currentPage="library"
        subtitle={`Nihontō Media Library - ${swordsWithMedia.length.toLocaleString()} Catalogued Items`}
        user={user}
        canAccessLibrary={true}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

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
            Showing {libraryStats.totalImages.toLocaleString()} images and {libraryStats.translationCount.toLocaleString()} translations of {filteredSwords.length.toLocaleString()} swords
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

      <Footer />
    </div>
  );
}

// Wrap with AuthProvider
function LibraryApp() {
  return (
    <AuthProvider>
      <LibraryAppContent />
    </AuthProvider>
  );
}

export default LibraryApp;
