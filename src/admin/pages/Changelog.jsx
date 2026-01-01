import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function Changelog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const limit = 100;

  // Toggle entry expansion
  const toggleEntry = (entryId) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load changelog entries
  useEffect(() => {
    setLoading(true);
    setError(null);

    const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
    fetch(`${API_BASE}/changelog?page=${page}&limit=${limit}${searchParam}`)
      .then(res => res.json())
      .then(data => {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
        setPages(data.pages || 0);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, debouncedSearch]);

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

  const getActionTypeInfo = (actionType) => {
    switch (actionType) {
      case 'media_upload':
        return { icon: '📎', label: 'Media Upload', className: 'action-media-upload' };
      case 'media_delete':
        return { icon: '🗑️', label: 'Media Deleted', className: 'action-media-delete' };
      case 'new_sword':
        return { icon: '✨', label: 'New Sword', className: 'action-new-sword' };
      case 'edit':
      default:
        return { icon: '✏️', label: 'Edit', className: 'action-edit' };
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Changelog</h2>
        <p className="subtitle">
          Complete history of all changes made to sword records
        </p>
      </div>

      {/* Stats and Search Row */}
      <div className="changelog-toolbar">
        <div className="changelog-stats">
          <div className="stat-item">
            <span className="stat-label">{debouncedSearch ? 'Results:' : 'Total Changes:'}</span>
            <span className="stat-value">{total.toLocaleString()}</span>
          </div>
          {entries.length > 0 && (
            <div className="stat-item">
              <span className="stat-label">Latest Update:</span>
              <span className="stat-value">{formatRelativeTime(entries[0].timestamp)}</span>
            </div>
          )}
        </div>
        <div className="changelog-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
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
      </div>

      {/* Loading / Error */}
      {loading && <div className="loading">Loading changelog...</div>}
      {error && <div className="error">Error: {error}</div>}

      {/* Changelog Entries */}
      {!loading && !error && (
        <>
          {entries.length === 0 ? (
            <div className="empty-state">
              {debouncedSearch
                ? `No changes found matching "${debouncedSearch}"`
                : 'No changes recorded yet. Changes will appear here when sword records are updated.'}
            </div>
          ) : (
            <div className="changelog-list">
              {entries.map((entry) => {
                const actionInfo = getActionTypeInfo(entry.actionType);
                const isExpanded = expandedEntries.has(entry.id);
                return (
                  <div key={entry.id} className={`changelog-entry ${actionInfo.className} ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    <div
                      className="changelog-header"
                      onClick={() => toggleEntry(entry.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="changelog-sword">
                        <span className="expand-arrow">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <span className="action-type-badge">
                          <span className="action-icon">{actionInfo.icon}</span>
                          <span className="action-label">{actionInfo.label}</span>
                        </span>
                        <Link
                          to={`/admin/sword/${entry.swordIndex}`}
                          className="sword-link"
                          onClick={(e) => e.stopPropagation()}
                        >
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

                    {isExpanded && (
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
                    )}
                  </div>
                );
              })}
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
