import React, { useMemo, useState, useRef, useEffect } from 'react';
import { getAvailableFilterOptions, getOptionCounts, getPeriodCounts, getAuthenticationCounts } from '../utils/filterUtils.js';
import { PERIOD_DEFINITIONS } from '../utils/periodUtils.js';

/**
 * AdvancedFilterGroups component for creating complex filter combinations
 * Each group uses AND logic internally, groups are combined with OR logic
 * Example: (Masamune AND Juyo) OR (Sadamune AND Tokubetsu Juyo)
 */
const AdvancedFilterGroups = ({ filterGroups, onFilterGroupsChange, swords, searchTags = [], baseFilters }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  const addFilterGroup = () => {
    const newGroup = {
      searchTags: [],
      school: '',
      smith: '',
      type: '',
      authentication: '',
      province: '',
      nagasaMin: '',
      nagasaMax: '',
      periods: []
    };
    onFilterGroupsChange([...filterGroups, newGroup]);
  };

  const removeFilterGroup = (index) => {
    const updated = filterGroups.filter((_, i) => i !== index);
    onFilterGroupsChange(updated);
  };

  const updateFilterGroup = (index, field, value) => {
    const updated = filterGroups.map((group, i) => {
      if (i === index) {
        return { ...group, [field]: value };
      }
      return group;
    });
    onFilterGroupsChange(updated);
  };

  const clearFilterGroup = (index) => {
    const updated = filterGroups.map((group, i) => {
      if (i === index) {
        return {
          searchTags: [],
          school: '',
          smith: '',
          type: '',
          authentication: '',
          province: '',
          nagasaMin: '',
          nagasaMax: '',
          periods: []
        };
      }
      return group;
    });
    onFilterGroupsChange(updated);
  };

  const activeGroupCount = filterGroups.filter(group => {
    // Check if any filter is active (non-empty string) or if searchTags has items
    const hasSearchTags = group.searchTags && group.searchTags.length > 0;
    const hasOtherFilters = Object.entries(group).some(([key, value]) =>
      key !== 'searchTags' && value !== ''
    );
    return hasSearchTags || hasOtherFilters;
  }).length;

  return (
    <div className={`advanced-filter-groups ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="advanced-filter-header" onClick={toggleExpanded}>
        <div className="advanced-filter-title-row">
          <button
            className="toggle-arrow-button"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse advanced filters' : 'Expand advanced filters'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <h3>
            Advanced Filters
            {!isExpanded && activeGroupCount > 0 && (
              <span className="active-count-badge">{activeGroupCount}</span>
            )}
          </h3>
        </div>
      </div>

      {isExpanded && (
        <div className="advanced-filter-content">
          <p className="filter-logic-explanation">
            Create filter groups combined with <strong>OR</strong> logic.
            Within each group, all filters use <strong>AND</strong> logic.
          </p>

          {filterGroups.length === 0 && (
            <div className="no-groups-message">
              <p>No advanced filter groups yet. Click "Add Filter Group" to create complex filter combinations.</p>
            </div>
          )}

          {filterGroups.map((group, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <div className="filter-group-separator">
                  <span className="or-badge">OR</span>
                </div>
              )}

              <FilterGroup
                group={group}
                index={index}
                swords={swords}
                searchTags={searchTags}
                baseFilters={baseFilters}
                onUpdate={(field, value) => updateFilterGroup(index, field, value)}
                onClear={() => clearFilterGroup(index)}
                onRemove={() => removeFilterGroup(index)}
              />
            </React.Fragment>
          ))}

          <button onClick={addFilterGroup} className="add-filter-group-button">
            + Add Filter Group
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Individual filter group component
 */
const FilterGroup = ({ group, index, swords, searchTags, baseFilters, onUpdate, onClear, onRemove }) => {
  const [tagInputValue, setTagInputValue] = useState('');
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

  // Get available options for this group (based on base filters and search)
  const availableOptions = useMemo(
    () => getAvailableFilterOptions(swords, { ...baseFilters, ...group }, searchTags),
    [swords, baseFilters, group, searchTags]
  );

  // Get period counts for this group's filter context
  const periodCounts = useMemo(
    () => getPeriodCounts(swords, { ...baseFilters, ...group }, searchTags),
    [swords, baseFilters, group, searchTags]
  );

  // Get counts for each filter option
  const combinedFilters = { ...baseFilters, ...group };

  const schoolCounts = useMemo(
    () => getOptionCounts(swords, combinedFilters, searchTags, 'school'),
    [swords, combinedFilters, searchTags]
  );

  const smithCounts = useMemo(
    () => getOptionCounts(swords, combinedFilters, searchTags, 'smith'),
    [swords, combinedFilters, searchTags]
  );

  const typeCounts = useMemo(
    () => getOptionCounts(swords, combinedFilters, searchTags, 'type'),
    [swords, combinedFilters, searchTags]
  );

  const provinceCounts = useMemo(
    () => getOptionCounts(swords, combinedFilters, searchTags, 'province'),
    [swords, combinedFilters, searchTags]
  );

  const authenticationCounts = useMemo(
    () => getAuthenticationCounts(swords, combinedFilters, searchTags),
    [swords, combinedFilters, searchTags]
  );

  const hasActiveFilters = group.searchTags?.length > 0 ||
    (group.periods && group.periods.length > 0) ||
    Object.entries(group).some(([key, value]) => key !== 'searchTags' && key !== 'periods' && value !== '');

  const handlePeriodToggle = (periodId) => {
    const currentPeriods = group.periods || [];
    const newPeriods = currentPeriods.includes(periodId)
      ? currentPeriods.filter(p => p !== periodId)
      : [...currentPeriods, periodId];
    onUpdate('periods', newPeriods);
  };

  const handleAddTag = () => {
    const trimmed = tagInputValue.trim();
    if (trimmed && !group.searchTags.includes(trimmed)) {
      onUpdate('searchTags', [...group.searchTags, trimmed]);
      setTagInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onUpdate('searchTags', group.searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="filter-group-card">
      <div className="filter-group-header">
        <h4>Filter Group {index + 1}</h4>
        <div className="filter-group-actions">
          {hasActiveFilters && (
            <button onClick={onClear} className="clear-group-button" title="Clear this group">
              Clear
            </button>
          )}
          <button onClick={onRemove} className="remove-group-button" title="Remove this group">
            ×
          </button>
        </div>
      </div>

      <div className="filter-group-content">
        <div className="filter-group-search">
          <label htmlFor={`group-${index}-search`}>Keyword Search (this group only)</label>
          <div className="group-search-input-container">
            {/* Display search tags */}
            {group.searchTags.map((tag, tagIndex) => (
              <span key={tagIndex} className="search-tag group-search-tag">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove-button"
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}

            {/* Input field */}
            <input
              id={`group-${index}-search`}
              type="text"
              value={tagInputValue}
              onChange={(e) => setTagInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={group.searchTags.length === 0 ? "Add search terms..." : "Add another..."}
              className="group-search-input"
            />
          </div>
          {tagInputValue && (
            <button
              onClick={handleAddTag}
              className="add-tag-button group-add-tag"
              aria-label="Add search tag to group"
            >
              Add
            </button>
          )}
        </div>

        <div className="filters-grid">
          <div className="filter-group-item">
            <label htmlFor={`group-${index}-school`}>School</label>
            <select
              id={`group-${index}-school`}
              value={group.school}
              onChange={(e) => onUpdate('school', e.target.value)}
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

          <div className="filter-group-item">
            <label htmlFor={`group-${index}-smith`}>Smith</label>
            <select
              id={`group-${index}-smith`}
              value={group.smith}
              onChange={(e) => onUpdate('smith', e.target.value)}
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

          <div className="filter-group-item">
            <label htmlFor={`group-${index}-type`}>Type</label>
            <select
              id={`group-${index}-type`}
              value={group.type}
              onChange={(e) => onUpdate('type', e.target.value)}
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

          <div className="filter-group-item">
            <label htmlFor={`group-${index}-authentication`}>Authentication Level</label>
            <select
              id={`group-${index}-authentication`}
              value={group.authentication}
              onChange={(e) => onUpdate('authentication', e.target.value)}
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

          <div className="filter-group-item">
            <label htmlFor={`group-${index}-province`}>Province</label>
            <select
              id={`group-${index}-province`}
              value={group.province}
              onChange={(e) => onUpdate('province', e.target.value)}
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

          <div className="filter-group-item">
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
                id={`group-${index}-nagasa-min`}
                placeholder="Min"
                value={group.nagasaMin || ''}
                onChange={(e) => onUpdate('nagasaMin', e.target.value)}
                className="range-input"
                step="0.1"
                min="0"
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                id={`group-${index}-nagasa-max`}
                placeholder="Max"
                value={group.nagasaMax || ''}
                onChange={(e) => onUpdate('nagasaMax', e.target.value)}
                className="range-input"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <div className="filter-group-item" ref={periodDropdownRef}>
            <label>
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
                  {(group.periods || []).length === 0
                    ? 'All Periods'
                    : `${(group.periods || []).length} selected`}
                </span>
                <span className="multi-select-arrow">{isPeriodDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {isPeriodDropdownOpen && (
                <div className="multi-select-options" role="listbox" aria-multiselectable="true">
                  {PERIOD_DEFINITIONS.map(period => (
                    <label key={period.id} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={(group.periods || []).includes(period.id)}
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

        {hasActiveFilters && (
          <div className="group-filter-summary">
            <strong>Active filters:</strong>{' '}
            {(() => {
              const filters = [];

              // Add search tags
              if (group.searchTags && group.searchTags.length > 0) {
                const tagList = group.searchTags.map(tag => `"${tag}"`).join(', ');
                filters.push(`search: ${tagList}`);
              }

              // Add other filters
              Object.entries(group)
                .filter(([key, value]) => key !== 'searchTags' && value !== '')
                .forEach(([key, value]) => {
                  filters.push(`${key}: ${value}`);
                });

              return filters.join(' AND ');
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilterGroups;
