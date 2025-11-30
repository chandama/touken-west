import React, { useMemo, useState, useRef, useEffect } from 'react';
import { getAvailableFilterOptions, getOptionCounts, getPeriodCounts, getAuthenticationCounts, getMediaCounts } from '../utils/filterUtils.js';
import { PERIOD_DEFINITIONS } from '../utils/periodUtils.js';

/**
 * FilterPanel component with dynamic cascading filters
 * Filter options update based on current selections
 * Collapsible on mobile devices - defaults to collapsed on screens <= 768px
 */
const FilterPanel = ({ filters, onFilterChange, swords, searchTags = [], user = null, hideMediaFilter = false }) => {
  // Check if mobile on initial render - default to collapsed on mobile
  const isMobileInitial = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [isExpanded, setIsExpanded] = useState(!isMobileInitial);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const periodDropdownRef = useRef(null);

  // Close period dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setIsPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

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

  // Get counts for each period option based on other active filters
  const periodCounts = useMemo(
    () => getPeriodCounts(swords, filters, searchTags),
    [swords, filters, searchTags]
  );

  // Get counts for authentication levels
  const authenticationCounts = useMemo(
    () => getAuthenticationCounts(swords, filters, searchTags),
    [swords, filters, searchTags]
  );

  // Get counts for media status
  const mediaCounts = useMemo(
    () => getMediaCounts(swords, filters, searchTags),
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
      province: '',
      hasMedia: '',
      nagasaMin: '',
      nagasaMax: '',
      periods: []
    });
  };

  const handlePeriodToggle = (periodId) => {
    const currentPeriods = filters.periods || [];
    const newPeriods = currentPeriods.includes(periodId)
      ? currentPeriods.filter(p => p !== periodId)
      : [...currentPeriods, periodId];
    handleFilterChange('periods', newPeriods);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'periods') return value && value.length > 0;
    return value !== '';
  });
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'periods') return value && value.length > 0;
    return value !== '';
  }).length;

  return (
    <div className={`filter-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filter-header" onClick={toggleExpanded}>
        <div className="filter-title-row">
          <button
            className="toggle-arrow-button"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <h3>
            Filters
            {!isExpanded && activeFilterCount > 0 && (
              <span className="active-count-badge">{activeFilterCount}</span>
            )}
          </h3>
        </div>
        {isExpanded && hasActiveFilters && (
          <button onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="clear-filters-button">
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="school-filter">School</label>
          <select
            id="school-filter"
            value={filters.school}
            onChange={(e) => handleFilterChange('school', e.target.value)}
          >
            <option value="">All Schools</option>
            {availableOptions.schools
              .filter(school => schoolCounts[school] > 0)
              .map(school => (
                <option key={school} value={school}>
                  {school} ({schoolCounts[school]})
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
            {availableOptions.smiths
              .filter(smith => smithCounts[smith] > 0)
              .map(smith => (
                <option key={smith} value={smith}>
                  {smith} ({smithCounts[smith]})
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
            {availableOptions.types
              .filter(type => typeCounts[type] > 0)
              .map(type => (
                <option key={type} value={type}>
                  {type} ({typeCounts[type]})
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
            {availableOptions.authenticationLevels
              .filter(auth => authenticationCounts[auth] > 0)
              .map(auth => (
                <option key={auth} value={auth}>
                  {auth} ({authenticationCounts[auth]})
                </option>
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
            {availableOptions.provinces
              .filter(province => provinceCounts[province] > 0)
              .map(province => (
                <option key={province} value={province}>
                  {province} ({provinceCounts[province]})
                </option>
              ))}
          </select>
        </div>

        {/* Media Status filter - only show for logged in users, hide in library view */}
        {user && !hideMediaFilter && (
          <div className="filter-group">
            <label htmlFor="media-filter">Media Status</label>
            <select
              id="media-filter"
              value={filters.hasMedia || ''}
              onChange={(e) => handleFilterChange('hasMedia', e.target.value)}
            >
              <option value="">All Swords</option>
              {mediaCounts.hasMedia > 0 && (
                <option value="true">Has Media ({mediaCounts.hasMedia})</option>
              )}
              {mediaCounts.noMedia > 0 && (
                <option value="false">No Media ({mediaCounts.noMedia})</option>
              )}
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>
            Nagasa (cm)
            <span className="info-tooltip">
              <span className="info-icon">?</span>
              <span className="info-tooltip-content">
                Filter by blade length in centimeters.<br />
                Set Min only: blades longer than value<br />
                Set Max only: blades shorter than value<br />
                Set both: blades within range
              </span>
            </span>
          </label>
          <div className="range-inputs">
            <input
              type="number"
              id="nagasa-min"
              placeholder="Min"
              value={filters.nagasaMin || ''}
              onChange={(e) => handleFilterChange('nagasaMin', e.target.value)}
              className="range-input"
              step="0.1"
              min="0"
            />
            <span className="range-separator">-</span>
            <input
              type="number"
              id="nagasa-max"
              placeholder="Max"
              value={filters.nagasaMax || ''}
              onChange={(e) => handleFilterChange('nagasaMax', e.target.value)}
              className="range-input"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        <div className="filter-group" ref={periodDropdownRef}>
          <label htmlFor="period-filter">
            Period
            <span className="info-tooltip">
              <span className="info-icon">?</span>
              <span className="info-tooltip-content">
                <strong>Period Date Ranges:</strong><br />
                Kofun: before 710<br />
                Nara: 710-793<br />
                Heian: 794-1184<br />
                Kamakura: 1185-1332<br />
                Nanbokucho: 1333-1391<br />
                Muromachi: 1392-1596<br />
                Momoyama: 1573-1596<br />
                Shinto: 1597-1780<br />
                Shinshinto: 1781-1876<br />
                Shinsaku: 1877-present
              </span>
            </span>
          </label>
          <div className="multi-select-dropdown">
            <button
              type="button"
              className="multi-select-trigger"
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              aria-expanded={isPeriodDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="multi-select-value">
                {(filters.periods || []).length === 0
                  ? 'All Periods'
                  : `${(filters.periods || []).length} selected`}
              </span>
              <span className="multi-select-arrow">{isPeriodDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {isPeriodDropdownOpen && (
              <div className="multi-select-options" role="listbox" aria-multiselectable="true">
                {PERIOD_DEFINITIONS.map(period => (
                  <label key={period.id} className="multi-select-option">
                    <input
                      type="checkbox"
                      checked={(filters.periods || []).includes(period.id)}
                      onChange={() => handlePeriodToggle(period.id)}
                    />
                    <span className="multi-select-option-text">
                      {period.name}
                      <span className="multi-select-count">({periodCounts[period.id] || 0})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default FilterPanel;
