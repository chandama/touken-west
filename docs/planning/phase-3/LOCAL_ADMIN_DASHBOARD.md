# Phase 3: Local Admin Dashboard

**Status**: ✅ COMPLETED
**Priority**: High
**Completion Date**: November 2024

## Overview

Built a comprehensive local admin dashboard that runs alongside the main app for managing sword data and media attachments. The dashboard provides full CRUD operations for sword records, media management, and includes an advanced changelog system for tracking all modifications.

## Goals

1. **View and search** all 15,097 swords
2. **Select any sword** and view its details
3. **Upload photos/PDFs** for selected sword
4. **Tag and categorize** media files
5. **Save changes** back to CSV and local file system
6. **Preview changes** before saving

## Architecture

### Local Development Setup

```
┌─────────────────────────────────┐
│   Main App                      │
│   http://localhost:3000         │
│   (User-facing frontend)        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   Admin Dashboard               │
│   http://localhost:3001         │
│   (Admin interface)             │
│   - Browse swords               │
│   - Upload media                │
│   - Edit metadata               │
└────────────┬────────────────────┘
             │
             ↓ Writes to
┌─────────────────────────────────┐
│   Local File System             │
│   - data/index.csv              │
│   - public/documents/           │
│   - public/data/index.csv       │
└─────────────────────────────────┘
```

## Technical Stack

### Frontend (Admin UI)
- **Framework**: React (reuse existing setup)
- **Routing**: React Router
- **UI Components**: Reuse existing styles
- **File Upload**: React Dropzone
- **Forms**: React Hook Form

### Backend (Local Server)
- **Framework**: Express.js
- **File Upload**: Multer
- **CSV Parsing**: PapaParse (server-side)
- **Image Processing**: Sharp (for thumbnails)
- **Port**: 3001

## Features

### 1. Sword Browser
```
┌─────────────────────────────────────────┐
│ Admin Dashboard - Sword Management      │
├─────────────────────────────────────────┤
│                                         │
│ Search: [________________] 🔍          │
│                                         │
│ Filters:                                │
│ School: [All ▼]  Type: [All ▼]        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ #7858  Osafune Nagamitsu  [View/Edit]  │
│        Tachi | Bizen | Kamakura        │
│        ✅ Has media (2 files)           │
│                                         │
│ #6129  Awataguchi Kunimitsu [View/Edit]│
│        Tanto | Yamashiro | Kamakura    │
│        ⚠️  No media                     │
│                                         │
│ ...showing 25 of 15,097                │
│                                         │
│ [Prev] Page 1 of 604 [Next]           │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Sword Detail & Media Upload
```
┌─────────────────────────────────────────┐
│ Edit Sword #7858 - Osafune Nagamitsu    │
├─────────────────────────────────────────┤
│                                         │
│ Basic Info:                             │
│ Smith: Osafune Nagamitsu               │
│ Type: Tachi                             │
│ School: Osafune (Bizen)                │
│ Period: Late Kamakura                   │
│ Nagasa: 71.5 cm                        │
│                                         │
├─────────────────────────────────────────┤
│ Media Attachments:                      │
│                                         │
│ ┌────────────┐  ┌────────────┐         │
│ │  [Image]   │  │  [Image]   │         │
│ │ Full blade │  │   Hamon    │         │
│ │ IMG_001.jpg│  │ IMG_002.jpg│         │
│ │ [Remove]   │  │ [Remove]   │         │
│ └────────────┘  └────────────┘         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   Drag & Drop files here            │ │
│ │   or click to browse                │ │
│ │   (JPG, PDF accepted)               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ New Upload:                             │
│ File: IMG_003.jpg                      │
│ Category: [Habaki        ▼]            │
│ Caption: [Gold-washed habaki detail]   │
│ Tags: [habaki, gold, detail]           │
│                                         │
│ [Upload File]                           │
│                                         │
├─────────────────────────────────────────┤
│ [Save Changes]  [Cancel]  [Preview]    │
└─────────────────────────────────────────┘
```

### 3. Media Categories
- Full Blade
- Hamon Detail
- Tang (Nakago)
- Signature (Mei)
- Certificate / Papers
- Mounting (Koshirae)
- Habaki
- Tsuba (Guard)
- Menuki (Ornaments)
- Fuchi-Kashira (Fittings)
- Other

## Implementation Plan

### Step 1: Create Admin Backend

Create `admin-server/` directory:

```javascript
// admin-server/server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');
const sharp = require('sharp');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Configure file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, '../public/documents/uploads');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PDF allowed.'));
    }
  },
});

