import React, { useMemo } from 'react';
import { getUniqueValues } from '../utils/csvParser';

/**
 * FilterPanel component for filtering swords by school, smith, type, authentication level, and province
 */
const FilterPanel = ({ filters, onFilterChange, swords }) => {
  // Get unique values for each filter category
  const schools = useMemo(() => getUniqueValues(swords, 'School'), [swords]);
  const smiths = useMemo(() => getUniqueValues(swords, 'Smith'), [swords]);
  const types = useMemo(() => getUniqueValues(swords, 'Type'), [swords]);
  const provinces = useMemo(() => getUniqueValues(swords, 'Province'), [swords]);

  // Authentication levels from CLAUDE.md
  const authenticationLevels = [
    'Kokuho',
    'Juyo Bunkazai',
    'Tokubetsu Juyo',
    'Juyo',
    'Juyo Bijutsuhin',
    'Tokubetsu Hozon',
    'Hozon'
  ];

  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      school: '',
      smith: '',
      type: '',
      authentication: '',
      province: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(f => f !== '');

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="clear-filters-button">
            Clear All
          </button>
        )}
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="school-filter">School</label>
          <select
            id="school-filter"
            value={filters.school}
            onChange={(e) => handleFilterChange('school', e.target.value)}
          >
            <option value="">All Schools</option>
            {schools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="smith-filter">Smith</label>
          <select
            id="smith-filter"
            value={filters.smith}
            onChange={(e) => handleFilterChange('smith', e.target.value)}
          >
            <option value="">All Smiths</option>
            {smiths.map(smith => (
              <option key={smith} value={smith}>{smith}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-filter">Type</label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="authentication-filter">Authentication Level</label>
          <select
            id="authentication-filter"
            value={filters.authentication}
            onChange={(e) => handleFilterChange('authentication', e.target.value)}
          >
            <option value="">All Levels</option>
            {authenticationLevels.map(auth => (
              <option key={auth} value={auth}>{auth}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="province-filter">Province</label>
          <select
            id="province-filter"
            value={filters.province}
            onChange={(e) => handleFilterChange('province', e.target.value)}
          >
            <option value="">All Provinces</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
