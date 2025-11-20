import React, { useState } from 'react';

/**
 * SearchBar component with multi-tag search functionality
 * Allows users to add multiple search terms as removable tags
 */
const SearchBar = ({ searchTags, onSearchTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !searchTags.includes(trimmed)) {
      onSearchTagsChange([...searchTags, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onSearchTagsChange(searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleClearAll = () => {
    onSearchTagsChange([]);
    setInputValue('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        {/* Display search tags */}
        {searchTags.map((tag, index) => (
          <span key={index} className="search-tag">
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
          placeholder={searchTags.length === 0 ? "Search swords by name, smith, school, mei..." : "Add another search term..."}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
      </div>

      <div className="search-actions">
        {inputValue && (
          <button
            onClick={handleAddTag}
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
    </div>
  );
};

export default SearchBar;
