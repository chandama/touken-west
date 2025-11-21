# Touken West Admin Server

Local admin server for managing sword data and media attachments.

## Quick Start

### 1. Install Dependencies

```bash
cd admin-server
npm install
```

### 2. Start the Admin Server

```bash
npm start
```

The server will run on `http://localhost:3002`

### 3. Start the Main App

In a separate terminal:

```bash
cd ..
npm run dev
```

The app will run on `http://localhost:3000`

### 4. Access the Admin Dashboard

Open your browser to:
```
http://localhost:3000/admin
```

## Features

- **Browse Swords**: Search and filter all 15,097 swords
- **Upload Media**: Drag & drop JPG/PDF files
- **Categorize**: Organize media by type (Full Blade, Hamon, Certificate, etc.)
- **Tag**: Add searchable tags to media
- **Delete**: Remove unwanted media files
- **Auto-save**: Changes saved directly to CSV and file system

## API Endpoints

### GET /api/health
Health check endpoint

### GET /api/swords
Get paginated list of swords with filtering
- Query params: `page`, `limit`, `search`, `school`, `type`, `hasMedia`

### GET /api/swords/:index
Get single sword by index

### POST /api/swords/:index/media
Upload media for a sword
- Form data: `file`, `category`, `caption`, `tags`

### DELETE /api/swords/:index/media
Remove media from a sword
- Body: `{ "filename": "..." }`

### PATCH /api/swords/:index
Update sword metadata
- Body: `{ "Tags": "...", "Description": "..." }`

## File Structure

```
admin-server/
├── server.js           # Express server
├── package.json        # Dependencies
└── README.md           # This file

Uploads are saved to:
└── public/documents/uploads/
    ├── {timestamp}-{filename}.jpg
    └── thumb-{timestamp}-{filename}.jpg
```

## Development

### Using Nodemon (Auto-restart)

```bash
npm run dev
```

### Logs

Server logs all upload and delete operations to console.

## Security Note

**This is a local development tool only!**

- No authentication
- No CORS restrictions
- Not for production use
- Use only on localhost

When ready for production, migrate to Payload CMS with proper authentication.

## Troubleshooting

### Port 3002 already in use

Kill the process or change PORT in `server.js`

### CORS errors

Make sure the admin server is running on port 3002 and main app on 3000

### File uploads failing

Check that `public/documents/uploads/` directory is writable

### CSV not updating

Check file permissions on `data/index.csv` and `public/data/index.csv`
