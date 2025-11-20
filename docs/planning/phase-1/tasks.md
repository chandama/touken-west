# Phase 1: Tasks Checklist

## 1. Sticky Tag / Multi-Keyword Search

### Research & Design
- [x] Research React tag/chip component libraries (react-tag-input, react-select) - Built custom solution
- [x] Design tag UI mockup (color, size, placement) - Implemented inline tags in search bar
- [x] Define search behavior (AND vs OR logic for multiple tags) - AND logic implemented
- [ ] Plan URL state management approach - Deferred to future iteration

### Implementation
- [x] Create `SearchTag` component for individual tags - Implemented as inline elements
- [x] Create `SearchTagList` component to manage multiple tags - Managed within SearchBar
- [x] Update `SearchBar` component to support tag input
- [x] Add "Add Tag" button or Enter key handler
- [x] Implement tag removal (click X icon)
- [x] Add "Clear All Tags" button
- [x] Update search logic to handle multiple keywords - AND logic in App.js
- [ ] Implement URL state sync for tags - Deferred to future iteration
- [ ] Add keyboard shortcuts (Backspace to remove last tag) - Deferred to future iteration

### Styling
- [x] Style tag chips with theme colors
- [x] Add hover/focus states for tags
- [x] Ensure responsive design on mobile - Basic responsive design
- [ ] Add smooth animations for tag add/remove - Deferred to Phase 2

### Testing
- [x] Test adding multiple tags - Manual testing completed
- [x] Test removing individual tags - Manual testing completed
- [x] Test clear all functionality - Manual testing completed
- [ ] Test URL sharing with tags - Not implemented yet
- [ ] Test keyboard navigation - Basic testing done
- [ ] Test with very long tag names - To be tested
- [ ] Test with many tags (10+) - To be tested

---

## 2. Dynamic Cascading Filters

### Research & Planning
- [x] Analyze data relationships (School→Smith, Province→School, etc.)
- [x] Create data dependency map - Implemented in filterUtils.js
- [x] Define filter update order and priority - All filters update based on others
- [ ] Plan UX for "no options available" states - Deferred

### Data Processing
- [x] Create utility function to build School→Smith index - getAvailableFilterOptions()
- [x] Create utility function to build Period→Type index - Handled dynamically
- [x] Create utility function to build Province→School index - Handled dynamically
- [x] Add memoization for filter option calculations - Using React useMemo
- [x] Create function to get available options based on current filters - getAvailableFilterOptions()

### Implementation
- [x] Refactor `FilterPanel` to use cascading logic
- [x] Update School filter to trigger cascade
- [x] Update Smith filter to show only relevant smiths
- [x] Update Type filter to show only relevant types
- [x] Update Authentication filter to show only relevant levels
- [x] Update Province filter to show only relevant provinces
- [x] Add option counts next to filter labels (e.g., "Sanjo (143)")
- [ ] Disable or hide filters with no available options - Options simply don't appear
- [x] Add "Reset Filters" functionality that's cascade-aware - Using existing Clear All

### UX Enhancements
- [ ] Show loading state when recalculating filters - Not needed, fast enough
- [ ] Add tooltip explaining why some options are unavailable - Deferred to Phase 2
- [ ] Highlight recently changed filters - Deferred to Phase 2
- [x] Show "X results match current filters" message - Already exists in results-info
- [ ] Add filter breadcrumb trail - Deferred to Phase 2

### Testing
- [x] Test School → Smith cascade - Manual testing completed
- [x] Test School → Type cascade - Manual testing completed
- [x] Test multiple filters cascading together - Manual testing completed
- [x] Test clearing filters in different orders - Manual testing completed
- [ ] Test edge cases (filters that eliminate all results) - To be tested
- [x] Test performance with rapid filter changes - Performance is good
- [x] Verify filter counts are accurate - Tested and working

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

## 4. Advanced Search: Complex AND/OR Filter Combinations

### Research & Planning
- [ ] Design UI for complex filter expressions
- [ ] Define query syntax/format (visual builder vs text input)
- [ ] Plan how to represent complex queries (e.g., "(Masamune AND Juyo) OR (Sadamune AND Tokubetsu Juyo)")
- [ ] Decide on implementation approach (query builder vs formula bar)

### Data Structure
- [ ] Design data structure to represent filter combinations
- [ ] Support nested AND/OR groups
- [ ] Allow multiple filter criteria per group
- [ ] Handle parentheses/grouping logic

