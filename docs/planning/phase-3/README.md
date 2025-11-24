# Phase 3: Backend & Photo Management

**Status**: 🟢 Completed
**Timeline**: Completed 2025-11-21
**Priority**: High
**Complexity**: High

## Overview

Phase 3 represents the most significant architectural shift in the project - transitioning from a static, client-side CSV application to a full-stack web application with backend services, database storage, and photo management capabilities. This phase enables photo uploads, admin data entry, and lays the foundation for user authentication in Phase 5.

## Objectives

1. **Migrate from CSV to database** ⚠️ - CSV-based approach retained (database migration deferred)
2. **Build backend API** ✅ - Created REST API with Express.js for data operations
3. **Implement photo storage** ✅ - Photo uploads with local storage and Sharp processing
4. **Create admin data entry form** ✅ - Comprehensive admin console for sword management
5. **Enhance Sword Detail page** ✅ - Display photo galleries for each sword
6. **Maintain data integrity** ✅ - Changelog system tracks all data modifications

## Key Features

### 1. Backend Infrastructure ✅
- ✅ Node.js + Express server (admin-server on port 3002)
- ✅ RESTful API endpoints
- ✅ CORS configuration for local development
- ✅ Error handling and logging
- ✅ Input validation and sanitization
- ✅ Cookie-based JWT authentication

### 2. Data Management ⚠️
- ⚠️ Database migration deferred - CSV approach retained
- ✅ Direct CSV file manipulation with PapaParse
- ✅ Dual CSV updates (data/index.csv and public/data/index.csv)
- ✅ Changelog JSON file for tracking modifications
- ✅ MD5-based duplicate detection for media uploads
- ⚠️ Database indexes - not applicable (CSV-based)

### 3. Photo Upload System ✅
- ✅ File upload endpoint with Multer (multipart/form-data)
- ✅ Image and PDF validation (format, 15MB size limit)
- ✅ Image processing with Sharp (resize, optimize)
- ✅ Local filesystem storage (public/documents/uploads)
- ✅ Timestamp-based filename sanitization
- ✅ Multiple photos per sword support
- ✅ Bulk upload capability
- ✅ MD5 duplicate detection

### 4. Photo Display ✅
- ✅ Enhanced Sword Detail page with photo gallery
- ✅ Grid layout for multiple images
- ✅ Lightbox/modal for full-size viewing
- ✅ PDF viewer for Juyo documents
- ✅ Responsive image display
- ✅ Media attachments section in detail view

### 5. Admin Console ✅
- ✅ Comprehensive admin dashboard
- ✅ Form to add new sword entries
- ✅ Form to edit existing entries with all 19 fields
- ✅ Photo upload interface (file selector and bulk upload)
- ✅ Field validation
- ✅ Success/error feedback with toasts
- ✅ Changelog viewer showing all modifications
- ✅ Media management (upload, view, delete)
- ✅ Search and filter within admin console

### 6. API Endpoints ✅

**Swords** ✅
- ✅ `GET /api/swords` - List all swords from CSV
- ✅ `GET /api/swords/:index` - Get single sword by index
- ✅ `POST /api/swords` - Create new sword (admin only)
- ✅ `PUT /api/swords/:index` - Update sword (admin only)
- ✅ `DELETE /api/swords/:index` - Delete sword (admin only)

**Media** ✅
- ✅ `POST /api/upload` - Upload media files (single or bulk)
- ✅ `GET /api/media/:index` - Get media for specific sword
- ✅ `DELETE /api/media/:filename` - Delete media file (admin only)

**Changelog** ✅
- ✅ `GET /api/changelog` - Get modification history

**Authentication** ✅
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login with JWT

## Technical Decisions

### Backend Framework Options
1. **Next.js** - Full-stack React with API routes (easiest integration)
2. **Express.js** - Standalone Node.js backend (more flexibility)
3. **NestJS** - TypeScript-first, enterprise-grade (more complex)

**Decision Made**: ✅ Express.js standalone backend (admin-server) - provides flexibility and separation of concerns

