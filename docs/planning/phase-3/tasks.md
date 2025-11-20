# Phase 3: Tasks Checklist

## 1. Backend Setup & Infrastructure

### Technology Selection
- [ ] Decide on backend framework (Next.js vs Express)
- [ ] Choose database (PostgreSQL vs MongoDB)
- [ ] Select photo storage solution
- [ ] Choose ORM/ODM if needed (Prisma, TypeORM, Sequelize)

### Project Setup
- [ ] Initialize backend project structure
- [ ] Set up package.json with dependencies
- [ ] Configure environment variables (.env)
- [ ] Set up development server
- [ ] Configure hot reloading
- [ ] Set up ESLint and Prettier for backend code
- [ ] Create .gitignore for backend files

### Database Installation
- [ ] Install PostgreSQL locally (or MongoDB)
- [ ] Create development database
- [ ] Set up database connection
- [ ] Test connection from backend
- [ ] Set up migration tool
- [ ] Configure database backup strategy

---

## 2. Database Schema & Migration

### Schema Design
- [ ] Design swords table schema
- [ ] Design photos table schema
- [ ] Design indexes for performance (School, Smith, Type, etc.)
- [ ] Define foreign key relationships
- [ ] Plan for future tables (users in Phase 5)
- [ ] Document schema decisions

### Migration Scripts
- [ ] Create initial migration for swords table
- [ ] Create migration for photos table
- [ ] Create indexes migration
- [ ] Test migrations (up and down)
- [ ] Create seed data for testing

### CSV Import
- [ ] Write CSV parsing script
- [ ] Map CSV columns to database fields
- [ ] Handle data type conversions
- [ ] Handle NULL/NA values
- [ ] Validate data during import
- [ ] Create dry-run mode for testing
- [ ] Run import on full dataset
- [ ] Verify data integrity (count, spot checks)
- [ ] Create backup of CSV before import
- [ ] Document import process

---

## 3. API Development

### Core API Setup
- [ ] Set up Express routes or Next.js API routes
- [ ] Configure CORS
- [ ] Set up request logging (morgan or similar)
- [ ] Create error handling middleware
- [ ] Set up request validation middleware
- [ ] Configure rate limiting (optional)

### Swords Endpoints
- [ ] `GET /api/swords` - List swords with pagination
- [ ] Add filtering support (school, smith, type, etc.)
- [ ] Add sorting support
- [ ] Add search support
- [ ] `GET /api/swords/:id` - Get single sword
- [ ] Include photos in response
- [ ] `POST /api/swords` - Create sword (admin)
- [ ] `PUT /api/swords/:id` - Update sword (admin)
- [ ] `DELETE /api/swords/:id` - Delete sword (admin)
- [ ] Write tests for each endpoint

### Photos Endpoints
- [ ] `POST /api/swords/:id/photos` - Upload photo(s)
- [ ] Set up multer for multipart uploads
- [ ] Validate file types (JPEG, PNG, WebP)
- [ ] Validate file sizes (max 10MB)
- [ ] `GET /api/photos/:filename` - Serve photo
- [ ] `DELETE /api/photos/:id` - Delete photo (admin)
- [ ] `PATCH /api/photos/:id` - Update photo metadata
- [ ] Write tests for photo endpoints

### Filters & Search
- [ ] Create dynamic filter builder
- [ ] Support cascading filters (from Phase 1)
- [ ] Implement full-text search
- [ ] Add pagination metadata
- [ ] Optimize query performance
- [ ] Cache filter options

---

## 4. Photo Processing & Storage

### Storage Setup
- [ ] Create uploads directory (if local)
- [ ] Configure cloud storage SDK (if S3/R2)
- [ ] Set up environment variables for storage
- [ ] Create storage abstraction layer
- [ ] Test file uploads locally

### Image Processing
- [ ] Install Sharp library
- [ ] Create image processing pipeline
- [ ] Generate thumbnail (200px)
- [ ] Generate medium size (800px)
- [ ] Generate full size (1600px max)
- [ ] Convert to WebP format
- [ ] Strip EXIF data
- [ ] Handle orientation (EXIF rotation)
- [ ] Optimize file sizes

### File Management
- [ ] Generate unique filenames
- [ ] Organize by sword ID or date
- [ ] Handle duplicate filenames
- [ ] Validate uploads completed successfully
- [ ] Delete old files when replacing
- [ ] Create cleanup script for orphaned files

---

## 5. Frontend API Integration

### API Client
- [ ] Create API service module (`src/services/api.js`)
- [ ] Set up axios or fetch configuration
- [ ] Add base URL configuration
- [ ] Create error handling wrapper
- [ ] Add request/response interceptors
- [ ] Handle authentication headers (for Phase 5)

### Update Data Fetching
- [ ] Replace CSV parsing with API calls in `App.js`
- [ ] Update `useSwordData` hook to fetch from API
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement retry logic
- [ ] Add caching strategy (React Query or SWR)

### Pagination
- [ ] Implement pagination in SwordTable
- [ ] Add page size selector
- [ ] Add "Load More" or page numbers
- [ ] Update URL with page state
- [ ] Handle filter changes resetting pagination

