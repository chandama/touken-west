import React, { useState, useEffect } from 'react';
import './styles/App.css';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
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

  const filteredSwords = swords.filter(sword => {
    // Multi-tag search with AND logic
    // All search tags must match for the sword to be included
    const matchesSearch = searchTags.length === 0 || searchTags.every(tag => {
      const lowerTag = tag.toLowerCase();
      return Object.values(sword).some(value =>
        String(value).toLowerCase().includes(lowerTag)
      );
    });

    const matchesSchool = filters.school === '' || sword.School === filters.school;
    const matchesSmith = filters.smith === '' || sword.Smith === filters.smith;
    const matchesType = filters.type === '' || sword.Type === filters.type;

    // Advanced authentication matching
    const matchesAuthentication = filters.authentication === '' || (() => {
      if (!sword.Authentication) return false;
      const authStr = String(sword.Authentication);

      switch (filters.authentication) {
        case 'Juyo':
          // Match "Juyo" followed by 1-2 digits or "XX", but not "Juyo Bunkazai" or "Juyo Bijutsuhin"
          return /Juyo\s+(\d{1,2}|XX)/.test(authStr);
        case 'Tokubetsu Juyo':
          // Match "Tokubetsu Juyo" followed by 1-2 digits or "XX"
          return /Tokubetsu Juyo\s+(\d{1,2}|XX)/.test(authStr);
        case 'Hozon':
          // Match "Hozon" but not "Tokubetsu Hozon"
          return authStr.includes('Hozon') && !authStr.includes('Tokubetsu Hozon');
        default:
          // For all other authentication levels, use simple contains
          return authStr.includes(filters.authentication);
      }
    })();

    const matchesProvince = filters.province === '' || sword.Province === filters.province;

    return matchesSearch && matchesSchool && matchesSmith && matchesType && matchesAuthentication && matchesProvince;
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
