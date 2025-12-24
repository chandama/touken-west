import React, { useMemo, useRef, useState } from 'react';

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
  { year: 794, label: 'Heian' },
  { year: 1185, label: 'Kamakura' },
  { year: 1333, label: 'Nanbokucho' },
  { year: 1392, label: 'Muromachi' },
  { year: 1573, label: 'Momoyama' },
  { year: 1600, label: 'Edo' },
];

function SchoolTimeline({ schools }) {
  const containerRef = useRef(null);
  const [hoveredSchool, setHoveredSchool] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const timelineConfig = useMemo(() => {
    if (schools.length === 0) return null;

    const allYears = schools.flatMap(s => [s.startYear, s.endYear]);
    const minYear = Math.min(...allYears, 900);
    const maxYear = Math.max(...allYears, 1600);

    const padding = 50;
    const startYear = Math.floor((minYear - padding) / 50) * 50;
    const endYear = Math.ceil((maxYear + padding) / 50) * 50;

    return {
      startYear,
      endYear,
      range: endYear - startYear,
    };
  }, [schools]);

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

  const barHeight = 28;
  const barGap = 4;
  const totalBarsHeight = sortedSchools.length * (barHeight + barGap);

  return (
    <div className="school-timeline" ref={containerRef}>
      {/* Chart title */}
      <div className="chart-header">
        <h3 className="chart-title">School Active Periods</h3>
        <span className="chart-subtitle">{sortedSchools.length} schools selected</span>
      </div>

      {/* Main chart area */}
      <div className="chart-container">
        {/* Y-axis label area */}
        <div className="y-axis-label">
          <span>Schools</span>
        </div>

        {/* Chart plot area */}
        <div className="chart-plot-area">
          {/* Scrollable bars area */}
          <div className="timeline-bars-container">
            <div className="timeline-content-wrapper">
              {/* Period divider lines - vertical separators */}
              <div className="timeline-period-dividers">
                {PERIOD_MARKERS.filter(p => p.year >= timelineConfig.startYear && p.year <= timelineConfig.endYear).map(period => (
                  <div
                    key={period.year}
                    className="period-divider"
                    style={{ left: `${yearToPercent(period.year)}%` }}
                  />
                ))}
              </div>

              {/* Minor grid lines */}
              <div className="timeline-grid">
                {gridLines.map(year => (
                  <div
                    key={year}
                    className="grid-line"
                    style={{ left: `${yearToPercent(year)}%` }}
                  />
                ))}
              </div>

              {/* Bars - stacked from bottom */}
              <div className="timeline-bars" style={{ minHeight: totalBarsHeight }}>
                {sortedSchools.map((school, index) => {
                  const color = TRADITION_COLORS[school.tradition] || '#9E9E9E';
                  const hasPeak = school.peakStart && school.peakEnd;
                  const barWidthPercent = getBarWidth(school);
                  const bottomOffset = (sortedSchools.length - 1 - index) * (barHeight + barGap);

                  return (
                    <div
                      key={school.name}
                      className="timeline-row"
                      style={{
                        bottom: bottomOffset,
                        height: barHeight,
                      }}
                    >
                      <div
                        className="timeline-bar"
                        style={{
                          left: `${yearToPercent(school.startYear)}%`,
                          width: `${barWidthPercent}%`,
                          backgroundColor: color,
                          height: barHeight,
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
                        <span className="bar-label">{school.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
            <div className="x-axis-periods">
              {PERIOD_MARKERS.filter(p => p.year >= timelineConfig.startYear && p.year <= timelineConfig.endYear).map(period => (
                <div
                  key={period.year}
                  className="period-label-wrapper"
                  style={{ left: `${yearToPercent(period.year)}%` }}
                >
                  <span className="period-name">{period.label}</span>
                </div>
              ))}
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
