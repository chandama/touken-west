/**
 * Search Parser Utility
 * Parses search input to extract quoted phrases and regular terms
 */

/**
 * Parse search input string into quoted and unquoted terms
 *
 * @param {string} input - Raw search input
 * @returns {Object} - { quoted: string[], unquoted: string[] }
 *
 * @example
 * parseSearchInput('Masamune "Juyo 11" tanto')
 * // Returns: {
 * //   quoted: ['Juyo 11'],
 * //   unquoted: ['Masamune', 'tanto']
 * // }
 */
export function parseSearchInput(input) {
  if (!input || typeof input !== 'string') {
    return { quoted: [], unquoted: [] };
  }

  const quoted = [];
  const unquoted = [];

  // Regex to match quoted phrases and unquoted words
  // Matches: "quoted phrase" or unquoted-word
  const regex = /"([^"]*)"|(\S+)/g;

  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      // Quoted phrase (group 1)
      const phrase = match[1].trim();
      if (phrase) {
        quoted.push(phrase);
      }
    } else if (match[2] !== undefined) {
      // Unquoted word (group 2)
      const word = match[2].trim();
      if (word) {
        unquoted.push(word);
      }
    }
  }

  return { quoted, unquoted };
}

/**
 * Check if a value contains all quoted phrases (exact match with word boundaries)
 * and all unquoted terms (partial match)
 *
 * @param {string} value - Value to search in
 * @param {string[]} quotedTerms - Terms requiring exact match
 * @param {string[]} unquotedTerms - Terms requiring partial match
 * @returns {boolean}
 */
export function matchesSearchTerms(value, quotedTerms, unquotedTerms) {
  if (!value) return false;

  const lowerValue = String(value).toLowerCase();

  // All quoted terms must match exactly with word boundaries (case-insensitive)
  const quotedMatch = quotedTerms.every(term => {
    const lowerTerm = term.toLowerCase();

    // Escape special regex characters in the search term
    const escapedTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Special handling for authentication terms to exclude modified versions
    // Check for modifiers BEFORE checking the main pattern
    if (lowerTerm.startsWith('juyo')) {
      // If searching for "Juyo X", first check if "Tokubetsu Juyo X" exists
      const tokubetsuPattern = new RegExp(
        `(^|\\s|,|:|;|\\(|\\[|\\{)tokubetsu\\s${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
        'i'
      );
      if (tokubetsuPattern.test(lowerValue)) {
        // If "Tokubetsu Juyo X" is found, this is NOT a match for just "Juyo X"
        return false;
      }
    } else if (lowerTerm.startsWith('hozon')) {
      // If searching for "Hozon", first check if "Tokubetsu Hozon" exists
      const tokubetsuPattern = new RegExp(
        `(^|\\s|,|:|;|\\(|\\[|\\{)tokubetsu\\s${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
        'i'
      );
      if (tokubetsuPattern.test(lowerValue)) {
        return false;
      }
    } else if (lowerTerm.startsWith('bunkazai')) {
      // If searching for "Bunkazai", first check if "Juyo Bunkazai" exists
      const juyoPattern = new RegExp(
        `(^|\\s|,|:|;|\\(|\\[|\\{)juyo\\s${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
        'i'
      );
      if (juyoPattern.test(lowerValue)) {
        return false;
      }
    }

    // Create regex with word boundaries
    // \b matches word boundary, but we also need to handle cases where the phrase
    // is at start/end of string or surrounded by spaces, commas, colons, etc.
    const pattern = new RegExp(
      `(^|\\s|,|:|;|\\(|\\[|\\{)${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
      'i'
    );

    return pattern.test(lowerValue);
  });

  // All unquoted terms must be present (partial match)
  const unquotedMatch = unquotedTerms.every(term => {
    const lowerTerm = term.toLowerCase();
    return lowerValue.includes(lowerTerm);
  });

  return quotedMatch && unquotedMatch;
}

/**
 * Convert parsed search terms back to tag format
 * Preserves quotes for quoted terms
 *
 * @param {Object} parsedSearch - { quoted, unquoted }
 * @returns {Array} - Array of tag objects
 */
export function searchTermsToTags(parsedSearch) {
  const tags = [];

  // Add quoted terms with quote markers
  parsedSearch.quoted.forEach(term => {
    tags.push({
      text: term,
      isQuoted: true,
      displayText: `"${term}"`
    });
  });

  // Add unquoted terms
  parsedSearch.unquoted.forEach(term => {
    tags.push({
      text: term,
      isQuoted: false,
      displayText: term
    });
  });

  return tags;
}

/**
 * Validate search input and provide helpful error messages
 *
 * @param {string} input - Search input
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export function validateSearchInput(input) {
  if (!input || typeof input !== 'string') {
    return { valid: true, error: null };
  }

  // Check for unclosed quotes
  const quoteCount = (input.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    return {
      valid: false,
      error: 'Unclosed quote - please add closing quote or remove the opening quote'
    };
  }

  // Check for empty quotes
  if (input.includes('""')) {
    return {
      valid: false,
      error: 'Empty quotes are not allowed - please add text between quotes or remove them'
    };
  }

  // Check input length
  const MAX_LENGTH = 200;
  if (input.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Search input is too long (max ${MAX_LENGTH} characters)`
    };
  }

  return { valid: true, error: null };
}

/**
 * Highlight matching text in a string
 * Used for autocomplete suggestions
 *
 * @param {string} text - Full text
 * @param {string} query - Query to highlight
 * @returns {Object} - { text, highlightIndices: [start, end] }
 */
export function highlightMatch(text, query) {
  if (!text || !query) {
    return { text, highlightIndices: null };
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return { text, highlightIndices: null };
  }

  return {
    text,
    highlightIndices: [index, index + query.length]
  };
}
