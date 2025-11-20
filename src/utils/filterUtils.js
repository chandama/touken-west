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
  // Create a copy of filters excluding the field we're counting for
  const filtersExcludingCurrent = { ...currentFilters };
  delete filtersExcludingCurrent[filterField];

  // Filter swords based on search and other filters
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

  // Apply all filters except the one we're counting for
  filteredData = filteredData.filter(sword => {
    return Object.entries(filtersExcludingCurrent).every(([key, value]) => {
      if (!value) return true;

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

      const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
      return sword[fieldName] === value;
    });
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
