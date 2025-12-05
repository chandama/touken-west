/**
 * URL Filter Utilities
 * Handles encoding/decoding filter state to/from URL parameters
 */

// Filter keys that map directly to URL params
const SIMPLE_FILTERS = ['school', 'smith', 'type', 'authentication', 'province', 'hasMedia'];
const RANGE_FILTERS = ['nagasaMin', 'nagasaMax'];
const ARRAY_FILTERS = ['periods'];

/**
 * Parse URL parameters into filter state and search tags
 * @param {URLSearchParams} params - URL search parameters
 * @returns {{ filters: object, searchTags: string[] }}
 */
export function parseUrlFilters(params) {
  const filters = {
    school: '',
    smith: '',
    type: '',
    authentication: '',
    province: '',
    hasMedia: '',
    nagasaMin: '',
    nagasaMax: '',
    periods: []
  };

  // Parse simple string filters
  SIMPLE_FILTERS.forEach(key => {
    const value = params.get(key);
    if (value) {
      filters[key] = value;
    }
  });

  // Parse range filters
  RANGE_FILTERS.forEach(key => {
    const value = params.get(key);
    if (value) {
      filters[key] = value;
    }
  });

  // Parse array filters (periods can appear multiple times)
  ARRAY_FILTERS.forEach(key => {
    const values = params.getAll(key);
    if (values.length > 0) {
      filters[key] = values;
    }
  });

  // Parse search tags (can appear multiple times)
  const searchTags = params.getAll('search');

  return { filters, searchTags };
}

/**
 * Convert filter state and search tags to URL parameters
 * @param {object} filters - Current filter state
 * @param {string[]} searchTags - Current search tags
 * @returns {URLSearchParams}
 */
export function filtersToUrlParams(filters, searchTags) {
  const params = new URLSearchParams();

  // Add simple string filters (only if non-empty)
  SIMPLE_FILTERS.forEach(key => {
    if (filters[key] && filters[key] !== '') {
      params.set(key, filters[key]);
    }
  });

  // Add range filters (only if non-empty)
  RANGE_FILTERS.forEach(key => {
    if (filters[key] && filters[key] !== '') {
      params.set(key, filters[key]);
    }
  });

  // Add array filters (each value as separate param)
  ARRAY_FILTERS.forEach(key => {
    if (filters[key] && filters[key].length > 0) {
      filters[key].forEach(value => {
        params.append(key, value);
      });
    }
  });

  // Add search tags (each tag as separate param)
  if (searchTags && searchTags.length > 0) {
    searchTags.forEach(tag => {
      params.append('search', tag);
    });
  }

  return params;
}

/**
 * Update the browser URL with current filters (without page reload)
 * @param {object} filters - Current filter state
 * @param {string[]} searchTags - Current search tags
 */
export function updateUrlWithFilters(filters, searchTags) {
  const params = filtersToUrlParams(filters, searchTags);
  const queryString = params.toString();
  const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;

  // Use replaceState to update URL without adding to history
  window.history.replaceState({}, '', newUrl);
}

/**
 * Check if any filters or search tags are active
 * @param {object} filters - Current filter state
 * @param {string[]} searchTags - Current search tags
 * @returns {boolean}
 */
export function hasActiveFilters(filters, searchTags) {
  const hasSimpleFilter = SIMPLE_FILTERS.some(key => filters[key] && filters[key] !== '');
  const hasRangeFilter = RANGE_FILTERS.some(key => filters[key] && filters[key] !== '');
  const hasArrayFilter = ARRAY_FILTERS.some(key => filters[key] && filters[key].length > 0);
  const hasSearch = searchTags && searchTags.length > 0;

  return hasSimpleFilter || hasRangeFilter || hasArrayFilter || hasSearch;
}
