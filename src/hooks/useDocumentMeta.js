import { useEffect } from 'react';

/**
 * Custom hook to manage document meta tags for SEO
 * Works with React 19 (no external dependencies needed)
 *
 * @param {Object} options - Meta tag options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.canonicalUrl - Canonical URL for the page
 * @param {string} options.ogImage - Open Graph image URL
 * @param {string} options.ogType - Open Graph type (default: 'website')
 */
export default function useDocumentMeta({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website'
} = {}) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Helper to set or create meta tag
    const setMetaTag = (selector, content, createAttrs = {}) => {
      if (!content) return;

      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        Object.entries(createAttrs).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel, href) => {
      if (!href) return;

      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Standard meta tags
    setMetaTag('meta[name="description"]', description, { name: 'description' });

    // Open Graph tags
    setMetaTag('meta[property="og:title"]', title, { property: 'og:title' });
    setMetaTag('meta[property="og:description"]', description, { property: 'og:description' });
    setMetaTag('meta[property="og:type"]', ogType, { property: 'og:type' });
    setMetaTag('meta[property="og:url"]', canonicalUrl, { property: 'og:url' });
    setMetaTag('meta[property="og:image"]', ogImage, { property: 'og:image' });

    // Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', ogImage ? 'summary_large_image' : 'summary', { name: 'twitter:card' });
    setMetaTag('meta[name="twitter:title"]', title, { name: 'twitter:title' });
    setMetaTag('meta[name="twitter:description"]', description, { name: 'twitter:description' });
    setMetaTag('meta[name="twitter:image"]', ogImage, { name: 'twitter:image' });

    // Canonical URL
    setLinkTag('canonical', canonicalUrl);

  }, [title, description, canonicalUrl, ogImage, ogType]);
}
