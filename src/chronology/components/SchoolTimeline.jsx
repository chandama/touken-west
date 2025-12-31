import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';

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
  const [autoZoom, setAutoZoom] = useState(true);
  const [manualZoom, setManualZoom] = useState(null); // { startYear, endYear }
  const [containerHeight, setContainerHeight] = useState(400); // Default height
  const [isMobile, setIsMobile] = useState(false);
  const [mobileZoomLevel, setMobileZoomLevel] = useState(1); // 1 = normal, 2 = 2x wider, etc.

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate the "fit" range based on selected schools
  const fitRange = useMemo(() => {
    if (schools.length === 0) return null;

    const allYears = schools.flatMap(s => [s.startYear, s.endYear]);
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);

    const padding = 25;
    const startYear = Math.floor((minYear - padding) / 25) * 25;
    const endYear = Math.ceil((maxYear + padding) / 25) * 25;

    return { startYear, endYear };
  }, [schools]);

  // Auto-zoom when schools change (if autoZoom is enabled)
  useEffect(() => {
    if (autoZoom && fitRange) {
      setManualZoom(null);
    }
  }, [autoZoom, fitRange]);

  // Full range for mobile - always show complete timeline, use zoom for scale
  const mobileFullRange = { startYear: 800, endYear: 1900 };

  // The actual timeline config
  // On mobile: always use full range (scroll to navigate, zoom changes scale)
  // On desktop: use zoom to change visible range
  const timelineConfig = useMemo(() => {
    if (isMobile) {
      return {
        startYear: mobileFullRange.startYear,
        endYear: mobileFullRange.endYear,
        range: mobileFullRange.endYear - mobileFullRange.startYear,
      };
    }

    const range = manualZoom || fitRange;
    if (!range) return null;

    return {
      startYear: range.startYear,
      endYear: range.endYear,
      range: range.endYear - range.startYear,
    };
  }, [manualZoom, fitRange, isMobile]);

  // Calculate dynamic width for mobile based on zoom level
  // Zoom in = wider chart = more px per year = scroll to see full timeline
  const mobileChartWidth = useMemo(() => {
    if (!isMobile) return null;
    // Base width of 800px at zoom level 1
    // Each zoom level doubles the width
    const baseWidth = 800;
    return baseWidth * mobileZoomLevel;
  }, [isMobile, mobileZoomLevel]);

  // Mobile zoom handlers (scale-based, not range-based)
  const handleMobileZoomIn = useCallback(() => {
    setMobileZoomLevel(prev => Math.min(prev + 0.5, 4)); // Max 4x zoom
  }, []);

  const handleMobileZoomOut = useCallback(() => {
    setMobileZoomLevel(prev => Math.max(prev - 0.5, 0.5)); // Min 0.5x zoom
  }, []);

  const handleMobileZoomReset = useCallback(() => {
    setMobileZoomLevel(1);
  }, []);

  // Zoom to fit handler
  const handleZoomToFit = useCallback(() => {
    setManualZoom(null);
    setAutoZoom(true);
  }, []);

  // Zoom in (narrow the range by 20%)
  const handleZoomIn = useCallback(() => {
    if (!timelineConfig) return;
    const { startYear, endYear, range } = timelineConfig;
    const shrink = Math.max(range * 0.1, 25);
    const newStart = Math.round((startYear + shrink) / 25) * 25;
    const newEnd = Math.round((endYear - shrink) / 25) * 25;
    if (newEnd - newStart >= 100) {
      setManualZoom({ startYear: newStart, endYear: newEnd });
      setAutoZoom(false);
    }
  }, [timelineConfig]);

  // Zoom out (expand the range by 20%)
  const handleZoomOut = useCallback(() => {
    if (!timelineConfig) return;
    const { startYear, endYear, range } = timelineConfig;
    const expand = range * 0.1;
    const newStart = Math.round((startYear - expand) / 25) * 25;
    const newEnd = Math.round((endYear + expand) / 25) * 25;
    setManualZoom({
      startYear: Math.max(newStart, 700),
      endYear: Math.min(newEnd, 1900)
    });
    setAutoZoom(false);
  }, [timelineConfig]);

  // Measure container height for dynamic bar sizing
  useEffect(() => {
    const container = barsContainerRef.current;
    if (!container) return;

    const updateHeight = () => {
      const height = container.clientHeight;
      if (height > 0) {
        setContainerHeight(height);
      }
    };

    // Initial measurement
    updateHeight();

    // Watch for resize
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const sortedSchools = useMemo(() => {
    return [...schools].sort((a, b) => {
      if (a.tradition !== b.tradition) {
        return a.tradition.localeCompare(b.tradition);
      }
      return a.startYear - b.startYear;
    });
  }, [schools]);

  const yearToPercent = (year) => {
    if (!timelineConfig) return 0;
    return ((year - timelineConfig.startYear) / timelineConfig.range) * 100;
  };

  const getBarWidth = (school) => {
    return yearToPercent(school.endYear) - yearToPercent(school.startYear);
  };

  const gridLines = useMemo(() => {
    if (!timelineConfig) return [];
    const lines = [];
    const step = 50;
    for (let year = Math.ceil(timelineConfig.startYear / step) * step; year <= timelineConfig.endYear; year += step) {
      lines.push(year);
    }
    return lines;
  }, [timelineConfig]);

  const handleMouseMove = (e, school) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredSchool(school);
  };

  const handleMouseLeave = () => {
    setHoveredSchool(null);
  };

  if (!timelineConfig || schools.length === 0) {
    return <div className="timeline-empty">No schools selected</div>;
  }

  // Dynamic bar sizing based on available height
  const minBarHeight = 12;
  const maxBarHeight = 60; // Allow bars to grow larger when few schools
  const minGap = 2;
  const maxGap = 8;
  const availableHeight = containerHeight - 32; // Subtract padding

  // Calculate optimal bar height to fit all schools and fill the space
  const idealBarHeight = Math.floor(availableHeight / sortedSchools.length) - maxGap;
  const barHeight = Math.max(minBarHeight, Math.min(maxBarHeight, idealBarHeight));
  const barGap = barHeight >= 30 ? maxGap : barHeight >= 20 ? 4 : minGap;
  const totalBarsHeight = sortedSchools.length * (barHeight + barGap);

  // Adjust font size based on bar height
  const fontSize = barHeight >= 30 ? 14 : barHeight >= 20 ? 12 : barHeight >= 14 ? 10 : 9;

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
            onClick={isMobile ? handleMobileZoomOut : handleZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          <button
            className={`zoom-btn zoom-fit-btn ${(isMobile ? mobileZoomLevel === 1 : autoZoom) ? 'active' : ''}`}
            onClick={isMobile ? handleMobileZoomReset : handleZoomToFit}
            title={isMobile ? "Reset zoom to 1x" : "Zoom to fit selected schools"}
            aria-label={isMobile ? "Reset zoom" : "Zoom to fit"}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>
            </svg>
            <span>{isMobile ? `${mobileZoomLevel}x` : 'Fit'}</span>
          </button>
          <button
            className="zoom-btn"
            onClick={isMobile ? handleMobileZoomIn : handleZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          {!isMobile && (
            <label className="auto-zoom-toggle" title="Automatically adjust zoom when schools change">
              <input
                type="checkbox"
                checked={autoZoom}
                onChange={(e) => setAutoZoom(e.target.checked)}
              />
              <span>Auto</span>
            </label>
          )}
        </div>
      </div>

      {/* Main chart area */}
      <div className="chart-container">
        {/* Y-axis label area */}
        <div className="y-axis-label">
          <span>Schools</span>
        </div>

        {/* Chart plot area */}
        <div
          className="chart-plot-area"
          style={mobileChartWidth ? { minWidth: `${mobileChartWidth}px` } : undefined}
        >
          {/* Scrollable bars area */}
          <div className="timeline-bars-container" ref={barsContainerRef}>
            {/* Background grid - fills entire container */}
            <div className="timeline-grid-background">
              {/* Period background bands */}
              {PERIOD_MARKERS.filter(p =>
                p.endYear > timelineConfig.startYear && p.year < timelineConfig.endYear
              ).map(period => {
                const startPercent = Math.max(0, yearToPercent(Math.max(period.year, timelineConfig.startYear)));
                const endPercent = Math.min(100, yearToPercent(Math.min(period.endYear, timelineConfig.endYear)));
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
              {PERIOD_MARKERS.filter(p => p.year > timelineConfig.startYear && p.year < timelineConfig.endYear).map(period => (
                <div
                  key={period.year}
                  className="period-divider"
                  style={{ left: `${yearToPercent(period.year)}%` }}
                />
              ))}
            </div>

            {/* Bars - centered vertically with smooth transitions */}
            <div className="timeline-bars-wrapper">
              {sortedSchools.map((school, index) => {
                const color = TRADITION_COLORS[school.tradition] || '#9E9E9E';
                const hasPeak = school.peakStart && school.peakEnd;
                const barWidthPercent = getBarWidth(school);

                return (
                  <div
                    key={school.name}
                    className="timeline-row"
                    style={{
                      height: barHeight,
                      marginBottom: index < sortedSchools.length - 1 ? barGap : 0,
                    }}
                  >
                    <div
                      className="timeline-bar"
                      style={{
                        left: `${yearToPercent(school.startYear)}%`,
                        width: `${barWidthPercent}%`,
                        backgroundColor: color,
                      }}
                      onMouseMove={(e) => handleMouseMove(e, school)}
                      onMouseLeave={handleMouseLeave}
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
            {PERIOD_MARKERS.filter(p => p.year >= timelineConfig.startYear && p.year <= timelineConfig.endYear).map(period => (
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

            {/* Period labels */}
            {/* Period labels - centered within each band */}
            <div className="x-axis-periods">
              {PERIOD_MARKERS.filter(p =>
                p.endYear > timelineConfig.startYear && p.year < timelineConfig.endYear
              ).map(period => {
                const startPercent = Math.max(0, yearToPercent(Math.max(period.year, timelineConfig.startYear)));
                const endPercent = Math.min(100, yearToPercent(Math.min(period.endYear, timelineConfig.endYear)));
                const centerPercent = (startPercent + endPercent) / 2;
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
