import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AncientJapanMap.css';

// Manual label position adjustments for oddly-shaped provinces
const LABEL_OFFSETS = {
  'Tosa': { x: 0, y: -60 },
  'Kii': { x: -20, y: 20 },
  'Echigo': { x: 15, y: 55 },
  'Sanuki': { x: 0, y: 20 },
  'Suruga': { x: 10, y: 15 },
  'Shimōsa': { x: 0, y: 15 },
  'Higo': { x: 25, y: 0 },
  'Hizen': { x: 60, y: -25 },
  'Chikuzen': { x: 0, y: 10 },
  'Bungo': { x: 0, y: 10 },
  'Buzen': { x: 0, y: 10 },
  'Iyo': { x: 0, y: -20 },
  'Iwaki': { x: 30, y: 0 },
  'Owari': { x: 0, y: -10 },
  'Tōtōmi': { x: 0, y: 10 },
  'Suō': { x: 10, y: -5 },
  'Nagato': { x: 0, y: 5 },
  'Kaga': { x: 3, y: 10 },
  'Hōki': { x: 0, y: -10 },
};

// Calculate approximate centroid from SVG path by parsing coordinates
const getPathCentroid = (pathData) => {
  const coords = [];
  // Match all coordinate pairs in the path data
  const regex = /(-?\d+\.?\d*),(-?\d+\.?\d*)/g;
  let match;
  while ((match = regex.exec(pathData)) !== null) {
    coords.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
  }

  // Also match space-separated coordinates like "m -515.27546,830.7416 v 28.6721"
  const moveRegex = /[mMlLhHvVcCsSqQtTaA]\s*(-?\d+\.?\d*)[,\s](-?\d+\.?\d*)/g;
  while ((match = moveRegex.exec(pathData)) !== null) {
    coords.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
  }

  if (coords.length === 0) return { x: 0, y: 0 };

  // Calculate bounding box from coordinates
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  coords.forEach(coord => {
    if (coord.x < minX) minX = coord.x;
    if (coord.x > maxX) maxX = coord.x;
    if (coord.y < minY) minY = coord.y;
    if (coord.y > maxY) maxY = coord.y;
  });

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  };
};

// Japanese circuit names mapping
const CIRCUIT_NAMES_JP = {
  "Saikaidō": "西海道",
  "San'yōdō": "山陽道",
  "San'indō": "山陰道",
  "Nankaidō": "南海道",
  "Kinai": "畿内",
  "Hokurikudō": "北陸道",
  "Tōkaidō": "東海道",
  "Tōsandō": "東山道"
};

