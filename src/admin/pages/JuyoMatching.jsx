import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../config/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import '../styles/juyo-matching.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function JuyoMatching() {
  const { user } = useAuth();

  // Session state
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Blade and index data
  const [blades, setBlades] = useState([]);
  const [indexEntries, setIndexEntries] = useState([]);
  const [currentBladeIdx, setCurrentBladeIdx] = useState(0);

  // Matching state
  const [selectedIndexIdx, setSelectedIndexIdx] = useState(null);
  const [nagasa, setNagasa] = useState('');
  const [sori, setSori] = useState('');
  const [filterText, setFilterText] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [renaming, setRenaming] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/juyo/sessions`);
      setSessions(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  // Load blades and index when session is selected
  useEffect(() => {
    if (selectedSession) {
      loadSessionData(selectedSession);
    }
  }, [selectedSession]);

  const loadSessionData = async (session) => {
    try {
      setLoading(true);
      setError(null);

      const [bladesRes, indexRes] = await Promise.all([
        axios.get(`${API_BASE}/juyo/session/${session}/blades`),
        axios.get(`${API_BASE}/juyo/session/${session}/index`)
      ]);

      setBlades(bladesRes.data);
      setIndexEntries(indexRes.data);
      setCurrentBladeIdx(0);
      setSelectedIndexIdx(null);
      setNagasa('');
      setSori('');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  // Update form when blade changes
  useEffect(() => {
    if (blades.length > 0 && currentBladeIdx < blades.length) {
      const blade = blades[currentBladeIdx];
      setNagasa(blade.nagasa || '');
      setSori(blade.sori || '');

      // Find matched index if exists
      if (blade.matchedIndex) {
        const idx = indexEntries.findIndex(e => e.index === blade.matchedIndex);
        setSelectedIndexIdx(idx >= 0 ? idx : null);
      } else {
        setSelectedIndexIdx(null);
      }
    }
  }, [currentBladeIdx, blades, indexEntries]);

  const currentBlade = blades[currentBladeIdx];
  const selectedEntry = selectedIndexIdx !== null ? indexEntries[selectedIndexIdx] : null;

  // Filter index entries
  const filteredEntries = indexEntries.filter(entry => {
    if (!filterText) return true;
    const search = filterText.toLowerCase();
    return (
      entry.attribution?.toLowerCase().includes(search) ||
      entry.mei?.toLowerCase().includes(search) ||
      entry.item?.toLowerCase().includes(search) ||
      String(entry.index).includes(search)
    );
  });

  // Navigation
  const goToNext = () => {
    if (currentBladeIdx < blades.length - 1) {
      setCurrentBladeIdx(currentBladeIdx + 1);
    }
  };

  const goToPrev = () => {
    if (currentBladeIdx > 0) {
      setCurrentBladeIdx(currentBladeIdx - 1);
    }
  };

  // Auto-match by blade number
  const autoMatch = () => {
    if (!currentBlade) return;
    const bladeNum = currentBlade.number;
    const matchIdx = indexEntries.findIndex(e => e.index === bladeNum);
    if (matchIdx >= 0) {
      setSelectedIndexIdx(matchIdx);
    }
  };

  // Save match
  const saveMatch = async () => {
    if (!currentBlade || !selectedSession) return;

    setSaving(true);
    try {
      await axios.post(`${API_BASE}/juyo/match`, {
        session: selectedSession,
        bladeNumber: currentBlade.number,
        originalName: currentBlade.name,
        matchedIndex: selectedEntry?.index || null,
        matchedItem: selectedEntry?.item || null,
        matchedAttribution: selectedEntry?.attribution || null,
        matchedMei: selectedEntry?.mei || null,
        nagasa: nagasa ? parseFloat(nagasa) : null,
        sori: sori ? parseFloat(sori) : null
      });

      // Update local state
      const updatedBlades = [...blades];
      updatedBlades[currentBladeIdx] = {
        ...currentBlade,
        matchedIndex: selectedEntry?.index || null,
        matchedItem: selectedEntry?.item || null,
        matchedAttribution: selectedEntry?.attribution || null,
        nagasa: nagasa ? parseFloat(nagasa) : null,
        sori: sori ? parseFloat(sori) : null,
        status: selectedEntry ? 'matched' : 'pending'
      };
      setBlades(updatedBlades);

      // Auto-advance to next
      goToNext();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  // Rename files
  const renameFiles = async () => {
    if (!selectedSession) return;
    if (!window.confirm(`Rename all matched files in session ${selectedSession}? This cannot be undone.`)) {
      return;
    }

    setRenaming(true);
    try {
      const response = await axios.post(`${API_BASE}/juyo/session/${selectedSession}/rename`);
      alert(`Renamed ${response.data.renamed} files. Errors: ${response.data.errors}`);
      // Reload session data
      loadSessionData(selectedSession);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setRenaming(false);
  };

  // Rename current blade only
  const renameCurrentBlade = async () => {
    if (!selectedSession || !currentBlade) return;
    if (currentBlade.status !== 'matched') {
      alert('This blade must be matched first before renaming.');
      return;
    }
    if (!window.confirm(`Rename this blade (${currentBlade.name})? This cannot be undone.`)) {
      return;
    }

    setRenaming(true);
    try {
      const response = await axios.post(`${API_BASE}/juyo/session/${selectedSession}/rename/${currentBlade.number}`);
      alert(`Renamed: ${response.data.originalName} → ${response.data.newFilename}`);
      // Reload session data
      loadSessionData(selectedSession);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setRenaming(false);
  };

  // Mark as not found
  const markNotFound = async () => {
    if (!selectedSession || !currentBlade) return;
    if (!window.confirm(`Mark blade ${currentBlade.number} as "Not Found"?`)) {
      return;
    }

    try {
      await axios.post(`${API_BASE}/juyo/session/${selectedSession}/not-found/${currentBlade.number}`, {
        originalName: currentBlade.name
      });
      // Reload session data
      loadSessionData(selectedSession);
      // Move to next blade
      goToNext();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (!selectedSession) return;
    window.open(`${API_BASE}/juyo/session/${selectedSession}/export`, '_blank');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveMatch();
      } else if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        autoMatch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBladeIdx, blades, selectedEntry, nagasa, sori]);

  // Stats
  const matchedCount = blades.filter(b => b.status === 'matched' || b.status === 'renamed').length;
  const renamedCount = blades.filter(b => b.status === 'renamed').length;

  if (loading && !selectedSession) {
    return <div className="admin-page"><div className="loading">Loading sessions...</div></div>;
  }

  return (
    <div className="admin-page juyo-matching-page">
      <div className="page-header">
        <h2>Juyo Zufu Matching</h2>
        <p className="subtitle">Match PDF scans to Juyo index entries</p>
      </div>

      {/* Session Selector */}
      {!selectedSession ? (
        <div className="session-selector">
          <h3>Select a Session</h3>
          <div className="session-grid">
            {sessions.map(s => (
              <button
                key={s.session}
                className="session-card"
                onClick={() => setSelectedSession(s.session)}
              >
                <div className="session-number">Session {s.session}</div>
                <div className="session-stats">
                  <span className="stat-matched">{s.matched} matched</span>
                  <span className="stat-renamed">{s.renamed} renamed</span>
                  <span className="stat-pending">{s.pending || '?'} pending</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="matching-toolbar">
            <button className="btn-secondary" onClick={() => setSelectedSession(null)}>
              &larr; Back to Sessions
            </button>
            <div className="toolbar-title">Session {selectedSession}</div>
            <div className="toolbar-stats">
              <span>Matched: {matchedCount}/{blades.length}</span>
              <span>Renamed: {renamedCount}</span>
            </div>
            <div className="toolbar-nav">
              <button onClick={goToPrev} disabled={currentBladeIdx === 0}>&larr;</button>
              <span>{currentBladeIdx + 1} / {blades.length}</span>
              <button onClick={goToNext} disabled={currentBladeIdx >= blades.length - 1}>&rarr;</button>
            </div>
            <div className="toolbar-actions">
              <button className="btn-secondary" onClick={autoMatch}>Auto-Match (A)</button>
              <button className="btn-secondary" onClick={exportCSV}>Export CSV</button>
              <button
                className="btn-warning"
                onClick={renameCurrentBlade}
                disabled={renaming || !currentBlade || currentBlade.status !== 'matched'}
              >
                Rename This
              </button>
              <button
                className="btn-danger"
                onClick={renameFiles}
                disabled={renaming || matchedCount === 0}
              >
                {renaming ? 'Renaming...' : 'Rename Matched'}
              </button>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div className="loading">Loading session data...</div>
          ) : (
            <div className="matching-container">
              {/* Blade List */}
              <div className="blade-list-panel">
                <div className="panel-header">Blades ({blades.length})</div>
                <div className="blade-list">
                  {blades.map((blade, idx) => (
                    <div
                      key={blade.name}
                      className={`blade-item ${idx === currentBladeIdx ? 'active' : ''} ${blade.status}`}
                      onClick={() => setCurrentBladeIdx(idx)}
                    >
                      <div className="blade-name">{blade.name}</div>
                      {blade.matchedIndex && (
                        <div className="blade-match">#{blade.matchedIndex} - {blade.matchedAttribution}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Viewer */}
              <div className="image-panel">
                {currentBlade && (
                  <>
                    <div className="image-container">
                      {currentBlade.pages.map(page => (
                        <img
                          key={page.page}
                          src={page.url}
                          alt={`${currentBlade.name} page ${page.page}`}
                          className="blade-image"
                        />
                      ))}
                    </div>
                    <div className="image-info">
                      <strong>{currentBlade.name}</strong>
                      {currentBlade.status !== 'pending' && (
                        <span className={`status-badge ${currentBlade.status}`}>
                          {currentBlade.status === 'not_found' ? 'Not Found' : currentBlade.status}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Index and Match Panel */}
              <div className="match-panel">
                <div className="panel-header">
                  <span>Index Entries ({filteredEntries.length})</span>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="filter-input"
                  />
                </div>
                <div className="index-list">
                  {filteredEntries.map((entry, idx) => {
                    const realIdx = indexEntries.indexOf(entry);
                    const isUsed = blades.some(b => b.matchedIndex === entry.index && b.name !== currentBlade?.name);
                    return (
                      <div
                        key={entry.index}
                        className={`index-item ${realIdx === selectedIndexIdx ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                        onClick={() => setSelectedIndexIdx(realIdx)}
                      >
                        <div className="index-number">#{entry.index}</div>
                        <div className="index-details">
                          <div className="index-type">{entry.item}</div>
                          <div className="index-attribution">{entry.attribution}</div>
                          {entry.mei && <div className="index-mei">{entry.mei}</div>}
                        </div>
                        {isUsed && <span className="used-badge">Used</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Match Details */}
                <div className="match-details">
                  <h4>Match Details</h4>
                  {selectedEntry ? (
                    <div className="selected-entry">
                      <div className="detail-row">
                        <span className="label">Index:</span>
                        <span className="value">#{selectedEntry.index}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Type:</span>
                        <span className="value">{selectedEntry.item}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Attribution:</span>
                        <span className="value">{selectedEntry.attribution}</span>
                      </div>
                      {selectedEntry.mei && (
                        <div className="detail-row">
                          <span className="label">Mei:</span>
                          <span className="value mei">{selectedEntry.mei}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="no-selection">No index entry selected</p>
                  )}

                  <div className="measurement-inputs">
                    <div className="input-group">
                      <label>Nagasa (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={nagasa}
                        onChange={(e) => setNagasa(e.target.value)}
                        placeholder="e.g. 70.5"
                      />
                    </div>
                    <div className="input-group">
                      <label>Sori (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={sori}
                        onChange={(e) => setSori(e.target.value)}
                        placeholder="e.g. 1.8"
                      />
                    </div>
                  </div>

                  <div className="match-buttons">
                    <button className="btn-primary save-next-btn" onClick={saveMatch} disabled={saving}>
                      {saving ? 'Saving...' : 'Save & Next (Enter)'}
                    </button>
                    <button
                      className="btn-not-found"
                      onClick={markNotFound}
                      disabled={!currentBlade || currentBlade.status === 'not_found'}
                    >
                      Not Found
                    </button>
                  </div>

                  <div className="keyboard-hints">
                    <span>Arrow keys: Navigate</span>
                    <span>Enter: Save & Next</span>
                    <span>A: Auto-match</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default JuyoMatching;
