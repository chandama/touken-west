import React, { useState, useEffect } from 'react';
import LibrarySwordCard from './LibrarySwordCard.jsx';

/**
 * Gallery grid component with pagination
 */
const LibraryGallery = ({ swords, onSwordSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // 4x6 grid on desktop

  const totalPages = Math.ceil(swords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSwords = swords.slice(startIndex, endIndex);

  // Reset to page 1 when sword list changes (due to filter changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [swords.length]);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (swords.length === 0) {
    return (
      <div className="library-gallery-empty">
        <svg viewBox="0 0 24 24" fill="currentColor" className="empty-icon">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
        <h3>No swords found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="library-gallery">
      <div className="gallery-grid">
        {currentSwords.map(sword => (
          <LibrarySwordCard
            key={sword.Index}
            sword={sword}
            onClick={onSwordSelect}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            &#x00AB;
          </button>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            &#x2039;
          </button>

          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              className={`pagination-btn pagination-num ${pageNum === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            &#x203A;
          </button>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            &#x00BB;
          </button>

          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({swords.length.toLocaleString()} swords)
          </span>
        </div>
      )}
    </div>
  );
};

export default LibraryGallery;
