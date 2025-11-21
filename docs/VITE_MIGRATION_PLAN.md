# Vite Migration Plan

## Overview
Migrate Touken West from Create React App (react-scripts) to Vite for improved development experience and build performance.

## Current State
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **React Version**: 19.2.0
- **Entry Point**: `src/index.js`
- **Public Assets**: `public/` folder with index.html, data, documents
- **Dependencies**: papaparse, pdf-parse, react, react-dom

## Benefits of Vite Migration
✅ **Faster Dev Server**: Near-instant server startup (~100-200ms vs 20-30s)
✅ **Lightning HMR**: Sub-100ms hot module replacement
✅ **Optimized Builds**: Better tree-shaking and code splitting
✅ **Modern Tooling**: Native ESM support, better DX
✅ **Smaller Bundles**: More efficient production builds
✅ **No Webpack Config**: Simpler, more maintainable setup

---

## Migration Steps

### 1. Install Vite and Dependencies

```bash
# Install Vite and plugins
npm install --save-dev vite @vitejs/plugin-react

# Install additional build tools (if needed)
npm install --save-dev vite-plugin-compression vite-plugin-pwa
```

**Files to change**: `package.json`

---

### 2. Create Vite Configuration

Create `vite.config.js` in project root:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },

  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['papaparse']
        }
      }
    }
  },

  // Public directory
  publicDir: 'public',

  // Resolve configuration
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
})
```

**Files to create**: `vite.config.js`

---

### 3. Update HTML File

Move `public/index.html` to root and update it:

**Current location**: `public/index.html`
**New location**: `index.html` (project root)

Changes needed:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/shimazu-mon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#2E4057" />
    <meta name="description" content="Japanese Sword Database - Searchable catalog of historical Japanese blades" />
    <title>Touken West - Japanese Sword Database</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!-- Vite requires explicit script module import -->
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

**Key changes**:
- Remove `%PUBLIC_URL%` references
- Add `<script type="module" src="/src/index.js"></script>`
- Use absolute paths starting with `/` for public assets

**Files to modify**: Move and update `public/index.html` → `index.html`

---

### 4. Update Entry Point

Rename and update entry file:

**Current**: `src/index.js`
**Change to**: `src/main.jsx` (optional but conventional)

Or keep as `src/index.js` and update imports:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Files to modify**: `src/index.js`

---

### 5. Rename JavaScript Files to JSX

Vite prefers `.jsx` extension for React components:

```bash
# Rename component files
mv src/App.js src/App.jsx
mv src/components/Header.js src/components/Header.jsx
mv src/components/SearchBar.js src/components/SearchBar.jsx
mv src/components/FilterPanel.js src/components/FilterPanel.jsx
mv src/components/SwordTable.js src/components/SwordTable.jsx
mv src/components/SwordDetail.js src/components/SwordDetail.jsx
```

**Files to rename**: All `.js` files containing JSX → `.jsx`

---

### 6. Update Import Statements

Update imports to use explicit extensions where needed:

```javascript
// Before (CRA)
import App from './App';
import { parseData } from './utils/dataParser';

// After (Vite) - usually still works without extensions
import App from './App.jsx';
import { parseData } from './utils/dataParser.js';
```

**Note**: Vite can handle imports without extensions if configured properly, but explicit extensions are recommended.

**Files to check**: All JavaScript files with imports

---

### 7. Update Environment Variables

Replace `REACT_APP_` prefix with `VITE_`:

**Before**:
```javascript
process.env.REACT_APP_API_KEY
```

**After**:
```javascript
import.meta.env.VITE_API_KEY
```

Create `.env` file:
```
VITE_API_KEY=your_key_here
```

**Files to modify**: Any files using environment variables

---

### 8. Update package.json Scripts

Replace react-scripts commands:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

**Files to modify**: `package.json`

---

### 9. Remove CRA-Specific Files

Delete files that are no longer needed:

```bash
# Delete CRA config files
rm -rf node_modules/.cache
rm -rf build

# Keep for now (review later):
# - .gitignore (may need updates)
# - eslintConfig in package.json
```

**Files to delete**: CRA cache and build artifacts

---

### 10. Update CSS Imports

Ensure CSS imports use proper paths:

```javascript
// These should work as-is in Vite
import './styles/App.css'
import './styles/index.css'
```

**Files to check**: All CSS import statements

---

### 11. Handle Public Assets

Update references to public assets:

**Before (CRA)**:
```javascript
// In code
const img = `${process.env.PUBLIC_URL}/documents/file.jpg`

