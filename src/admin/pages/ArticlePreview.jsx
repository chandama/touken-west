import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../config/axios.js';
import PdfViewer from '../../articles/components/PdfViewer.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function ArticlePreview() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, src: '', caption: '' });

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/admin/articles/${slug}`);
      setArticle(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image clicks for lightbox using event delegation
  const handleContentClick = (e) => {
    const img = e.target.closest('img');
    if (!img) return;

    // Get caption from figcaption sibling, data attribute, or alt text
    const figure = img.closest('figure');
    const figcaption = figure?.querySelector('figcaption');
    const caption = figcaption?.textContent || img.dataset.caption || img.alt || '';

    setLightbox({
      open: true,
      src: img.src,
      caption
    });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, src: '', caption: '' });
  };

  // Close lightbox on escape key
  useEffect(() => {
    if (!lightbox.open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [lightbox.open]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error">Error: {error}</div>
        <Link to="/admin/articles" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Articles
        </Link>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="article-preview-page">
      {/* Draft Preview Banner */}
      <div className="preview-banner">
        <span className="preview-banner-text">
          Draft Preview
          {article.status === 'draft' && ' - This article is not published'}
        </span>
        <Link to={`/admin/articles/${slug}`} className="preview-banner-link">
          Back to Editor
        </Link>
      </div>

      {/* Article Content - mirrors ArticleViewPage structure */}
      <div className="article-preview-content">
        <div className="article-header">
          {article.coverImage?.url && (
            <div className="article-cover">
              <img src={article.coverImage.url} alt={article.title} />
            </div>
          )}

          <div className="article-meta">
            <span className="article-category">{article.category}</span>
            <span className="article-type">
              {article.contentType === 'pdf' ? 'PDF Document' : 'Article'}
            </span>
            <span className={`article-status-badge ${article.status}`}>
              {article.status}
            </span>
          </div>

          <h1 className="article-title">{article.title}</h1>

          {article.summary && (
            <p className="article-summary">{article.summary}</p>
          )}

          <div className="article-info">
            {article.author && (
              <span className="article-author">By {article.author}</span>
            )}
            {article.status === 'published' && article.publishedAt ? (
              <span className="article-date">
                Published {formatDate(article.publishedAt)}
              </span>
            ) : (
              <span className="article-date">
                Last updated {formatDate(article.updatedAt)}
              </span>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="article-tags">
              {article.tags.map((tag, i) => (
                <span key={i} className="article-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="article-content" onClick={handleContentClick}>
          {article.contentType === 'pdf' ? (
            article.pdfFile?.url ? (
              <PdfViewer
                url={article.pdfFile.url}
                filename={article.pdfFile.originalFilename || 'document.pdf'}
              />
            ) : (
              <div className="no-content">
                <p>PDF document not uploaded yet.</p>
              </div>
            )
          ) : (
            article.htmlContent ? (
              <div
                className="article-html-content"
                dangerouslySetInnerHTML={{ __html: article.htmlContent }}
              />
            ) : (
              <div className="no-content">
                <p>No content written yet.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Lightbox for viewing images full size */}
      {lightbox.open && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            &times;
          </button>
          <div className="lightbox-content">
            <img src={lightbox.src} alt={lightbox.caption} />
            {lightbox.caption && (
              <div className="lightbox-caption">{lightbox.caption}</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .article-preview-page {
          min-height: 100vh;
        }

        .preview-banner {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .preview-banner-text {
          font-size: 0.875rem;
        }

        .preview-banner-link {
          color: white;
          text-decoration: none;
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .preview-banner-link:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .article-preview-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .article-header {
          margin-bottom: 2rem;
        }

        .article-cover {
          margin-bottom: 1.5rem;
          border-radius: 12px;
          overflow: hidden;
        }

        .article-cover img {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
        }

        .article-meta {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .article-category {
          background: #e5e7eb;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .article-type {
          background: #dbeafe;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #1d4ed8;
        }

        .article-status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .article-status-badge.draft {
          background: #fef3c7;
          color: #92400e;
        }

        .article-status-badge.published {
          background: #d1fae5;
          color: #065f46;
        }

        .article-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: #1f2937;
          line-height: 1.2;
        }

        .article-summary {
          font-size: 1.125rem;
          color: #4b5563;
          margin: 0 0 1rem 0;
          line-height: 1.6;
        }

        .article-info {
          display: flex;
          gap: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .article-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .article-tag {
          background: #f3f4f6;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #4b5563;
        }

        .article-content {
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
        }

        .article-html-content {
          font-size: 1.0625rem;
          line-height: 1.8;
          color: #374151;
        }

        .article-html-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 2rem 0 1rem;
          color: #1f2937;
        }

        .article-html-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem;
          color: #374151;
        }

        .article-html-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem;
          color: #4b5563;
        }

        .article-html-content p {
          margin: 0 0 1.25rem;
        }

        .article-html-content ul,
        .article-html-content ol {
          margin: 0 0 1.25rem;
          padding-left: 1.5rem;
        }

        .article-html-content li {
          margin: 0.25rem 0;
        }

        .article-html-content blockquote {
          border-left: 4px solid #3b82f6;
          border-right: 4px solid #3b82f6;
          padding: 1rem 2rem;
          margin: 1.5rem auto;
          max-width: 80%;
          color: #4b5563;
          font-style: italic;
          text-align: center;
          background: #f9fafb;
          border-radius: 4px;
          line-height: 1.1;
        }

        .article-html-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }

        .article-html-content img.article-image {
          display: block;
          margin: 1.5rem auto 0 auto;
          cursor: zoom-in;
          transition: opacity 0.2s ease, box-shadow 0.2s ease;
        }

        .article-html-content img.article-image:hover {
          opacity: 0.9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .article-html-content img.article-image + p {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
          margin: 0.25rem auto 1.5rem auto;
          max-width: 80ch;
        }

        .article-html-content p.image-caption {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
          margin: 0.25rem auto 1.5rem auto;
          max-width: 80ch;
        }

        .article-html-content img.article-image[data-size="small"] {
          max-width: 25%;
        }

        .article-html-content img.article-image[data-size="medium"] {
          max-width: 50%;
        }

        .article-html-content img.article-image[data-size="large"] {
          max-width: 75%;
        }

        .article-html-content img.article-image[data-size="full"] {
          max-width: 100%;
        }

        .article-html-content figure.article-figure {
          display: table;
          margin: 1.5rem auto;
          text-align: center;
        }

        .article-html-content figure.figure-small {
          max-width: 25%;
        }

        .article-html-content figure.figure-medium {
          max-width: 50%;
        }

        .article-html-content figure.figure-large {
          max-width: 75%;
        }

        .article-html-content figure.figure-full {
          max-width: 100%;
        }

        .article-html-content figure img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0;
          cursor: zoom-in;
          transition: opacity 0.2s ease, box-shadow 0.2s ease;
        }

        .article-html-content figure img:hover {
          opacity: 0.9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .article-html-content figcaption {
          display: table-caption;
          caption-side: bottom;
          margin-top: 0.25rem;
          padding: 0.25rem 0;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
          text-align: center;
          max-width: 80ch;
        }

        .article-html-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .article-html-content a:hover {
          color: #2563eb;
        }

        .no-content {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 8px;
        }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          cursor: pointer;
          padding: 2rem;
        }

        .lightbox-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 90vw;
          max-height: 90vh;
          pointer-events: none;
        }

        .lightbox-content img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 4px;
          pointer-events: none;
        }

        .lightbox-caption {
          text-align: center;
          color: white;
          margin-top: 1rem;
          font-size: 1rem;
          font-style: italic;
          max-width: 600px;
          pointer-events: none;
        }

        .lightbox-close {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          line-height: 1;
          border-radius: 4px;
          pointer-events: auto;
          transition: background 0.2s ease;
        }

        .lightbox-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* PDF Viewer Styles */
        .pdf-viewer {
          width: 100%;
        }

        .pdf-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .pdf-embed {
          width: 100%;
        }

        .pdf-iframe {
          width: 100%;
          height: 80vh;
          min-height: 600px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        /* Dark Mode Support */
        body.dark-mode .preview-banner {
          background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
        }

        body.dark-mode .article-preview-content {
          background: #111827;
        }

        body.dark-mode .article-title {
          color: #f9fafb;
        }

        body.dark-mode .article-summary {
          color: #d1d5db;
        }

        body.dark-mode .article-category {
          background: #374151;
          color: #d1d5db;
        }

        body.dark-mode .article-type {
          background: #1e3a5f;
          color: #93c5fd;
        }

        body.dark-mode .article-tag {
          background: #374151;
          color: #d1d5db;
        }

        body.dark-mode .article-content {
          border-color: #374151;
        }

        body.dark-mode .article-html-content {
          color: #d1d5db;
        }

        body.dark-mode .article-html-content h2,
        body.dark-mode .article-html-content h3,
        body.dark-mode .article-html-content h4 {
          color: #f9fafb;
        }

        body.dark-mode .article-html-content blockquote {
          background: #1f2937;
          color: #9ca3af;
        }

        body.dark-mode .article-html-content figcaption {
          color: #9ca3af;
        }

        body.dark-mode .article-html-content p.image-caption {
          color: #9ca3af;
        }

        body.dark-mode .article-html-content img.article-image + p {
          color: #9ca3af;
        }

        body.dark-mode .no-content {
          background: #1f2937;
        }

        body.dark-mode .pdf-controls {
          background: #1f2937;
        }

        body.dark-mode .pdf-iframe {
          border-color: #374151;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .article-preview-content {
            padding: 1rem;
          }

          .article-title {
            font-size: 1.75rem;
          }

          .preview-banner {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .pdf-controls {
            flex-direction: column;
          }

          .pdf-iframe {
            height: 60vh;
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
}

export default ArticlePreview;
