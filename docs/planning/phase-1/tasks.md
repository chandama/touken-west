# Phase 1: Tasks Checklist

## 1. Sticky Tag / Multi-Keyword Search

### Research & Design
- [ ] Research React tag/chip component libraries (react-tag-input, react-select)
- [ ] Design tag UI mockup (color, size, placement)
- [ ] Define search behavior (AND vs OR logic for multiple tags)
- [ ] Plan URL state management approach

### Implementation
- [ ] Create `SearchTag` component for individual tags
- [ ] Create `SearchTagList` component to manage multiple tags
- [ ] Update `SearchBar` component to support tag input
- [ ] Add "Add Tag" button or Enter key handler
- [ ] Implement tag removal (click X icon)
- [ ] Add "Clear All Tags" button
- [ ] Update search logic to handle multiple keywords
- [ ] Implement URL state sync for tags
- [ ] Add keyboard shortcuts (Backspace to remove last tag)

### Styling
- [ ] Style tag chips with theme colors
- [ ] Add hover/focus states for tags
- [ ] Ensure responsive design on mobile
- [ ] Add smooth animations for tag add/remove

### Testing
- [ ] Test adding multiple tags
- [ ] Test removing individual tags
- [ ] Test clear all functionality
- [ ] Test URL sharing with tags
- [ ] Test keyboard navigation
- [ ] Test with very long tag names
- [ ] Test with many tags (10+)

---

## 2. Dynamic Cascading Filters

### Research & Planning
- [ ] Analyze data relationships (School→Smith, Province→School, etc.)
- [ ] Create data dependency map
- [ ] Define filter update order and priority
- [ ] Plan UX for "no options available" states

### Data Processing
- [ ] Create utility function to build School→Smith index
- [ ] Create utility function to build Period→Type index
- [ ] Create utility function to build Province→School index
- [ ] Add memoization for filter option calculations
- [ ] Create function to get available options based on current filters

### Implementation
- [ ] Refactor `FilterPanel` to use cascading logic
- [ ] Update School filter to trigger cascade
- [ ] Update Smith filter to show only relevant smiths
- [ ] Update Type filter to show only relevant types
- [ ] Update Authentication filter to show only relevant levels
- [ ] Update Province filter to show only relevant provinces
- [ ] Add option counts next to filter labels (e.g., "Sanjo (143)")
- [ ] Disable or hide filters with no available options
- [ ] Add "Reset Filters" functionality that's cascade-aware

### UX Enhancements
- [ ] Show loading state when recalculating filters
- [ ] Add tooltip explaining why some options are unavailable
- [ ] Highlight recently changed filters
- [ ] Show "X results match current filters" message
- [ ] Add filter breadcrumb trail

### Testing
- [ ] Test School → Smith cascade
- [ ] Test School → Type cascade
- [ ] Test multiple filters cascading together
- [ ] Test clearing filters in different orders
- [ ] Test edge cases (filters that eliminate all results)
- [ ] Test performance with rapid filter changes
- [ ] Verify filter counts are accurate

---

## 3. Meito Detection & Display

### Research
- [ ] Review CLAUDE.md for Meito terminology
- [ ] Analyze Description field patterns in CSV
- [ ] Compile list of known Meito names from data
- [ ] Research Japanese naming patterns for famous swords

### Data Processing
- [ ] Create `extractMeito()` utility function
- [ ] Implement regex pattern for "Meito" keyword detection
- [ ] Implement named sword extraction (e.g., "Dojigiri Yasutsuna")
- [ ] Handle edge cases (partial names, alternate spellings)
- [ ] Create Meito validation/manual override list
- [ ] Add Meito data to sword objects on load

### UI Implementation
- [ ] Add "Famous Sword" field to `SwordDetail` component
- [ ] Design Meito badge/icon for table view
- [ ] Add Meito badge to `SwordTable` component
- [ ] Create Meito filter option in `FilterPanel`
- [ ] Style Meito indicator to stand out visually
- [ ] Add tooltip with Meito explanation

### Documentation
- [ ] Document Meito detection logic
- [ ] Add comments explaining regex patterns
- [ ] Create list of detected Meito for verification
- [ ] Update CLAUDE.md if needed with new conventions

### Testing
- [ ] Test Meito detection on known famous swords
- [ ] Verify no false positives
- [ ] Test Meito filter functionality
- [ ] Test Meito display in detail view
- [ ] Test Meito badge in table view
- [ ] Validate against historical records

---

## 4. General Improvements & Polish

### Performance
- [ ] Add memoization to filter calculations
- [ ] Implement debouncing on search input
- [ ] Profile performance with all filters active
- [ ] Optimize re-renders in FilterPanel
- [ ] Consider React.memo for SwordTable rows

### Accessibility
- [ ] Ensure all filters are keyboard navigable
- [ ] Add ARIA labels to search tags
- [ ] Test with screen reader
- [ ] Ensure proper focus management
- [ ] Add skip links for filter section

### Code Quality
- [ ] Add PropTypes or TypeScript types
- [ ] Write unit tests for utility functions
- [ ] Add integration tests for filter combinations
- [ ] Refactor duplicate code
- [ ] Add JSDoc comments to new functions

### Documentation
- [ ] Update README with new features
- [ ] Add user guide for advanced search
- [ ] Document filter logic for future developers
- [ ] Create screenshots of new features

---

## Phase 1 Completion Checklist

- [ ] All search tag features implemented and tested
- [ ] Cascading filters working correctly for all combinations
- [ ] Meito detection accurate and displayed properly
- [ ] Performance is acceptable (no lag with filters)
- [ ] Code is well-documented and tested
- [ ] User testing completed with positive feedback
- [ ] All bugs fixed
- [ ] Phase 1 merged to main branch

---

**Notes**:
- Add specific bugs or blockers here as they arise
- Link to related GitHub issues if using issue tracking
- Note any deviations from original plan
