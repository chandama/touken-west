/**
 * Utility functions for detecting and extracting Meito (famous named sword) information
 *
 * Meito Pattern: "Meito – [Name in Romaji] [Japanese characters]"
 * Found in the Description field of the CSV data
 * Total ~292 famous swords in the database
 */

/**
 * Extract Meito information from a sword's description field
 * @param {string} description - The Description field from the CSV
 * @returns {Object|null} - Object with {name, isMeito: true} or null if not a Meito
 */
export function extractMeito(description) {
  if (!description || typeof description !== 'string') {
    return null;
  }

  // Look for the "Meito – " pattern (note the en dash, not regular hyphen)
  const meitoMatch = description.match(/Meito\s*[–-]\s*([^,]+)/i);

  if (meitoMatch) {
    // Extract the name (everything after "Meito – " until the next comma)
    const meitoName = meitoMatch[1].trim();

    return {
      isMeito: true,
      name: meitoName
    };
  }

  return null;
}

/**
 * Check if a sword is a Meito (famous named sword)
 * @param {string} description - The Description field from the CSV
 * @returns {boolean} - True if the sword is a Meito
 */
export function isMeito(description) {
  return extractMeito(description) !== null;
}

/**
 * Extract just the Meito name without Japanese characters (optional)
 * @param {string} description - The Description field
 * @returns {string|null} - Just the romaji name, or null
 */
export function getMeitoRomajiName(description) {
  const meito = extractMeito(description);
  if (!meito) return null;

  // Try to extract just the romaji part (before Japanese characters)
  // Japanese characters typically start after the English name
  const romajiMatch = meito.name.match(/^([A-Za-z\s'-]+)/);
  if (romajiMatch) {
    return romajiMatch[1].trim();
  }

  // If no clear separation, return the full name
  return meito.name;
}

/**
 * Get a list of all Meito swords from a dataset
 * @param {Array} swords - Array of sword objects
 * @returns {Array} - Filtered array containing only Meito swords
 */
export function filterMeitoSwords(swords) {
  return swords.filter(sword => isMeito(sword.Description));
}

/**
 * Add Meito information to sword objects
 * @param {Array} swords - Array of sword objects
 * @returns {Array} - Sword objects enhanced with Meito data
 */
export function enrichWithMeitoData(swords) {
  return swords.map(sword => {
    const meitoInfo = extractMeito(sword.Description);

    if (meitoInfo) {
      return {
        ...sword,
        isMeito: true,
        meitoName: meitoInfo.name
      };
    }

    return {
      ...sword,
      isMeito: false,
      meitoName: null
    };
  });
}
