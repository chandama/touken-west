# Admin Dashboard - Quick Start Guide

## 🚀 What You Just Built

A local admin dashboard for managing your Japanese sword database with:
- ✅ Browse all 15,097 swords with search and filters
- ✅ Upload photos and PDFs for any sword
- ✅ Drag & drop file upload
- ✅ Categorize media (Full Blade, Hamon, Certificate, etc.)
- ✅ Add captions and tags
- ✅ Changes save directly to your CSV files

## 🎯 How to Use It

### Step 1: Start the Admin Server

Open a terminal and run:

```bash
node admin-server/server.js
```

You should see:
```
✅ Admin server running on http://localhost:3002
   API endpoint: http://localhost:3002/api
   Health check: http://localhost:3002/api/health
```

**Keep this terminal open!** The admin server needs to stay running.

### Step 2: Start the Main App

Open a **second terminal** and run:

```bash
npm run dev
```

You should see:
```
VITE v7.2.4  ready in 226 ms

➜  Local:   http://localhost:3000/
```

### Step 3: Open the Admin Dashboard

Open your browser to:
```
http://localhost:3000/admin
```

You should see the Admin Dashboard with a list of swords!

## 📖 Using the Admin Dashboard

### Browse Swords

1. **Search**: Type smith name, school, or index number
2. **Filter**: Use dropdowns to filter by school, type, or media status
3. **Paginate**: Navigate through pages (25 swords per page)

### Upload Media for a Sword

1. Click **"View / Edit"** on any sword
2. Scroll to "Upload New Media" section
3. Select a category (Full Blade, Hamon Detail, etc.)
4. Add a caption (optional)
5. Add tags (optional, comma-separated)
6. **Drag & drop** a JPG or PDF file
   - Or click the dropzone to browse files
7. File uploads automatically!

### View Media

- Uploaded images show as thumbnails
- Click image to open full size in new tab
- PDFs show with a document icon

### Remove Media

- Click the "Remove" button under any media item
- Confirm deletion
- File is deleted from disk and CSV

## 📁 Where Files Are Saved

### Media Files
```
public/documents/uploads/
├── 1732214789123-sword-photo.jpg
├── thumb-1732214789123-sword-photo.jpg
└── 1732214789456-certificate.pdf
```

### CSV Data
Changes are saved to both:
- `data/index.csv` (source)
- `public/data/index.csv` (served to app)

## ✨ Features

### Multi-file Upload
Upload multiple files for the same sword - each with its own category, caption, and tags.

### Smart Thumbnails
JPG images automatically generate thumbnails for faster loading.

### Real-time Updates
Changes are saved immediately and reflected in the main app.

### Categorization
14 categories to choose from:
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
- Kissaki (Tip)
- Boshi (Tip Temper Line)
- Hada (Grain Pattern)
- Other

## 🛠️ Troubleshooting

### Admin server won't start

**Error**: `Port 3002 already in use`

**Solution**: Kill the existing process:
```bash
lsof -ti:3002 | xargs kill -9
```

### Cannot access admin page

**Problem**: Shows 404 or blank page

**Solutions**:
1. Make sure both servers are running (admin on 3002, main on 3000)
2. Check you're on `http://localhost:3000/admin` (not 3002)
3. Clear browser cache and reload

### File upload fails

**Problem**: Upload button spins forever

**Solutions**:
1. Check admin server is running (`http://localhost:3002/api/health`)
2. Check file size (max 10MB)
3. Check file type (JPG or PDF only)
4. Check console for CORS errors

### CSV not updating

**Problem**: Changes don't persist

**Solutions**:
1. Check file permissions on `data/index.csv`
2. Check you're not editing CSV files manually at the same time
3. Look for error messages in admin server terminal

## 🔒 Security Note

**This is a local development tool!**

- ⚠️ No authentication
- ⚠️ No CORS restrictions
- ⚠️ Not for production use
- ✅ Safe for localhost only

When ready to deploy, migrate to Payload CMS with proper authentication and security.

## 🎨 What's Next?

### Immediate
- Start uploading media for your swords!
- Test with different file types
- Try all the categories

### Future Enhancements
- Batch upload multiple files at once
- Edit captions after upload
- Reorder media files
- Preview images before upload
- Bulk tagging

### Production Deployment
When you're ready to go live, see:
- `docs/planning/phase-7/DEPLOYMENT_PLAN.md`
- Migration to Payload CMS
- Proper authentication
- Cloud storage integration

## 💡 Tips

1. **Use descriptive captions** - helps identify photos later
2. **Tag consistently** - use same tags across similar photos
3. **Organize by category** - makes browsing easier
4. **Upload full blade first** - then detail shots
5. **Include certificates** - adds provenance value

## 🐛 Found a Bug?

If something isn't working:
1. Check both terminals for error messages
2. Try restarting both servers
3. Check browser console (F12) for errors
4. Make sure you're on the latest code

## 📚 Documentation

- Admin Server API: `admin-server/README.md`
- Deployment Plan: `docs/planning/phase-7/DEPLOYMENT_PLAN.md`
- Local Dashboard Spec: `docs/planning/phase-3/LOCAL_ADMIN_DASHBOARD.md`

---

**Happy sword cataloging!** 🗡️
