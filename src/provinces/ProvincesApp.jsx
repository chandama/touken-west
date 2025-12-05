import React, { useState, useEffect, useMemo } from 'react';
import './styles/Provinces.css';
import '../styles/theme.css';
import '../styles/App.css';
import AncientJapanMap from '../components/AncientJapanMap.jsx';
import DarkModeToggle from '../components/DarkModeToggle.jsx';
import ProvinceDetailPanel from './components/ProvinceDetailPanel.jsx';
import useSwordData from '../hooks/useSwordData.js';

/**
 * Provinces page - Interactive map of historical Japanese provinces (Gokishichidō)
 */
function ProvincesApp() {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Load sword data for province statistics
  const { swords, loading: swordsLoading } = useSwordData();

  // Normalize accented characters for matching (e.g., "Hōki" -> "Hoki")
  const normalizeProvinceName = (name) => {
    if (!name) return '';
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/ō/g, 'o')
      .replace(/Ō/g, 'O')
      .replace(/ū/g, 'u')
      .replace(/Ū/g, 'U')
      .replace(/ā/g, 'a')
      .replace(/Ā/g, 'A')
      .replace(/ē/g, 'e')
      .replace(/Ē/g, 'E')
      .replace(/ī/g, 'i')
      .replace(/Ī/g, 'I');
  };

  // Aggregate sword data by province
  const provinceStats = useMemo(() => {
    const stats = {};
    const normalizedToOriginal = {}; // Map normalized names back to original

    swords.forEach(sword => {
      const province = sword.Province;
      if (!province || province === 'NA' || province === '') return;

      // Normalize the province name for consistent matching
      const normalizedProvince = normalizeProvinceName(province);

      // Keep track of original name (prefer the first one we encounter)
      if (!normalizedToOriginal[normalizedProvince]) {
        normalizedToOriginal[normalizedProvince] = province;
      }

      if (!stats[normalizedProvince]) {
        stats[normalizedProvince] = {
          totalSwords: 0,
          schools: {},
          smiths: {},
          types: {},
          authentications: {},
          originalName: province
        };
      }

      stats[normalizedProvince].totalSwords++;

      // Count schools
      if (sword.School && sword.School !== 'NA') {
        stats[normalizedProvince].schools[sword.School] = (stats[normalizedProvince].schools[sword.School] || 0) + 1;
      }

      // Count smiths
      if (sword.Smith && sword.Smith !== 'NA') {
        stats[normalizedProvince].smiths[sword.Smith] = (stats[normalizedProvince].smiths[sword.Smith] || 0) + 1;
      }

      // Count types
      if (sword.Type && sword.Type !== 'NA') {
        stats[normalizedProvince].types[sword.Type] = (stats[normalizedProvince].types[sword.Type] || 0) + 1;
      }

      // Count authentications - check for all types present in the string
      if (sword.Authentication && sword.Authentication !== 'NA') {
        const authStr = sword.Authentication;
        // Check each authentication type (order matters - check longer/specific matches first)
        const authTypes = [
          { pattern: /Kokuho/i, name: 'Kokuho' },
          { pattern: /Juyo Bunkazai/i, name: 'Juyo Bunkazai' },
          { pattern: /Juyo Bijutsuhin/i, name: 'Juyo Bijutsuhin' },
          { pattern: /Tokubetsu Juyo/i, name: 'Tokubetsu Juyo' },
          { pattern: /Tokubetsu Hozon/i, name: 'Tokubetsu Hozon' },
          { pattern: /(?<!Tokubetsu )(?<!Bunkazai )(?<!Bijutsuhin )Juyo(?! Bunkazai)(?! Bijutsuhin)/i, name: 'Juyo' },
          { pattern: /(?<!Tokubetsu )Hozon/i, name: 'Hozon' }
        ];

        authTypes.forEach(({ pattern, name }) => {
          if (pattern.test(authStr)) {
            stats[normalizedProvince].authentications[name] = (stats[normalizedProvince].authentications[name] || 0) + 1;
          }
        });
      }
    });

    // Convert counts to sorted arrays
    Object.keys(stats).forEach(province => {
      // Total counts
      stats[province].totalSchools = Object.keys(stats[province].schools).length;
      stats[province].totalSmiths = Object.keys(stats[province].smiths).length;

      stats[province].topSchools = Object.entries(stats[province].schools)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      stats[province].topSmiths = Object.entries(stats[province].smiths)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      stats[province].typeBreakdown = Object.entries(stats[province].types)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      stats[province].authBreakdown = Object.entries(stats[province].authentications)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    });

    return stats;
  }, [swords]);

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

  const handleClosePanel = () => {
    setSelectedProvince(null);
  };

  // Get stats for the selected province (normalize name for matching)
  const selectedProvinceStats = selectedProvince
    ? provinceStats[normalizeProvinceName(selectedProvince.nameEn)] || null
    : null;

  return (
    <div className="ProvincesApp">
      <header className="subpage-header">
        <div className="subpage-header-content">
          <div className="subpage-header-text">
            <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="subpage-header-logo" />
            <div className="subpage-header-title">
              <h1>Ancient Provinces</h1>
              <p>Gokishichidō - Five Provinces and Seven Circuits</p>
            </div>
          </div>
          <div className="subpage-header-actions">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            <a href="/" className="header-nav-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Database
            </a>
          </div>
        </div>
      </header>

      <div className="provinces-map-fullscreen">
        <AncientJapanMap
          onProvinceClick={handleProvinceClick}
          selectedProvince={selectedProvince?.id}
        />
      </div>

      {/* Province Detail Panel */}
      <ProvinceDetailPanel
        province={selectedProvince}
        stats={selectedProvinceStats}
        loading={swordsLoading}
        onClose={handleClosePanel}
      />
    </div>
  );
}

export default ProvincesApp;
