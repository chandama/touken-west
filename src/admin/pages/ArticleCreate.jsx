import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../config/axios.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function ArticleCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    contentType: 'html',
    category: 'General',
    summary: '',
    author: '',
    tags: ''
  });

  const categories = ['Research', 'History', 'Kantei', 'Smiths', 'Schools', 'General'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse tags from comma-separated string
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      const response = await axios.post(`${API_BASE}/admin/articles`, {
        title: formData.title,
        contentType: formData.contentType,
        category: formData.category,
        summary: formData.summary,
        author: formData.author,
        tags
      });

      if (response.data.success) {
        navigate(`/admin/articles/${response.data.article.slug}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <Link to="/admin/articles" className="back-link">
          &larr; Back to Articles
        </Link>
        <h2>Create New Article</h2>
        <p className="subtitle">Add a new article to the site</p>
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

      <form onSubmit={handleSubmit} className="detail-section">
        <div className="detail-grid" style={{ display: 'grid', gap: '1rem' }}>
          {/* Title */}
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter article title"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Content Type */}
          <div className="detail-field">
            <label className="field-label">Content Type *</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="contentType"
                  value="html"
                  checked={formData.contentType === 'html'}
                  onChange={handleChange}
                />
                <span>HTML (Rich Text)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="contentType"
                  value="pdf"
                  checked={formData.contentType === 'pdf'}
                  onChange={handleChange}
                />
                <span>PDF Document</span>
              </label>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              {formData.contentType === 'html'
                ? 'Write content using a rich text editor with support for images'
                : 'Upload a PDF document for readers to view inline or download'
              }
            </p>
          </div>

          {/* Category */}
          <div className="detail-field">
            <label className="field-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div className="detail-field">
            <label className="field-label">Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author name"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Summary */}
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Summary</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Brief description of the article (shown in list views)"
              rows={3}
              maxLength={500}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
              {formData.summary.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas (e.g., research, koto, bizen)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            {loading ? 'Creating...' : 'Create Article'}
          </button>
          <Link to="/admin/articles" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
            Cancel
          </Link>
        </div>
      </form>

      <style>{`
        .back-link {
          display: inline-block;
          margin-bottom: 1rem;
          color: #6b7280;
          text-decoration: none;
        }
        .back-link:hover {
          color: #374151;
        }
      `}</style>
    </div>
  );
}

export default ArticleCreate;