### Database Options
1. **PostgreSQL** - Relational, structured, great for tabular data
2. **MongoDB** - NoSQL, flexible schema, easier for photos
3. **SQLite** - Lightweight, good for development/small scale

**Decision Made**: ⚠️ CSV-based approach retained - database migration deferred for simpler deployment and data portability

### Photo Storage Options
1. **Local filesystem** - Simple, free, no external dependencies
2. **AWS S3** - Scalable, reliable, pay-as-you-go
3. **Cloudflare R2** - S3-compatible, cheaper egress
4. **Vercel Blob** - Integrated with Vercel hosting

**Decision Made**: ✅ Local filesystem (public/documents/uploads) - simple, no external dependencies, suitable for current scale

### Photo Processing ✅
- ✅ **Sharp** - Fast Node.js image processing library
- ✅ Image optimization and resizing
- ✅ Format preservation (JPEG, PNG)
- ✅ File size optimization

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

- [x] CSV data management system functional
- [x] API endpoints functional and tested
- [x] Photos can be uploaded and stored
- [x] Photos display correctly in Sword Detail view
- [x] Admin console allows creating/editing sword entries
- [x] Image gallery is smooth and responsive
- [x] No data loss - changelog tracks all changes
- [x] Performance is acceptable (fast loading)
- [x] Error handling is robust
- [x] Bulk upload capability implemented
- [x] MD5 duplicate detection working
- [ ] Database migration (deferred to future phase)

## Out of Scope

- Database migration (deferred)
- Advanced image editing (cropping, filters)
- Video support
- OCR for reading mei inscriptions
- 3D model support

## Completed Beyond Original Scope

- ✅ Bulk photo upload (added)
- ✅ MD5 duplicate detection (added)
- ✅ Changelog tracking system (added)
- ✅ User authentication foundation (added - see Phase 5)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | Critical | Create backups, test migration thoroughly |
| Photo storage costs | Medium | Start with local storage, monitor usage |
| Performance issues with many photos | High | Implement lazy loading, CDN, optimization |
| Complex backend adds maintenance burden | Medium | Keep architecture simple, document well |

## Files to Create/Modify

### Backend ✅
- ✅ Created: `/admin-server/` directory
- ✅ Created: `/admin-server/server.js` - Express server (port 3002)
- ✅ Implemented: CSV read/write with PapaParse
- ✅ Implemented: API routes (swords, media, changelog, auth)
- ✅ Implemented: JWT authentication middleware
- ✅ Implemented: Multer file upload handling

### Frontend ✅
- ✅ Created: `src/components/AdminConsole.jsx` - Comprehensive admin dashboard
- ✅ Created: `src/components/Login.jsx` - Authentication interface
- ✅ Created: `src/context/AuthContext.jsx` - Auth state management
- ✅ Modified: `src/components/SwordDetail.jsx` - Added media attachments display
- ✅ Created: Photo lightbox viewer integration

### Data Management ✅
- ✅ Created: `/data/changelog.json` - Modification tracking
- ✅ Implemented: Dual CSV sync (data/ and public/data/)
- ✅ Implemented: MD5-based duplicate detection

## Implementation Summary

Phase 3 successfully implemented a full-stack architecture with:

1. ✅ Express.js backend server (admin-server on port 3002)
2. ✅ CSV-based data management (database migration deferred)
3. ✅ RESTful API with authentication
4. ✅ Photo and PDF upload system with Sharp processing
5. ✅ Comprehensive admin console for sword management
6. ✅ Changelog tracking for all data modifications
7. ✅ MD5-based duplicate detection
8. ✅ Bulk upload capability
9. ✅ Media galleries with lightbox viewer
10. ✅ JWT authentication foundation

The decision to retain CSV-based storage simplified deployment while maintaining data portability. The changelog system ensures full auditability of all changes.

---

**Completed**: 2025-11-21
**All Core Features Implemented**: ✅
**Database Migration**: Deferred to future phase
