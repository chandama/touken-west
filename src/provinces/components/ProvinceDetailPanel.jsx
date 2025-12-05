import React from 'react';
import './ProvinceDetailPanel.css';

/**
 * Slide-in panel showing detailed province information and sword statistics
 */
function ProvinceDetailPanel({ province, stats, loading, onClose }) {
  if (!province) return null;

  const hasData = stats && stats.totalSwords > 0;

  return (
    <>
      {/* Backdrop */}
      <div className="province-panel-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className={`province-detail-panel ${province ? 'open' : ''}`}>
        {/* Close button */}
        <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Header */}
        <div className="panel-header">
          <div className="panel-province-names">
            <h2 className="panel-name-en">{province.nameEn}</h2>
            <span className="panel-name-jp">{province.nameJp}</span>
          </div>
          <div className="panel-circuit">
            <span
              className="panel-circuit-badge"
              style={{ backgroundColor: province.color }}
            >
              {province.circuit}
            </span>
            <span className="panel-circuit-jp">{province.circuitJp}</span>
          </div>
        </div>

        <div className="panel-divider"></div>

        {/* Content */}
        <div className="panel-content">
          {loading ? (
            <div className="panel-loading">
              <div className="loading-spinner"></div>
              <p>Loading sword data...</p>
            </div>
          ) : !hasData ? (
            <div className="panel-no-data">
              <svg viewBox="0 0 24 24" fill="currentColor" className="no-data-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p>No sword records found for this province</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="panel-summary">
                <div className="summary-stat">
                  <span className="stat-value">{stats.totalSwords.toLocaleString()}</span>
                  <span className="stat-label">Total Swords</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-value">{stats.totalSchools}</span>
                  <span className="stat-label">Schools</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-value">{stats.totalSmiths}</span>
                  <span className="stat-label">Smiths</span>
                </div>
              </div>

              {/* Top Schools */}
              {stats.topSchools.length > 0 && (
                <div className="panel-section">
                  <h3 className="section-title">Top Schools</h3>
                  <ul className="stats-list">
                    {stats.topSchools.map(({ name, count }) => (
                      <li key={name} className="stats-item">
                        <a
                          href={`/?province=${encodeURIComponent(stats.originalName || province.nameEn)}&school=${encodeURIComponent(name)}`}
                          className="stats-link"
                        >
                          <span className="stats-name">{name}</span>
                          <span className="stats-count">{count}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top Smiths */}
              {stats.topSmiths.length > 0 && (
                <div className="panel-section">
                  <h3 className="section-title">Top Smiths</h3>
                  <ul className="stats-list">
                    {stats.topSmiths.map(({ name, count }) => (
                      <li key={name} className="stats-item">
                        <a
                          href={`/?province=${encodeURIComponent(stats.originalName || province.nameEn)}&smith=${encodeURIComponent(name)}`}
                          className="stats-link"
                        >
                          <span className="stats-name">{name}</span>
                          <span className="stats-count">{count}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Type Breakdown */}
              {stats.typeBreakdown.length > 0 && (
                <div className="panel-section">
                  <h3 className="section-title">Sword Types</h3>
                  <div className="type-bars">
                    {stats.typeBreakdown.map(({ name, count }) => {
                      const percentage = (count / stats.totalSwords) * 100;
                      return (
                        <div key={name} className="type-bar-item">
                          <div className="type-bar-header">
                            <span className="type-name">{name}</span>
                            <span className="type-count">{count}</span>
                          </div>
                          <div className="type-bar-bg">
                            <div
                              className="type-bar-fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Authentication Breakdown */}
              {stats.authBreakdown.length > 0 && (
                <div className="panel-section">
                  <h3 className="section-title">Authentications</h3>
                  <div className="auth-badges">
                    {stats.authBreakdown.map(({ name, count }) => (
                      <span key={name} className={`auth-badge auth-${name.toLowerCase().replace(' ', '-')}`}>
                        {name}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* View All Link */}
              <div className="panel-actions">
                <a
                  href={`/?province=${encodeURIComponent(stats.originalName || province.nameEn)}`}
                  className="view-all-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  View all {stats.totalSwords} swords from {province.nameEn}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ProvinceDetailPanel;
