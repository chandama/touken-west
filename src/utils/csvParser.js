import Papa from 'papaparse';

/**
 * Parses the Japanese sword CSV data
 * @param {string} csvFilePath - Path to the CSV file
 * @returns {Promise<Array>} Array of sword objects
 */
export const parseSwordData = async (csvFilePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Trim whitespace from headers
        return header.trim();
      },
      transform: (value) => {
        // Trim whitespace from values
        return value.trim();
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Extracts unique values from a specific field in the sword data
 * @param {Array} swords - Array of sword objects
 * @param {string} field - Field name to extract values from
 * @returns {Array} Sorted array of unique values
 */
export const getUniqueValues = (swords, field) => {
  const values = new Set();
  swords.forEach(sword => {
    const value = sword[field];
    if (value && value !== 'NA' && value !== 'XX' && value !== '') {
      values.add(value);
    }
  });
  return Array.from(values).sort();
};

/**
 * Filters sword data based on criteria
 * @param {Array} swords - Array of sword objects
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered array of swords
 */
export const filterSwords = (swords, criteria) => {
  return swords.filter(sword => {
    return Object.entries(criteria).every(([key, value]) => {
      if (!value || value === '') return true;
      return sword[key] === value;
    });
  });
};

/**
 * Searches sword data for a term across all fields
 * @param {Array} swords - Array of sword objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching swords
 */
export const searchSwords = (swords, searchTerm) => {
  if (!searchTerm || searchTerm === '') return swords;

  const term = searchTerm.toLowerCase();
  return swords.filter(sword => {
    return Object.values(sword).some(value => {
      return String(value).toLowerCase().includes(term);
    });
  });
};
