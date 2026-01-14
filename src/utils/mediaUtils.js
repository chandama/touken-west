/**
 * Media utility functions for thumbnail selection and media handling
 */

/**
 * Parse MediaAttachments JSON string to array
 * Normalizes different formats:
 * - Array of objects with url property: [{"url": "...", ...}]
 * - Array of strings (Juyo 48 format): ["/path/to/file.jpg"]
 *
 * @param {string} mediaStr - JSON string of media attachments
 * @returns {Array} - Parsed array of media objects with url property
 */
export function parseMediaAttachments(mediaStr) {
  if (!mediaStr || mediaStr === 'NA' || mediaStr === '[]' || mediaStr === '') {
    return [];
  }
  try {
    const parsed = JSON.parse(mediaStr);
    if (!Array.isArray(parsed)) return [];

    // Normalize: convert string items to objects with url property
    return parsed.map(item => {
      if (typeof item === 'string') {
        // String path - convert to object format
        return { url: item };
      }
      return item;
    });
  } catch (error) {
    console.error('Error parsing MediaAttachments:', error);
    return [];
  }
}

/**
 * Check if sword has valid media attachments
 * @param {Object} sword - Sword object
 * @returns {boolean}
 */
export function hasValidMedia(sword) {
  const media = parseMediaAttachments(sword.MediaAttachments);
  return media.length > 0;
}

/**
 * Helper to check if media item has a specific tag (case-insensitive)
 * @param {Object} item - Media attachment object
 * @param {string} tagPattern - Tag pattern to search for
 * @returns {boolean}
 */
function hasTag(item, tagPattern) {
  if (!item.tags || !Array.isArray(item.tags)) return false;
  const lowerPattern = tagPattern.toLowerCase();
  return item.tags.some(tag =>
    tag.toLowerCase().includes(lowerPattern)
  );
}

/**
 * Helper to check if media item matches a category (case-insensitive)
 * @param {Object} item - Media attachment object
 * @param {string} categoryPattern - Category pattern to search for
 * @returns {boolean}
 */
function hasCategory(item, categoryPattern) {
  if (!item.category) return false;
  return item.category.toLowerCase().includes(categoryPattern.toLowerCase());
}

/**
 * Check if media item is a certificate/papers type
 * @param {Object} item - Media attachment object
 * @returns {boolean}
 */
function isCertificate(item) {
  return hasCategory(item, 'certificate') || hasCategory(item, 'papers');
}

/**
 * Get priority thumbnail for a sword
 * Priority order:
 * 0. Manual override (isCoverImage flag set by admin)
 * 1. Tokubetsu Juyo certificate
 * 2. Juyo certificate (not Tokubetsu)
 * 3. Full Blade/Sugata image
 * 4. First image in the array
 *
 * @param {Object} sword - Sword object
 * @returns {Object|null} - Media object with thumbnailUrl/url, or null
 */
export function getPriorityThumbnail(sword) {
  const media = parseMediaAttachments(sword.MediaAttachments);
  if (media.length === 0) return null;

  // Priority 0: Manual cover image override
  const coverImage = media.find(item => item.isCoverImage);
  if (coverImage) return coverImage;

  // Priority 1: Tokubetsu Juyo certificate
  const tokujuCert = media.find(item =>
    hasTag(item, 'tokubetsu juyo') && isCertificate(item)
  );
  if (tokujuCert) return tokujuCert;

  // Priority 2: Juyo certificate (but not Tokubetsu Juyo)
  const juyoCert = media.find(item =>
    hasTag(item, 'juyo') &&
    !hasTag(item, 'tokubetsu juyo') &&
    isCertificate(item)
  );
  if (juyoCert) return juyoCert;

  // Priority 3: Full Blade or Sugata image
  const bladeImage = media.find(item =>
    hasCategory(item, 'full blade') ||
    hasCategory(item, 'sugata')
  );
  if (bladeImage) return bladeImage;

  // Priority 4: First image
  return media[0];
}

/**
 * Get thumbnail URL from media item (prefers thumbnailUrl over url)
 * @param {Object} mediaItem - Media attachment object
 * @returns {string|null}
 */
export function getThumbnailUrl(mediaItem) {
  if (!mediaItem) return null;
  return mediaItem.thumbnailUrl || mediaItem.url || null;
}

/**
 * Get full-size URL from media item
 * @param {Object} mediaItem - Media attachment object
 * @returns {string|null}
 */
export function getFullUrl(mediaItem) {
  if (!mediaItem) return null;
  return mediaItem.url || mediaItem.thumbnailUrl || null;
}

/**
 * Check if a media item is an image file
 * @param {Object} mediaItem - Media attachment object
 * @returns {boolean}
 */
export function isImageFile(mediaItem) {
  if (!mediaItem || !mediaItem.url) return false;
  const lowerPath = mediaItem.url.toLowerCase();
  return lowerPath.endsWith('.jpg') ||
         lowerPath.endsWith('.jpeg') ||
         lowerPath.endsWith('.png') ||
         lowerPath.endsWith('.gif') ||
         lowerPath.endsWith('.webp');
}

/**
 * Check if a media item is a PDF file
 * @param {Object} mediaItem - Media attachment object
 * @returns {boolean}
 */
export function isPdfFile(mediaItem) {
  if (!mediaItem || !mediaItem.url) return false;
  return mediaItem.url.toLowerCase().endsWith('.pdf');
}

/**
 * Check if sword has a translation PDF available
 * Looks for PDFs with "translation" or "translated" in caption, tags, or filename
 * @param {Object} sword - Sword object
 * @returns {boolean}
 */
export function hasTranslationPdf(sword) {
  try {
    const media = parseMediaAttachments(sword.MediaAttachments);
    if (media.length === 0) return false;

    // Filter for PDFs
    const pdfs = media.filter(item => {
      // Check mimeType first (most reliable)
      if (item.mimeType === 'application/pdf') return true;
      // Fallback to file extension check
      return isPdfFile(item);
    });

    // Check if any PDF has translation-related keywords
    return pdfs.some(pdf => {
      // Check caption
      const caption = (pdf.caption || '').toLowerCase();
      if (caption.includes('translation') || caption.includes('translated')) {
        return true;
      }

      // Check tags
      if (pdf.tags && Array.isArray(pdf.tags)) {
        const hasTranslationTag = pdf.tags.some(tag =>
          tag.toLowerCase().includes('translation') ||
          tag.toLowerCase().includes('translated')
        );
        if (hasTranslationTag) return true;
      }

      // Check original filename
      const filename = (pdf.originalFilename || '').toLowerCase();
      if (filename.includes('translation') || filename.includes('translated')) {
        return true;
      }

      return false;
    });
  } catch (error) {
    console.error('Error checking for translation PDF:', error);
    return false;
  }
}
