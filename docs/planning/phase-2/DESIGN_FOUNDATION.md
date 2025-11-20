# Phase 2: Design Foundation & Mood Board

## Design Goals & Principles

### Core Objectives
1. **Museum-Quality Aesthetic** - Elevate the interface to match the cultural significance of the content
2. **Respectful Elegance** - Honor Japanese sword-making tradition through refined, sophisticated design
3. **Modern Accessibility** - Contemporary UI patterns that welcome all users
4. **Information Clarity** - Let the data shine through clear hierarchy and typography
5. **Subtle Sophistication** - Avoid flashy effects; embrace understated elegance

### Design Principles
- **Ma (間)** - Embrace negative space, let content breathe
- **Wabi-Sabi (侘寂)** - Beauty in simplicity and imperfection
- **Shibui (渋い)** - Subtle, unobtrusive beauty that reveals itself over time
- **Precision** - Clean lines and exact spacing, like the blade itself
- **Contrast** - Bold typography meets delicate details

---

## Color Palette

**Sanzo Wada Combination #192**

Inspired by kimono designer and artist Sanzo Wada's "Dictionary of Color Combinations" (1930s), this palette embodies traditional Japanese aesthetics with a museum-quality feel.

### Primary Palette

#### Slate Blue-Gray (Weathered Steel)
Base color: `#5c7287` - Evokes the patina of aged sword steel

- **Primary Dark**: `#4a5d6e` - Darker for headers and primary surfaces
- **Primary**: `#5c7287` - Main UI elements, navigation
- **Primary Light**: `#7a8ea1` - Hover states, secondary elements
- **Primary Lighter**: `#96a8b8` - Subtle backgrounds, disabled states

#### Deep Brown (Aged Wood & Lacquer)
Base color: `#362304` - Like ebony scabbards and aged wood fittings

- **Accent Dark**: `#362304` - Primary text, strong accents
- **Accent**: `#4a3205` - Secondary accents
- **Accent Medium**: `#6b4a0a` - Medium-weight elements
- **Accent Light**: `#8b6510` - Lighter accents, borders

#### Golden Amber (Gold Leaf & Fittings)
Base color: `#ffb852` - Traditional gold leaf and precious metal accents

- **Highlight Dark**: `#e5a33d` - Darker gold for contrast
- **Highlight**: `#ffb852` - CTAs, special designations (Kokuho)
- **Highlight Light**: `#ffc66b` - Lighter gold hover states
- **Highlight Lighter**: `#ffd485` - Subtle gold accents

#### Warm Neutrals (Harmonized with palette)
Warm grays with subtle brown undertones that complement the Sanzo Wada palette

- **Neutral 900**: `#362304` - Deep brown for primary text
- **Neutral 800**: `#4a3205` - Very dark brown
- **Neutral 700**: `#5a4520` - Dark warm gray
- **Neutral 600**: `#6b5a3d` - Medium-dark warm gray
- **Neutral 500**: `#8a7660` - True warm gray
- **Neutral 400**: `#a89886` - Medium-light warm gray
- **Neutral 300**: `#c4b8ab` - Light warm gray
- **Neutral 200**: `#ddd6cf` - Very light warm gray
- **Neutral 100**: `#eeebe7` - Off-white warm
- **Neutral 50**: `#f7f5f3` - Background warm

#### Backgrounds (Aged Paper)
Warm off-whites reminiscent of aged washi paper and parchment

- **Background**: `#ffffff` - Pure white for content
- **Background Subtle**: `#faf9f7` - Warm off-white
- **Background Elevated**: `#ffffff` - White cards/panels
- **Background Elevated 2**: `#f7f5f3` - Subtle warm elevation

### Semantic Colors

Harmonized with the Sanzo Wada palette for visual cohesion

#### Success
- **Success**: `#4a6b3a` - Muted olive green
- **Success Light**: `#5d8549` - Lighter olive green

#### Warning (Uses golden amber from palette)
- **Warning**: `#e5a33d` - Darker golden amber
- **Warning Light**: `#ffb852` - Base golden amber

#### Error
- **Error**: `#b84a3d` - Muted terracotta red
- **Error Light**: `#d16356` - Lighter terracotta

#### Info (Uses slate blue from palette)
- **Info**: `#5c7287` - Slate blue-gray
- **Info Light**: `#7a8ea1` - Lighter slate blue

### Dark Mode Palette

