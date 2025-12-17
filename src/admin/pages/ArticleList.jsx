import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../config/axios.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const limit = 20;

  const categories = ['Research', 'History', 'Kantei', 'Smiths', 'Schools', 'General'];

  useEffect(() => {
    fetchArticles();
  }, [page, statusFilter, categoryFilter]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page,
        limit
      });
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await axios.get(`${API_BASE}/admin/articles?${params}`);
      setArticles(response.data.articles || []);
      setTotal(response.data.total || 0);
      setPages(response.data.pages || 0);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/articles/${slug}`);
      fetchArticles();
    } catch (err) {
      alert('Error deleting article: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePublishToggle = async (article) => {
    try {
      const endpoint = article.status === 'published' ? 'unpublish' : 'publish';
      await axios.post(`${API_BASE}/admin/articles/${article.slug}/${endpoint}`);
      fetchArticles();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Article Management</h2>
          <p className="subtitle">Create and manage articles</p>
        </div>
        <Link to="/admin/articles/create" className="btn-primary">
          + New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-panel expanded">
        <div className="filter-header">
          <div className="filter-title-row">
            <h3>Filters</h3>
          </div>
          {(statusFilter || categoryFilter) && (
            <button onClick={clearFilters} className="clear-filters-button">
              Clear All
            </button>
          )}
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {articles.length} of {total} articles
        {(statusFilter || categoryFilter) && ' (filtered)'}
      </div>

      {/* Loading / Error */}
      {loading && <div className="loading">Loading articles...</div>}
      {error && <div className="error">Error: {error}</div>}

      {/* Article List */}
      {!loading && !error && (
        <>
          <div className="sword-list">
            {articles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No articles found. <Link to="/admin/articles/create">Create your first article</Link>
              </div>
            )}
            {articles.map(article => (
              <div key={article.slug} className="sword-card">
                <div className="sword-card-header">
                  <span className={`status-badge ${article.status}`}>
                    {article.status}
                  </span>
                  <span className="sword-index" style={{ marginLeft: '0.5rem' }}>
                    {article.contentType === 'pdf' ? 'PDF' : 'HTML'}
                  </span>
                </div>

                <div className="sword-card-body">
                  <h3 className="sword-smith">{article.title}</h3>
                  <div className="sword-meta">
                    <span className="meta-item">{article.category}</span>
                    {article.author && (
                      <>
                        <span className="meta-separator">•</span>
                        <span className="meta-item">{article.author}</span>
                      </>
                    )}
                    <span className="meta-separator">•</span>
                    <span className="meta-item">
                      {article.status === 'published'
                        ? `Published ${formatDate(article.publishedAt)}`
                        : `Updated ${formatDate(article.updatedAt)}`
                      }
                    </span>
                  </div>

                  {article.summary && (
                    <div className="sword-auth" style={{ marginTop: '0.5rem' }}>
                      {article.summary.length > 150
                        ? article.summary.substring(0, 150) + '...'
                        : article.summary
                      }
                    </div>
                  )}

                  {article.tags && article.tags.length > 0 && (
                    <div className="article-tags">
                      {article.tags.map((tag, i) => (
                        <span key={i} className="article-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sword-card-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/admin/articles/${article.slug}`} className="btn-primary">
                    Edit
                  </Link>
                  <button
                    onClick={() => handlePublishToggle(article)}
                    className="btn-secondary"
                  >
                    {article.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(article.slug, article.title)}
                    className="btn-secondary"
                    style={{ color: '#dc2626' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                Previous
              </button>

              <span className="page-info">
                Page {page} of {pages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
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
        .article-tags {
          margin-top: 0.5rem;
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        .article-tag {
          background: #e5e7eb;
          color: #374151;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }
        body.dark-mode .article-tag {
          background: #374151;
          color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}

export default ArticleList;
