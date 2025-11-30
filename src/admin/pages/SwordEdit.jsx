import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MediaUpload from '../components/MediaUpload.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function SwordEdit() {
  const { index } = useParams();
  const navigate = useNavigate();

  const [sword, setSword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for editable fields
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load sword data
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/swords/${index}`)
      .then(res => res.json())
      .then(data => {
        setSword(data);

        // Initialize form data with current values
        const initialFormData = {
          School: data.School || '',
          Smith: data.Smith || '',
          Mei: data.Mei || '',
          Type: data.Type || '',
          Nagasa: data.Nagasa || '',
          Sori: data.Sori || '',
          Moto: data.Moto || '',
          Saki: data.Saki || '',
          Nakago: data.Nakago || '',
          Ana: data.Ana || '',
          Length: data.Length || '',
          Hori: data.Hori || '',
          Authentication: data.Authentication || '',
          Province: data.Province || '',
          Period: data.Period || '',
          References: data.References || '',
          Description: data.Description || '',
          Attachments: data.Attachments || '',
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [index]);

  const handleUploadComplete = (updatedSword) => {
    // Refresh sword data
    fetch(`${API_BASE}/swords/${index}`)
      .then(res => res.json())
      .then(data => setSword(data))
      .catch(err => console.error('Error refreshing sword:', err));
  };

  const handleRemoveMedia = async (filename) => {
    if (!confirm('Are you sure you want to remove this media file?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/swords/${index}/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Media removed successfully');
        // Refresh sword data
        fetch(`${API_BASE}/swords/${index}`)
          .then(res => res.json())
          .then(data => setSword(data));
      } else {
        alert('Failed to remove media: ' + result.error);
      }
    } catch (err) {
      alert('Error removing media: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getChangedFields = () => {
    const changes = {};
    Object.keys(formData).forEach(key => {
      const original = originalData[key] || '';
      const current = formData[key] || '';
      if (original !== current) {
        changes[key] = { before: original, after: current };
      }
    });
    return changes;
  };

  const handleSaveClick = () => {
    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      alert('No changes to save');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE}/swords/${index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Sword record updated successfully');
        setShowConfirmModal(false);
        setIsEditing(false);

        // Refresh sword data
        fetch(`${API_BASE}/swords/${index}`)
          .then(res => res.json())
          .then(data => {
            setSword(data);
            const updatedFormData = {
              School: data.School || '',
              Smith: data.Smith || '',
              Mei: data.Mei || '',
              Type: data.Type || '',
              Nagasa: data.Nagasa || '',
              Sori: data.Sori || '',
              Moto: data.Moto || '',
              Saki: data.Saki || '',
              Nakago: data.Nakago || '',
              Ana: data.Ana || '',
              Length: data.Length || '',
              Hori: data.Hori || '',
              Authentication: data.Authentication || '',
              Province: data.Province || '',
              Period: data.Period || '',
              References: data.References || '',
              Description: data.Description || '',
              Attachments: data.Attachments || '',
            };
            setFormData(updatedFormData);
            setOriginalData(updatedFormData);
          });
      } else {
        alert('Failed to update sword: ' + result.error);
      }
    } catch (err) {
      alert('Error updating sword: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setShowConfirmModal(false);
  };

  const handleCancelEdit = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE}/swords/${index}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Sword record deleted successfully');
        // Navigate back to the sword list
        navigate('/admin');
      } else {
        alert('Failed to delete sword: ' + result.error);
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (err) {
      alert('Error deleting sword: ' + err.message);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading sword...</div></div>;
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error">Error: {error}</div>
        <Link to="/admin" className="btn-secondary">← Back to List</Link>
      </div>
    );
  }

  if (!sword) {
    return (
      <div className="admin-page">
        <div className="error">Sword not found</div>
        <Link to="/admin" className="btn-secondary">← Back to List</Link>
      </div>
    );
  }

  const mediaAttachments = sword.MediaAttachmentsArray || [];
  const changedFields = getChangedFields();
  const hasChanges = Object.keys(changedFields).length > 0;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="page-header-top">
          <Link to="/admin" className="back-link">← Back to List</Link>
          <span className="sword-index">#{sword.Index}</span>
        </div>
        <h2>{sword.Smith || 'Unknown Smith'}</h2>
        <div className="sword-type-badge">{sword.Type || 'Unknown Type'}</div>
      </div>

      {/* Sword Details */}
      <div className="detail-section">
        <div className="section-header">
          <h3>Sword Information</h3>
          <div className="edit-controls">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-primary">
                  Edit Sword Data
                </button>
                <button onClick={handleDeleteClick} className="btn-danger">
                  Delete Record
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveClick}
                  className="btn-primary"
                  disabled={!hasChanges}
                >
                  Save Changes {hasChanges && `(${Object.keys(changedFields).length})`}
                </button>
                <button onClick={handleCancelEdit} className="btn-secondary">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-grid">
          {/* School */}
          <div className="detail-item">
            <label>School:</label>
            {isEditing ? (
              <input
                type="text"
                name="School"
                value={formData.School}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.School || 'N/A'}</span>
            )}
          </div>

          {/* Smith */}
          <div className="detail-item">
            <label>Smith:</label>
            {isEditing ? (
              <input
                type="text"
                name="Smith"
                value={formData.Smith}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Smith || 'N/A'}</span>
            )}
          </div>

          {/* Mei */}
          <div className="detail-item">
            <label>Mei (Signature):</label>
            {isEditing ? (
              <input
                type="text"
                name="Mei"
                value={formData.Mei}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Mei || 'N/A'}</span>
            )}
          </div>

          {/* Type */}
          <div className="detail-item">
            <label>Type:</label>
            {isEditing ? (
              <input
                type="text"
                name="Type"
                value={formData.Type}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Type || 'N/A'}</span>
            )}
          </div>

          {/* Period */}
          <div className="detail-item">
            <label>Period:</label>
            {isEditing ? (
              <input
                type="text"
                name="Period"
                value={formData.Period}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Period || 'N/A'}</span>
            )}
          </div>

          {/* Province */}
          <div className="detail-item">
            <label>Province:</label>
            {isEditing ? (
              <input
                type="text"
                name="Province"
                value={formData.Province}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Province || 'N/A'}</span>
            )}
          </div>

          {/* Nagasa */}
          <div className="detail-item">
            <label>Nagasa (Length):</label>
            {isEditing ? (
              <input
                type="text"
                name="Nagasa"
                value={formData.Nagasa}
                onChange={handleInputChange}
                className="form-input"
                placeholder="cm"
              />
            ) : (
              <span>{sword.Nagasa && sword.Nagasa !== 'NA' ? `${sword.Nagasa} cm` : 'N/A'}</span>
            )}
          </div>

          {/* Sori */}
          <div className="detail-item">
            <label>Sori (Curvature):</label>
            {isEditing ? (
              <input
                type="text"
                name="Sori"
                value={formData.Sori}
                onChange={handleInputChange}
                className="form-input"
                placeholder="cm"
              />
            ) : (
              <span>{sword.Sori && sword.Sori !== 'NA' ? `${sword.Sori} cm` : 'N/A'}</span>
            )}
          </div>

          {/* Moto */}
          <div className="detail-item">
            <label>Moto (Base Width):</label>
            {isEditing ? (
              <input
                type="text"
                name="Moto"
                value={formData.Moto}
                onChange={handleInputChange}
                className="form-input"
                placeholder="cm"
              />
            ) : (
              <span>{sword.Moto && sword.Moto !== 'NA' ? `${sword.Moto} cm` : 'N/A'}</span>
            )}
          </div>

          {/* Saki */}
          <div className="detail-item">
            <label>Saki (Tip Width):</label>
            {isEditing ? (
              <input
                type="text"
                name="Saki"
                value={formData.Saki}
                onChange={handleInputChange}
                className="form-input"
                placeholder="cm"
              />
            ) : (
              <span>{sword.Saki && sword.Saki !== 'NA' ? `${sword.Saki} cm` : 'N/A'}</span>
            )}
          </div>

          {/* Nakago */}
          <div className="detail-item">
            <label>Nakago (Tang):</label>
            {isEditing ? (
              <input
                type="text"
                name="Nakago"
                value={formData.Nakago}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Nakago || 'N/A'}</span>
            )}
          </div>

          {/* Ana */}
          <div className="detail-item">
            <label>Ana (Holes):</label>
            {isEditing ? (
              <input
                type="text"
                name="Ana"
                value={formData.Ana}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Ana || 'N/A'}</span>
            )}
          </div>

          {/* Length (Tang Length) */}
          <div className="detail-item">
            <label>Tang Length:</label>
            {isEditing ? (
              <input
                type="text"
                name="Length"
                value={formData.Length}
                onChange={handleInputChange}
                className="form-input"
                placeholder="cm"
              />
            ) : (
              <span>{sword.Length && sword.Length !== 'NA' ? `${sword.Length} cm` : 'N/A'}</span>
            )}
          </div>

          {/* Hori */}
          <div className="detail-item">
            <label>Hori (Engravings):</label>
            {isEditing ? (
              <input
                type="text"
                name="Hori"
                value={formData.Hori}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Hori || 'N/A'}</span>
            )}
          </div>

          {/* Authentication */}
          <div className="detail-item detail-full-width">
            <label>Authentication:</label>
            {isEditing ? (
              <input
                type="text"
                name="Authentication"
                value={formData.Authentication}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Authentication && sword.Authentication !== 'NA' ? sword.Authentication : 'N/A'}</span>
            )}
          </div>

          {/* References */}
          <div className="detail-item detail-full-width">
            <label>References:</label>
            {isEditing ? (
              <input
                type="text"
                name="References"
                value={formData.References}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.References || 'N/A'}</span>
            )}
          </div>

          {/* Description */}
          <div className="detail-item detail-full-width">
            <label>Description:</label>
            {isEditing ? (
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
              />
            ) : (
              <span>{sword.Description && sword.Description !== 'NA' ? sword.Description : 'N/A'}</span>
            )}
          </div>

          {/* Attachments */}
          <div className="detail-item detail-full-width">
            <label>Attachments:</label>
            {isEditing ? (
              <input
                type="text"
                name="Attachments"
                value={formData.Attachments}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <span>{sword.Attachments || 'N/A'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Media Attachments */}
      <div className="detail-section">
        <h3>Media Attachments ({mediaAttachments.length})</h3>

        {mediaAttachments.length > 0 && (
          <div className="media-grid">
            {mediaAttachments.map((media, idx) => {
              // Determine if this is a PDF - check mimeType first, then fall back to file extension
              const isPdf = media.mimeType === 'application/pdf' ||
                (media.url && media.url.toLowerCase().endsWith('.pdf'));
              const displayName = media.filename || media.caption || (media.url ? media.url.split('/').pop() : 'File');

              return (
              <div key={idx} className="media-item">
                {isPdf ? (
                  <div className="media-pdf" onClick={() => window.open(media.url, '_blank')} style={{ cursor: 'pointer' }}>
                    <div className="pdf-icon">📄</div>
                    <div className="pdf-name">{displayName}</div>
                  </div>
                ) : (
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt={media.caption || 'Sword image'}
                    className="media-thumbnail"
                    onClick={() => window.open(media.url, '_blank')}
                  />
                )}

                <div className="media-info">
                  {media.category && (
                    <div className="media-category">{media.category}</div>
                  )}
                  {media.caption && (
                    <div className="media-caption">{media.caption}</div>
                  )}
                  {media.tags && media.tags.length > 0 && (
                    <div className="media-tags">
                      {media.tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveMedia(media.filename || displayName)}
                  className="btn-danger btn-small"
                >
                  Remove
                </button>
              </div>
              );
            })}
          </div>
        )}

        {mediaAttachments.length === 0 && (
          <div className="empty-state">
            No media attachments yet. Upload photos or PDFs below.
          </div>
        )}
      </div>

      {/* Upload New Media */}
      <div className="detail-section">
        <h3>Upload New Media</h3>
        <MediaUpload
          swordIndex={sword.Index}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">⚠️ Confirm Sword Record Update</h3>
            <p className="modal-warning">
              You are about to update the sword record. Please review the changes below:
            </p>

            <div className="changes-list">
              {Object.entries(changedFields).map(([field, { before, after }]) => (
                <div key={field} className="change-item">
                  <div className="change-field">{field}:</div>
                  <div className="change-comparison">
                    <div className="change-before">
                      <strong>Before:</strong> {before || '(empty)'}
                    </div>
                    <div className="change-arrow">→</div>
                    <div className="change-after">
                      <strong>After:</strong> {after || '(empty)'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                onClick={handleConfirmSave}
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Submit'}
              </button>
              <button
                onClick={handleCancelChanges}
                className="btn-secondary"
                disabled={isSaving}
              >
                Cancel Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">⚠️ Delete Sword Record</h3>
            <p className="modal-warning" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
              Are you sure you want to delete this record from the database?
            </p>
            <p className="modal-warning">
              This action cannot be undone. All associated media files will also be deleted.
            </p>

            <div style={{ margin: '20px 0', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
              <strong>Record to be deleted:</strong>
              <div style={{ marginTop: '10px' }}>
                <div>Index: #{sword.Index}</div>
                <div>Smith: {sword.Smith || 'Unknown'}</div>
                <div>Type: {sword.Type || 'Unknown'}</div>
                <div>School: {sword.School || 'Unknown'}</div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleConfirmDelete}
                className="btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
              <button
                onClick={handleCancelDelete}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SwordEdit;
