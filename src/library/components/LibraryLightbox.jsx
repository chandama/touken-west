import React, { useState, useEffect, useCallback, useRef } from 'react';
import { parseMediaAttachments, getFullUrl, getThumbnailUrl, isImageFile, isPdfFile } from '../../utils/mediaUtils.js';
import ThumbnailStrip from './ThumbnailStrip.jsx';

// Hook to detect mobile viewport
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

/**
 * Lightbox component for viewing sword details with media
 * Layout: Large image (left 70%), Details panel (right 30%), Thumbnail strip at bottom
 */
const LibraryLightbox = ({
  sword,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentIndex,
  totalCount
}) => {
  const media = parseMediaAttachments(sword.MediaAttachments);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isFullSizeOpen, setIsFullSizeOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [fullSizeImageUrl, setFullSizeImageUrl] = useState(null);
  const isMobile = useIsMobile();
  const mobileScrollRef = useRef(null);

  // Touch swipe tracking for mobile sword navigation
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndX = useRef(null);
  const touchEndY = useRef(null);

  const currentMedia = media[selectedMediaIndex];
  const mainImageUrl = getFullUrl(currentMedia);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        if (fullSizeImageUrl) {
          setFullSizeImageUrl(null);
        } else {
          onClose();
        }
        break;
      case 'ArrowLeft':
        if (e.shiftKey) {
          // Shift+Left = Previous sword
          if (hasPrev) onPrev();
        } else {
          // Left = Previous image, or previous sword if at first image
          if (selectedMediaIndex > 0) {
            setSelectedMediaIndex(prev => prev - 1);
          } else if (hasPrev) {
            onPrev();
          }
        }
        break;
      case 'ArrowRight':
        if (e.shiftKey) {
          // Shift+Right = Next sword
          if (hasNext) onNext();
        } else {
          // Right = Next image, or next sword if at last image
          if (selectedMediaIndex < media.length - 1) {
            setSelectedMediaIndex(prev => prev + 1);
          } else if (hasNext) {
            onNext();
          }
        }
        break;
      default:
        break;
    }
  }, [onClose, onPrev, onNext, hasPrev, hasNext, selectedMediaIndex, media.length, fullSizeImageUrl]);

  // Touch swipe handlers for mobile sword navigation
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current !== null && touchStartY.current !== null
      ? Math.abs(touchEndY.current - touchStartY.current)
      : 0;
    const minSwipeDistance = 50;

    // Only trigger if horizontal swipe is dominant (not scrolling vertically)
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > deltaY) {
      if (deltaX < 0 && hasNext) {
        // Swipe left = next sword
        onNext();
      } else if (deltaX > 0 && hasPrev) {
        // Swipe right = previous sword
        onPrev();
      }
    }

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  }, [hasNext, hasPrev, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Reset to first image when sword changes
  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [sword.Index]);

  // Detail row helper component
  const DetailRow = ({ label, value }) => {
    if (!value || value === 'NA' || value === '') return null;
    return (
      <div className="lightbox-detail-row">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">{value}</span>
      </div>
    );
  };

  // Mobile layout - vertical scroll through all images
  if (isMobile) {
    return (
      <div className="library-lightbox-overlay mobile" onClick={onClose}>
        <div
          className="library-lightbox-mobile"
          onClick={e => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header with close and navigation */}
          <div className="mobile-lightbox-header">
            <button className="lightbox-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            <div className="mobile-lightbox-title">
              <span className="mobile-smith">{sword.Smith || 'Unknown'}</span>
              <span className="mobile-type">{sword.Type || ''}</span>
            </div>
            <div className="mobile-lightbox-counter">
              {currentIndex + 1} / {totalCount}
            </div>
          </div>

          {/* Sword navigation arrows */}
          <div className="mobile-sword-nav">
            <button
              className="mobile-nav-btn"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous sword"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
              Prev
            </button>
            <button
              className="mobile-nav-btn"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next sword"
            >
              Next
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>

          {/* Scrollable content area with all images */}
          <div className="mobile-scroll-content" ref={mobileScrollRef}>
            {/* All media items in vertical scroll */}
            <div className="mobile-media-list">
              {media.map((item, index) => {
                const imageUrl = getFullUrl(item);
                return (
                  <div key={index} className="mobile-media-item">
                    {isImageFile(item) && imageUrl && (
                      <img
                        src={imageUrl}
                        alt={item.caption || `Image ${index + 1}`}
                        className="mobile-media-image"
                        onClick={() => setFullSizeImageUrl(imageUrl)}
                      />
                    )}
                    {isPdfFile(item) && imageUrl && (
                      <div className="mobile-pdf-placeholder" onClick={() => window.open(imageUrl, '_blank')}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,13H8V11H10V13M14,13H12V11H14V13M10,17H8V15H10V17M14,17H12V15H14V17Z"/>
                        </svg>
                        <span>Open PDF</span>
                      </div>
                    )}
                    {item.caption && (
                      <div className="mobile-media-caption">
                        {item.caption}
                        {item.category && <span className="mobile-category"> ({item.category})</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sword details section */}
            <div className="mobile-details-section">
              <h3 className="mobile-section-title">Sword Details</h3>

              {sword.isMeito && (
                <div className="lightbox-meito">
                  <span className="meito-badge">★ Meito</span>
                  <span className="meito-name">{sword.meitoName}</span>
                </div>
              )}

              <div className="mobile-details-grid">
                <DetailRow label="Index" value={sword.Index} />
                <DetailRow label="School" value={sword.School} />
                <DetailRow label="Mei" value={sword.Mei} />
                <DetailRow label="Province" value={sword.Province} />
                <DetailRow label="Period" value={sword.Period} />
                <DetailRow label="Authentication" value={sword.Authentication} />
                <DetailRow label="Nagasa" value={sword.Nagasa ? `${sword.Nagasa} cm` : null} />
                <DetailRow label="Sori" value={sword.Sori ? `${sword.Sori} cm` : null} />
              </div>

              {sword.Description && sword.Description !== 'NA' && (
                <div className="mobile-description">
                  <h4>Description</h4>
                  <p>{sword.Description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-size image overlay for mobile */}
        {fullSizeImageUrl && (
          <div
            className="fullsize-overlay"
            onClick={(e) => {
              e.stopPropagation();
              setFullSizeImageUrl(null);
            }}
          >
            <button
              className="fullsize-close"
              onClick={() => setFullSizeImageUrl(null)}
              aria-label="Close full size view"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            <img
              src={fullSizeImageUrl}
              alt="Full size view"
              className="fullsize-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop layout - original side-by-side layout
  return (
    <div className="library-lightbox-overlay" onClick={onClose}>
      <div className="library-lightbox" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Previous sword navigation */}
        {hasPrev && (
          <button
            className="lightbox-nav lightbox-nav-prev"
            onClick={onPrev}
            aria-label="Previous sword"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
        )}

        {/* Next sword navigation */}
        {hasNext && (
          <button
            className="lightbox-nav lightbox-nav-next"
            onClick={onNext}
            aria-label="Next sword"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        )}

        <div className="lightbox-content">
          {/* Main image area (left ~70%) */}
          <div className="lightbox-main">
            {currentMedia && isImageFile(currentMedia) && mainImageUrl && (
              <img
                src={mainImageUrl}
                alt={currentMedia.caption || `${sword.Smith || 'Unknown'} ${sword.Type || 'Sword'}`}
                className="lightbox-main-image clickable"
                onClick={() => setFullSizeImageUrl(mainImageUrl)}
                title="Click to view full size"
              />
            )}
            {currentMedia && isPdfFile(currentMedia) && mainImageUrl && (
              <div className="lightbox-pdf-container">
                <iframe
                  src={`${mainImageUrl}#toolbar=0&navpanes=0`}
                  title={currentMedia.caption || 'PDF Document'}
                  className="lightbox-pdf"
                />
                <button
                  className="lightbox-pdf-open"
                  onClick={() => window.open(mainImageUrl, '_blank')}
                >
                  Open PDF in new tab
                </button>
              </div>
            )}
            {currentMedia && currentMedia.caption && (
              <div className="lightbox-caption">
                {currentMedia.caption}
                {currentMedia.category && (
                  <span className="lightbox-category"> ({currentMedia.category})</span>
                )}
              </div>
            )}
          </div>

          {/* Details panel (right ~30%) */}
          <div className="lightbox-details">
            <div className="lightbox-details-header">
              <h2 className="lightbox-smith">{sword.Smith || 'Unknown Smith'}</h2>
              <div className="lightbox-type">{sword.Type || 'Unknown Type'}</div>
            </div>

            <div className="lightbox-details-content">
              {sword.isMeito && (
                <div className="lightbox-meito">
                  <span className="meito-badge">★ Meito</span>
                  <span className="meito-name">{sword.meitoName}</span>
                </div>
              )}

              <div className="lightbox-section">
                <h3>Basic Information</h3>
                <DetailRow label="Index" value={sword.Index} />
                <DetailRow label="School" value={sword.School} />
                <DetailRow label="Mei (Signature)" value={sword.Mei} />
              </div>

              <div className="lightbox-section">
                <h3>Dimensions</h3>
                <DetailRow label="Nagasa (Length)" value={sword.Nagasa ? `${sword.Nagasa} cm` : null} />
                <DetailRow label="Sori (Curvature)" value={sword.Sori ? `${sword.Sori} cm` : null} />
                <DetailRow label="Moto (Width at base)" value={sword.Moto ? `${sword.Moto} cm` : null} />
                <DetailRow label="Saki (Width at tip)" value={sword.Saki ? `${sword.Saki} cm` : null} />
              </div>

              <div className="lightbox-section">
                <h3>Tang (Nakago)</h3>
                <DetailRow label="Condition" value={sword.Nakago} />
                <DetailRow label="Mekugi-ana (Holes)" value={sword.Ana} />
                <DetailRow label="Length" value={sword.Length ? `${sword.Length} cm` : null} />
              </div>

              <div className="lightbox-section">
                <h3>Historical Context</h3>
                <DetailRow label="Province" value={sword.Province} />
                <DetailRow label="Period" value={sword.Period} />
                <DetailRow label="Authentication" value={sword.Authentication} />
              </div>

              {sword.Description && sword.Description !== 'NA' && (
                <div className="lightbox-section">
                  <h3>Description</h3>
                  <p className="lightbox-description">{sword.Description}</p>
                </div>
              )}

              <div className="lightbox-counter">
                Sword {currentIndex + 1} of {totalCount}
                {media.length > 1 && (
                  <span className="media-counter">
                    {' '}| Image {selectedMediaIndex + 1} of {media.length}
                  </span>
                )}
              </div>

              <div className="lightbox-keyboard-hint">
                <span>← → Navigate images</span>
                <span>Shift + ← → Navigate swords</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail strip at bottom */}
        <ThumbnailStrip
          media={media}
          selectedIndex={selectedMediaIndex}
          onSelect={setSelectedMediaIndex}
        />
      </div>

      {/* Full-size image overlay */}
      {fullSizeImageUrl && (
        <div
          className="fullsize-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setFullSizeImageUrl(null);
          }}
        >
          <button
            className="fullsize-close"
            onClick={() => setFullSizeImageUrl(null)}
            aria-label="Close full size view"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          <img
            src={fullSizeImageUrl}
            alt="Full size view"
            className="fullsize-image"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="fullsize-hint">Click outside image or press Esc to close</div>
        </div>
      )}
    </div>
  );
};

export default LibraryLightbox;
