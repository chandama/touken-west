import React, { useState, useEffect } from 'react';
import './styles/AncientJapan.css';
import '../styles/theme.css';
import '../styles/App.css';
import AncientJapanMap from '../components/AncientJapanMap.jsx';
import DarkModeToggle from '../components/DarkModeToggle.jsx';

/**
 * Ancient Japan page - Interactive map of historical Japanese provinces (Gokishichidō)
 */
function AncientJapanApp() {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleProvinceClick = (province) => {
    setSelectedProvince(prev => prev?.id === province.id ? null : province);
  };

  return (
    <div className="AncientJapanApp">
      <header className="ancient-header">
        <div className="ancient-header-content">
          <div className="ancient-header-text">
            <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="ancient-header-logo" />
            <div className="ancient-header-title">
              <h1>Ancient Provinces</h1>
              <p>Gokishichidō - Five Provinces and Seven Circuits</p>
            </div>
          </div>
          <div className="ancient-header-actions">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            <a href="/" className="ancient-back-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Database
            </a>
          </div>
        </div>
      </header>

      <div className="ancient-map-fullscreen">
        <AncientJapanMap
          onProvinceClick={handleProvinceClick}
          selectedProvince={selectedProvince?.id}
        />
      </div>
    </div>
  );
}

export default AncientJapanApp;
