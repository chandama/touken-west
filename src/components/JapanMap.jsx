import React, { useState, useEffect, useRef, useCallback } from 'react';
import './JapanMap.css';

const JapanMap = ({ onPrefectureClick, selectedPrefecture }) => {
  const [mapData, setMapData] = useState(null);
  const [labelData, setLabelData] = useState(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 846 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Initial viewBox dimensions
  const INITIAL_WIDTH = 1000;
  const INITIAL_HEIGHT = 846;
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;

  // Load map data (paths and bounding boxes)
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const response = await fetch('/maps/advanced-data.js');
        const text = await response.text();

        // Parse the JS file to extract the data
        const dataMatch = text.match(/var\s+simplemaps_countrymap_mapinfo\s*=\s*(\{[\s\S]*\});?\s*$/);
        if (dataMatch) {
          const evalData = new Function('return ' + dataMatch[1])();
          setMapData(evalData);
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
      }
    };
    loadMapData();
  }, []);

  // Load label data
  useEffect(() => {
    const loadLabelData = async () => {
      try {
        const response = await fetch('/maps/mapdata.js');
        const text = await response.text();

        // Parse the JS file to extract the data
        const dataMatch = text.match(/var\s+simplemaps_countrymap_mapdata\s*=\s*(\{[\s\S]*\});?\s*$/);
        if (dataMatch) {
          const evalData = new Function('return ' + dataMatch[1])();
          setLabelData(evalData);
        }
      } catch (error) {
        console.error('Failed to load label data:', error);
      }
    };
    loadLabelData();
  }, []);

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
    if (e.button === 0) { // Left click only
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

    // Zoom towards center
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

    // Zoom from center
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
    setViewBox({ x: 0, y: 0, width: INITIAL_WIDTH, height: INITIAL_HEIGHT });
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
      <div className="japan-map-container">
        <div className="japan-map-loading">Loading map...</div>
      </div>
    );
  }

  const paths = mapData.paths || {};
  const bboxes = mapData.state_bbox_array || {};
  const labels = labelData?.labels || {};

  // Calculate font size based on scale (labels get smaller when zoomed out)
  const baseFontSize = 5.5;
  const fontSize = Math.max(4, Math.min(8, baseFontSize / Math.sqrt(scale)));

  return (
    <div className="japan-map-container" ref={containerRef}>
      <div className="japan-map-controls">
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

      <svg
        ref={svgRef}
        className={`japan-map-svg ${isDragging ? 'dragging' : ''}`}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
      >
        {/* Prefecture paths */}
        {Object.keys(paths).sort().map(code => (
          <path
            key={code}
            d={paths[code]}
            className={`prefecture ${selectedPrefecture === code ? 'selected' : ''}`}
            id={code}
            onClick={() => onPrefectureClick && onPrefectureClick(code)}
          />
        ))}

        {/* Labels */}
        {Object.keys(labels).map(code => {
          const bbox = bboxes[code];
          const label = labels[code];
          if (!bbox || !label) return null;

          // Get center coordinates from bbox
          const cx = parseFloat(bbox.cx);
          const cy = parseFloat(bbox.cy);

          if (isNaN(cx) || isNaN(cy)) return null;

          return (
            <text
              key={`label-${code}`}
              x={cx}
              y={cy}
              className="prefecture-label"
              style={{ fontSize: `${fontSize}px` }}
              onClick={() => onPrefectureClick && onPrefectureClick(code)}
            >
              {label.name}
            </text>
          );
        })}
      </svg>

      <div className="japan-map-hint">
        Scroll to zoom, drag to pan
      </div>
    </div>
  );
};

export default JapanMap;
