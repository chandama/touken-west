import React, { useMemo } from 'react';
import { getUniqueValues } from '../utils/csvParser';

/**
 * FilterPanel component for filtering swords by school, tradition, smith, type, authentication, and province
 */
const FilterPanel = ({ filters, onFilterChange, swords }) => {
  // Get unique values for each filter category
  const schools = useMemo(() => getUniqueValues(swords, 'School'), [swords]);
  const traditions = useMemo(() => getUniqueValues(swords, 'Tradition'), [swords]);
  const smiths = useMemo(() => getUniqueValues(swords, 'Smith'), [swords]);
  const types = useMemo(() => getUniqueValues(swords, 'Type'), [swords]);
  const authentications = useMemo(() => getUniqueValues(swords, 'Authentication'), [swords]);
  const provinces = useMemo(() => getUniqueValues(swords, 'Province'), [swords]);

  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      school: '',
      tradition: '',
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
          <label htmlFor="tradition-filter">Tradition</label>
          <select
            id="tradition-filter"
            value={filters.tradition}
            onChange={(e) => handleFilterChange('tradition', e.target.value)}
          >
            <option value="">All Traditions</option>
            {traditions.map(tradition => (
              <option key={tradition} value={tradition}>{tradition}</option>
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
          <label htmlFor="authentication-filter">Authentication</label>
          <select
            id="authentication-filter"
            value={filters.authentication}
            onChange={(e) => handleFilterChange('authentication', e.target.value)}
          >
            <option value="">All Authentications</option>
            {authentications.map(auth => (
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
