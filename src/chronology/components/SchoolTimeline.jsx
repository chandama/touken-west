import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';

// Constants for pan/zoom limits
const FULL_YEAR_RANGE = { min: 700, max: 1900 };
const MIN_VISIBLE_SCHOOLS = 3;  // Minimum schools visible when zoomed in
const MIN_YEAR_SPAN = 50;       // Minimum years visible when zoomed in

// Helper function to clamp a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const TRADITION_COLORS = {
  Yamashiro: '#5B8BD4',
  Bizen: '#E07B7B',
  Yamato: '#9B7BD4',
  Soshu: '#6BD4A0',
  Mino: '#D4A86B',
  Bitchu: '#D46BA8',
  Bingo: '#6BC4D4',
  Hoki: '#A8D46B',
  Chikuzen: '#D4916B',
  Higo: '#916BD4',
  Bungo: '#6B91D4',
  Satsuma: '#D46B91',
  Dewa: '#6BD4B8',
  Echizen: '#B86BD4',
  Echigo: '#D4B86B',
  Kaga: '#6BA8D4',
  Suruga: '#D46BC4',
  Various: '#9E9E9E',
};

const PERIOD_MARKERS = [
  { year: 794, endYear: 1185, label: 'Heian', color: 'rgba(139, 92, 246, 0.08)' },      // purple tint
  { year: 1185, endYear: 1333, label: 'Kamakura', color: 'rgba(59, 130, 246, 0.08)' },  // blue tint
  { year: 1333, endYear: 1392, label: 'Nanbokucho', color: 'rgba(236, 72, 153, 0.08)' }, // pink tint
  { year: 1392, endYear: 1600, label: 'Muromachi', color: 'rgba(34, 197, 94, 0.08)' },  // green tint
  { year: 1600, endYear: 1868, label: 'Edo', color: 'rgba(249, 115, 22, 0.08)' },       // orange tint
];

const PERIOD_COLORS_DARK = {
  Heian: 'rgba(139, 92, 246, 0.15)',
  Kamakura: 'rgba(59, 130, 246, 0.15)',
  Nanbokucho: 'rgba(236, 72, 153, 0.15)',
  Muromachi: 'rgba(34, 197, 94, 0.15)',
  Edo: 'rgba(249, 115, 22, 0.15)',
};

