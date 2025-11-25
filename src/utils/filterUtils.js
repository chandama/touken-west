import { getSwordPeriods, PERIOD_DEFINITIONS } from './periodUtils.js';

/**
 * Utility functions for dynamic cascading filters
 * These functions calculate available filter options based on current selections
 */

/**
 * Get unique values for a specific field from filtered data
 * @param {Array} data - Array of sword objects
 * @param {string} field - Field name to extract values from
 * @returns {Array} - Sorted array of unique values (excluding 'NA')
 */
export const getUniqueValues = (data, field) => {
  const values = data
    .map(item => item[field])
    .filter(value => value && value !== 'NA' && value !== 'XX');

  return [...new Set(values)].sort();
};

/**
 * Get available filter options based on current filters
 * This implements cascading filter logic where options update based on selections
 * @param {Array} allSwords - Complete array of all swords
 * @param {Object} currentFilters - Current filter selections
 * @param {Array} searchTags - Active search tags
 * @returns {Object} - Object containing arrays of available options for each filter
 */
export const getAvailableFilterOptions = (allSwords, currentFilters, searchTags = []) => {
  // First, filter swords based on search tags
  let filteredData = allSwords;

  if (searchTags.length > 0) {
    filteredData = allSwords.filter(sword => {
      return searchTags.every(tag => {
        const lowerTag = tag.toLowerCase();
        return Object.values(sword).some(value =>
          String(value).toLowerCase().includes(lowerTag)
        );
      });
    });
  }

  // Helper function to filter based on a specific set of criteria
  const filterByCriteria = (data, criteria) => {
    return data.filter(sword => {
      return Object.entries(criteria).every(([key, value]) => {
        if (!value) return true; // Skip empty filters

        // Handle special authentication logic
        if (key === 'authentication') {
          if (!sword.Authentication) return false;
          const authStr = String(sword.Authentication);

          switch (value) {
            case 'Juyo':
              return /Juyo\s+(\d{1,2}|XX)/.test(authStr);
            case 'Tokubetsu Juyo':
              return /Tokubetsu Juyo\s+(\d{1,2}|XX)/.test(authStr);
            case 'Hozon':
              return authStr.includes('Hozon') && !authStr.includes('Tokubetsu Hozon');
            default:
              return authStr.includes(value);
          }
        }

        return sword[capitalizeField(key)] === value;
      });
    });
  };

  // Helper to capitalize field names to match sword object keys
  const capitalizeField = (field) => {
    const fieldMap = {
      school: 'School',
      smith: 'Smith',
      type: 'Type',
      authentication: 'Authentication',
      province: 'Province'
    };
    return fieldMap[field] || field;
  };

  // Calculate available options for each filter
  const schools = getUniqueValues(
    filterByCriteria(filteredData, {
      smith: currentFilters.smith,
      type: currentFilters.type,
      authentication: currentFilters.authentication,
      province: currentFilters.province
    }),
    'School'
  );

  const smiths = getUniqueValues(
    filterByCriteria(filteredData, {
      school: currentFilters.school,
      type: currentFilters.type,
      authentication: currentFilters.authentication,
      province: currentFilters.province
    }),
    'Smith'
  );

  const types = getUniqueValues(
    filterByCriteria(filteredData, {
      school: currentFilters.school,
      smith: currentFilters.smith,
      authentication: currentFilters.authentication,
      province: currentFilters.province
    }),
    'Type'
  );

  const provinces = getUniqueValues(
    filterByCriteria(filteredData, {
      school: currentFilters.school,
      smith: currentFilters.smith,
      type: currentFilters.type,
      authentication: currentFilters.authentication
    }),
    'Province'
  );

  // Authentication levels are static from CLAUDE.md
  const authenticationLevels = [
    'Kokuho',
    'Juyo Bunkazai',
    'Tokubetsu Juyo',
    'Juyo',
    'Juyo Bijutsuhin',
    'Tokubetsu Hozon',
    'Hozon'
  ];

  return {
    schools,
    smiths,
    types,
    provinces,
    authenticationLevels
  };
};

