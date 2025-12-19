import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from '../../config/axios.js';
import WysiwygEditor from '../components/WysiwygEditor.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function ArticleEdit() {
  const { slug } = useParams();
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification that auto-dismisses
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const categories = ['Research', 'History', 'Kantei', 'Smiths', 'Schools', 'General'];

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async (softRefresh = false) => {
    // Only show loading spinner on initial load, not soft refreshes
    if (!softRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/admin/articles/${slug}`);
      const art = response.data;
      setArticle(art);

      // Only update form fields on initial load, not soft refresh
      // This preserves user's unsaved changes during soft refresh
      if (!softRefresh) {
        setTitle(art.title || '');
        setSummary(art.summary || '');
        setAuthor(art.author || '');
        setCategory(art.category || 'General');
        setTags(art.tags?.join(', ') || '');
        setHtmlContent(art.htmlContent || '');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      if (!softRefresh) {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

      await axios.patch(`${API_BASE}/admin/articles/${slug}`, {
        title,
        summary,
        author,
        category,
        tags: tagArray,
        htmlContent: article?.contentType === 'html' ? htmlContent : undefined
      });

      await fetchArticle(true);
      showToast('Article saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await axios.post(`${API_BASE}/admin/articles/${slug}/publish`);
      await fetchArticle();
    } catch (err) {
      alert('Error publishing: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUnpublish = async () => {
    try {
      await axios.post(`${API_BASE}/admin/articles/${slug}/unpublish`);
      await fetchArticle();
    } catch (err) {
      alert('Error unpublishing: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${article?.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/articles/${slug}`);
      navigate('/admin/articles');
    } catch (err) {
      alert('Error deleting: ' + (err.response?.data?.error || err.message));
    }
  };

  // PDF Upload
  const onPdfDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Uploading PDF...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_BASE}/admin/articles/${slug}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress('');
      await fetchArticle();
    } catch (err) {
      alert('Error uploading PDF: ' + (err.response?.data?.error || err.message));
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  }, [slug]);

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: onPdfDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading
  });

  // Image Upload for HTML articles
  const handleImageUpload = useCallback(async () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      // Handle cancel - when input loses focus without selecting a file
      let fileSelected = false;
      input.onchange = async (e) => {
        fileSelected = true;
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        setUploading(true);
        setUploadProgress('Uploading image...');

        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await axios.post(`${API_BASE}/admin/articles/${slug}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setUploadProgress('');
          // Soft refresh to update the images array without unmounting editor
          fetchArticle(true);
          resolve(response.data.image.url);
        } catch (err) {
          alert('Error uploading image: ' + (err.response?.data?.error || err.message));
          setUploadProgress('');
          resolve(null);
        } finally {
          setUploading(false);
        }
      };

      // Detect when file picker closes without selection
      window.addEventListener('focus', function onFocus() {
        window.removeEventListener('focus', onFocus);
        setTimeout(() => {
          if (!fileSelected) {
            resolve(null);
          }
        }, 300);
      }, { once: true });

      input.click();
    });
  }, [slug]);

  // Cover Image Upload
  const onCoverDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Uploading cover image...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_BASE}/admin/articles/${slug}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress('');
      await fetchArticle();
    } catch (err) {
      alert('Error uploading cover: ' + (err.response?.data?.error || err.message));
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  }, [slug]);

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onCoverDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
    maxFiles: 1,
    disabled: uploading
  });

  const handleRemoveImage = async (filename) => {
    if (!confirm('Remove this image?')) return;

    try {
      await axios.delete(`${API_BASE}/admin/articles/${slug}/images/${filename}`);

      // Auto-save the article content after removing image
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      await axios.patch(`${API_BASE}/admin/articles/${slug}`, {
        title,
        summary,
        author,
        category,
        tags: tagArray,
        htmlContent: article?.contentType === 'html' ? htmlContent : undefined
      });

      // Soft refresh to update UI without unmounting editor
      await fetchArticle(true);
    } catch (err) {
      alert('Error removing image: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading article...</div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="admin-page">
        <div className="error">Error: {error}</div>
        <Link to="/admin/articles" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}

      <div className="page-header">
        <Link to="/admin/articles" className="back-link">
          &larr; Back to Articles
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>{article?.title}</h2>
          <span className={`status-badge ${article?.status}`}>
            {article?.status}
          </span>
          <span className="type-badge">
            {article?.contentType === 'pdf' ? 'PDF' : 'HTML'}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {uploadProgress && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {uploadProgress}
        </div>
      )}

      {/* Metadata Section */}
      <div className="detail-section">
        <h3>Article Details</h3>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div className="detail-field">
            <label className="field-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="detail-field">
            <label className="field-label">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              maxLength={500}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
              {summary.length}/500 characters
            </p>
          </div>

          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Cover Image Section */}
      <div className="detail-section">
        <h3>Cover Image</h3>
        {article?.coverImage?.url ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <img
              src={article.coverImage.thumbnailUrl || article.coverImage.url}
              alt="Cover"
              style={{ maxWidth: '200px', borderRadius: '8px' }}
            />
            <div {...getCoverRootProps()} style={dropzoneStyle(isCoverDragActive)}>
              <input {...getCoverInputProps()} />
              <p>Replace cover image</p>
            </div>
          </div>
        ) : (
          <div {...getCoverRootProps()} style={dropzoneStyle(isCoverDragActive)}>
            <input {...getCoverInputProps()} />
            <p>{isCoverDragActive ? 'Drop image here...' : 'Drag & drop cover image, or click to select'}</p>
          </div>
        )}
      </div>

      {/* Content Section - Conditional on type */}
      {article?.contentType === 'html' ? (
        <div className="detail-section">
          <h3>Content</h3>
          <WysiwygEditor
            ref={editorRef}
            content={htmlContent}
            onChange={setHtmlContent}
            onImageUpload={handleImageUpload}
          />

          {/* Image Gallery */}
          {article?.imagesArray && article.imagesArray.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Uploaded Images</h4>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Click "Insert" to add an image to your article, or "Remove" to delete it.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {article.imagesArray.map((img, idx) => (
                  <div key={idx} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={img.thumbnailUrl || img.url}
                      alt={img.caption || `Image ${idx + 1}`}
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => editorRef.current?.openImageModal(img.url)}
                        className="btn-primary"
                        style={{ flex: '1 1 100%', fontSize: '0.75rem', padding: '0.375rem' }}
                      >
                        Insert
                      </button>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(img.url)}
                        className="btn-secondary"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '0.25rem' }}
                      >
                        Copy URL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.filename)}
                        className="btn-secondary"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '0.25rem', color: '#dc2626' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="detail-section">
          <h3>PDF Document</h3>
          {article?.pdfFile?.url ? (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '2rem' }}>PDF</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{article.pdfFile.originalFilename}</p>
                  <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                    {(article.pdfFile.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <a
                  href={article.pdfFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  View PDF
                </a>
              </div>

              <div {...getPdfRootProps()} style={dropzoneStyle(isPdfDragActive)}>
                <input {...getPdfInputProps()} />
                <p>{isPdfDragActive ? 'Drop PDF here...' : 'Replace PDF: Drag & drop or click to select'}</p>
              </div>
            </div>
          ) : (
            <div {...getPdfRootProps()} style={{ ...dropzoneStyle(isPdfDragActive), minHeight: '150px' }}>
              <input {...getPdfInputProps()} />
              <p>{isPdfDragActive ? 'Drop PDF here...' : 'Drag & drop a PDF file, or click to select'}</p>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>Maximum file size: 50MB</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="btn-primary"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {article?.status === 'draft' ? (
          <button
            onClick={handlePublish}
            disabled={uploading}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none' }}
          >
            Publish
          </button>
        ) : (
          <button
            onClick={handleUnpublish}
            disabled={uploading}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Unpublish
          </button>
        )}

        <a
          href={`/admin/articles/${article?.slug}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          Preview
        </a>

        {article?.status === 'published' && (
          <a
            href={`/articles/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            View Live
          </a>
        )}

        <button
          onClick={handleDelete}
          disabled={uploading}
          className="btn-secondary"
          style={{ padding: '0.75rem 1.5rem', color: '#dc2626', marginLeft: 'auto' }}
        >
          Delete Article
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .back-link {
          display: inline-block;
          color: #6b7280;
          text-decoration: none;
        }
        .back-link:hover {
          color: #374151;
        }
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-badge.draft {
          background: #fef3c7;
          color: #92400e;
        }
        .status-badge.published {
          background: #d1fae5;
          color: #065f46;
        }
        .type-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #e5e7eb;
          color: #374151;
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '1rem'
};

const dropzoneStyle = (isDragActive) => ({
  border: `2px dashed ${isDragActive ? '#3b82f6' : '#d1d5db'}`,
  borderRadius: '8px',
  padding: '2rem',
  textAlign: 'center',
  cursor: 'pointer',
  background: isDragActive ? '#eff6ff' : '#f9fafb',
  transition: 'all 0.2s ease'
});

export default ArticleEdit;