#### Primary (Dark Mode - Lightened for visibility)
- **Primary Dark**: `#7a8ea1` - Darker slate blue for contrast
- **Primary**: `#96a8b8` - Main slate blue (lightened)
- **Primary Light**: `#b2c0cd` - Lighter slate blue for hover
- **Primary Lighter**: `#cdd7e0` - Very light slate blue

#### Accent Browns (Dark Mode - Warmer tones)
- **Accent Dark**: `#6b4a0a` - Medium brown
- **Accent**: `#8b6510` - Warm brown
- **Accent Medium**: `#a67c1a` - Lighter warm brown
- **Accent Light**: `#c29625` - Golden brown

#### Backgrounds (Dark Mode - Warm brown undertones)
Based on the deep brown `#362304` from Sanzo Wada palette

- **Background**: `#1a1510` - Very dark brown-black
- **Background Subtle**: `#201a14` - Dark brown-black
- **Background Elevated**: `#2a241d` - Elevated brown-gray
- **Background Elevated 2**: `#362d24` - Lighter elevated surface

#### Neutrals (Dark Mode - Warm light tones)
- **Neutral 900**: `#f7f5f3` - Warm off-white for text
- **Neutral 800**: `#eeebe7` - Light warm
- **Neutral 700**: `#ddd6cf` - Medium-light warm
- **Neutral 600**: `#c4b8ab` - Medium warm
- **Neutral 500**: `#a89886` - True warm gray
- **Neutral 400**: `#8a7660` - Medium-dark warm
- **Neutral 300**: `#6b5a3d` - Dark warm
- **Neutral 200**: `#5a4520` - Very dark warm
- **Neutral 100**: `#4a3205` - Near-black warm
- **Neutral 50**: `#362304` - Deep brown (darkest)

---

## Typography

### Font Families

#### Display Font (Headers & Titles)
**DM Sans** - Geometric sans-serif with a modern, clean aesthetic
- Low contrast and geometric forms create a sophisticated look
- Excellent readability at all sizes
- Perfect for museum-quality interface
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

**Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif

#### Body Font (Content & UI)
**Open Sans** - Highly legible humanist sans-serif
- Optimized for web readability
- Friendly and open letterforms
- Wide character support
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)

**With Japanese support**: Pair with **Noto Sans JP**
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)

**Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif

#### Data/Monospace Font
**JetBrains Mono** or **Roboto Mono** - For technical data and measurements
- Weights: 400 (Regular), 500 (Medium)

**Fallback**: "SF Mono", Monaco, "Courier New", monospace

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Page Title) | 48px / 3rem | 600 | 1.2 | -0.02em |
| H2 (Section) | 36px / 2.25rem | 600 | 1.3 | -0.01em |
| H3 (Subsection) | 28px / 1.75rem | 600 | 1.4 | 0 |
| H4 (Card Title) | 22px / 1.375rem | 600 | 1.4 | 0 |
| H5 | 18px / 1.125rem | 600 | 1.5 | 0 |
| H6 | 16px / 1rem | 600 | 1.5 | 0 |
| Body Large | 18px / 1.125rem | 400 | 1.6 | 0 |
| Body | 16px / 1rem | 400 | 1.6 | 0 |
| Body Small | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | 12px / 0.75rem | 500 | 1.4 | 0.01em |
| Overline | 12px / 0.75rem | 600 | 1.4 | 0.08em |

### Japanese Text Adjustments
- Slightly larger line-height for kanji readability: multiply by 1.1-1.15
- No letter-spacing adjustments for Japanese characters

---

## Spacing & Layout

### Spacing Scale (8px base unit)
- **xs**: `4px` (0.25rem)
- **sm**: `8px` (0.5rem)
- **md**: `16px` (1rem)
- **lg**: `24px` (1.5rem)
- **xl**: `32px` (2rem)
- **2xl**: `48px` (3rem)
- **3xl**: `64px` (4rem)
- **4xl**: `96px` (6rem)
- **5xl**: `128px` (8rem)

### Layout Grid
- **Columns**: 12-column grid
- **Gutter**: 24px (1.5rem)
- **Margin**: 24px mobile, 48px tablet, 64px desktop

### Container Max-Widths
- **Small**: `640px` - Forms, narrow content
- **Medium**: `768px` - Article content
- **Large**: `1024px` - Default container
- **XLarge**: `1280px` - Wide layouts
- **2XLarge**: `1536px` - Maximum width

### Responsive Breakpoints
- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (md - lg)
- **Desktop**: `1024px - 1280px` (lg - xl)
- **Large Desktop**: `> 1280px` (xl+)

---

