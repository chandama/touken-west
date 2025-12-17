import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const limit = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page, categoryFilter, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/articles/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page, limit });
      if (categoryFilter) params.append('category', categoryFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`${API_BASE}/articles?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
      setPages(data.pages || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="articles-list-page">
      {/* Search and Filters */}
      <div className="articles-filters">
        <form onSubmit={handleSearch} className="articles-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="search-input"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        <div className="articles-filter-controls">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>

          {(categoryFilter || searchQuery) && (
            <button onClick={clearFilters} className="btn-secondary clear-btn">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="articles-results-info">
        {total > 0 ? (
          <>Showing {articles.length} of {total} articles</>
        ) : (
          !loading && 'No articles found'
        )}
        {(categoryFilter || searchQuery) && ' (filtered)'}
      </div>

      {/* Loading / Error */}
      {loading && <div className="loading">Loading articles...</div>}
      {error && <div className="error">Error: {error}</div>}

      {/* Article Grid */}
      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <div className="no-articles">
              <p>No articles found.</p>
              {(categoryFilter || searchQuery) && (
                <button onClick={clearFilters} className="btn-secondary">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map(article => (
                <ArticleCard key={article.slug} article={article} />
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
    </div>
  );
}

export default ArticleListPage;
