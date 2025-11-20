import React from 'react';

/**
 * AutocompleteDropdown Component
 * Displays categorized search suggestions with result counts
 */
const AutocompleteDropdown = ({
  suggestions,
  selectedIndex,
  onSelect,
  dropdownRef,
  inputValue
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  // Calculate flat index for each suggestion
  let flatIndex = 0;
  const suggestionIndices = [];

  suggestions.forEach((group) => {
    group.suggestions.forEach(() => {
      suggestionIndices.push(flatIndex);
      flatIndex++;
    });
  });

  // Render highlighted text
  const renderHighlightedText = (text, highlightIndices) => {
    if (!highlightIndices || highlightIndices.length !== 2) {
      return <span>{text}</span>;
    }

    const [start, end] = highlightIndices;
    const before = text.substring(0, start);
    const match = text.substring(start, end);
    const after = text.substring(end);

    return (
      <span>
        {before}
        <mark className="autocomplete-highlight">{match}</mark>
        {after}
      </span>
    );
  };

  let currentFlatIndex = 0;

  return (
    <div
      className="autocomplete-dropdown"
      ref={dropdownRef}
      role="listbox"
      aria-label="Search suggestions"
    >
      {suggestions.map((group, groupIndex) => (
        <div key={groupIndex} className="autocomplete-group" role="group">
          <div className="autocomplete-category" role="presentation">
            {group.category}
          </div>

          {group.suggestions.map((suggestion, suggestionIndex) => {
            const suggestionFlatIndex = currentFlatIndex++;
            const isSelected = suggestionFlatIndex === selectedIndex;

            return (
              <div
                key={suggestionIndex}
                className={`autocomplete-suggestion ${isSelected ? 'highlighted' : ''}`}
                onClick={() => onSelect(suggestionFlatIndex)}
                onMouseEnter={() => {
                  // Optional: Update selected index on hover
                  // Could add this if you want hover to change keyboard selection
                }}
                role="option"
                aria-selected={isSelected}
                aria-label={`${suggestion.text}, ${group.category}, ${suggestion.count} results`}
              >
                <span className="autocomplete-suggestion-text">
                  {renderHighlightedText(suggestion.text, suggestion.highlightIndices)}
                </span>
                <span className="autocomplete-suggestion-count">
                  ({suggestion.count})
                </span>
              </div>
            );
          })}
        </div>
      ))}

      {suggestions.length === 0 && (
        <div className="autocomplete-no-results">
          <div>No suggestions found</div>
          <div className="autocomplete-no-results-hint">
            Try: smith names, school names, sword types
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteDropdown;
