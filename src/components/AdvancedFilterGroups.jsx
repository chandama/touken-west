import React, { useMemo } from 'react';
import { getAvailableFilterOptions } from '../utils/filterUtils';

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
      search: '',
      school: '',
      smith: '',
      type: '',
      authentication: '',
      province: ''
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
          search: '',
          school: '',
          smith: '',
          type: '',
          authentication: '',
          province: ''
        };
      }
      return group;
    });
    onFilterGroupsChange(updated);
  };

  const activeGroupCount = filterGroups.filter(group =>
    Object.values(group).some(v => v !== '')
  ).length;

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
  // Get available options for this group (based on base filters and search)
  const availableOptions = useMemo(
    () => getAvailableFilterOptions(swords, { ...baseFilters, ...group }, searchTags),
    [swords, baseFilters, group, searchTags]
  );

  const hasActiveFilters = Object.values(group).some(f => f !== '');

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
          <input
            id={`group-${index}-search`}
            type="text"
            value={group.search}
            onChange={(e) => onUpdate('search', e.target.value)}
            placeholder="Search within this group..."
            className="group-search-input"
          />
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
              {availableOptions.schools.map(school => (
                <option key={school} value={school}>{school}</option>
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
              {availableOptions.smiths.map(smith => (
                <option key={smith} value={smith}>{smith}</option>
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
              {availableOptions.types.map(type => (
                <option key={type} value={type}>{type}</option>
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
              {availableOptions.authenticationLevels.map(auth => (
                <option key={auth} value={auth}>{auth}</option>
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
              {availableOptions.provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="group-filter-summary">
            <strong>Active filters:</strong>{' '}
            {Object.entries(group)
              .filter(([_, value]) => value !== '')
              .map(([key, value]) => {
                if (key === 'search') {
                  return `search: "${value}"`;
                }
                return `${key}: ${value}`;
              })
              .join(' AND ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilterGroups;
