import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Use the current hostname to allow network access
const API_BASE = `http://${window.location.hostname}:3002/api`;

function Changelog() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const limit = 100;

  // Load changelog entries
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/changelog?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setEntries(data.entries || []);
        setFilteredEntries(data.entries || []);
        setTotal(data.total || 0);
        setPages(data.pages || 0);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page]);

  // Filter entries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = entries.filter(entry => {
      // Search in sword index, smith, type
      const swordInfo = `${entry.swordIndex} ${entry.swordSmith} ${entry.swordType}`.toLowerCase();
      if (swordInfo.includes(query)) return true;

      // Search in changed field names
      const fieldNames = entry.changes.map(c => c.field).join(' ').toLowerCase();
      if (fieldNames.includes(query)) return true;

      // Search in before/after values
      const values = entry.changes.map(c => `${c.before} ${c.after}`).join(' ').toLowerCase();
      if (values.includes(query)) return true;

      return false;
    });

    setFilteredEntries(filtered);
  }, [searchQuery, entries]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(timestamp);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Changelog</h2>
        <p className="subtitle">
          Complete history of all changes made to sword records
        </p>
      </div>

      {/* Search */}
      <div className="changelog-search">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by sword index, smith, type, field name, or values..."
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="btn-secondary btn-small"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="changelog-stats">
        <div className="stat-item">
          <span className="stat-label">Total Changes:</span>
          <span className="stat-value">{total.toLocaleString()}</span>
        </div>
        {entries.length > 0 && (
          <div className="stat-item">
            <span className="stat-label">Latest Update:</span>
            <span className="stat-value">{formatRelativeTime(entries[0].timestamp)}</span>
          </div>
        )}
        {searchQuery && (
          <div className="stat-item">
            <span className="stat-label">Filtered Results:</span>
            <span className="stat-value">{filteredEntries.length}</span>
          </div>
        )}
      </div>

      {/* Loading / Error */}
      {loading && <div className="loading">Loading changelog...</div>}
      {error && <div className="error">Error: {error}</div>}

      {/* Changelog Entries */}
      {!loading && !error && (
        <>
          {entries.length === 0 ? (
            <div className="empty-state">
              No changes recorded yet. Changes will appear here when sword records are updated.
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">
              No changes found matching "{searchQuery}"
            </div>
          ) : (
            <div className="changelog-list">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="changelog-entry">
                  <div className="changelog-header">
                    <div className="changelog-sword">
                      <Link to={`/admin/sword/${entry.swordIndex}`} className="sword-link">
                        {entry.swordIndex} - {entry.swordSmith} - {entry.swordType}
                      </Link>
                      <span className="change-count">
                        {entry.changes.length} field{entry.changes.length > 1 ? 's' : ''} changed
                      </span>
                    </div>
                    <div className="changelog-time">
                      <span className="relative-time">{formatRelativeTime(entry.timestamp)}</span>
                      <span className="exact-time">{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>

                  <div className="changelog-changes">
                    {entry.changes.map((change, idx) => (
                      <div key={idx} className="change-detail">
                        <div className="change-field-name">{change.field}</div>
                        <div className="change-values">
                          <div className="value-before">
                            <span className="value-label">Before:</span>
                            <span className="value-content">{change.before}</span>
                          </div>
                          <div className="change-arrow-small">→</div>
                          <div className="value-after">
                            <span className="value-label">After:</span>
                            <span className="value-content">{change.after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

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

export default Changelog;
