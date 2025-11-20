import React, { useMemo } from 'react';
import { getAvailableFilterOptions, getOptionCounts } from '../utils/filterUtils';

/**
 * FilterPanel component with dynamic cascading filters
 * Filter options update based on current selections
 */
const FilterPanel = ({ filters, onFilterChange, swords, searchTags = [] }) => {
  // Get available filter options based on current filters and search
  const availableOptions = useMemo(
    () => getAvailableFilterOptions(swords, filters, searchTags),
    [swords, filters, searchTags]
  );

  // Get counts for each filter option
  const schoolCounts = useMemo(
    () => getOptionCounts(swords, filters, searchTags, 'school'),
    [swords, filters, searchTags]
  );

  const smithCounts = useMemo(
    () => getOptionCounts(swords, filters, searchTags, 'smith'),
    [swords, filters, searchTags]
  );

  const typeCounts = useMemo(
    () => getOptionCounts(swords, filters, searchTags, 'type'),
    [swords, filters, searchTags]
  );

  const provinceCounts = useMemo(
    () => getOptionCounts(swords, filters, searchTags, 'province'),
    [swords, filters, searchTags]
  );

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
            {availableOptions.schools.map(school => (
              <option key={school} value={school}>
                {school} {schoolCounts[school] ? `(${schoolCounts[school]})` : ''}
              </option>
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
            {availableOptions.smiths.map(smith => (
              <option key={smith} value={smith}>
                {smith} {smithCounts[smith] ? `(${smithCounts[smith]})` : ''}
              </option>
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
            {availableOptions.types.map(type => (
              <option key={type} value={type}>
                {type} {typeCounts[type] ? `(${typeCounts[type]})` : ''}
              </option>
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
            {availableOptions.authenticationLevels.map(auth => (
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
            {availableOptions.provinces.map(province => (
              <option key={province} value={province}>
                {province} {provinceCounts[province] ? `(${provinceCounts[province]})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
