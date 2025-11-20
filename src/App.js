import React, { useState, useEffect } from 'react';
import './styles/App.css';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import AdvancedFilterGroups from './components/AdvancedFilterGroups';
import SwordTable from './components/SwordTable';
import SwordDetail from './components/SwordDetail';
import DarkModeToggle from './components/DarkModeToggle';
import useSwordData from './hooks/useSwordData';

function App() {
  const { swords, loading, error } = useSwordData();
  const [searchTags, setSearchTags] = useState([]);
  const [filters, setFilters] = useState({
    school: '',
    smith: '',
    type: '',
    authentication: '',
    province: ''
  });
  const [filterGroups, setFilterGroups] = useState([]);
  const [selectedSword, setSelectedSword] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

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
    // Check group search (similar to global search but for this group only)
    const matchesGroupSearch = group.search === '' || (() => {
      const lowerSearch = group.search.toLowerCase();
      return Object.values(sword).some(value =>
        String(value).toLowerCase().includes(lowerSearch)
      );
    })();

    const matchesSchool = group.school === '' || sword.School === group.school;
    const matchesSmith = group.smith === '' || sword.Smith === group.smith;
    const matchesType = group.type === '' || sword.Type === group.type;
    const matchesAuthentication = checkAuthenticationMatch(sword, group.authentication);
    const matchesProvince = group.province === '' || sword.Province === group.province;

    return matchesGroupSearch && matchesSchool && matchesSmith && matchesType && matchesAuthentication && matchesProvince;
  };

  const filteredSwords = swords.filter(sword => {
    // Multi-tag search with AND logic
    // All search tags must match for the sword to be included
    const matchesSearch = searchTags.length === 0 || searchTags.every(tag => {
      const lowerTag = tag.toLowerCase();
      return Object.values(sword).some(value =>
        String(value).toLowerCase().includes(lowerTag)
      );
    });

    // Base filters (AND logic)
    const matchesSchool = filters.school === '' || sword.School === filters.school;
    const matchesSmith = filters.smith === '' || sword.Smith === filters.smith;
    const matchesType = filters.type === '' || sword.Type === filters.type;
    const matchesAuthentication = checkAuthenticationMatch(sword, filters.authentication);
    const matchesProvince = filters.province === '' || sword.Province === filters.province;

    const matchesBaseFilters = matchesSchool && matchesSmith && matchesType && matchesAuthentication && matchesProvince;

    // Advanced filter groups (OR logic between groups, AND logic within each group)
    // If no filter groups exist, this passes automatically
    const matchesFilterGroups = filterGroups.length === 0 || filterGroups.some(group => {
      // Skip empty groups (groups with no active filters)
      const hasActiveFilters = Object.values(group).some(v => v !== '');
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
            <h1>Touken West</h1>
            <p>Japanese Sword Database - {swords.length.toLocaleString()} Historical Blades</p>
          </div>
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
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
            />
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              swords={swords}
              searchTags={searchTags}
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
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
