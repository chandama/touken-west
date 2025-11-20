# Phase 2: Visual Redesign

**Status**: 🔵 Not Started
**Priority**: Medium
**Estimated Complexity**: Medium-High

## Overview

Phase 2 transforms Touken West's visual identity from a functional database interface into a museum-quality artistic experience. The redesign will establish a sophisticated, modern aesthetic that honors the historical and cultural significance of Japanese swords while providing an engaging, contemporary user experience.

## Objectives

1. **Establish a museum-quality design system** - Create cohesive color palette, typography, spacing, and component library
2. **Redesign all major UI components** - Header, filters, table, detail views with refined aesthetics
3. **Improve visual hierarchy** - Guide users' attention to important information
4. **Enhance brand identity** - Create memorable, distinctive visual language

## Key Features

### 1. Design System Development
- Define color palette (light & dark themes)
- Select typography (Japanese + Latin typefaces)
- Establish spacing/layout grid system
- Create component style guide
- Define animation/transition standards

### 2. Color Scheme
- Primary colors inspired by traditional Japanese aesthetics (indigo, vermillion, gold)
- Neutral palette with warm undertones
- High contrast for accessibility
- Sophisticated dark mode variant
- Subtle gradients and textures

### 3. Typography
- Elegant serif or display font for headers
- Clean sans-serif for body text
- Support for Japanese characters (Noto Sans JP, etc.)
- Responsive font sizing
- Proper line-height and letter-spacing

### 4. Component Redesign
- Refined header with elegant logo treatment
- Card-based layouts for sword entries
- Sophisticated filter panel design
- Enhanced table with better readability
- Beautiful detail view with improved information hierarchy
- Custom scrollbars and form elements

### 5. Visual Enhancements
- Subtle background textures (washi paper, fabric weave)
- Elegant dividers and borders
- Smooth transitions and micro-animations
- Loading states with custom animations
- Empty states with helpful illustrations
- Error states with graceful messaging

## Design Inspiration

- **Museum websites**: Metropolitan Museum, Tokyo National Museum, British Museum
- **Japanese aesthetics**: Wabi-sabi, ma (negative space), subtle elegance
- **Modern minimalism**: Clean layouts, ample whitespace
- **Art gallery vibes**: Focus on content, refined details

## Technical Considerations

### CSS Architecture
- Decide on styling approach (CSS Modules, Styled Components, Tailwind, Emotion)
- Organize styles by component or utility
- Implement CSS custom properties for theming
- Ensure maintainability and scalability

### Responsive Design
- Mobile-first approach
- Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Touch-friendly targets on mobile
- Optimized layouts for different screen sizes

### Performance
- Optimize CSS bundle size
- Minimize repaints/reflows
- Use CSS containment where appropriate
- Lazy load non-critical styles

### Accessibility
- WCAG 2.1 AA compliance
- Sufficient color contrast ratios
- Focus visible states
- Reduced motion preference support
- Screen reader friendly

## Dependencies

- Typography: Google Fonts (Noto Sans JP, Noto Serif JP)
- Icons: Consider icon library (Lucide, Heroicons, custom SVG)
- Potential: Animation library (Framer Motion) if complex animations needed

## Success Criteria

- [ ] Cohesive visual identity across all pages
- [ ] Improved perceived quality and professionalism
- [ ] Positive user feedback on aesthetics
- [ ] Maintains or improves usability
- [ ] Accessible (WCAG AA compliance)
- [ ] Performs well (no jank, smooth animations)
- [ ] Dark mode fully functional
- [ ] Responsive on all devices

## Out of Scope

- Complete rebrand/new logo design
- Marketing materials
- Print collateral
- Video/multimedia content

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Redesign reduces usability | High | User testing throughout process |
| Scope creep / endless tweaking | Medium | Define clear design goals and timeline |
| Performance degradation | Medium | Profile and optimize, use CSS best practices |
| Accessibility issues | High | Test with accessibility tools early and often |

## Files to Modify

- `src/styles/App.css` - Global styles and theme variables
- `src/components/*.jsx` - All component styles
- Create: `src/styles/theme.css` - Design system variables
- Create: `src/styles/components/` - Component-specific styles
- Consider: Migration to styled-components or CSS-in-JS

## Design Deliverables

- [ ] Color palette documentation
- [ ] Typography scale and usage guide
- [ ] Component style guide
- [ ] Design mockups (Figma/Sketch optional)
- [ ] Dark mode specifications
- [ ] Responsive breakpoint guide

## Next Steps

See [tasks.md](./tasks.md) for detailed implementation checklist.

---

**Estimated Duration**: TBD
**Blockers**: None
