import React from 'react';

/**
 * DarkModeToggle component for switching between light and dark themes
 */
const DarkModeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button
      className="dark-mode-toggle"
      onClick={onToggle}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default DarkModeToggle;
