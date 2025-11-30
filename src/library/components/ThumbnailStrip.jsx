import React from 'react';
import { getThumbnailUrl, isPdfFile, isImageFile } from '../../utils/mediaUtils.js';

/**
 * Horizontal scrollable strip of media thumbnails for the lightbox
 */
const ThumbnailStrip = ({ media, selectedIndex, onSelect }) => {
  // Don't render if only one item
  if (!media || media.length <= 1) return null;

  return (
    <div className="thumbnail-strip">
      <div className="thumbnail-strip-inner">
        {media.map((item, index) => {
          const thumbnailUrl = getThumbnailUrl(item);
          const isSelected = index === selectedIndex;
          const isImage = isImageFile(item);
          const isPdf = isPdfFile(item);

          return (
            <button
              key={index}
              className={`thumbnail-strip-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelect(index)}
              aria-label={item.caption || (isPdf ? `PDF ${index + 1}` : `Image ${index + 1}`)}
              aria-current={isSelected ? 'true' : undefined}
            >
              {isImage && thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={item.caption || `Thumbnail ${index + 1}`}
                  loading="lazy"
                />
              ) : isPdf ? (
                <div className="thumbnail-pdf">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                </div>
              ) : (
                <div className="thumbnail-placeholder">
                  {index + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThumbnailStrip;