const AncientJapanMap = ({ onProvinceClick, selectedProvince }) => {
  const [mapData, setMapData] = useState(null);
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [popupProvince, setPopupProvince] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({ x: -787.25, y: -788.64, width: 2000, height: 2000 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [labelPositions, setLabelPositions] = useState({});
  const [isJapanese, setIsJapanese] = useState(false);
  const svgRef = useRef(null);
  const pathRefs = useRef({});
  const containerRef = useRef(null);

  // Initial viewBox dimensions
  const INITIAL_WIDTH = 2000;
  const INITIAL_HEIGHT = 2000;
  const INITIAL_X = -787.25;
  const INITIAL_Y = -788.64;
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 6;

  // Load map data
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const response = await fetch('/maps/ancient_provinces.json');
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('Failed to load ancient provinces data:', error);
      }
    };
    loadMapData();
  }, []);

  // Close popup when selectedProvince is cleared from parent
  useEffect(() => {
    if (!selectedProvince) {
      setPopupProvince(null);
    }
  }, [selectedProvince]);

  // Calculate label positions after paths are rendered
  useEffect(() => {
    if (!mapData || !svgRef.current) return;

    // Small delay to ensure paths are rendered
    const timer = setTimeout(() => {
      const positions = {};
      mapData.provinces.forEach(province => {
        const pathEl = pathRefs.current[province.id];
        if (pathEl) {
          try {
            const bbox = pathEl.getBBox();
            positions[province.id] = {
              x: bbox.x + bbox.width / 2,
              y: bbox.y + bbox.height / 2
            };
          } catch {
            // Fallback to parsing path data
            positions[province.id] = getPathCentroid(province.path);
          }
        }
      });
      setLabelPositions(positions);
    }, 100);

    return () => clearTimeout(timer);
  }, [mapData]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to SVG coordinates
    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width;
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height;

    // Calculate new scale
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * zoomFactor));

    if (newScale !== scale) {
      const newWidth = INITIAL_WIDTH / newScale;
      const newHeight = INITIAL_HEIGHT / newScale;

      // Adjust viewBox to zoom towards mouse position
      const newX = svgX - (mouseX / rect.width) * newWidth;
      const newY = svgY - (mouseY / rect.height) * newHeight;

      setScale(newScale);
      setViewBox({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    }
  }, [viewBox, scale]);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStart.x) * (viewBox.width / rect.width);
    const dy = (e.clientY - dragStart.y) * (viewBox.height / rect.height);

    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, viewBox]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle zoom buttons
  const handleZoomIn = () => {
    const newScale = Math.min(MAX_SCALE, scale * 1.3);
    const newWidth = INITIAL_WIDTH / newScale;
    const newHeight = INITIAL_HEIGHT / newScale;

    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;

    setScale(newScale);
    setViewBox({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(MIN_SCALE, scale / 1.3);
    const newWidth = INITIAL_WIDTH / newScale;
    const newHeight = INITIAL_HEIGHT / newScale;

    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;

    setScale(newScale);
    setViewBox({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    });
  };

  const handleReset = () => {
    setScale(1);
    setViewBox({ x: INITIAL_X, y: INITIAL_Y, width: INITIAL_WIDTH, height: INITIAL_HEIGHT });
  };

  // Handle province click to show popup
  const handleProvinceClick = (province, e) => {
    e.stopPropagation();

    // Get click position relative to container
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPopupPosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }

    setPopupProvince(province);

    // Also call the external handler if provided
    if (onProvinceClick) {
      onProvinceClick(province);
    }
  };

  // Close popup
  const closePopup = () => {
    setPopupProvince(null);
  };

  // Add event listeners
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      svg.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleWheel, handleMouseUp, handleMouseMove]);

  if (!mapData) {
    return (
      <div className="ancient-map-container">
        <div className="ancient-map-loading">Loading ancient provinces map...</div>
      </div>
    );
  }

  const { provinces, circuitColors } = mapData;

  // Calculate font size based on scale
  const baseFontSize = 18;
  const fontSize = Math.max(10, Math.min(24, baseFontSize / Math.sqrt(scale)));

  return (
    <div className="ancient-map-container" ref={containerRef} onClick={closePopup}>
      <div className="ancient-map-controls">
        <button onClick={handleZoomIn} className="map-control-btn" title="Zoom In">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <button onClick={handleZoomOut} className="map-control-btn" title="Zoom Out">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
        <button onClick={handleReset} className="map-control-btn" title="Reset View">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="ancient-map-legend">
        <div className="legend-header">
          <h4>{isJapanese ? '五畿七道' : 'Gokishichidō Circuits'}</h4>
          <button
            className={`language-toggle ${isJapanese ? 'jp' : 'en'}`}
            onClick={() => setIsJapanese(!isJapanese)}
            aria-label={isJapanese ? 'Switch to English' : 'Switch to Japanese'}
          >
            <span className="lang-toggle-track">
              <span className="lang-toggle-thumb">
                {isJapanese ? (
                  <svg viewBox="0 0 60 40" className="flag-icon">
                    <rect width="60" height="40" fill="#fff"/>
                    <circle cx="30" cy="20" r="12" fill="#bc002d"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 60 30" className="flag-icon">
                    <clipPath id="us-clip"><rect width="60" height="30"/></clipPath>
                    <g clipPath="url(#us-clip)">
                      <rect width="60" height="30" fill="#bf0a30"/>
                      <rect y="2.31" width="60" height="2.31" fill="#fff"/>
                      <rect y="6.92" width="60" height="2.31" fill="#fff"/>
                      <rect y="11.54" width="60" height="2.31" fill="#fff"/>
                      <rect y="16.15" width="60" height="2.31" fill="#fff"/>
                      <rect y="20.77" width="60" height="2.31" fill="#fff"/>
                      <rect y="25.38" width="60" height="2.31" fill="#fff"/>
                      <rect width="24" height="16.15" fill="#002868"/>
                    </g>
                  </svg>
                )}
              </span>
            </span>
          </button>
        </div>
        {Object.entries(circuitColors).map(([circuit, color]) => (
          <div key={circuit} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: color }}></span>
            <span className="legend-label">{isJapanese ? CIRCUIT_NAMES_JP[circuit] : circuit}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredProvince && !popupProvince && (
        <div className="ancient-map-tooltip">
          <div className="tooltip-name-jp">{hoveredProvince.nameJp}</div>
          <div className="tooltip-name-en">{hoveredProvince.nameEn}</div>
          <div className="tooltip-circuit">{hoveredProvince.circuit} ({hoveredProvince.circuitJp})</div>
        </div>
      )}

      {/* Province Popup */}
      {popupProvince && (
        <div
          className="province-popup"
          style={{
            left: Math.min(popupPosition.x, (containerRef.current?.offsetWidth || 400) - 220),
            top: Math.min(popupPosition.y, (containerRef.current?.offsetHeight || 400) - 180)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="popup-close" onClick={closePopup} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          <div className="popup-header">
            <h3 className="popup-name-en">{popupProvince.nameEn}</h3>
            <span className="popup-name-jp">{popupProvince.nameJp}</span>
          </div>

          <div className="popup-divider"></div>

          <div className="popup-section">
            <div className="popup-label">Circuit</div>
            <div className="popup-value">
              <span className="popup-circuit-en">{popupProvince.circuit}</span>
              <span className="popup-circuit-jp">{popupProvince.circuitJp}</span>
            </div>
          </div>

          <div
            className="popup-color-bar"
            style={{ backgroundColor: popupProvince.color }}
          ></div>
        </div>
      )}

      <svg
        ref={svgRef}
        className={`ancient-map-svg ${isDragging ? 'dragging' : ''}`}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
      >
        {/* Ocean background */}
        <rect
          x={viewBox.x - 1000}
          y={viewBox.y - 1000}
          width={viewBox.width + 2000}
          height={viewBox.height + 2000}
          fill="#aadaff"
          className="ocean-bg"
        />

        {/* Province paths */}
        {provinces.map(province => (
          <path
            key={province.id}
            ref={el => pathRefs.current[province.id] = el}
            d={province.path}
            className={`ancient-province ${selectedProvince === province.id ? 'selected' : ''} ${popupProvince?.id === province.id ? 'selected' : ''}`}
            style={{ fill: province.color }}
            onClick={(e) => handleProvinceClick(province, e)}
            onMouseEnter={() => setHoveredProvince(province)}
            onMouseLeave={() => setHoveredProvince(null)}
          />
        ))}

        {/* Province labels */}
        {Object.keys(labelPositions).length > 0 && provinces.map(province => {
          const pos = labelPositions[province.id];
          if (!pos) return null;

          // Apply manual offset if defined for this province
          const offset = LABEL_OFFSETS[province.nameEn] || { x: 0, y: 0 };

          return (
            <text
              key={`label-${province.id}`}
              x={pos.x + offset.x}
              y={pos.y + offset.y}
              className="province-label"
              style={{
                fontSize: `${fontSize}px`,
                pointerEvents: 'none'
              }}
            >
              {isJapanese ? province.nameJp : province.nameEn}
            </text>
          );
        })}
      </svg>

      <div className="ancient-map-hint">
        Scroll to zoom, drag to pan
      </div>
    </div>
  );
};

export default AncientJapanMap;
