import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { buildAutocompleteIndex, generateSuggestions, countTotalSuggestions } from '../utils/autocompleteUtils.js';

/**
 * Custom hook for autocomplete functionality
 *
 * @param {string} inputValue - Current input value
 * @param {Array} swords - Sword data array
 * @param {Object} options - Configuration options
 * @returns {Object} - Autocomplete state and handlers
 */
function useAutocomplete(inputValue, swords, options = {}) {
  const {
    debounceDelay = 300,
    minChars = 2,
    maxSuggestions = 8,
    onSelect
  } = options;

  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Build autocomplete index (memoized)
  const autocompleteIndex = useMemo(() => {
    return buildAutocompleteIndex(swords);
  }, [swords]);

  // Debounce input value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [inputValue, debounceDelay]);

  // Generate suggestions (memoized)
  const suggestions = useMemo(() => {
    if (debouncedValue.length < minChars) {
      return [];
    }

    return generateSuggestions(debouncedValue, autocompleteIndex, maxSuggestions);
  }, [debouncedValue, autocompleteIndex, minChars, maxSuggestions]);

  // Calculate total suggestion count
  const totalSuggestions = useMemo(() => {
    return countTotalSuggestions(suggestions);
  }, [suggestions]);

  // Open/close dropdown based on suggestions
  useEffect(() => {
    if (totalSuggestions > 0 && inputValue.length >= minChars) {
      setIsOpen(true);
      setSelectedIndex(-1); // Reset selection
    } else {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [totalSuggestions, inputValue, minChars]);

  // Get currently selected suggestion
  const getSelectedSuggestion = useCallback(() => {
    if (selectedIndex === -1 || !isOpen) {
      return null;
    }

    let currentIndex = 0;
    for (const group of suggestions) {
      for (const suggestion of group.suggestions) {
        if (currentIndex === selectedIndex) {
          return suggestion.text;
        }
        currentIndex++;
      }
    }
    return null;
  }, [selectedIndex, isOpen, suggestions]);

  // Navigate to next suggestion
  const selectNext = useCallback(() => {
    if (!isOpen || totalSuggestions === 0) return;

    setSelectedIndex(prev => {
      const next = prev + 1;
      return next >= totalSuggestions ? 0 : next;
    });
  }, [isOpen, totalSuggestions]);

  // Navigate to previous suggestion
  const selectPrevious = useCallback(() => {
    if (!isOpen || totalSuggestions === 0) return;

    setSelectedIndex(prev => {
      const next = prev - 1;
      return next < 0 ? totalSuggestions - 1 : next;
    });
  }, [isOpen, totalSuggestions]);

  // Select current suggestion
  const selectCurrent = useCallback(() => {
    const suggestion = getSelectedSuggestion();
    if (suggestion && onSelect) {
      onSelect(suggestion);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [getSelectedSuggestion, onSelect]);

  // Close dropdown
  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    if (!isOpen) return false;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectNext();
        return true;

      case 'ArrowUp':
        event.preventDefault();
        selectPrevious();
        return true;

      case 'Enter':
        if (selectedIndex !== -1) {
          event.preventDefault();
          selectCurrent();
          return true;
        }
        return false;

      case 'Escape':
        event.preventDefault();
        close();
        return true;

      case 'Tab':
        // Close dropdown on tab
        close();
        return false; // Allow default tab behavior

      default:
        return false;
    }
  }, [isOpen, selectedIndex, selectNext, selectPrevious, selectCurrent, close]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, close]);

  // Select suggestion by index (for mouse clicks)
  const selectSuggestionByIndex = useCallback((index) => {
    if (index < 0 || index >= totalSuggestions) return;

    let currentIndex = 0;
    for (const group of suggestions) {
      for (const suggestion of group.suggestions) {
        if (currentIndex === index) {
          if (onSelect) {
            onSelect(suggestion.text);
          }
          setIsOpen(false);
          setSelectedIndex(-1);
          return;
        }
        currentIndex++;
      }
    }
  }, [suggestions, totalSuggestions, onSelect]);

  // Get suggestion by flat index (for accessibility)
  const getSuggestionByIndex = useCallback((index) => {
    let currentIndex = 0;
    for (const group of suggestions) {
      for (const suggestion of group.suggestions) {
        if (currentIndex === index) {
          return { ...suggestion, category: group.category };
        }
        currentIndex++;
      }
    }
    return null;
  }, [suggestions]);

  return {
    suggestions,
    isOpen,
    selectedIndex,
    totalSuggestions,
    dropdownRef,
    handleKeyDown,
    selectSuggestionByIndex,
    getSuggestionByIndex,
    close
  };
}

export default useAutocomplete;
