import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PdfViewer from '../components/PdfViewer.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

function ArticleViewPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, src: '', caption: '' });

  // Scroll position persistence
  useEffect(() => {
    const scrollKey = `article-scroll-${slug}`;

    // Restore scroll position after content loads
    const savedPosition = sessionStorage.getItem(scrollKey);
    if (savedPosition && !loading) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }, 100);
    }

    // Save scroll position on scroll (debounced)
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem(scrollKey, window.scrollY.toString());
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);

    // Save position before page unload
    const handleBeforeUnload = () => {
      sessionStorage.setItem(scrollKey, window.scrollY.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [slug, loading]);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

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

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/articles/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found');
        }
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="article-view-page">
        <div className="loading">Loading article...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-view-page">
        <div className="article-error">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/articles" className="btn-primary">
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="article-view-page">
      <div className="article-header">
        <Link to="/articles" className="back-link">
          &larr; Back to Articles
        </Link>

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
        </div>

        <h1 className="article-title">{article.title}</h1>

        {article.summary && (
          <p className="article-summary">{article.summary}</p>
        )}

        <div className="article-info">
          {article.author && (
            <span className="article-author">By {article.author}</span>
          )}
          {article.publishedAt && (
            <span className="article-date">
              Published {formatDate(article.publishedAt)}
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
              <p>PDF document not available.</p>
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
              <p>Article content not available.</p>
            </div>
          )
        )}
      </div>

      {/* Lightbox for viewing images full size - click anywhere to close */}
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
    </div>
  );
}

export default ArticleViewPage;
