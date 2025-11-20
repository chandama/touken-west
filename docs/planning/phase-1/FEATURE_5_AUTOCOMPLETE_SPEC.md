# Feature 5B: Real-time Autocomplete Search - Specification

## Overview

Real-time autocomplete provides intelligent search suggestions as users type, improving discoverability and reducing search time. The feature displays a dropdown with categorized suggestions showing matching terms and their result counts.

## User Experience Flow

### 1. Initial State
```
┌─────────────────────────────────────────────┐
│ 🔍 Search swords by name, smith, school... │
└─────────────────────────────────────────────┘
```
- Empty search bar with placeholder text
- No dropdown visible
- User can start typing

### 2. User Types (Minimum 2 Characters)
```
User types: "mas"

┌─────────────────────────────────────────────┐
│ 🔍 mas                                      │
└─────────────────────────────────────────────┘
   ┌─────────────────────────────────────────┐
   │ SMITHS                                  │
   │ → Masamune                    (47)      │ ← Highlighted
   │   Masamitsu                   (15)      │
   │   Masanaga                    (8)       │
   │                                         │
   │ SCHOOLS                                 │
   │   Masahira                    (5)       │
   │                                         │
   │ FAMOUS SWORDS                           │
   │   Masamune Honjo              (1)       │
   └─────────────────────────────────────────┘
```

**Key Elements:**
- **Debounced**: 300-500ms delay after last keystroke
- **Categorized**: Grouped by type (Smiths, Schools, etc.)
- **Result Count**: Badge showing number of matching swords
- **Highlighted**: First item auto-highlighted
- **Matching Text**: "Mas" portion bolded or highlighted in each suggestion
- **Smooth Animation**: Fade-in and slide-down effect (150-200ms)

### 3. Keyboard Navigation
```
User presses ↓ (ArrowDown):

┌─────────────────────────────────────────────┐
│ 🔍 mas                                      │
└─────────────────────────────────────────────┘
   ┌─────────────────────────────────────────┐
   │ SMITHS                                  │
   │   Masamune                    (47)      │
   │ → Masamitsu                   (15)      │ ← Now highlighted
   │   Masanaga                    (8)       │
   │                                         │
   │ SCHOOLS                                 │
   │   Masahira                    (5)       │
   └─────────────────────────────────────────┘
```

**Keyboard Controls:**
- `↓` (Down Arrow): Move to next suggestion
- `↑` (Up Arrow): Move to previous suggestion
- `Enter`: Select highlighted suggestion
- `Escape`: Close dropdown without selecting
- `Tab`: Close dropdown (or select and move on)

### 4. Mouse Interaction
```
User hovers over "Masamune":

┌─────────────────────────────────────────────┐
│ 🔍 mas                                      │
└─────────────────────────────────────────────┘
   ┌─────────────────────────────────────────┐
   │ SMITHS                                  │
   │ → Masamune                    (47)      │ ← Hovered (bg change)
   │   Masamitsu                   (15)      │
   │   Masanaga                    (8)       │
   └─────────────────────────────────────────┘
```

- **Hover**: Background color changes, cursor becomes pointer
- **Click**: Selects suggestion, adds as search tag

### 5. Selection
```
User clicks or presses Enter on "Masamune":

┌─────────────────────────────────────────────┐
│ [Masamune ×] 🔍                            │
└─────────────────────────────────────────────┘

(Dropdown closes, "Masamune" added as tag, input cleared)
```

### 6. No Results
```
User types: "xyz"

┌─────────────────────────────────────────────┐
│ 🔍 xyz                                      │
└─────────────────────────────────────────────┘
   ┌─────────────────────────────────────────┐
   │ No suggestions found                    │
   │ Try different search terms              │
   └─────────────────────────────────────────┘
```

## Visual Design Specifications

### Dropdown Container
```css
.autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;

  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  z-index: 1000;

  /* Animation */
  animation: slideDown 200ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Category Header
```css
.autocomplete-category {
  padding: 8px 16px;
  background: #f5f5f5;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.5px;

  /* Sticky on scroll */
  position: sticky;
  top: 0;
  z-index: 1;
}
```

### Suggestion Item
```css
.autocomplete-suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.autocomplete-suggestion:hover,
.autocomplete-suggestion.highlighted {
  background: #e3f2fd; /* Light blue */
}

.autocomplete-suggestion-text {
  flex: 1;
  font-size: 0.95rem;
}

