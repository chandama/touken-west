/**
 * Autocomplete Utilities
 * Builds search index and generates autocomplete suggestions
 */

import { highlightMatch } from './searchParser';

/**
 * Build autocomplete index from sword data
 * Creates searchable index of unique values from all relevant fields
 *
 * @param {Array} swords - Array of sword objects
 * @returns {Object} - Categorized index with counts
 */
export function buildAutocompleteIndex(swords) {
  if (!swords || swords.length === 0) {
    return {
      smiths: [],
      schools: [],
      types: [],
      authentication: [],
      provinces: [],
      periods: [],
      meito: []
    };
  }

  // Use Maps to track unique values and their counts
  const smithsMap = new Map();
  const schoolsMap = new Map();
  const typesMap = new Map();
  const authMap = new Map();
  const provincesMap = new Map();
  const periodsMap = new Map();
  const meitoMap = new Map();

  swords.forEach(sword => {
    // Smiths
    if (sword.Smith && sword.Smith !== 'NA' && sword.Smith !== 'XX') {
      smithsMap.set(sword.Smith, (smithsMap.get(sword.Smith) || 0) + 1);
    }

    // Schools
    if (sword.School && sword.School !== 'NA' && sword.School !== 'XX') {
      schoolsMap.set(sword.School, (schoolsMap.get(sword.School) || 0) + 1);
    }

    // Types
    if (sword.Type && sword.Type !== 'NA') {
      typesMap.set(sword.Type, (typesMap.get(sword.Type) || 0) + 1);
    }

    // Authentication
    if (sword.Authentication && sword.Authentication !== 'NA') {
      // Extract authentication levels (e.g., "Juyo", "Tokubetsu Juyo")
      const auth = String(sword.Authentication);

      // Check for common authentication levels
      if (auth.includes('Kokuho')) {
        authMap.set('Kokuho', (authMap.get('Kokuho') || 0) + 1);
      }
      if (auth.includes('Juyo Bunkazai')) {
        authMap.set('Juyo Bunkazai', (authMap.get('Juyo Bunkazai') || 0) + 1);
      }
      if (auth.includes('Tokubetsu Juyo')) {
        authMap.set('Tokubetsu Juyo', (authMap.get('Tokubetsu Juyo') || 0) + 1);
      }
      if (auth.match(/Juyo\s+(\d{1,2}|XX)/)) {
        authMap.set('Juyo', (authMap.get('Juyo') || 0) + 1);
      }
      if (auth.includes('Tokubetsu Hozon')) {
        authMap.set('Tokubetsu Hozon', (authMap.get('Tokubetsu Hozon') || 0) + 1);
      }
      if (auth.includes('Hozon') && !auth.includes('Tokubetsu Hozon')) {
        authMap.set('Hozon', (authMap.get('Hozon') || 0) + 1);
      }
    }

    // Provinces
    if (sword.Province && sword.Province !== 'NA' && sword.Province !== 'XX') {
      provincesMap.set(sword.Province, (provincesMap.get(sword.Province) || 0) + 1);
    }

    // Periods
    if (sword.Period && sword.Period !== 'NA' && sword.Period !== 'XX') {
      periodsMap.set(sword.Period, (periodsMap.get(sword.Period) || 0) + 1);
    }

    // Meito (famous swords)
    if (sword.meitoName) {
      meitoMap.set(sword.meitoName, (meitoMap.get(sword.meitoName) || 0) + 1);
    }
  });

  // Convert Maps to sorted arrays
  const mapToArray = (map) => {
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  };

  return {
    smiths: mapToArray(smithsMap),
    schools: mapToArray(schoolsMap),
    types: mapToArray(typesMap),
    authentication: mapToArray(authMap),
    provinces: mapToArray(provincesMap),
    periods: mapToArray(periodsMap),
    meito: mapToArray(meitoMap)
  };
}

/**
 * Calculate relevance score for a suggestion
 *
 * @param {string} suggestion - Suggestion text
 * @param {string} query - User input
 * @param {number} count - Number of matching results
 * @returns {number} - Relevance score (higher is better)
 */