## Border Radius

- **None**: `0px` - Sharp edges for formal elements
- **XSmall**: `2px` - Subtle rounding
- **Small**: `4px` - Buttons, inputs
- **Medium**: `8px` - Cards, panels
- **Large**: `12px` - Modals, large cards
- **XLarge**: `16px` - Special elements
- **Full**: `9999px` - Pills, avatars

---

## Shadows & Elevation

### Light Mode
- **Shadow XS**: `0 1px 2px rgba(0, 0, 0, 0.05)` - Subtle lift
- **Shadow SM**: `0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)` - Input focus
- **Shadow MD**: `0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)` - Cards
- **Shadow LG**: `0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)` - Dropdowns
- **Shadow XL**: `0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06)` - Modals
- **Shadow 2XL**: `0 24px 48px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.08)` - Large modals

### Dark Mode
- **Shadow XS**: `0 1px 2px rgba(0, 0, 0, 0.3)`
- **Shadow SM**: `0 2px 4px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)`
- **Shadow MD**: `0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.25)`
- **Shadow LG**: `0 8px 16px rgba(0, 0, 0, 0.45), 0 4px 8px rgba(0, 0, 0, 0.3)`
- **Shadow XL**: `0 16px 32px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.35)`
- **Shadow 2XL**: `0 24px 48px rgba(0, 0, 0, 0.55), 0 12px 24px rgba(0, 0, 0, 0.4)`

---

## Animation & Transitions

### Timing Functions
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)` - Default
- **Ease Out**: `cubic-bezier(0, 0, 0.2, 1)` - Entering elements
- **Ease In**: `cubic-bezier(0.4, 0, 1, 1)` - Exiting elements
- **Sharp**: `cubic-bezier(0.4, 0, 0.6, 1)` - Quick transitions

### Duration
- **Fast**: `150ms` - Hover states, micro-interactions
- **Normal**: `300ms` - Standard transitions
- **Slow**: `500ms` - Large element animations
- **Slower**: `700ms` - Page transitions

### Respect User Preferences
Always respect `prefers-reduced-motion: reduce` - use simpler, faster animations or disable entirely

---

## Inspiration & References

### Museum Websites
- **Tokyo National Museum**: Elegant use of whitespace, subtle Japanese motifs
- **Metropolitan Museum**: Clean hierarchy, excellent typography
- **British Museum**: Strong information architecture, accessible design
- **Museum of Fine Arts Boston**: Beautiful image presentation

### Japanese Aesthetic References
- **Traditional Colors**: Indigo (藍 ai), vermillion (朱 shu), gold (金 kin)
- **Natural Materials**: Washi paper texture, silk, lacquered wood
- **Calligraphy**: Brush stroke weight variation, elegant negative space
- **Architecture**: Clean lines, natural materials, subtle ornamentation
- **Mon (家紋)**: Family crests - geometric precision meets organic forms

### Modern Design Systems
- **Tailwind CSS**: Excellent spacing and color scales
- **Material Design**: Elevation and shadow system
- **Apple Human Interface Guidelines**: Typography and accessibility
- **IBM Carbon**: Grid system and layout principles

### Japanese Typography Examples
- **Nikkei**: Beautiful Japanese/Latin typography mixing
- **Rakuten**: Modern Japanese web design
- **Cookpad**: Clean, accessible Japanese UI

---

## Implementation Strategy

### Phase 2.1: Foundation (Current)
1. Set up CSS custom properties for all design tokens
2. Configure font loading
3. Establish base styles and reset
4. Create utility classes for spacing, typography

### Phase 2.2: Component Styling
1. Header and navigation
2. Search bar with refined input design
3. Filter panel with elegant dropdowns
4. Table or card-based sword list
5. Detail view modal

### Phase 2.3: Visual Polish
1. Add subtle textures and gradients
2. Implement micro-animations
3. Enhance loading and empty states
4. Perfect dark mode

### Phase 2.4: Responsive & Accessible
1. Mobile-first responsive implementation
2. Keyboard navigation refinement
3. Screen reader testing
4. Contrast and WCAG compliance

---

## Success Metrics

- [ ] Design feels distinctly Japanese yet modern
- [ ] Typography is highly legible at all sizes
- [ ] Color palette creates clear hierarchy
- [ ] Dark mode is comfortable for extended use
- [ ] Interface feels "museum-quality"
- [ ] All elements feel cohesive and intentional
- [ ] Accessibility tests pass (WCAG AA)
- [ ] User feedback is positive on aesthetics
