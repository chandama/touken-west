import React, { useState, useEffect, useCallback } from 'react';
import { parseMediaAttachments, getFullUrl, getThumbnailUrl, isImageFile, isPdfFile } from '../../utils/mediaUtils.js';
import ThumbnailStrip from './ThumbnailStrip.jsx';

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

  const currentMedia = media[selectedMediaIndex];
  const mainImageUrl = getFullUrl(currentMedia);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        if (isFullSizeOpen) {
          setIsFullSizeOpen(false);
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
  }, [onClose, onPrev, onNext, hasPrev, hasNext, selectedMediaIndex, media.length, isFullSizeOpen]);

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
                onClick={() => setIsFullSizeOpen(true)}
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

        {/* Thumbnail strip at bottom */}
        <ThumbnailStrip
          media={media}
          selectedIndex={selectedMediaIndex}
          onSelect={setSelectedMediaIndex}
        />
      </div>

      {/* Full-size image overlay */}
      {isFullSizeOpen && currentMedia && isImageFile(currentMedia) && mainImageUrl && (
        <div
          className="fullsize-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullSizeOpen(false);
          }}
        >
          <button
            className="fullsize-close"
            onClick={() => setIsFullSizeOpen(false)}
            aria-label="Close full size view"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          <img
            src={mainImageUrl}
            alt={currentMedia.caption || `${sword.Smith || 'Unknown'} ${sword.Type || 'Sword'} - Full Size`}
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
