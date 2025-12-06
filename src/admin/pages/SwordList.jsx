import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAutocomplete from '../../hooks/useAutocomplete.js';
import AutocompleteDropdown from '../../components/AutocompleteDropdown.jsx';
import { getAvailableFilterOptions, getOptionCounts, getAuthenticationCounts, getMediaCounts } from '../../utils/filterUtils.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function SwordList() {
  const [swords, setSwords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore filters from sessionStorage on mount
  const getStoredFilters = () => {
    try {
      const stored = sessionStorage.getItem('adminFilters');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const storedFilters = getStoredFilters();

  // Pagination
  const [page, setPage] = useState(storedFilters?.page || 1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const limit = 25;

  // Filters with restored state
  const [searchInput, setSearchInput] = useState(storedFilters?.searchInput || '');
  const [searchTags, setSearchTags] = useState(storedFilters?.searchTags || []);
  const [school, setSchool] = useState(storedFilters?.school || '');
  const [smith, setSmith] = useState(storedFilters?.smith || '');
  const [type, setType] = useState(storedFilters?.type || '');
  const [authentication, setAuthentication] = useState(storedFilters?.authentication || '');
  const [province, setProvince] = useState(storedFilters?.province || '');
  const [hasMedia, setHasMedia] = useState(storedFilters?.hasMedia || '');

  // All swords for autocomplete and filter options (fetched once)
  const [allSwords, setAllSwords] = useState([]);

  // Current filters object for filterUtils
  const currentFilters = useMemo(() => ({
    school,
    smith,
    type,
    authentication,
    province,
    hasMedia
  }), [school, smith, type, authentication, province, hasMedia]);

  // Get available filter options based on current filters (cascading)
  const availableOptions = useMemo(
    () => getAvailableFilterOptions(allSwords, currentFilters, searchTags),
    [allSwords, currentFilters, searchTags]
  );

  // Get counts for each filter option
  const schoolCounts = useMemo(
    () => getOptionCounts(allSwords, currentFilters, searchTags, 'school'),
    [allSwords, currentFilters, searchTags]
  );

  const smithCounts = useMemo(
    () => getOptionCounts(allSwords, currentFilters, searchTags, 'smith'),
    [allSwords, currentFilters, searchTags]
  );

  const typeCounts = useMemo(
    () => getOptionCounts(allSwords, currentFilters, searchTags, 'type'),
    [allSwords, currentFilters, searchTags]
  );

  const provinceCounts = useMemo(
    () => getOptionCounts(allSwords, currentFilters, searchTags, 'province'),
    [allSwords, currentFilters, searchTags]
  );

  const authenticationCounts = useMemo(
    () => getAuthenticationCounts(allSwords, currentFilters, searchTags),
    [allSwords, currentFilters, searchTags]
  );

  const mediaCounts = useMemo(
    () => getMediaCounts(allSwords, currentFilters, searchTags),
    [allSwords, currentFilters, searchTags]
  );

  // Search input ref for autocomplete
  const searchInputRef = useRef(null);

  // Autocomplete hook
  const handleAutocompleteSelect = (suggestion) => {
    setSearchTags([...searchTags, suggestion]);
    setSearchInput('');
    setPage(1);
    searchInputRef.current?.focus();
  };

  const {
    suggestions,
    isOpen: isAutocompleteOpen,
    selectedIndex,
    dropdownRef,
    handleKeyDown: handleAutocompleteKeyDown,
    selectSuggestionByIndex,
    close: closeAutocomplete
  } = useAutocomplete(searchInput, allSwords, {
    debounceDelay: 150,
    minChars: 2,
    maxSuggestions: 8,
    onSelect: handleAutocompleteSelect
  });

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    const filters = {
      searchInput,
      searchTags,
      school,
      smith,
      type,
      authentication,
      province,
      hasMedia,
      page
    };
    sessionStorage.setItem('adminFilters', JSON.stringify(filters));
  }, [searchInput, searchTags, school, smith, type, authentication, province, hasMedia, page]);

  // Load all swords for autocomplete and filter options (once on mount)
  useEffect(() => {
    fetch(`${API_BASE}/swords?limit=50000`)
      .then(res => res.json())
      .then(data => {
        setAllSwords(data.swords || []);
      })
      .catch(err => console.error('Error loading swords for autocomplete:', err));
  }, []);

  // Load swords with debounced live search
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Debounce live search input (wait 300ms after user stops typing)
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams({
        page,
        limit,
        school,
        smith,
        type,
        authentication,
        province,
        hasMedia
      });

      // Add search tags as separate parameters
      searchTags.forEach(tag => {
        params.append('search', tag);
      });

      // Add live search input if present
      if (searchInput.trim()) {
        params.append('search', searchInput.trim());
      }

      fetch(`${API_BASE}/swords?${params}`)
        .then(res => res.json())
        .then(data => {
          setSwords(data.swords || []);
          setTotal(data.total || 0);
          setPages(data.pages || 0);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, searchTags, searchInput, school, smith, type, authentication, province, hasMedia]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      setSearchTags([...searchTags, searchInput.trim()]);
      setSearchInput('');
      setPage(1);
      closeAutocomplete();
    }
  };

  const removeSearchTag = (indexToRemove) => {
    setSearchTags(searchTags.filter((_, index) => index !== indexToRemove));
    setPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  // Clear only dropdown filters (not search tags)
  const clearDropdownFilters = () => {
    setSchool('');
    setSmith('');
    setType('');
    setAuthentication('');
    setProvince('');
    setHasMedia('');
    setPage(1);
  };

  // Clear only search (not dropdown filters)
  const clearSearch = () => {
    setSearchTags([]);
    setSearchInput('');
    closeAutocomplete();
    setPage(1);
  };

  // Handle keyboard events for search input
  const handleSearchKeyDown = (e) => {
    // Let autocomplete handle its keyboard events first
    if (handleAutocompleteKeyDown(e)) {
      return;
    }
    // If Enter and no autocomplete selection, add the search tag
    if (e.key === 'Enter' && selectedIndex === -1) {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const hasMediaCount = (sword) => {
    try {
      const media = sword.MediaAttachments;
      if (!media || media === 'NA' || media === '[]') return 0;
      const parsed = JSON.parse(media);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Sword Management</h2>
          <p className="subtitle">Browse and manage sword data and media attachments</p>
        </div>
        <Link to="/admin/create" className="btn-primary">
          + Add Record
        </Link>
      </div>

      {/* Full-width Search Bar (matching main site SearchBar exactly) */}
      <div className="search-bar">
        <div className="search-input-wrapper" ref={dropdownRef}>
          <div className="search-input-container">
            {/* Display search tags */}
            {searchTags.map((tag, index) => (
              <span key={index} className="search-tag">
                {tag}
                <button
                  type="button"
                  onClick={() => removeSearchTag(index)}
                  className="tag-remove-button"
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}

            {/* Input field */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setTimeout(closeAutocomplete, 150)}
              placeholder={searchTags.length === 0 ? 'Search swords by name, smith, school... (Use "quotes" for exact match)' : 'Add another search term...'}
              className="search-input"
              autoComplete="off"
              role="combobox"
              aria-expanded={isAutocompleteOpen}
              aria-autocomplete="list"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isAutocompleteOpen && suggestions.length > 0 && (
            <AutocompleteDropdown
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              onSelect={selectSuggestionByIndex}
              dropdownRef={dropdownRef}
              inputValue={searchInput}
            />
          )}
        </div>

        <div className="search-actions">
          {searchInput && !isAutocompleteOpen && (
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="add-tag-button"
            >
              Add
            </button>
          )}
          {searchTags.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="clear-all-button"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters - matching main site FilterPanel structure */}
      <div className="filter-panel expanded">
        <div className="filter-header">
          <div className="filter-title-row">
            <h3>Filters</h3>
          </div>
          {(school || smith || type || authentication || province || hasMedia) && (
            <button onClick={clearDropdownFilters} className="clear-filters-button">
              Clear All
            </button>
          )}
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>School</label>
            <select value={school} onChange={handleFilterChange(setSchool)}>
              <option value="">All Schools</option>
              {availableOptions.schools
                .filter(s => schoolCounts[s] > 0)
                .map(s => (
                  <option key={s} value={s}>{s} ({schoolCounts[s]})</option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Smith</label>
            <select value={smith} onChange={handleFilterChange(setSmith)}>
              <option value="">All Smiths</option>
              {availableOptions.smiths
                .filter(s => smithCounts[s] > 0)
                .map(s => (
                  <option key={s} value={s}>{s} ({smithCounts[s]})</option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select value={type} onChange={handleFilterChange(setType)}>
              <option value="">All Types</option>
              {availableOptions.types
                .filter(t => typeCounts[t] > 0)
                .map(t => (
                  <option key={t} value={t}>{t} ({typeCounts[t]})</option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Authentication</label>
            <select value={authentication} onChange={handleFilterChange(setAuthentication)}>
              <option value="">All Levels</option>
              {availableOptions.authenticationLevels
                .filter(a => authenticationCounts[a] > 0)
                .map(a => (
                  <option key={a} value={a}>{a} ({authenticationCounts[a]})</option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Province</label>
            <select value={province} onChange={handleFilterChange(setProvince)}>
              <option value="">All Provinces</option>
              {availableOptions.provinces
                .filter(p => provinceCounts[p] > 0)
                .map(p => (
                  <option key={p} value={p}>{p} ({provinceCounts[p]})</option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Media Status</label>
            <select value={hasMedia} onChange={handleFilterChange(setHasMedia)}>
              <option value="">All</option>
              {mediaCounts.hasMedia > 0 && (
                <option value="true">Has Media ({mediaCounts.hasMedia})</option>
              )}
              {mediaCounts.noMedia > 0 && (
                <option value="false">No Media ({mediaCounts.noMedia})</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-info">
        Showing {swords.length} of {total.toLocaleString()} swords
        {(searchInput.trim() || searchTags.length > 0 || school || smith || type || authentication || province || hasMedia) && ' (filtered)'}
      </div>

      {/* Loading / Error */}
      {loading && <div className="loading">Loading swords...</div>}
      {error && <div className="error">Error: {error}</div>}

      {/* Sword List */}
      {!loading && !error && (
        <>
          <div className="sword-list">
            {swords.map(sword => {
              const mediaCount = hasMediaCount(sword);

              return (
                <div key={sword.Index} className="sword-card">
                  <div className="sword-card-header">
                    <span className="sword-index">#{sword.Index}</span>
                    {mediaCount > 0 && (
                      <span className="media-badge">
                        {mediaCount} file{mediaCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="sword-card-body">
                    <h3 className="sword-smith">{sword.Smith || 'Unknown Smith'}</h3>
                    <div className="sword-meta">
                      <span className="meta-item">{sword.Type || 'Unknown'}</span>
                      <span className="meta-separator">•</span>
                      <span className="meta-item">{sword.School || 'Unknown School'}</span>
                      {sword.Period && (
                        <>
                          <span className="meta-separator">•</span>
                          <span className="meta-item">{sword.Period}</span>
                        </>
                      )}
                    </div>

                    {/* Measurements */}
                    {(sword.Nagasa || sword.Sori) && (
                      <div className="sword-measurements">
                        {sword.Nagasa && sword.Nagasa !== 'NA' && (
                          <span className="measurement">
                            <span className="measurement-label">Length:</span> {sword.Nagasa} cm
                          </span>
                        )}
                        {sword.Sori && sword.Sori !== 'NA' && (
                          <span className="measurement">
                            <span className="measurement-label">Sori:</span> {sword.Sori} cm
                          </span>
                        )}
                      </div>
                    )}

                    {sword.Authentication && sword.Authentication !== 'NA' && (
                      <div className="sword-auth">{sword.Authentication}</div>
                    )}
                  </div>

                  <div className="sword-card-footer">
                    <Link to={`/admin/sword/${sword.Index}`} className="btn-primary">
                      View / Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                ← Previous
              </button>

              <span className="page-info">
                Page {page} of {pages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SwordList;
