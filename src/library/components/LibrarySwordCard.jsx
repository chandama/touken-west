import React from 'react';
import { getPriorityThumbnail, getThumbnailUrl, isPdfFile, isImageFile } from '../../utils/mediaUtils.js';

/**
 * Get the count of media attachments for a sword
 */
const getMediaCount = (sword) => {
  try {
    const media = sword.MediaAttachments;
    if (!media || media === 'NA' || media === '[]') return 0;
    const parsed = JSON.parse(media);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

/**
 * Gallery card component for displaying a sword with its thumbnail
 */
const LibrarySwordCard = ({ sword, onClick }) => {
  const thumbnail = getPriorityThumbnail(sword);
  const thumbnailUrl = getThumbnailUrl(thumbnail);
  const mediaCount = getMediaCount(sword);

  // Check if the thumbnail is actually an image (not a PDF)
  const isImage = thumbnail && isImageFile(thumbnail);
  const isPdf = thumbnail && isPdfFile(thumbnail);

  return (
    <div
      className="library-sword-card"
      onClick={() => onClick(sword)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(sword);
        }
      }}
      aria-label={`View details for ${sword.Smith || 'Unknown Smith'} ${sword.Type || 'Sword'}`}
    >
      <div className="card-thumbnail">
        {isImage && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${sword.Smith || 'Unknown'} ${sword.Type || 'Sword'}`}
            loading="lazy"
          />
        ) : isPdf ? (
          <div className="card-pdf-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor" className="pdf-icon">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span>PDF</span>
          </div>
        ) : (
          <div className="card-no-image">
            <svg viewBox="0 0 24 24" fill="currentColor" className="no-image-icon">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="card-info">
        <div className="card-info-header">
          <div className="card-smith" title={sword.Smith}>
            {sword.Smith || 'Unknown Smith'}
          </div>
          {mediaCount > 0 && (
            <span className="card-media-badge">{mediaCount}</span>
          )}
        </div>
        <div className="card-type">
          {sword.Type || 'Unknown Type'}
        </div>
        {sword.Mei && sword.Mei !== 'NA' && sword.Mei !== '' && (
          <div className="card-mei" title={sword.Mei}>
            {sword.Mei}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySwordCard;
