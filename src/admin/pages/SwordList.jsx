import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Use the current hostname to allow network access
const API_BASE = `http://${window.location.hostname}:3002/api`;

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
  const [type, setType] = useState(storedFilters?.type || '');
  const [hasMedia, setHasMedia] = useState(storedFilters?.hasMedia || '');

  // Filter options
  const [schools, setSchools] = useState([]);
  const [types, setTypes] = useState([]);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    const filters = {
      searchInput,
      searchTags,
      school,
      type,
      hasMedia,
      page
    };
    sessionStorage.setItem('adminFilters', JSON.stringify(filters));
  }, [searchInput, searchTags, school, type, hasMedia, page]);

  // Load filter options
  useEffect(() => {
    fetch(`${API_BASE}/filters`)
      .then(res => res.json())
      .then(data => {
        setSchools(data.schools || []);
        setTypes(data.types || []);
      })
      .catch(err => console.error('Error loading filters:', err));
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
        type,
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
  }, [page, searchTags, searchInput, school, type, hasMedia]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchTags([...searchTags, searchInput.trim()]);
      setSearchInput('');
      setPage(1);
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

  const clearFilters = () => {
    setSearchInput('');
    setSearchTags([]);
    setSchool('');
    setType('');
    setHasMedia('');
    setPage(1);
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
      <div className="page-header">
        <h2>Sword Management</h2>
        <p className="subtitle">Browse and manage sword data and media attachments</p>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <div className="filter-group">
          <label>Search (live updates as you type, or click "Add Filter" for multi-tag search):</label>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Type to search live, or add as filter (supports "quoted phrases")...'
              className="search-input"
            />
            <button type="submit" className="btn-primary">Add as Filter Tag</button>
          </form>

          {searchTags.length > 0 && (
            <div className="search-tags">
              {searchTags.map((tag, index) => (
                <span key={index} className="search-tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeSearchTag(index)}
                    className="tag-remove"
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>School:</label>
            <select value={school} onChange={handleFilterChange(setSchool)}>
              <option value="">All Schools</option>
              {schools.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select value={type} onChange={handleFilterChange(setType)}>
              <option value="">All Types</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Media Status:</label>
            <select value={hasMedia} onChange={handleFilterChange(setHasMedia)}>
              <option value="">All</option>
              <option value="true">Has Media</option>
              <option value="false">No Media</option>
            </select>
          </div>

          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="results-info">
        Showing {swords.length} of {total.toLocaleString()} swords
        {(searchInput.trim() || searchTags.length > 0 || school || type || hasMedia) && ' (filtered)'}
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
