# Phase 3: Backend & Photo Management

**Status**: 🔵 Not Started
**Priority**: High
**Estimated Complexity**: High

## Overview

Phase 3 represents the most significant architectural shift in the project - transitioning from a static, client-side CSV application to a full-stack web application with backend services, database storage, and photo management capabilities. This phase enables photo uploads, admin data entry, and lays the foundation for user authentication in Phase 5.

## Objectives

1. **Migrate from CSV to database** - Move sword data to PostgreSQL or MongoDB
2. **Build backend API** - Create REST or GraphQL API for data operations
3. **Implement photo storage** - Allow photo uploads and storage (local or cloud)
4. **Create admin data entry form** - Allow authorized users to add/edit sword entries
5. **Enhance Sword Detail page** - Display photo galleries for each sword
6. **Maintain data integrity** - Ensure existing data migrates cleanly

## Key Features

### 1. Backend Infrastructure
- Node.js + Express server (or Next.js API routes)
- RESTful API or GraphQL endpoints
- Environment-based configuration
- Error handling and logging
- Input validation and sanitization

### 2. Database Setup
- PostgreSQL or MongoDB installation
- Schema/model design for sword data
- Database migrations
- CSV data import script
- Indexes for performance
- Backup and recovery plan

### 3. Photo Upload System
- File upload endpoint (multipart/form-data)
- Image validation (format, size)
- Image processing (resize, optimize)
- Storage solution (local filesystem, AWS S3, Cloudflare R2)
- Filename sanitization and organization
- Multiple photos per sword support

### 4. Photo Display
- Enhanced Sword Detail page with photo gallery
- Image carousel or grid layout
- Lightbox/modal for full-size viewing
- Lazy loading for performance
- Placeholder images for swords without photos
- Optional: Zoom and pan functionality

### 5. Admin Data Entry Form
- Form to add new sword entries
- Form to edit existing entries
- Photo upload interface (drag-and-drop)
- Field validation
- Preview before submission
- Success/error feedback
- Save drafts functionality

### 6. API Endpoints

**Swords**
- `GET /api/swords` - List all swords (with pagination, filtering)
- `GET /api/swords/:id` - Get single sword with photos
- `POST /api/swords` - Create new sword (admin only)
- `PUT /api/swords/:id` - Update sword (admin only)
- `DELETE /api/swords/:id` - Delete sword (admin only)

**Photos**
- `POST /api/swords/:id/photos` - Upload photo(s)
- `GET /api/photos/:filename` - Serve photo file
- `DELETE /api/photos/:id` - Delete photo (admin only)

## Technical Decisions

### Backend Framework Options
1. **Next.js** - Full-stack React with API routes (easiest integration)
2. **Express.js** - Standalone Node.js backend (more flexibility)
3. **NestJS** - TypeScript-first, enterprise-grade (more complex)

**Recommendation**: Start with Next.js for easier integration, migrate to Express if needed later.

### Database Options
1. **PostgreSQL** - Relational, structured, great for tabular data
2. **MongoDB** - NoSQL, flexible schema, easier for photos
3. **SQLite** - Lightweight, good for development/small scale

**Recommendation**: PostgreSQL for data integrity and relational queries.

### Photo Storage Options
1. **Local filesystem** - Simple, free, no external dependencies
2. **AWS S3** - Scalable, reliable, pay-as-you-go
3. **Cloudflare R2** - S3-compatible, cheaper egress
4. **Vercel Blob** - Integrated with Vercel hosting

**Recommendation**: Local filesystem for development, cloud storage (R2/S3) for production.

### Photo Processing
- **Sharp** - Fast Node.js image processing library
- Resize images to multiple sizes (thumbnail, medium, full)
- Convert to WebP for better compression
- Strip EXIF data for privacy/size

## Database Schema

### Swords Table
```sql
CREATE TABLE swords (
  id SERIAL PRIMARY KEY,
  index INTEGER UNIQUE,
  school VARCHAR(255),
  smith VARCHAR(255),
  mei TEXT,
  type VARCHAR(100),
  nagasa DECIMAL(5,2),
  sori DECIMAL(5,2),
  moto DECIMAL(5,2),
  saki DECIMAL(5,2),
  nakago VARCHAR(100),
  ana INTEGER,
  tang_length DECIMAL(5,2),
  hori VARCHAR(255),
  authentication TEXT,
  province VARCHAR(255),
  period VARCHAR(255),
  references TEXT,
  description TEXT,
  attachments TEXT,
  is_meito BOOLEAN DEFAULT FALSE,
  meito_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Photos Table
```sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  sword_id INTEGER REFERENCES swords(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Dependencies

### Backend
- `express` or Next.js
- `pg` (PostgreSQL client) or `mongoose` (MongoDB)
- `multer` (file uploads)
- `sharp` (image processing)
- `dotenv` (environment variables)
- `joi` or `zod` (validation)
- `cors` (if separate backend)

### Frontend
- `axios` or `fetch` for API calls
- Image carousel library (e.g., `react-responsive-carousel`, `swiper`)
- Lightbox library (e.g., `yet-another-react-lightbox`)
- Drag-and-drop upload (e.g., `react-dropzone`)

## Success Criteria

- [ ] All CSV data successfully migrated to database
- [ ] API endpoints functional and tested
- [ ] Photos can be uploaded and stored
- [ ] Photos display correctly in Sword Detail view
- [ ] Admin form allows creating/editing sword entries
- [ ] Image gallery is smooth and responsive
- [ ] No data loss during migration
- [ ] Performance is acceptable (fast loading)
- [ ] Error handling is robust

## Out of Scope

- User authentication (Phase 5)
- Bulk photo upload
- Advanced image editing
- Video support
- OCR for reading mei inscriptions
- 3D model support

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | Critical | Create backups, test migration thoroughly |
| Photo storage costs | Medium | Start with local storage, monitor usage |
| Performance issues with many photos | High | Implement lazy loading, CDN, optimization |
| Complex backend adds maintenance burden | Medium | Keep architecture simple, document well |

## Files to Create/Modify

### Backend (if separate)
- Create: `/server` directory
- Create: `/server/index.js` - Express server
- Create: `/server/db/` - Database models and migrations
- Create: `/server/routes/` - API routes
- Create: `/server/middleware/` - Auth, validation, etc.
- Create: `/server/uploads/` - Local photo storage

### Frontend
- Modify: `src/App.js` - Use API instead of CSV
- Modify: `src/components/SwordDetail.jsx` - Add photo gallery
- Create: `src/components/PhotoGallery.jsx`
- Create: `src/components/AdminForm.jsx`
- Create: `src/components/PhotoUpload.jsx`
- Create: `src/services/api.js` - API client

### Database
- Create: `/migrations/` - Database migration scripts
- Create: `/scripts/import-csv.js` - CSV to DB import script

## Migration Plan

1. Set up database locally
2. Design schema
3. Write CSV import script
4. Test import with sample data
5. Validate data integrity
6. Import full dataset
7. Build API endpoints
8. Update frontend to use API
9. Test thoroughly before switching
10. Keep CSV as backup

## Next Steps

See [tasks.md](./tasks.md) for detailed implementation checklist.

---

**Estimated Duration**: TBD
**Blockers**: None (proceed after Phase 1 & 2, or in parallel)