.autocomplete-suggestion-text .match {
  font-weight: 600;
  color: #2c5282; /* Dark blue */
}

.autocomplete-suggestion-count {
  display: inline-block;
  padding: 2px 8px;
  background: #e0e0e0;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #555;
  margin-left: 8px;
}
```

### Dark Mode
```css
body.dark-mode .autocomplete-dropdown {
  background: #1e1e1e;
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

body.dark-mode .autocomplete-category {
  background: #2a2a2a;
  color: #aaa;
}

body.dark-mode .autocomplete-suggestion:hover,
body.dark-mode .autocomplete-suggestion.highlighted {
  background: #2d3748;
}

body.dark-mode .autocomplete-suggestion-text .match {
  color: #6bb0ff;
}

body.dark-mode .autocomplete-suggestion-count {
  background: #3a3a3a;
  color: #bbb;
}
```

## Data Structure

### Autocomplete Index (Built on Load)
```javascript
const autocompleteIndex = {
  smiths: [
    { value: 'Masamune', count: 47 },
    { value: 'Muramasa', count: 23 },
    { value: 'Kuniyoshi', count: 65 },
    // ... all unique smiths
  ],
  schools: [
    { value: 'Soshu', count: 120 },
    { value: 'Awataguchi', count: 180 },
    // ... all unique schools
  ],
  types: [
    { value: 'Tachi', count: 3200 },
    { value: 'Katana', count: 2100 },
    { value: 'Tanto', count: 1800 },
    // ... all types
  ],
  authentication: [
    { value: 'Juyo', count: 450 },
    { value: 'Tokubetsu Juyo', count: 180 },
    // ... all authentication levels
  ],
  provinces: [
    { value: 'Yamashiro', count: 2800 },
    { value: 'Bizen', count: 3500 },
    // ... all provinces
  ],
  periods: [
    { value: 'Kamakura', count: 4200 },
    { value: 'Nanbokucho', count: 1800 },
    // ... all periods
  ],
  meito: [
    { value: 'Mikazuki Munechika', count: 1 },
    { value: 'Dojigiri Yasutsuna', count: 1 },
    // ... all famous sword names
  ]
};
```

### Suggestion Object Format
```javascript
{
  category: 'SMITHS',           // Display category
  text: 'Masamune',             // Suggestion text
  count: 47,                    // Number of matching swords
  highlightIndices: [0, 3],     // Which characters to highlight (start, end)
  displayText: '<b>Mas</b>amune' // Pre-formatted HTML (optional)
}
```

## Matching Algorithm

### Priority Levels

1. **Exact Prefix Match** (Highest Priority)
   - Input: "mas"
   - Matches: "**Mas**amune" (starts with "mas")
   - Score: 100

2. **Word Start Match** (Medium Priority)
   - Input: "mas"
   - Matches: "Goro **Mas**amune" (word starts with "mas")
   - Score: 75

3. **Contains Match** (Lower Priority)
   - Input: "mas"
   - Matches: "Go**mas**a" (contains "mas")
   - Score: 50

### Ranking Algorithm
```javascript
function rankSuggestion(suggestion, input) {
  const lowerSuggestion = suggestion.toLowerCase();
  const lowerInput = input.toLowerCase();

  let score = 0;

  // Exact prefix match
  if (lowerSuggestion.startsWith(lowerInput)) {
    score = 100;
  }
  // Word start match
  else if (lowerSuggestion.includes(' ' + lowerInput)) {
    score = 75;
  }
  // Contains match
  else if (lowerSuggestion.includes(lowerInput)) {
    score = 50;
  }

  // Boost shorter matches (prefer "Masa" over "Masamune long name")
  score += (100 - suggestion.length) / 10;

  // Boost higher count (more relevant if more results)
  score += Math.log(suggestion.count) * 2;

  return score;
}
```

## Performance Considerations

### Debouncing
```javascript
// Wait 300ms after last keystroke before searching
const DEBOUNCE_DELAY = 300;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### Optimization Strategies
1. **Index Caching**: Build index once on data load, store in useMemo
2. **Limit Results**: Show max 8-10 suggestions
3. **Early Exit**: Stop searching after finding enough matches
4. **Memoization**: Cache suggestion calculations with useMemo
5. **Virtual Scrolling**: If many suggestions, virtualize the list

### Performance Targets
- **Debounce Delay**: 300-500ms
- **Search Time**: < 50ms for 15,000 records
- **Render Time**: < 16ms (60fps animation)
- **Memory**: < 5MB for autocomplete index

## Accessibility (WCAG 2.1 Level AA)

### ARIA Attributes
```jsx
<div className="search-bar">
  <input
    type="text"
    role="combobox"
    aria-expanded={isOpen}
    aria-autocomplete="list"
    aria-controls="autocomplete-listbox"
    aria-activedescendant={selectedId}
    {...props}
  />

  <div
    id="autocomplete-listbox"
    role="listbox"
    aria-label="Search suggestions"
  >
    <div role="group" aria-labelledby="smiths-heading">
      <div id="smiths-heading" className="category">SMITHS</div>
      <div
        id="suggestion-0"
        role="option"
        aria-selected={selectedIndex === 0}
        aria-label="Masamune, 47 results"
      >
        Masamune <span aria-hidden="true">(47)</span>
      </div>
    </div>
  </div>
</div>
```

### Screen Reader Announcements
- When suggestions appear: "5 suggestions available"
- When navigating: "Masamune, Smith, 47 results, 1 of 5"
- When no results: "No suggestions found"

### Keyboard Support
✅ Full keyboard navigation (no mouse required)
✅ Focus visible indicator
✅ Escape key to dismiss
✅ Arrow keys for navigation
✅ Enter to select

## Edge Cases

### 1. Very Long Suggestion Text
```
Solution: Truncate with ellipsis
"Masamune with very long description th..." (47)
```

### 2. Rapid Typing
```
Solution: Debounce effectively cancels previous requests
User types: m → a → s → a (quickly)
Only searches for "masa" after 300ms pause
```

### 3. Special Characters
```
Input: "山城" (Yamashiro in Japanese)
Matches: Schools containing "山城"
```

### 4. No Results
```
Show helpful message:
"No suggestions found
Try: smith names, school names, sword types"
```

### 5. Click Outside
```
User clicks anywhere outside dropdown → closes automatically
Uses: useEffect with document event listener
```

## Mobile Considerations

### Touch Targets
- Minimum 44x44px touch targets (iOS guidelines)
- Adequate spacing between suggestions (12px+)

### Responsive Design
```css
@media (max-width: 768px) {
  .autocomplete-dropdown {
    max-height: 300px; /* Shorter on mobile */
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .autocomplete-suggestion {
    padding: 14px 16px; /* Larger touch targets */
  }
}
```

### Mobile-Specific Behavior
- Prevent body scroll when dropdown open
- Close on scroll (optional)
- Support swipe-to-dismiss (optional)

## Testing Checklist

### Functional Testing
- [ ] Suggestions appear after 2+ characters
- [ ] Debouncing prevents excessive searches
- [ ] Categories display correctly
- [ ] Result counts are accurate
- [ ] Keyboard navigation works (↑↓ Enter Esc)
- [ ] Click selection works
- [ ] Click outside closes dropdown
- [ ] Japanese characters supported
- [ ] Dark mode styling correct
- [ ] Mobile responsive

### Performance Testing
- [ ] Search completes in < 50ms
- [ ] No lag while typing
- [ ] Animations are smooth (60fps)
- [ ] Memory usage acceptable

### Accessibility Testing
- [ ] Screen reader announces suggestions
- [ ] Keyboard-only navigation works
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Color contrast meets WCAG AA

## Future Enhancements (Out of Scope for Phase 1)

1. **Fuzzy Matching**: Handle typos ("Masumune" → "Masamune")
2. **Recent Searches**: Show recently searched terms
3. **Popular Searches**: Show trending/common searches
4. **Rich Previews**: Show sword image in suggestions
5. **Multi-column Layout**: More suggestions visible
6. **Infinite Scroll**: Load more suggestions dynamically
7. **Voice Search**: Speech-to-text input
8. **Search History**: Save and suggest previous searches

## Implementation Order

1. ✅ Build autocomplete index from sword data
2. ✅ Create suggestion matching algorithm
3. ✅ Implement debounce hook
4. ✅ Create AutocompleteDropdown component
5. ✅ Add keyboard navigation
6. ✅ Integrate with SearchBar
7. ✅ Add styling and animations
8. ✅ Dark mode support
9. ✅ Accessibility features
10. ✅ Testing and refinement

---

**Total Estimated Time**: 2-3 days for full implementation and testing