function SchoolTimeline({ schools }) {
  const containerRef = useRef(null);
  const barsContainerRef = useRef(null);
  const [hoveredSchool, setHoveredSchool] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [containerHeight, setContainerHeight] = useState(400);
  const [isMobile, setIsMobile] = useState(false);

  // 2D ViewBox state for pan/zoom
  const [viewBox, setViewBox] = useState({
    x: FULL_YEAR_RANGE.min,      // Start year
    y: 0,                         // Start school index
    width: FULL_YEAR_RANGE.max - FULL_YEAR_RANGE.min,  // Visible year range
    height: 10,                   // Visible school count (will be auto-set)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch tracking refs
  const lastTouchDistance = useRef(null);
  const lastTouchCenter = useRef(null);

  // Total schools count for calculations
  const totalSchools = schools.length;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate "fit" dimensions based on selected schools
  const fitDimensions = useMemo(() => {
    if (schools.length === 0) {
      return { startYear: FULL_YEAR_RANGE.min, width: FULL_YEAR_RANGE.max - FULL_YEAR_RANGE.min, height: 10 };
    }

    const allYears = schools.flatMap(s => [s.startYear, s.endYear]);
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);
    const padding = 25;
    const startYear = Math.max(FULL_YEAR_RANGE.min, Math.floor((minYear - padding) / 25) * 25);
    const endYear = Math.min(FULL_YEAR_RANGE.max, Math.ceil((maxYear + padding) / 25) * 25);

    return {
      startYear,
      width: endYear - startYear,
      height: schools.length,
    };
  }, [schools]);

  // Initialize viewBox when schools change - fit all schools
  useEffect(() => {
    if (schools.length === 0) return;

    setViewBox({
      x: fitDimensions.startYear,
      y: 0,
      width: fitDimensions.width,
      height: fitDimensions.height,
    });
  }, [fitDimensions]);

  // Measure container height
  useEffect(() => {
    const container = barsContainerRef.current;
    if (!container) return;

    const updateHeight = () => {
      const height = container.clientHeight;
      if (height > 0) {
        setContainerHeight(height);
      }
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Touch helper functions
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches, rect) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
    y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
  });

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !barsContainerRef.current) return;

    const rect = barsContainerRef.current.getBoundingClientRect();
    // Account for padding: 24px left/right, 16px top/bottom
    const contentWidth = rect.width - 48;
    const contentHeight = rect.height - 32;

    const dx = (e.clientX - dragStart.x) / contentWidth * viewBox.width;
    const dy = (e.clientY - dragStart.y) / contentHeight * viewBox.height;

    setViewBox(prev => ({
      ...prev,
      x: clamp(prev.x - dx, FULL_YEAR_RANGE.min, FULL_YEAR_RANGE.max - prev.width),
      y: clamp(prev.y - dy, 0, Math.max(0, totalSchools - prev.height)),
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, viewBox, totalSchools]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom handler with smart axis zooming
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!barsContainerRef.current) return;

    const rect = barsContainerRef.current.getBoundingClientRect();
    // Account for padding: 24px left/right, 16px top/bottom
    const contentWidth = rect.width - 48;
    const contentHeight = rect.height - 32;

    // Adjust mouse position for padding offset
    const mouseX = (e.clientX - rect.left - 24) / contentWidth;
    const mouseY = (e.clientY - rect.top - 16) / contentHeight;

    // Zoom factor: scroll down = zoom out (larger view), scroll up = zoom in (smaller view)
    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;
    const isZoomingIn = zoomFactor < 1;

    const fullYearRange = FULL_YEAR_RANGE.max - FULL_YEAR_RANGE.min;

    let newWidth, newHeight;

    // Smart zoom: if one axis is "wider" than fit while other is at limit, zoom that axis first
    const xIsWiderThanFit = viewBox.width > fitDimensions.width * 1.05; // 5% tolerance
    const yIsAtMax = viewBox.height >= totalSchools - 0.1; // Small tolerance for floating point

    if (isZoomingIn && xIsWiderThanFit && yIsAtMax) {
      // Zooming in: x-axis is wider than fit, y is at max - only zoom x until it reaches fit
      newWidth = clamp(viewBox.width * zoomFactor, fitDimensions.width, fullYearRange);
      newHeight = viewBox.height; // Keep y at max
    } else if (!isZoomingIn && yIsAtMax) {
      // Zooming out: y is at max - only zoom x-axis out
      newWidth = clamp(viewBox.width * zoomFactor, MIN_YEAR_SPAN, fullYearRange);
      newHeight = viewBox.height; // Keep y at max
    } else {
      // Normal unified zoom for both axes
      newWidth = clamp(viewBox.width * zoomFactor, MIN_YEAR_SPAN, fullYearRange);
      newHeight = clamp(viewBox.height * zoomFactor, MIN_VISIBLE_SCHOOLS, totalSchools);
    }

    // Check if we've hit the limits
    if (newWidth === viewBox.width && newHeight === viewBox.height) return;

    // Zoom toward mouse position
    const yearAtMouse = viewBox.x + mouseX * viewBox.width;
    const schoolAtMouse = viewBox.y + mouseY * viewBox.height;

    const newX = clamp(yearAtMouse - mouseX * newWidth, FULL_YEAR_RANGE.min, FULL_YEAR_RANGE.max - newWidth);
    const newY = clamp(schoolAtMouse - mouseY * newHeight, 0, Math.max(0, totalSchools - newHeight));

    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  }, [viewBox, totalSchools, fitDimensions]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const rect = barsContainerRef.current?.getBoundingClientRect();
      if (rect) {
        lastTouchDistance.current = getTouchDistance(e.touches);
        lastTouchCenter.current = getTouchCenter(e.touches, rect);
      }
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      e.preventDefault();
      const rect = barsContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Account for padding: 24px left/right, 16px top/bottom
      const contentWidth = rect.width - 48;
      const contentHeight = rect.height - 32;

      const currentDistance = getTouchDistance(e.touches);
      const currentCenter = getTouchCenter(e.touches, rect);

      // Pinch out = zoom in (smaller view), pinch in = zoom out (larger view)
      const zoomFactor = lastTouchDistance.current / currentDistance;
      const isZoomingIn = zoomFactor < 1;

      const fullYearRange = FULL_YEAR_RANGE.max - FULL_YEAR_RANGE.min;

      // Smart zoom logic
      const xIsWiderThanFit = viewBox.width > fitDimensions.width * 1.05;
      const yIsAtMax = viewBox.height >= totalSchools - 0.1;

      let newWidth, newHeight;

      if (isZoomingIn && xIsWiderThanFit && yIsAtMax) {
        newWidth = clamp(viewBox.width * zoomFactor, fitDimensions.width, fullYearRange);
        newHeight = viewBox.height;
      } else if (!isZoomingIn && yIsAtMax) {
        newWidth = clamp(viewBox.width * zoomFactor, MIN_YEAR_SPAN, fullYearRange);
        newHeight = viewBox.height;
      } else {
        newWidth = clamp(viewBox.width * zoomFactor, MIN_YEAR_SPAN, fullYearRange);
        newHeight = clamp(viewBox.height * zoomFactor, MIN_VISIBLE_SCHOOLS, totalSchools);
      }

      if (newWidth !== viewBox.width || newHeight !== viewBox.height) {
        // Adjust for padding offset (24px left, 16px top)
        const mouseX = (currentCenter.x - 24) / contentWidth;
        const mouseY = (currentCenter.y - 16) / contentHeight;

        const yearAtCenter = viewBox.x + mouseX * viewBox.width;
        const schoolAtCenter = viewBox.y + mouseY * viewBox.height;

        setViewBox({
          x: clamp(yearAtCenter - mouseX * newWidth, FULL_YEAR_RANGE.min, FULL_YEAR_RANGE.max - newWidth),
          y: clamp(schoolAtCenter - mouseY * newHeight, 0, Math.max(0, totalSchools - newHeight)),
          width: newWidth,
          height: newHeight,
        });
      }

      lastTouchDistance.current = currentDistance;
      lastTouchCenter.current = currentCenter;
    } else if (e.touches.length === 1 && isDragging && barsContainerRef.current) {
      const rect = barsContainerRef.current.getBoundingClientRect();
      // Account for padding: 24px left/right, 16px top/bottom
      const contentWidth = rect.width - 48;
      const contentHeight = rect.height - 32;

      const dx = (e.touches[0].clientX - dragStart.x) / contentWidth * viewBox.width;
      const dy = (e.touches[0].clientY - dragStart.y) / contentHeight * viewBox.height;

      setViewBox(prev => ({
        ...prev,
        x: clamp(prev.x - dx, FULL_YEAR_RANGE.min, FULL_YEAR_RANGE.max - prev.width),
        y: clamp(prev.y - dy, 0, Math.max(0, totalSchools - prev.height)),
      }));

      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, [viewBox, isDragging, dragStart, totalSchools, fitDimensions]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
    setIsDragging(false);
  }, []);

  // Event listeners for mouse/wheel
  useEffect(() => {
    const container = barsContainerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleWheel, handleMouseUp, handleMouseMove]);

  // Zoom button handlers with smart axis zooming
  const handleZoomIn = useCallback(() => {
    const zoomFactor = 0.75; // Smaller = zoom in
    const fullYearRange = FULL_YEAR_RANGE.max - FULL_YEAR_RANGE.min;

    // Smart zoom logic
    const xIsWiderThanFit = viewBox.width > fitDimensions.width * 1.05;
    const yIsAtMax = viewBox.height >= totalSchools - 0.1;

    let newWidth, newHeight;

    if (xIsWiderThanFit && yIsAtMax) {
      newWidth = clamp(viewBox.width * zoomFactor, fitDimensions.width, fullYearRange);
      newHeight = viewBox.height;
    } else {
      newWidth = clamp(viewBox.width * zoomFactor, MIN_YEAR_SPAN, fullYearRange);
      newHeight = clamp(viewBox.height * zoomFactor, MIN_VISIBLE_SCHOOLS, totalSchools);
    }

    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;

    setViewBox({
      x: clamp(centerX - newWidth / 2, FULL_YEAR_RANGE.min, FULL_YEAR_RANGE.max - newWidth),
      y: clamp(centerY - newHeight / 2, 0, Math.max(0, totalSchools - newHeight)),
      width: newWidth,
      height: newHeight,
    });
  }, [viewBox, totalSchools, fitDimensions]);

  const handleZoomOut = useCallback(() => {
    const zoomFactor = 1.33; // Larger = zoom out
    const fullYearRange = FULL_YEAR_RANGE.max - FULL_YEAR_RANGE.min;

    // Smart zoom logic - if y is at max, only zoom x
    const yIsAtMax = viewBox.height >= totalSchools - 0.1;

    let newWidth, newHeight;

    if (yIsAtMax) {
      newWidth = clamp(viewBox.width * zoomFactor, MIN_YEAR_SPAN, fullYearRange);
      newHeight = viewBox.height;
    } else {
      newWidth = clamp(viewBox.width * zoomFactor, MIN_YEAR_SPAN, fullYearRange);
      newHeight = clamp(viewBox.height * zoomFactor, MIN_VISIBLE_SCHOOLS, totalSchools);
    }

    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;

    setViewBox({
      x: clamp(centerX - newWidth / 2, FULL_YEAR_RANGE.min, FULL_YEAR_RANGE.max - newWidth),
      y: clamp(centerY - newHeight / 2, 0, Math.max(0, totalSchools - newHeight)),
      width: newWidth,
      height: newHeight,
    });
  }, [viewBox, totalSchools, fitDimensions]);

  const handleReset = useCallback(() => {
    if (schools.length === 0) return;

    setViewBox({
      x: fitDimensions.startYear,
      y: 0,
      width: fitDimensions.width,
      height: fitDimensions.height,
    });
  }, [schools, fitDimensions]);

  const sortedSchools = useMemo(() => {
    return [...schools].sort((a, b) => {
      if (a.tradition !== b.tradition) {
        return a.tradition.localeCompare(b.tradition);
      }
      return a.startYear - b.startYear;
    });
  }, [schools]);

  // Convert year to X position (percentage)
  const yearToPercent = useCallback((year) => {
    return ((year - viewBox.x) / viewBox.width) * 100;
  }, [viewBox.x, viewBox.width]);

  // Convert school index to Y position (percentage)
  const schoolToPercent = useCallback((index) => {
    return ((index - viewBox.y) / viewBox.height) * 100;
  }, [viewBox.y, viewBox.height]);

  const getBarWidth = (school) => {
    return yearToPercent(school.endYear) - yearToPercent(school.startYear);
  };

  // Dynamic grid lines based on zoom level
  const gridLines = useMemo(() => {
    const visibleRange = viewBox.width;
    let step;
    if (visibleRange <= 100) step = 10;
    else if (visibleRange <= 200) step = 25;
    else if (visibleRange <= 500) step = 50;
    else step = 100;

    const lines = [];
    const start = Math.ceil(viewBox.x / step) * step;
    for (let year = start; year <= viewBox.x + viewBox.width; year += step) {
      lines.push(year);
    }
    return lines;
  }, [viewBox.x, viewBox.width]);

  const handleBarMouseMove = (e, school) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredSchool(school);
  };

  const handleBarMouseLeave = () => {
    setHoveredSchool(null);
  };

  if (schools.length === 0) {
    return <div className="timeline-empty">No schools selected</div>;
  }

  // Calculate bar height based on visible schools in viewBox
  const visibleSchoolCount = Math.ceil(viewBox.height);
  const availableHeight = containerHeight - 32; // Subtract padding

  // Bar height fills available space for visible schools
  const minBarHeight = 12;
  const maxBarHeight = 80;
  const minGap = 2;
  const maxGap = 8;

  const idealBarHeight = Math.floor(availableHeight / visibleSchoolCount) - maxGap;
  const barHeight = Math.max(minBarHeight, Math.min(maxBarHeight, idealBarHeight));
  const barGap = barHeight >= 30 ? maxGap : barHeight >= 20 ? 4 : minGap;

  // Adjust font size based on bar height
  const fontSize = barHeight >= 30 ? 14 : barHeight >= 20 ? 12 : barHeight >= 14 ? 10 : 9;

  // Calculate which schools are visible
  const visibleSchools = useMemo(() => {
    const startIdx = Math.max(0, Math.floor(viewBox.y) - 1);
    const endIdx = Math.min(sortedSchools.length, Math.ceil(viewBox.y + viewBox.height) + 1);
    return sortedSchools.slice(startIdx, endIdx).map((school, i) => ({
      ...school,
      absoluteIndex: startIdx + i,
    }));
  }, [sortedSchools, viewBox.y, viewBox.height]);

  return (
    <div className="school-timeline" ref={containerRef}>
      {/* Chart title */}
      <div className="chart-header">
        <div className="chart-header-left">
          <h3 className="chart-title">School Active Periods</h3>
          <span className="chart-subtitle">{sortedSchools.length} schools selected</span>
        </div>
        <div className="chart-zoom-controls">
          <button
            className="zoom-btn"
            onClick={handleZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          <button
            className="zoom-btn zoom-fit-btn"
            onClick={handleReset}
            title="Reset to fit all schools"
            aria-label="Zoom to fit"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>
            </svg>
            <span>Fit</span>
          </button>
          <button
            className="zoom-btn"
            onClick={handleZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main chart area */}
      <div className="chart-container">
        {/* Y-axis label area */}
        <div className="y-axis-label">
          <span>Schools</span>
        </div>

        {/* Chart plot area */}
        <div className="chart-plot-area">
          {/* Pan/zoom bars area */}
          <div
            className={`timeline-bars-container ${isDragging ? 'dragging' : ''}`}
            ref={barsContainerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background grid - fills entire container */}
            <div className="timeline-grid-background">
              {/* Period background bands */}
              {PERIOD_MARKERS.filter(p =>
                p.endYear > viewBox.x && p.year < viewBox.x + viewBox.width
              ).map(period => {
                const startPercent = Math.max(0, yearToPercent(Math.max(period.year, viewBox.x)));
                const endPercent = Math.min(100, yearToPercent(Math.min(period.endYear, viewBox.x + viewBox.width)));
                return (
                  <div
                    key={period.label}
                    className="period-band"
                    style={{
                      left: `${startPercent}%`,
                      width: `${endPercent - startPercent}%`,
                      backgroundColor: period.color,
                    }}
                  />
                );
              })}
              {/* Minor grid lines */}
              {gridLines.map(year => (
                <div
                  key={year}
                  className="grid-line"
                  style={{ left: `${yearToPercent(year)}%` }}
                />
              ))}
              {/* Period divider lines - vertical separators */}
              {PERIOD_MARKERS.filter(p => p.year > viewBox.x && p.year < viewBox.x + viewBox.width).map(period => (
                <div
                  key={period.year}
                  className="period-divider"
                  style={{ left: `${yearToPercent(period.year)}%` }}
                />
              ))}
            </div>

            {/* Bars - positioned based on viewBox */}
            <div className="timeline-bars-wrapper">
              {visibleSchools.map((school) => {
                const color = TRADITION_COLORS[school.tradition] || '#9E9E9E';
                const hasPeak = school.peakStart && school.peakEnd;
                const barWidthPercent = getBarWidth(school);
                const topPercent = schoolToPercent(school.absoluteIndex);
                const heightPercent = 100 / viewBox.height;

                return (
                  <div
                    key={`${school.name}-${school.absoluteIndex}`}
                    className="timeline-row"
                    style={{
                      position: 'absolute',
                      top: `${topPercent}%`,
                      height: `${heightPercent}%`,
                      left: 0,
                      right: 0,
                      padding: `${barGap / 2}px 0`,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      className="timeline-bar"
                      style={{
                        left: `${yearToPercent(school.startYear)}%`,
                        width: `${barWidthPercent}%`,
                        backgroundColor: color,
                      }}
                      onMouseMove={(e) => handleBarMouseMove(e, school)}
                      onMouseLeave={handleBarMouseLeave}
                    >
                      {hasPeak && (
                        <div
                          className="peak-period"
                          style={{
                            left: `${((school.peakStart - school.startYear) / (school.endYear - school.startYear)) * 100}%`,
                            width: `${((school.peakEnd - school.peakStart) / (school.endYear - school.startYear)) * 100}%`,
                          }}
                        />
                      )}
                      <span className="bar-label" style={{ fontSize }}>{school.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis */}
          <div className="x-axis">
            {/* Horizontal axis line */}
            <div className="x-axis-line" />

            {/* Period dividers extending down */}
            {PERIOD_MARKERS.filter(p => p.year >= viewBox.x && p.year <= viewBox.x + viewBox.width).map(period => (
              <div
                key={`divider-${period.year}`}
                className="x-axis-period-divider"
                style={{ left: `${yearToPercent(period.year)}%` }}
              />
            ))}

            {/* Tick marks and labels */}
            <div className="x-axis-ticks">
              {gridLines.map(year => (
                <div
                  key={year}
                  className="x-axis-tick"
                  style={{ left: `${yearToPercent(year)}%` }}
                >
                  <div className="tick-mark" />
                  <span className="tick-label">{year}</span>
                </div>
              ))}
            </div>

            {/* Period labels - centered within each band */}
            <div className="x-axis-periods">
              {PERIOD_MARKERS.filter(p =>
                p.endYear > viewBox.x && p.year < viewBox.x + viewBox.width
              ).map(period => {
                const startPercent = Math.max(0, yearToPercent(Math.max(period.year, viewBox.x)));
                const endPercent = Math.min(100, yearToPercent(Math.min(period.endYear, viewBox.x + viewBox.width)));
                return (
                  <div
                    key={period.label}
                    className="period-label-wrapper"
                    style={{
                      left: `${startPercent}%`,
                      width: `${endPercent - startPercent}%`,
                      backgroundColor: period.color,
                    }}
                  >
                    <span className="period-name">{period.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis title */}
          <div className="x-axis-title">
            <span>Year (CE)</span>
          </div>
        </div>

        {/* Pan/zoom hint */}
        <div className="timeline-hint">
          {isMobile ? 'Pinch to zoom, drag to pan' : 'Scroll to zoom, drag to pan'}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSchool && (
        <div
          className="timeline-tooltip"
          style={{
            left: Math.min(tooltipPos.x + 15, containerRef.current?.offsetWidth - 280 || tooltipPos.x),
            top: Math.max(tooltipPos.y - 80, 10),
          }}
        >
          <div className="tooltip-header">
            <span
              className="tooltip-tradition-dot"
              style={{ backgroundColor: TRADITION_COLORS[hoveredSchool.tradition] || '#9E9E9E' }}
            />
            <strong>{hoveredSchool.name}</strong>
          </div>
          <div className="tooltip-grid">
            <span className="tooltip-label">Tradition</span>
            <span className="tooltip-value">{hoveredSchool.tradition}</span>
            <span className="tooltip-label">Province</span>
            <span className="tooltip-value">{hoveredSchool.province}</span>
            <span className="tooltip-label">Active</span>
            <span className="tooltip-value">{hoveredSchool.startYear} – {hoveredSchool.endYear}</span>
            {hoveredSchool.peakStart && hoveredSchool.peakEnd && (
              <>
                <span className="tooltip-label">Peak</span>
                <span className="tooltip-value">{hoveredSchool.peakStart} – {hoveredSchool.peakEnd}</span>
              </>
            )}
          </div>
          {hoveredSchool.description && (
            <div className="tooltip-description">{hoveredSchool.description}</div>
          )}
          {hoveredSchool.notableSmiths && hoveredSchool.notableSmiths.length > 0 && (
            <div className="tooltip-smiths">
              <span className="tooltip-label">Notable smiths</span>
              <span className="tooltip-smith-list">{hoveredSchool.notableSmiths.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SchoolTimeline;