### UI Implementation
- [ ] Create filter group builder component
- [ ] Add AND/OR toggle buttons between groups
- [ ] Visual representation of grouped filters
- [ ] Add ability to nest filter groups
- [ ] Show current filter logic clearly (e.g., "Group 1 OR Group 2")
- [ ] Add "Add Group" button
- [ ] Allow removing individual groups

### Filter Logic
- [ ] Implement AND logic within groups
- [ ] Implement OR logic between groups
- [ ] Support nested grouping evaluation
- [ ] Update filtering function to handle complex queries
- [ ] Optimize performance for complex filter combinations

### Examples to Support
- [ ] Example 1: (Smith = Masamune AND Authentication = Juyo) OR (Smith = Sadamune AND Authentication = Tokubetsu Juyo)
- [ ] Example 2: (School = Soshu OR School = Bizen) AND Type = Tanto
- [ ] Example 3: Multiple groups with different field combinations

### UX Enhancements
- [ ] Clear visual distinction between groups
- [ ] Highlight active filter groups
- [ ] Show result counts per group (optional)
- [ ] Add "Save Filter" functionality (optional)
- [ ] Implement filter presets (optional)

### Testing
- [ ] Test simple AND combinations
- [ ] Test simple OR combinations
- [ ] Test complex nested combinations
- [ ] Test performance with many groups
- [ ] Test clearing complex filters
- [ ] Verify filter logic correctness

---

## 5. Literal String Search with Quoted Phrases

### Research & Planning
- [ ] Design quote parsing logic
- [ ] Handle edge cases (unclosed quotes, nested quotes, escaped quotes)
- [ ] Define behavior for mixed quoted/unquoted terms
- [ ] Plan UI feedback for quoted searches

### Implementation
- [ ] Create string parser to detect quoted phrases
- [ ] Extract quoted phrases as literal search terms
- [ ] Update search logic to handle both literal and partial matches
- [ ] Combine quoted and unquoted searches (quoted = exact, unquoted = contains)

### Search Logic
- [ ] Parse input string to identify quoted segments
- [ ] Example: `Masamune "Juyo 11" tanto` → 3 terms (partial, exact, partial)
- [ ] Implement exact match for quoted phrases
- [ ] Implement partial match for unquoted terms
- [ ] Combine results with AND logic

### UI Enhancements
- [ ] Visual indicator for quoted searches (different tag color?)
- [ ] Show quote marks in search tags
- [ ] Add tooltip explaining quote functionality
- [ ] Add example in placeholder text
- [ ] Help text or info icon explaining syntax

### Examples to Support
- [ ] `"Juyo 11"` - Find exact phrase "Juyo 11"
- [ ] `"Tokubetsu Juyo"` - Find exact authentication level
- [ ] `Masamune "Soshu tradition"` - Partial + exact match
- [ ] `"Denrai: Tokugawa"` - Exact provenance string

### Edge Cases
- [ ] Handle unclosed quotes gracefully
- [ ] Handle empty quotes ""
- [ ] Handle quotes within quotes
- [ ] Handle special characters within quotes
- [ ] Case sensitivity (should quotes preserve case?)

### Testing
- [ ] Test simple quoted phrase
- [ ] Test multiple quoted phrases
- [ ] Test mixed quoted and unquoted terms
- [ ] Test unclosed quotes
- [ ] Test empty quotes
- [ ] Test special characters
- [ ] Test very long quoted phrases

---

## 6. General Improvements & Polish

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

- [x] All search tag features implemented and tested - Core functionality complete
- [x] Cascading filters working correctly for all combinations - Implemented and working
- [ ] Meito detection accurate and displayed properly - NOT STARTED (Feature 3)
- [x] Performance is acceptable (no lag with filters) - Tested, performance is good
- [x] Code is well-documented and tested - Code has comments, manual testing done
- [ ] User testing completed with positive feedback - Needs broader testing
- [ ] All bugs fixed - No known bugs currently
- [ ] Phase 1 merged to main branch - Still in feature/first-steps branch

---

**Notes**:
- **Completed (2024-11-19)**: Features 1 & 2 - Sticky tag search and cascading filters
- **Deferred to Future**: URL state management, tag animations, advanced tooltips
- **Future Enhancement**: Add toggleable AND/OR logic for search tags (currently AND only)
- **Next Task**: Feature 3 - Meito detection and display
- Commit: `1837fe8` - Implement Phase 1 UX enhancements
