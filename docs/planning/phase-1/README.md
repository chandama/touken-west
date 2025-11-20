# Phase 1: Core UX Enhancements

**Status**: 🔵 Not Started
**Priority**: High
**Estimated Complexity**: Medium

## Overview

Phase 1 focuses on improving the core user experience with advanced filtering and search capabilities. These enhancements will make it easier for users to discover and explore the sword database through intuitive, powerful search tools.

## Objectives

1. **Implement sticky tag/multi-keyword search** - Allow users to apply multiple search terms simultaneously and see them as removable tags
2. **Add dynamic cascading filters** - Update filter dropdowns to show only relevant options based on currently selected filters
3. **Extract and display Meito status** - Parse the Description field to identify famous named swords and display this prominently

## Key Features

### 1. Sticky Tag Search
- Display active search keywords as visual tags/chips
- Allow adding multiple keywords simultaneously
- Click to remove individual search tags
- Persist search state in URL for shareability
- Clear all tags with single action

### 2. Dynamic Cascading Filters
- When a School is selected, only show Smiths from that school
- Filter Type options based on selected School/Period
- Show Authentication levels only for matching results
- Update Province options dynamically
- Display count of available options in each filter
- Gracefully handle empty filter states

### 3. Meito Detection & Display
- Parse Description field for "Meito" keyword
- Extract famous sword names (e.g., "Dojigiri", "Onimaru")
- Add dedicated "Famous Sword" field in Sword Detail view
- Add visual indicator (badge/icon) for Meito in table view
- Create filter option for Meito swords only

## Technical Considerations

### State Management
- May need to introduce Context API or lightweight state management
- Consider React Query for filter state synchronization
- URL state management for shareable filtered views

### Performance
- Memoize filter calculations to avoid re-computing on every render
- Debounce search input for performance
- Consider virtualizing table if performance degrades with filters

### Data Processing
- Create utility functions for Meito extraction
- Build index of School → Smith relationships for faster filtering
- Cache computed filter options

## Dependencies

- No external dependencies required
- Works with existing CSV data structure
- May benefit from URL state library (e.g., use-query-params)

## Success Criteria

- [ ] Users can add/remove multiple search keywords as visible tags
- [ ] Filter dropdowns update in real-time based on current selections
- [ ] Meito swords are clearly identified in detail view
- [ ] Filter combinations return correct results
- [ ] Performance remains smooth with all filters active
- [ ] URL reflects current filter state (shareable links)

## Out of Scope

- Advanced search syntax (AND/OR/NOT operators)
- Saved search presets
- Search history
- Full-text search with ranking

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Filter combinations return no results | High | Show message with option to clear filters |
| Performance degradation with complex filters | Medium | Implement memoization and debouncing |
| Meito detection false positives | Low | Manual review and refinement of detection logic |

## Files to Modify

- `src/components/SearchBar.jsx` - Add tag functionality
- `src/components/FilterPanel.jsx` - Implement cascading filters
- `src/components/SwordDetail.jsx` - Display Meito status
- `src/App.js` - Update filtering logic
- `src/utils/csvParser.js` - Add Meito extraction utilities

## Next Steps

See [tasks.md](./tasks.md) for detailed implementation checklist.

---

**Estimated Duration**: TBD
**Blockers**: None
