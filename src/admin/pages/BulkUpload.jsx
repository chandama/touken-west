import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// CSV fields that can be imported
const CSV_FIELDS = [
  'School', 'Smith', 'Mei', 'Type', 'Nagasa', 'Sori', 'Moto', 'Saki',
  'Nakago', 'Ana', 'Length', 'Hori', 'Authentication', 'Province',
  'Period', 'References', 'Description', 'Attachments', 'Tags'
];

function BulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload state
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [nonDuplicates, setNonDuplicates] = useState([]);

  // Duplicate review state
  const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState(0);
  const [duplicateDecisions, setDuplicateDecisions] = useState({});
  const [reviewingDuplicates, setReviewingDuplicates] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setPreviewData(null);
      setDuplicates([]);
      setNonDuplicates([]);
      setDuplicateDecisions({});
      setImportResults(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setPreviewData(null);
      setDuplicates([]);
      setNonDuplicates([]);
      setDuplicateDecisions({});
      setImportResults(null);
    }
  };

  const parseAndPreview = async () => {
    if (!file) return;

    setParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading to:', `${API_BASE}/swords/bulk/preview`);
      const response = await axios.post(`${API_BASE}/swords/bulk/preview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;
      setPreviewData(data);
      setDuplicates(data.duplicates || []);
      setNonDuplicates(data.nonDuplicates || []);

      // Initialize decisions for duplicates (default: skip)
      const decisions = {};
      (data.duplicates || []).forEach((dup, idx) => {
        decisions[idx] = 'skip';
      });
      setDuplicateDecisions(decisions);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to parse CSV');
    } finally {
      setParsing(false);
    }
  };

  const startDuplicateReview = () => {
    if (duplicates.length > 0) {
      setCurrentDuplicateIndex(0);
      setReviewingDuplicates(true);
    }
  };

  const handleDuplicateDecision = (decision) => {
    setDuplicateDecisions(prev => ({
      ...prev,
      [currentDuplicateIndex]: decision
    }));

    // Move to next duplicate or finish review
    if (currentDuplicateIndex < duplicates.length - 1) {
      setCurrentDuplicateIndex(prev => prev + 1);
    } else {
      setReviewingDuplicates(false);
    }
  };

  const skipRemainingDuplicates = () => {
    const newDecisions = { ...duplicateDecisions };
    for (let i = currentDuplicateIndex; i < duplicates.length; i++) {
      newDecisions[i] = 'skip';
    }
    setDuplicateDecisions(newDecisions);
    setReviewingDuplicates(false);
  };

  const importAllDuplicates = () => {
    const newDecisions = { ...duplicateDecisions };
    for (let i = currentDuplicateIndex; i < duplicates.length; i++) {
      newDecisions[i] = 'import';
    }
    setDuplicateDecisions(newDecisions);
    setReviewingDuplicates(false);
  };

  const performImport = async () => {
    setImporting(true);
    setError(null);

    try {
      // Build list of swords to import
      const swordsToImport = [
        ...nonDuplicates.map(item => item.data),
        ...duplicates
          .filter((_, idx) => duplicateDecisions[idx] === 'import')
          .map(item => item.data)
      ];

      if (swordsToImport.length === 0) {
        setError('No swords selected for import');
        setImporting(false);
        return;
      }

      const response = await axios.post(`${API_BASE}/swords/bulk/import`, {
        swords: swordsToImport
      });

      setImportResults(response.data);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewData(null);
    setDuplicates([]);
    setNonDuplicates([]);
    setDuplicateDecisions({});
    setImportResults(null);
    setError(null);
    setReviewingDuplicates(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const duplicatesToImport = Object.values(duplicateDecisions).filter(d => d === 'import').length;
  const duplicatesToSkip = Object.values(duplicateDecisions).filter(d => d === 'skip').length;
  const totalToImport = nonDuplicates.length + duplicatesToImport;

  // Render duplicate review modal
  if (reviewingDuplicates && duplicates.length > 0) {
    const currentDuplicate = duplicates[currentDuplicateIndex];
    const existing = currentDuplicate.existing;
    const csvData = currentDuplicate.data;

    return (
      <div className="admin-page">
        <div className="page-header">
          <h2>Review Duplicate ({currentDuplicateIndex + 1} of {duplicates.length})</h2>
          <p className="subtitle">This record may be a duplicate. Decide whether to import or skip.</p>
        </div>

        <div className="duplicate-review-container">
          <div className="duplicate-comparison">
            <div className="comparison-side csv-side">
              <h3>CSV Record (New)</h3>
              <div className="comparison-fields">
                {CSV_FIELDS.map(field => (
                  <div key={field} className="comparison-field">
                    <label>{field}</label>
                    <span className={csvData[field] !== existing[field] ? 'value-different' : ''}>
                      {csvData[field] || 'NA'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="comparison-divider">
              <span>vs</span>
            </div>

            <div className="comparison-side existing-side">
              <h3>Existing Record (Index: {existing.Index})</h3>
              <div className="comparison-fields">
                {CSV_FIELDS.map(field => (
                  <div key={field} className="comparison-field">
                    <label>{field}</label>
                    <span className={csvData[field] !== existing[field] ? 'value-different' : ''}>
                      {existing[field] || 'NA'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="duplicate-actions">
            <div className="action-buttons-main">
              <button
                onClick={() => handleDuplicateDecision('skip')}
                className="btn-secondary"
              >
                Skip (Don't Import)
              </button>
              <button
                onClick={() => handleDuplicateDecision('import')}
                className="btn-primary"
              >
                Import Anyway
              </button>
            </div>

            <div className="action-buttons-bulk">
              <button onClick={skipRemainingDuplicates} className="btn-small btn-secondary">
                Skip All Remaining ({duplicates.length - currentDuplicateIndex})
              </button>
              <button onClick={importAllDuplicates} className="btn-small btn-primary">
                Import All Remaining ({duplicates.length - currentDuplicateIndex})
              </button>
            </div>
          </div>

          <div className="review-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentDuplicateIndex + 1) / duplicates.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              {currentDuplicateIndex + 1} of {duplicates.length} duplicates reviewed
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render import results
  if (importResults) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h2>Import Complete</h2>
          <p className="subtitle">Bulk upload finished successfully</p>
        </div>

        <div className="import-results">
          <div className="results-summary">
            <div className="result-stat success">
              <span className="stat-number">{importResults.created}</span>
              <span className="stat-label">Swords Created</span>
            </div>
            {importResults.errors > 0 && (
              <div className="result-stat error">
                <span className="stat-number">{importResults.errors}</span>
                <span className="stat-label">Errors</span>
              </div>
            )}
          </div>

          {importResults.newSwords && importResults.newSwords.length > 0 && (
            <div className="new-swords-list">
              <h3>Newly Created Swords</h3>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Smith</th>
                    <th>Mei</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {importResults.newSwords.map(sword => (
                    <tr key={sword.Index}>
                      <td>{sword.Index}</td>
                      <td>{sword.Smith}</td>
                      <td>{sword.Mei}</td>
                      <td>{sword.Type}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/sword/${sword.Index}`)}
                          className="btn-small btn-secondary"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {importResults.errorDetails && importResults.errorDetails.length > 0 && (
            <div className="error-details">
              <h3>Errors</h3>
              {importResults.errorDetails.map((err, idx) => (
                <div key={idx} className="error-item">
                  <strong>Row {err.row}:</strong> {err.error}
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button onClick={resetUpload} className="btn-secondary">
              Upload Another File
            </button>
            <button onClick={() => navigate('/admin')} className="btn-primary">
              Back to Sword List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Bulk Upload Swords</h2>
        <p className="subtitle">Upload a CSV file to add multiple sword records at once</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* File Upload Section */}
      {!previewData && (
        <div className="upload-section">
          <div
            className={`dropzone ${parsing ? 'dropzone-disabled' : ''}`}
            onClick={() => !parsing && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="dropzone-content">
              <div className="dropzone-icon">📄</div>
              <p className="dropzone-text">
                {file ? file.name : 'Drop CSV file here or click to browse'}
              </p>
              <p className="dropzone-hint">
                Supported format: CSV with headers matching sword fields
              </p>
            </div>
          </div>

          {file && (
            <div className="file-actions">
              <button
                onClick={parseAndPreview}
                className="btn-primary"
                disabled={parsing}
              >
                {parsing ? 'Parsing...' : 'Parse & Preview'}
              </button>
              <button onClick={resetUpload} className="btn-secondary">
                Clear
              </button>
            </div>
          )}

          <div className="csv-format-help">
            <h3>Expected CSV Format</h3>
            <p>Your CSV should include a header row with any of these column names:</p>
            <div className="field-list">
              {CSV_FIELDS.map(field => (
                <span key={field} className="field-tag">{field}</span>
              ))}
            </div>
            <p className="note">
              <strong>Note:</strong> Index and MediaAttachments will be generated automatically.
              Empty values will be set to 'NA'.
            </p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {previewData && !importResults && (
        <div className="preview-section">
          <div className="preview-summary">
            <h3>Upload Preview</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{previewData.total}</span>
                <span className="stat-label">Total Rows</span>
              </div>
              <div className="stat-item success">
                <span className="stat-number">{nonDuplicates.length}</span>
                <span className="stat-label">New Records</span>
              </div>
              <div className="stat-item warning">
                <span className="stat-number">{duplicates.length}</span>
                <span className="stat-label">Potential Duplicates</span>
              </div>
              {previewData.skipped > 0 && (
                <div className="stat-item">
                  <span className="stat-number">{previewData.skipped}</span>
                  <span className="stat-label">Empty Rows</span>
                </div>
              )}
            </div>
          </div>

          {duplicates.length > 0 && (
            <div className="duplicates-section">
              <div className="section-header">
                <h3>Duplicate Review</h3>
                <p>
                  {duplicatesToImport > 0
                    ? `${duplicatesToImport} duplicates will be imported, ${duplicatesToSkip} will be skipped`
                    : 'All duplicates will be skipped'
                  }
                </p>
              </div>
              <button onClick={startDuplicateReview} className="btn-secondary">
                Review Duplicates One by One
              </button>
            </div>
          )}

          {nonDuplicates.length > 0 && (
            <div className="new-records-preview">
              <h3>New Records to Import ({nonDuplicates.length})</h3>
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Smith</th>
                      <th>Mei</th>
                      <th>Type</th>
                      <th>School</th>
                      <th>Nagasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonDuplicates.slice(0, 20).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.row}</td>
                        <td>{item.data.Smith || 'Unknown'}</td>
                        <td>{item.data.Mei || 'Mumei'}</td>
                        <td>{item.data.Type || 'NA'}</td>
                        <td>{item.data.School || 'NA'}</td>
                        <td>{item.data.Nagasa || 'NA'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {nonDuplicates.length > 20 && (
                  <p className="more-records">
                    ... and {nonDuplicates.length - 20} more records
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="import-actions">
            <div className="import-summary">
              <strong>Ready to import {totalToImport} swords</strong>
              {duplicatesToImport > 0 && (
                <span className="includes-duplicates">
                  (includes {duplicatesToImport} duplicate{duplicatesToImport > 1 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="action-buttons">
              <button onClick={resetUpload} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={performImport}
                className="btn-primary"
                disabled={importing || totalToImport === 0}
              >
                {importing ? 'Importing...' : `Import ${totalToImport} Swords`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkUpload;
