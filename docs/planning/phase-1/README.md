# Phase 1: Core UX Enhancements

**Status**: 🟡 In Progress (2 of 5 features complete)
**Priority**: High
**Estimated Complexity**: Medium-High

## Overview

Phase 1 focuses on improving the core user experience with advanced filtering and search capabilities. These enhancements will make it easier for users to discover and explore the sword database through intuitive, powerful search tools, including complex filter combinations and precise search syntax.

## Objectives

1. **Implement sticky tag/multi-keyword search** ✅ - Allow users to apply multiple search terms simultaneously and see them as removable tags
2. **Add dynamic cascading filters** ✅ - Update filter dropdowns to show only relevant options based on currently selected filters
3. **Extract and display Meito status** - Parse the Description field to identify famous named swords and display this prominently
4. **Complex AND/OR filter combinations** - Enable advanced filtering with groups like "(Masamune AND Juyo) OR (Sadamune AND Tokubetsu Juyo)"
5. **Literal string search with quotes** - Support exact phrase matching using double quotes (e.g., "Juyo 11")

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

### 4. Complex AND/OR Filter Combinations
- Create filter groups with AND logic within groups
- Support OR logic between filter groups
- Visual query builder interface
- Example: Find swords that are either (Masamune + Juyo) OR (Sadamune + Tokubetsu Juyo)
- Nested grouping support for complex queries
- Clear visual representation of active filter logic
- Save and reuse complex filter combinations

### 5. Literal String Search with Quoted Phrases
- Support exact phrase matching using double quotes
- Example: `"Juyo 11"` finds only that exact string
- Mix literal and partial searches: `Masamune "Soshu tradition" tanto`
- Visual differentiation for quoted vs unquoted search terms
- Intelligent quote parsing with error handling
- Case-insensitive matching (configurable)
- Help text and examples for users

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

- [x] Users can add/remove multiple search keywords as visible tags
- [x] Filter dropdowns update in real-time based on current selections
- [ ] Meito swords are clearly identified in detail view
- [x] Filter combinations return correct results
- [x] Performance remains smooth with all filters active
- [ ] Complex AND/OR filter groups work correctly
- [ ] Quoted phrase searches return exact matches
- [ ] Mixed quoted/unquoted searches work as expected
- [ ] URL reflects current filter state (shareable links) - deferred

## Out of Scope (Deferred to Later Phases)

- NOT operators (exclusion filters)
- Search history
- Full-text search with relevance ranking
- Natural language query processing
- RegEx search support

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Filter combinations return no results | High | Show message with option to clear filters |
| Performance degradation with complex filters | Medium | Implement memoization and debouncing |
| Meito detection false positives | Low | Manual review and refinement of detection logic |
| Complex filter UI too confusing | High | User testing, clear visual design, examples |
| Quote parsing edge cases | Medium | Comprehensive testing, graceful error handling |
| Performance with deeply nested filter groups | Medium | Limit nesting depth, optimize evaluation |

## Files to Modify

### Already Modified (Features 1-2)
- ✅ `src/components/SearchBar.jsx` - Tag functionality (complete)
- ✅ `src/components/FilterPanel.jsx` - Cascading filters (complete)
- ✅ `src/App.js` - Multi-tag search logic (complete)
- ✅ `src/styles/App.css` - Tag styling and dark mode (complete)
- ✅ `src/utils/filterUtils.js` - NEW - Cascading filter utilities (complete)

### To Be Modified (Features 3-5)
- `src/components/SwordDetail.jsx` - Display Meito status
- `src/utils/csvParser.js` - Add Meito extraction utilities
- `src/components/FilterGroupBuilder.jsx` - NEW - Complex filter UI
- `src/components/SearchBar.jsx` - Add quote parsing logic
- `src/utils/searchParser.js` - NEW - Parse quoted phrases
- `src/utils/queryEvaluator.js` - NEW - Evaluate complex filter queries
- `src/App.js` - Update to handle filter groups and quoted searches

## Next Steps

See [tasks.md](./tasks.md) for detailed implementation checklist.

---

**Estimated Duration**: TBD
**Blockers**: None
