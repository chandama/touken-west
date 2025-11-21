import React, { useState } from 'react';
import useAutocomplete from '../hooks/useAutocomplete.js';
import AutocompleteDropdown from './AutocompleteDropdown.jsx';

/**
 * SearchBar component with multi-tag search, autocomplete, and quoted phrase support
 * Allows users to add multiple search terms as removable tags
 * Shows real-time autocomplete suggestions
 * Supports quoted phrases for exact matching
 */
const SearchBar = ({ searchTags, onSearchTagsChange, swords }) => {
  const [inputValue, setInputValue] = useState('');

  // Autocomplete functionality
  const {
    suggestions,
    isOpen,
    selectedIndex,
    dropdownRef,
    handleKeyDown: autocompleteKeyDown,
    selectSuggestionByIndex,
    close: closeAutocomplete
  } = useAutocomplete(inputValue, swords, {
    debounceDelay: 300,
    minChars: 2,
    maxSuggestions: 8,
    onSelect: (suggestion) => {
      handleAddTag(suggestion);
    }
  });

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTag = (tagText = null) => {
    const text = tagText || inputValue.trim();
    const MAX_TAG_LENGTH = 100;

    // Validation
    if (!text) return;

    if (text.length > MAX_TAG_LENGTH) {
      alert(`Search tags must be ${MAX_TAG_LENGTH} characters or less`);
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = searchTags.some(
      existingTag => existingTag.toLowerCase() === text.toLowerCase()
    );

    if (!isDuplicate) {
      onSearchTagsChange([...searchTags, text]);
      setInputValue('');
      closeAutocomplete();
    }
  };

  const handleKeyDown = (e) => {
    // Let autocomplete handle its keyboard events first
    const handled = autocompleteKeyDown(e);

    if (!handled) {
      // Handle Enter key when autocomplete is not open
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onSearchTagsChange(searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleClearAll = () => {
    onSearchTagsChange([]);
    setInputValue('');
    closeAutocomplete();
  };

  // Check if tag contains quotes (for visual differentiation)
  const isQuotedTag = (tag) => {
    return tag.includes('"');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <div className="search-input-container">
          {/* Display search tags */}
          {searchTags.map((tag, index) => (
            <span
              key={index}
              className={`search-tag ${isQuotedTag(tag) ? 'search-tag-quoted' : ''}`}
              title={isQuotedTag(tag) ? 'Exact phrase match' : 'Partial match'}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="tag-remove-button"
                aria-label={`Remove ${tag} tag`}
              >
                ×
              </button>
            </span>
          ))}

          {/* Input field */}
          <input
            type="text"
            placeholder={searchTags.length === 0 ? 'Search swords by name, smith, school... (Use "quotes" for exact match)' : "Add another search term..."}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="search-input"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="autocomplete-listbox"
            aria-activedescendant={selectedIndex !== -1 ? `suggestion-${selectedIndex}` : undefined}
          />
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <AutocompleteDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            onSelect={selectSuggestionByIndex}
            dropdownRef={dropdownRef}
            inputValue={inputValue}
          />
        )}
      </div>

      <div className="search-actions">
        {inputValue && !isOpen && (
          <button
            onClick={() => handleAddTag()}
            className="add-tag-button"
            aria-label="Add search tag"
          >
            Add
          </button>
        )}
        {searchTags.length > 0 && (
          <button
            onClick={handleClearAll}
            className="clear-all-button"
            aria-label="Clear all search tags"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Help text for quoted search */}
      {inputValue.includes('"') && (
        <div className="search-hint">
          💡 Tip: Text in quotes will match exactly
        </div>
      )}
    </div>
  );
};

export default SearchBar;