function calculateRelevanceScore(suggestion, query, count) {
  const lowerSuggestion = suggestion.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let score = 0;

  // Exact prefix match (highest priority)
  if (lowerSuggestion.startsWith(lowerQuery)) {
    score += 100;
  }
  // Word start match (medium priority)
  else if (lowerSuggestion.includes(' ' + lowerQuery)) {
    score += 75;
  }
  // Contains match (lower priority)
  else if (lowerSuggestion.includes(lowerQuery)) {
    score += 50;
  }
  // No match
  else {
    return 0;
  }

  // Boost shorter matches (prefer "Masa" over "Masamune Long Name")
  const lengthBonus = Math.max(0, 20 - (suggestion.length / 5));
  score += lengthBonus;

  // Boost higher count (more relevant if more results)
  const countBonus = Math.log(count + 1) * 3;
  score += countBonus;

  return score;
}

/**
 * Generate autocomplete suggestions from index
 *
 * @param {string} query - User input
 * @param {Object} index - Autocomplete index
 * @param {number} maxSuggestions - Maximum suggestions to return
 * @returns {Array} - Grouped suggestions
 */
export function generateSuggestions(query, index, maxSuggestions = 8) {
  if (!query || query.length < 2) {
    return [];
  }

  const allSuggestions = [];

  // Define category display names and priorities
  const categories = [
    { key: 'smiths', label: 'SMITHS', priority: 1 },
    { key: 'schools', label: 'SCHOOLS', priority: 2 },
    { key: 'types', label: 'TYPES', priority: 3 },
    { key: 'authentication', label: 'AUTHENTICATION', priority: 4 },
    { key: 'provinces', label: 'PROVINCES', priority: 5 },
    { key: 'periods', label: 'PERIODS', priority: 6 },
    { key: 'meito', label: 'FAMOUS SWORDS', priority: 7 }
  ];

  // Collect matching suggestions from all categories
  categories.forEach(category => {
    const items = index[category.key] || [];

    items.forEach(item => {
      const score = calculateRelevanceScore(item.value, query, item.count);

      if (score > 0) {
        const highlight = highlightMatch(item.value, query);

        allSuggestions.push({
          category: category.label,
          categoryPriority: category.priority,
          text: item.value,
          count: item.count,
          score,
          highlightIndices: highlight.highlightIndices
        });
      }
    });
  });

  // Sort by score descending
  allSuggestions.sort((a, b) => b.score - a.score);

  // Limit total suggestions
  const topSuggestions = allSuggestions.slice(0, maxSuggestions);

  // Group by category
  const grouped = {};

  topSuggestions.forEach(suggestion => {
    if (!grouped[suggestion.category]) {
      grouped[suggestion.category] = {
        category: suggestion.category,
        categoryPriority: suggestion.categoryPriority,
        suggestions: []
      };
    }

    grouped[suggestion.category].suggestions.push({
      text: suggestion.text,
      count: suggestion.count,
      highlightIndices: suggestion.highlightIndices
    });
  });

  // Convert to array and sort by category priority
  const result = Object.values(grouped).sort((a, b) => a.categoryPriority - b.categoryPriority);

  return result;
}

/**
 * Format suggestion text with highlighting
 *
 * @param {string} text - Full suggestion text
 * @param {Array|null} highlightIndices - [start, end] indices to highlight
 * @returns {string} - HTML string with <mark> tags for highlighting
 */
export function formatHighlightedText(text, highlightIndices) {
  if (!highlightIndices || highlightIndices.length !== 2) {
    return text;
  }

  const [start, end] = highlightIndices;
  const before = text.substring(0, start);
  const match = text.substring(start, end);
  const after = text.substring(end);

  // Return formatted HTML string (not used in React component, kept for potential future use)
  return `${before}<mark>${match}</mark>${after}`;
}

/**
 * Count total suggestions across all categories
 *
 * @param {Array} groupedSuggestions - Grouped suggestions
 * @returns {number} - Total number of suggestions
 */
export function countTotalSuggestions(groupedSuggestions) {
  return groupedSuggestions.reduce((total, group) => {
    return total + group.suggestions.length;
  }, 0);
}