---

## 6. Photo Gallery Implementation

### Gallery Component
- [ ] Create `PhotoGallery.jsx` component
- [ ] Install carousel/lightbox library
- [ ] Display thumbnails in grid
- [ ] Implement carousel for browsing
- [ ] Add lightbox for full-size viewing
- [ ] Add image captions
- [ ] Show loading placeholders
- [ ] Handle no photos state
- [ ] Add keyboard navigation (arrows, ESC)

### Integration
- [ ] Add PhotoGallery to SwordDetail component
- [ ] Fetch photos from API
- [ ] Handle loading states
- [ ] Add image lazy loading
- [ ] Optimize image loading performance
- [ ] Add photo count indicator
- [ ] Consider full-page photo view option

### Responsive Design
- [ ] Mobile-friendly gallery layout
- [ ] Touch gestures for swipe
- [ ] Responsive image sizes
- [ ] Test on various devices

---

## 7. Admin Data Entry Form

### Form Components
- [ ] Create `AdminForm.jsx` component
- [ ] Build form fields for all sword attributes
- [ ] Add field validation
- [ ] Show validation errors inline
- [ ] Add form submission handling
- [ ] Show success/error messages
- [ ] Add "Save Draft" functionality
- [ ] Add "Preview" before submit

### Photo Upload UI
- [ ] Create `PhotoUpload.jsx` component
- [ ] Implement drag-and-drop area
- [ ] Show upload progress
- [ ] Display uploaded photos preview
- [ ] Allow removing photos before submit
- [ ] Add photo reordering
- [ ] Show file size warnings
- [ ] Handle multiple file selection

### Form Fields
- [ ] School (dropdown or autocomplete)
- [ ] Smith (autocomplete with existing values)
- [ ] Mei (text input)
- [ ] Type (dropdown)
- [ ] Nagasa (number input with units)
- [ ] Sori (number input)
- [ ] Moto (number input)
- [ ] Saki (number input)
- [ ] Nakago (dropdown)
- [ ] Ana (number input)
- [ ] Tang Length (number input)
- [ ] Hori (text input)
- [ ] Authentication (text area)
- [ ] Province (dropdown or autocomplete)
- [ ] Period (dropdown)
- [ ] References (text area)
- [ ] Description (rich text area)
- [ ] Attachments (text area)
- [ ] Meito checkbox
- [ ] Meito name (text input if checked)

### Access Control
- [ ] Add admin-only route for form
- [ ] Show form only to authorized users (placeholder for Phase 5)
- [ ] Add edit mode for existing swords
- [ ] Prevent unauthorized API access

---

## 8. Testing & Quality Assurance

### Backend Tests
- [ ] Unit tests for database models
- [ ] Integration tests for API endpoints
- [ ] Test photo upload process
- [ ] Test CSV import script
- [ ] Test error handling
- [ ] Load testing for API performance

### Frontend Tests
- [ ] Test API integration
- [ ] Test photo gallery component
- [ ] Test admin form validation
- [ ] Test photo upload component
- [ ] E2E tests for critical flows

### Data Validation
- [ ] Verify all CSV data migrated correctly
- [ ] Spot-check random entries
- [ ] Verify photo uploads work
- [ ] Test filter functionality with database
- [ ] Test search with database

### Performance Testing
- [ ] Test page load times with photos
- [ ] Profile API response times
- [ ] Test with large datasets
- [ ] Optimize slow queries
- [ ] Monitor database performance

---

## 9. Documentation

### API Documentation
- [ ] Document all endpoints
- [ ] Provide request/response examples
- [ ] Document query parameters
- [ ] Document error responses
- [ ] Create Postman collection or OpenAPI spec

### Developer Guide
- [ ] Document database schema
- [ ] Explain photo storage architecture
- [ ] Document environment variables
- [ ] Create setup instructions
- [ ] Document migration process

### User Guide
- [ ] Create admin form user guide
- [ ] Document photo upload process
- [ ] Create troubleshooting guide

---

## 10. Deployment Preparation

### Configuration
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Set up production photo storage
- [ ] Configure CORS for production
- [ ] Set up SSL/HTTPS

### Security
- [ ] Sanitize user inputs
- [ ] Validate file uploads
- [ ] Set file size limits
- [ ] Rate limit API endpoints
- [ ] Add CSRF protection
- [ ] Secure sensitive environment variables
- [ ] Run security audit

---

## Phase 3 Completion Checklist

- [ ] Database fully set up and populated
- [ ] All API endpoints functional and tested
- [ ] Photo upload and storage working
- [ ] Photo gallery displays correctly
- [ ] Admin form allows creating/editing entries
- [ ] Frontend successfully integrated with backend
- [ ] Performance is acceptable
- [ ] Security measures in place
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Phase 3 merged to main branch

---

**Notes**:
- This is the most complex phase - break into smaller sub-tasks as needed
- Consider feature flags to roll out incrementally
- Keep CSV fallback until fully confident in database
- Budget extra time for debugging and edge cases