// In HTML
<link rel="icon" href="%PUBLIC_URL%/shimazu-mon.svg" />
```

**After (Vite)**:
```javascript
// In code - assets in public/ are served from root
const img = '/documents/file.jpg'

// In HTML
<link rel="icon" href="/shimazu-mon.svg" />
```

**Files to modify**: Any files referencing `PUBLIC_URL` or public assets

---

### 12. Update Dependencies

Remove CRA and install Vite:

```bash
# Remove CRA
npm uninstall react-scripts

# Install Vite
npm install --save-dev vite @vitejs/plugin-react

# Update any incompatible dependencies if needed
npm update
```

**Files to modify**: `package.json`, `package-lock.json`

---

### 13. Test Development Server

```bash
npm run dev
```

Check for:
- ✅ Server starts quickly
- ✅ App loads correctly
- ✅ HMR works (make a change and verify hot reload)
- ✅ All assets load (CSS, images, data files)
- ✅ No console errors

---

### 14. Test Production Build

```bash
npm run build
npm run preview
```

Check for:
- ✅ Build completes successfully
- ✅ Bundle sizes are reasonable
- ✅ App works in production mode
- ✅ All assets are included in build

---

### 15. Update .gitignore

Add Vite-specific entries:

```
# Vite
dist
*.local

# Keep existing:
node_modules
build
.env
```

**Files to modify**: `.gitignore`

---

## Potential Issues and Solutions

### Issue 1: Global Variables
**Problem**: `process` is not available in browser
**Solution**: Use Vite's `import.meta.env` or define in `vite.config.js`:
```javascript
define: {
  'process.env': {}
}
```

### Issue 2: CommonJS Imports
**Problem**: Some packages use `require()`
**Solution**: Vite handles most cases, but for problematic packages:
```javascript
// vite.config.js
optimizeDeps: {
  include: ['problematic-package']
}
```

### Issue 3: Absolute Imports
**Problem**: CRA supported absolute imports from `src/`
**Solution**: Configure path aliases in `vite.config.js`:
```javascript
resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components',
    '@utils': '/src/utils'
  }
}
```

### Issue 4: PDF Files Not Loading
**Problem**: pdf-parse might need special handling
**Solution**: Ensure files in `public/` are referenced with absolute paths starting with `/`

---

## Migration Checklist

### Pre-Migration
- [ ] Commit all current changes
- [ ] Create backup branch
- [ ] Document current CRA setup
- [ ] Test current build works

### Installation
- [ ] Install Vite and plugins
- [ ] Remove react-scripts

### Configuration
- [ ] Create `vite.config.js`
- [ ] Move and update `index.html`
- [ ] Update `package.json` scripts

### Code Updates
- [ ] Rename `.js` → `.jsx` for React components
- [ ] Update entry point (`src/index.js`)
- [ ] Update environment variable usage
- [ ] Update public asset references
- [ ] Update import statements (if needed)

### Testing
- [ ] Test dev server (`npm run dev`)
- [ ] Test HMR functionality
- [ ] Test all routes and features
- [ ] Test production build (`npm run build`)
- [ ] Test production preview (`npm run preview`)
- [ ] Check bundle sizes
- [ ] Test in multiple browsers

### Cleanup
- [ ] Remove CRA artifacts
- [ ] Update `.gitignore`
- [ ] Update documentation
- [ ] Update README.md

### Final
- [ ] Commit migration changes
- [ ] Update CI/CD if applicable
- [ ] Deploy and verify production

---

## Estimated Time

- **Setup & Configuration**: 30-60 minutes
- **Code Updates**: 30-60 minutes
- **Testing & Debugging**: 1-2 hours
- **Total**: 2-4 hours

---

## Rollback Plan

If migration fails:
```bash
git checkout feature/phase2-task1
npm install
npm start
```

Or keep CRA alongside Vite for gradual migration.

---

## Post-Migration Benefits

After successful migration, you'll have:
- ⚡ **~50x faster** dev server startup
- 🔥 **Instant** hot module replacement
- 📦 **Smaller** production bundles
- 🛠️ **Simpler** configuration
- 🚀 **Better** developer experience

---

## Resources

- [Vite Official Docs](https://vitejs.dev/)
- [Vite React Plugin](https://github.com/vitejs/vite-plugin-react)
- [Migration from CRA](https://vitejs.dev/guide/migration.html)
- [Vite Config Reference](https://vitejs.dev/config/)
