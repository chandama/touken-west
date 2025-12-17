import React from 'react';
import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/articles/${article.slug}`} className="article-card">
      {article.coverImage?.thumbnailUrl || article.coverImage?.url ? (
        <div className="article-card-image">
          <img
            src={article.coverImage.thumbnailUrl || article.coverImage.url}
            alt={article.title}
          />
        </div>
      ) : (
        <div className="article-card-image article-card-placeholder">
          <span className="placeholder-icon">
            {article.contentType === 'pdf' ? 'PDF' : 'Article'}
          </span>
        </div>
      )}

      <div className="article-card-content">
        <div className="article-card-meta">
          <span className="article-card-category">{article.category}</span>
          <span className="article-card-type">
            {article.contentType === 'pdf' ? 'PDF' : 'HTML'}
          </span>
        </div>

        <h3 className="article-card-title">{article.title}</h3>

        {article.summary && (
          <p className="article-card-summary">
            {article.summary.length > 120
              ? article.summary.substring(0, 120) + '...'
              : article.summary
            }
          </p>
        )}

        <div className="article-card-footer">
          {article.author && (
            <span className="article-card-author">{article.author}</span>
          )}
          <span className="article-card-date">
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