// API Routes

// Get all swords with pagination
app.get('/api/swords', async (req, res) => {
  try {
    const { page = 1, limit = 25, search = '', school = '', type = '' } = req.query;

    const csvPath = path.join(__dirname, '../data/index.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    let swords = parsed.data;

    // Filter
    if (search) {
      const searchLower = search.toLowerCase();
      swords = swords.filter(s =>
        s.Smith?.toLowerCase().includes(searchLower) ||
        s.School?.toLowerCase().includes(searchLower) ||
        s.Mei?.toLowerCase().includes(searchLower)
      );
    }

    if (school) {
      swords = swords.filter(s => s.School === school);
    }

    if (type) {
      swords = swords.filter(s => s.Type === type);
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSwords = swords.slice(startIndex, endIndex);

    res.json({
      swords: paginatedSwords,
      total: swords.length,
      page: parseInt(page),
      pages: Math.ceil(swords.length / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single sword by index
app.get('/api/swords/:index', async (req, res) => {
  try {
    const { index } = req.params;

    const csvPath = path.join(__dirname, '../data/index.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true });

    const sword = parsed.data.find(s => s.Index === index);

    if (!sword) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    res.json(sword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload media for a sword
app.post('/api/swords/:index/media', upload.single('file'), async (req, res) => {
  try {
    const { index } = req.params;
    const { category, caption, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate thumbnail if image
    if (file.mimetype.startsWith('image/')) {
      const thumbnailPath = path.join(
        path.dirname(file.path),
        `thumb-${file.filename}`
      );

      await sharp(file.path)
        .resize(400, 300, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    }

    // Update CSV with new media attachment
    const csvPath = path.join(__dirname, '../data/index.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true });

    const swordIndex = parsed.data.findIndex(s => s.Index === index);
    if (swordIndex === -1) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    const sword = parsed.data[swordIndex];

    // Parse existing media attachments
    let mediaAttachments = [];
    if (sword.MediaAttachments && sword.MediaAttachments !== 'NA') {
      try {
        mediaAttachments = JSON.parse(sword.MediaAttachments);
      } catch {
        mediaAttachments = [];
      }
    }

    // Add new attachment
    const fileUrl = `/documents/uploads/${file.filename}`;
    mediaAttachments.push({
      url: fileUrl,
      category: category || 'Other',
      caption: caption || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      uploadedAt: new Date().toISOString(),
    });

    // Update sword record
    sword.MediaAttachments = JSON.stringify(mediaAttachments);

    // Write back to CSV
    const csv = Papa.unparse(parsed.data, { header: true });
    await fs.writeFile(csvPath, csv, 'utf8');

    // Also update public CSV
    const publicCsvPath = path.join(__dirname, '../public/data/index.csv');
    await fs.writeFile(publicCsvPath, csv, 'utf8');

    res.json({
      success: true,
      file: {
        url: fileUrl,
        category,
        caption,
        tags,
      },
      sword,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove media from sword
app.delete('/api/swords/:index/media', async (req, res) => {
  try {
    const { index } = req.params;
    const { mediaUrl } = req.body;

    const csvPath = path.join(__dirname, '../data/index.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true });

    const swordIndex = parsed.data.findIndex(s => s.Index === index);
    if (swordIndex === -1) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    const sword = parsed.data[swordIndex];

    // Parse and filter media attachments
    let mediaAttachments = JSON.parse(sword.MediaAttachments || '[]');
    mediaAttachments = mediaAttachments.filter(m => m.url !== mediaUrl);

    sword.MediaAttachments = JSON.stringify(mediaAttachments);

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../public', mediaUrl);
    await fs.unlink(filePath).catch(() => {}); // Ignore errors

    // Write back to CSV
    const csv = Papa.unparse(parsed.data, { header: true });
    await fs.writeFile(csvPath, csv, 'utf8');
    await fs.writeFile(path.join(__dirname, '../public/data/index.csv'), csv, 'utf8');

    res.json({ success: true, sword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Admin server running on http://localhost:${PORT}`);
});
```

### Step 2: Create Admin Frontend

Create `src/admin/` directory with React components:

```javascript
// src/admin/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SwordList from './pages/SwordList';
import SwordEdit from './pages/SwordEdit';
import './styles/admin.css';

function AdminApp() {
  return (
    <BrowserRouter>
      <div className="admin-container">
        <header className="admin-header">
          <h1>Touken West - Admin Dashboard</h1>
          <nav>
            <a href="/admin">Swords</a>
            <a href="/" target="_blank">View Site</a>
          </nav>
        </header>

        <main className="admin-main">
          <Routes>
            <Route path="/admin" element={<SwordList />} />
            <Route path="/admin/sword/:index" element={<SwordEdit />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default AdminApp;
```

### Step 3: Build Media Upload Component

```javascript
// src/admin/components/MediaUpload.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

function MediaUpload({ swordIndex, onUploadComplete }) {
  const [category, setCategory] = useState('Full Blade');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('caption', caption);
    formData.append('tags', tags);

    try {
      const response = await fetch(`http://localhost:3001/api/swords/${swordIndex}/media`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert('File uploaded successfully!');
        onUploadComplete(result.sword);
        setCaption('');
        setTags('');
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  }, [swordIndex, category, caption, tags, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div className="media-upload">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop file here...</p>
        ) : (
          <p>Drag & drop a file here, or click to browse (JPG, PDF)</p>
        )}
      </div>

      <div className="upload-form">
        <label>
          Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Full Blade</option>
            <option>Hamon Detail</option>
            <option>Tang (Nakago)</option>
            <option>Signature (Mei)</option>
            <option>Certificate</option>
            <option>Mounting (Koshirae)</option>
            <option>Habaki</option>
            <option>Tsuba</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Caption:
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Brief description"
          />
        </label>

        <label>
          Tags (comma-separated):
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="hamon, detail, close-up"
          />
        </label>
      </div>

      {uploading && <p>Uploading...</p>}
    </div>
  );
}

export default MediaUpload;
```

## Development Workflow

### Daily Usage
```bash
# Terminal 1: Run main app
npm run dev

# Terminal 2: Run admin server
cd admin-server
node server.js

# Terminal 3: Run admin frontend (if separate)
# Or just navigate to http://localhost:3000/admin
```

### Making Changes
1. Open admin dashboard: http://localhost:3001
2. Search for sword
3. Click "Edit"
4. Upload media files
5. Add captions and tags
6. Save changes
7. Changes written to CSV and files
8. Refresh main app to see updates

## Benefits of Local Dashboard

1. **No Backend Required** - Everything runs locally
2. **Fast Development** - Direct file system access
3. **Easy Testing** - See changes immediately
4. **Portable** - Can run on any machine
5. **Safe** - No risk to production data
6. **Foundation** - Can evolve into Payload CMS later

## Migration Path to Production

When ready to deploy:
1. Current local dashboard code becomes proof of concept
2. Payload CMS provides production-ready admin
3. Same features, but with:
   - User authentication
   - Role-based access control
   - Cloud storage integration
   - Better security
   - Scalability

## Completed Features

### Core Functionality ✅
- Sword browsing with pagination (100 items per page)
- Advanced search with live filtering and multi-tag support
- Filter by school, type, and media status
- Session-based filter persistence
- Individual sword editing with all 18 data fields
- Media upload with drag & drop (JPG, PDF)
- Media categorization and tagging
- Thumbnail generation for images
- Media removal functionality

### Advanced Features ✅
- **Sword Record Editing**: Full edit capability for all sword fields
  - School, Smith, Mei, Type, Period, Province
  - Measurements: Nagasa, Sori, Moto, Saki
  - Tang details: Nakago, Ana, Length, Hori
  - Authentication, References, Description, Attachments
- **Confirmation Modal**: Before/after comparison for all changes
- **Changelog System**: Complete audit trail of all modifications
  - Automatic tracking of all sword record updates
  - Timestamped entries with relative/absolute time display
  - Live search across changelog entries
  - Compact, scannable layout (100 entries per page)
  - Before/after value comparison for each changed field
  - Direct links to sword records from changelog

### Technical Implementation
- **Backend**: Express.js server on port 3002
- **Frontend**: React with React Router
- **File Upload**: Multer with Sharp for image processing
- **CSV Management**: PapaParse for data persistence
- **Changelog Storage**: JSON file with 1,000 entry limit
- **Network Access**: Configured for LAN access via hostname

## Next Steps

Phase 3 is complete. The admin dashboard is fully functional with:
- Comprehensive CRUD operations
- Media management system
- Advanced changelog tracking
- Live search and filtering

Ready to move to Phase 4 (Public Gallery) or Phase 5 (Search Enhancement).
