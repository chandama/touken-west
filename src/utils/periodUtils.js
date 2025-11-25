/**
 * Period utility functions for mapping sword dates/periods to historical eras
 */

// Historical period definitions with year ranges
export const PERIOD_DEFINITIONS = [
  { id: 'kofun', name: 'Kofun', startYear: 0, endYear: 709 },
  { id: 'nara', name: 'Nara', startYear: 710, endYear: 793 },
  { id: 'heian', name: 'Heian', startYear: 794, endYear: 1184 },
  { id: 'kamakura', name: 'Kamakura', startYear: 1185, endYear: 1332 },
  { id: 'nanbokucho', name: 'Nanbokucho', startYear: 1333, endYear: 1391 },
  { id: 'muromachi', name: 'Muromachi', startYear: 1392, endYear: 1596 },
  { id: 'momoyama', name: 'Momoyama', startYear: 1573, endYear: 1596 },
  { id: 'shinto', name: 'Shinto', startYear: 1597, endYear: 1780 },
  { id: 'shinshinto', name: 'Shinshinto', startYear: 1781, endYear: 1876 },
  { id: 'shinsaku', name: 'Shinsaku', startYear: 1877, endYear: 2100 },
];

// Keywords that map to specific periods (case-insensitive matching)
const PERIOD_KEYWORDS = {
  kofun: ['kofun', '5th century', '6th century', '5-6th century', 'late 6th century'],
  nara: ['nara', '7th century', 'late 7th century', '8th century'],
  heian: ['heian'],
  kamakura: ['kamakura'],
  nanbokucho: ['nanbokucho'],
  muromachi: ['muromachi'],
  momoyama: ['momoyama'],
  shinto: ['shinto', 'edo'],
  shinshinto: ['shinshinto'],
  shinsaku: ['shinsaku', 'meiji', 'taisho', 'showa', 'heisei', 'reiwa'],
};

/**
 * Extract the first year from a period string
 * Handles formats like "1326", "1326-1328", "1299 - 1302", "13XX"
 */
function extractYear(periodStr) {
  if (!periodStr) return null;

  // Match 4-digit year at the start
  const match = periodStr.match(/^(\d{4})/);
  if (match) {
    return parseInt(match[1], 10);
  }

  // Handle "13XX" style dates - assume middle of century
  const centuryMatch = periodStr.match(/^(\d{2})XX/i);
  if (centuryMatch) {
    return parseInt(centuryMatch[1], 10) * 100 + 50;
  }

  return null;
}

/**
 * Get the period ID(s) that a year falls into
 */
function getPeriodsForYear(year) {
  if (!year || isNaN(year)) return [];

  const periods = [];
  for (const period of PERIOD_DEFINITIONS) {
    if (year >= period.startYear && year <= period.endYear) {
      periods.push(period.id);
    }
  }
  return periods;
}

/**
 * Get the period ID(s) that match a period name string
 * Handles compound periods like "Late Heian - Early Kamakura"
 */
function getPeriodsForName(periodStr) {
  if (!periodStr) return [];

  const lowerStr = periodStr.toLowerCase();
  const matchedPeriods = new Set();

  for (const [periodId, keywords] of Object.entries(PERIOD_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerStr.includes(keyword.toLowerCase())) {
        matchedPeriods.add(periodId);
      }
    }
  }

  return [...matchedPeriods];
}

/**
 * Get all period IDs that a sword's Period value matches
 * @param {string} periodValue - The Period field value from a sword record
 * @returns {string[]} - Array of period IDs that match
 */
export function getSwordPeriods(periodValue) {
  if (!periodValue || periodValue === 'NA' || periodValue === 'UNKNO') {
    return [];
  }

  const periods = new Set();

  // First, try to extract a year
  const year = extractYear(periodValue);
  if (year) {
    for (const p of getPeriodsForYear(year)) {
      periods.add(p);
    }
  }

  // Also check for period name keywords
  for (const p of getPeriodsForName(periodValue)) {
    periods.add(p);
  }

  return [...periods];
}

/**
 * Check if a sword matches any of the selected period filters
 * @param {string} periodValue - The Period field value from a sword record
 * @param {string[]} selectedPeriods - Array of selected period IDs
 * @returns {boolean} - True if sword matches any selected period
 */
export function matchesPeriodFilter(periodValue, selectedPeriods) {
  if (!selectedPeriods || selectedPeriods.length === 0) {
    return true; // No filter applied
  }

  const swordPeriods = getSwordPeriods(periodValue);

  // If sword has no identifiable period, don't match
  if (swordPeriods.length === 0) {
    return false;
  }

  // Check if any of the sword's periods match any selected period
  return swordPeriods.some(p => selectedPeriods.includes(p));
}