/**
 * Count how many results match each filter option
 * @param {Array} allSwords - Complete array of all swords
 * @param {Object} currentFilters - Current filter selections
 * @param {Array} searchTags - Active search tags
 * @param {string} filterField - Field to count options for
 * @returns {Object} - Object mapping option values to counts
 */
export const getOptionCounts = (allSwords, currentFilters, searchTags, filterField) => {
  // Filter swords based on search tags first
  let filteredData = allSwords;

  if (searchTags.length > 0) {
    filteredData = allSwords.filter(sword => {
      return searchTags.every(tag => {
        const lowerTag = tag.toLowerCase();
        return Object.values(sword).some(value =>
          String(value).toLowerCase().includes(lowerTag)
        );
      });
    });
  }

  // Apply all filters EXCEPT the one we're counting for
  filteredData = filteredData.filter(sword => {
    // School filter (skip if counting for school)
    if (filterField !== 'school' && currentFilters.school && sword.School !== currentFilters.school) return false;

    // Smith filter (skip if counting for smith)
    if (filterField !== 'smith' && currentFilters.smith && sword.Smith !== currentFilters.smith) return false;

    // Type filter (skip if counting for type)
    if (filterField !== 'type' && currentFilters.type && sword.Type !== currentFilters.type) return false;

    // Province filter (skip if counting for province)
    if (filterField !== 'province' && currentFilters.province && sword.Province !== currentFilters.province) return false;

    // Authentication filter (skip if counting for authentication)
    if (filterField !== 'authentication' && currentFilters.authentication) {
      if (!sword.Authentication) return false;
      const authStr = String(sword.Authentication);
      switch (currentFilters.authentication) {
        case 'Juyo':
          if (!/Juyo\s+(\d{1,2}|XX)/.test(authStr)) return false;
          break;
        case 'Tokubetsu Juyo':
          if (!/Tokubetsu Juyo\s+(\d{1,2}|XX)/.test(authStr)) return false;
          break;
        case 'Hozon':
          if (!authStr.includes('Hozon') || authStr.includes('Tokubetsu Hozon')) return false;
          break;
        default:
          if (!authStr.includes(currentFilters.authentication)) return false;
      }
    }

    // Nagasa filter
    if (currentFilters.nagasaMin || currentFilters.nagasaMax) {
      if (!sword.Nagasa) return false;
      const nagasa = parseFloat(sword.Nagasa);
      if (isNaN(nagasa)) return false;
      if (currentFilters.nagasaMin && nagasa < parseFloat(currentFilters.nagasaMin)) return false;
      if (currentFilters.nagasaMax && nagasa > parseFloat(currentFilters.nagasaMax)) return false;
    }

    // Media filter
    if (currentFilters.hasMedia) {
      const hasMedia = sword.MediaAttachments && sword.MediaAttachments !== 'NA' && sword.MediaAttachments !== '[]';
      if (currentFilters.hasMedia === 'true' && !hasMedia) return false;
      if (currentFilters.hasMedia === 'false' && hasMedia) return false;
    }

    return true;
  });

  // Count occurrences of each option
  const counts = {};
  const fieldName = filterField.charAt(0).toUpperCase() + filterField.slice(1);

  filteredData.forEach(sword => {
    const value = sword[fieldName];
    if (value && value !== 'NA' && value !== 'XX') {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return counts;
};

/**
 * Count how many results match each authentication level
 * @param {Array} allSwords - Complete array of all swords
 * @param {Object} currentFilters - Current filter selections (excluding authentication)
 * @param {Array} searchTags - Active search tags
 * @returns {Object} - Object mapping authentication levels to counts
 */
export const getAuthenticationCounts = (allSwords, currentFilters, searchTags) => {
  // Filter swords based on search tags first
  let filteredData = allSwords;

  if (searchTags.length > 0) {
    filteredData = allSwords.filter(sword => {
      return searchTags.every(tag => {
        const lowerTag = tag.toLowerCase();
        return Object.values(sword).some(value =>
          String(value).toLowerCase().includes(lowerTag)
        );
      });
    });
  }

  // Apply all other filters (excluding authentication)
  filteredData = filteredData.filter(sword => {
    if (currentFilters.school && sword.School !== currentFilters.school) return false;
    if (currentFilters.smith && sword.Smith !== currentFilters.smith) return false;
    if (currentFilters.type && sword.Type !== currentFilters.type) return false;
    if (currentFilters.province && sword.Province !== currentFilters.province) return false;

    // Nagasa filter
    if (currentFilters.nagasaMin || currentFilters.nagasaMax) {
      if (!sword.Nagasa) return false;
      const nagasa = parseFloat(sword.Nagasa);
      if (isNaN(nagasa)) return false;
      if (currentFilters.nagasaMin && nagasa < parseFloat(currentFilters.nagasaMin)) return false;
      if (currentFilters.nagasaMax && nagasa > parseFloat(currentFilters.nagasaMax)) return false;
    }

    // Media filter
    if (currentFilters.hasMedia) {
      const hasMedia = sword.MediaAttachments && sword.MediaAttachments !== 'NA' && sword.MediaAttachments !== '[]';
      if (currentFilters.hasMedia === 'true' && !hasMedia) return false;
      if (currentFilters.hasMedia === 'false' && hasMedia) return false;
    }

    return true;
  });

  // Authentication levels and their matching logic
  const authLevels = [
    { name: 'Kokuho', match: (auth) => auth.includes('Kokuho') },
    { name: 'Juyo Bunkazai', match: (auth) => auth.includes('Juyo Bunkazai') },
    { name: 'Tokubetsu Juyo', match: (auth) => /Tokubetsu Juyo\s+(\d{1,2}|XX)/.test(auth) },
    { name: 'Juyo', match: (auth) => /Juyo\s+(\d{1,2}|XX)/.test(auth) },
    { name: 'Juyo Bijutsuhin', match: (auth) => auth.includes('Juyo Bijutsuhin') },
    { name: 'Tokubetsu Hozon', match: (auth) => auth.includes('Tokubetsu Hozon') },
    { name: 'Hozon', match: (auth) => auth.includes('Hozon') && !auth.includes('Tokubetsu Hozon') },
  ];

  const counts = {};
  authLevels.forEach(level => {
    counts[level.name] = 0;
  });

  filteredData.forEach(sword => {
    if (!sword.Authentication) return;
    const authStr = String(sword.Authentication);

    authLevels.forEach(level => {
      if (level.match(authStr)) {
        counts[level.name]++;
      }
    });
  });

  return counts;
};

/**
 * Count how many results match each media status
 * @param {Array} allSwords - Complete array of all swords
 * @param {Object} currentFilters - Current filter selections (excluding hasMedia)
 * @param {Array} searchTags - Active search tags
 * @returns {Object} - Object with hasMedia and noMedia counts
 */
export const getMediaCounts = (allSwords, currentFilters, searchTags) => {
  // Filter swords based on search tags first
  let filteredData = allSwords;

  if (searchTags.length > 0) {
    filteredData = allSwords.filter(sword => {
      return searchTags.every(tag => {
        const lowerTag = tag.toLowerCase();
        return Object.values(sword).some(value =>
          String(value).toLowerCase().includes(lowerTag)
        );
      });
    });
  }

  // Apply all other filters (excluding hasMedia)
  filteredData = filteredData.filter(sword => {
    if (currentFilters.school && sword.School !== currentFilters.school) return false;
    if (currentFilters.smith && sword.Smith !== currentFilters.smith) return false;
    if (currentFilters.type && sword.Type !== currentFilters.type) return false;
    if (currentFilters.province && sword.Province !== currentFilters.province) return false;

    // Authentication filter
    if (currentFilters.authentication) {
      if (!sword.Authentication) return false;
      const authStr = String(sword.Authentication);
      switch (currentFilters.authentication) {
        case 'Juyo':
          if (!/Juyo\s+(\d{1,2}|XX)/.test(authStr)) return false;
          break;
        case 'Tokubetsu Juyo':
          if (!/Tokubetsu Juyo\s+(\d{1,2}|XX)/.test(authStr)) return false;
          break;
        case 'Hozon':
          if (!authStr.includes('Hozon') || authStr.includes('Tokubetsu Hozon')) return false;
          break;
        default:
          if (!authStr.includes(currentFilters.authentication)) return false;
      }
    }

    // Nagasa filter
    if (currentFilters.nagasaMin || currentFilters.nagasaMax) {
      if (!sword.Nagasa) return false;
      const nagasa = parseFloat(sword.Nagasa);
      if (isNaN(nagasa)) return false;
      if (currentFilters.nagasaMin && nagasa < parseFloat(currentFilters.nagasaMin)) return false;
      if (currentFilters.nagasaMax && nagasa > parseFloat(currentFilters.nagasaMax)) return false;
    }

    return true;
  });

  let hasMediaCount = 0;
  let noMediaCount = 0;

  filteredData.forEach(sword => {
    const hasMedia = sword.MediaAttachments && sword.MediaAttachments !== 'NA' && sword.MediaAttachments !== '[]';
    if (hasMedia) {
      hasMediaCount++;
    } else {
      noMediaCount++;
    }
  });

  return { hasMedia: hasMediaCount, noMedia: noMediaCount };
};

/**
 * Count how many results match each period option
 * @param {Array} allSwords - Complete array of all swords
 * @param {Object} currentFilters - Current filter selections (excluding periods)
 * @param {Array} searchTags - Active search tags
 * @returns {Object} - Object mapping period IDs to counts
 */
export const getPeriodCounts = (allSwords, currentFilters, searchTags) => {
  // Filter swords based on search tags first
  let filteredData = allSwords;

  if (searchTags.length > 0) {
    filteredData = allSwords.filter(sword => {
      return searchTags.every(tag => {
        const lowerTag = tag.toLowerCase();
        return Object.values(sword).some(value =>
          String(value).toLowerCase().includes(lowerTag)
        );
      });
    });
  }

  // Apply all other filters (excluding periods)
  filteredData = filteredData.filter(sword => {
    // School filter
    if (currentFilters.school && sword.School !== currentFilters.school) return false;

    // Smith filter
    if (currentFilters.smith && sword.Smith !== currentFilters.smith) return false;

    // Type filter
    if (currentFilters.type && sword.Type !== currentFilters.type) return false;

    // Province filter
    if (currentFilters.province && sword.Province !== currentFilters.province) return false;

    // Authentication filter
    if (currentFilters.authentication) {
      if (!sword.Authentication) return false;
      const authStr = String(sword.Authentication);
      switch (currentFilters.authentication) {
        case 'Juyo':
          if (!/Juyo\s+(\d{1,2}|XX)/.test(authStr)) return false;
          break;
        case 'Tokubetsu Juyo':
          if (!/Tokubetsu Juyo\s+(\d{1,2}|XX)/.test(authStr)) return false;
          break;
        case 'Hozon':
          if (!authStr.includes('Hozon') || authStr.includes('Tokubetsu Hozon')) return false;
          break;
        default:
          if (!authStr.includes(currentFilters.authentication)) return false;
      }
    }

    // Nagasa filter
    if (currentFilters.nagasaMin || currentFilters.nagasaMax) {
      if (!sword.Nagasa) return false;
      const nagasa = parseFloat(sword.Nagasa);
      if (isNaN(nagasa)) return false;
      if (currentFilters.nagasaMin && nagasa < parseFloat(currentFilters.nagasaMin)) return false;
      if (currentFilters.nagasaMax && nagasa > parseFloat(currentFilters.nagasaMax)) return false;
    }

    // Media filter
    if (currentFilters.hasMedia) {
      const hasMedia = sword.MediaAttachments && sword.MediaAttachments !== 'NA' && sword.MediaAttachments !== '[]';
      if (currentFilters.hasMedia === 'true' && !hasMedia) return false;
      if (currentFilters.hasMedia === 'false' && hasMedia) return false;
    }

    return true;
  });

  // Count occurrences of each period
  const counts = {};
  PERIOD_DEFINITIONS.forEach(period => {
    counts[period.id] = 0;
  });

  filteredData.forEach(sword => {
    const swordPeriods = getSwordPeriods(sword.Period);
    swordPeriods.forEach(periodId => {
      if (counts[periodId] !== undefined) {
        counts[periodId]++;
      }
    });
  });

  return counts;
};
