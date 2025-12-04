# Touken West

A searchable database of historical Japanese swords featuring 15,097 documented blades from the 7th century through the Edo period.

## Overview

This application provides an interactive interface to explore a comprehensive catalog of Japanese swords (touken/刀剣). The database includes detailed information about blade dimensions, authentication status, historical periods, smithing schools, and provenance.

## Features

- **Full-text search** across all sword data fields
- **Advanced filtering** by type, school, period, province, and more
- **Detailed view** with complete specifications for each sword
- **Media attachments** - PDFs, images, and documents per sword
- **Media library** - Browse and manage all uploaded media
- **Admin panel** - CRUD operations for sword entries
- **User authentication** - JWT-based auth with role management
- **Dark mode** - Toggle between light and dark themes
- **Responsive design** - Desktop and mobile support

## Tech Stack

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **PapaParse** for CSV parsing

### Backend
- **Node.js/Express** API server
- **MongoDB/Mongoose** database
- **JWT** authentication
- **DigitalOcean Spaces** (S3-compatible) for media storage

### Infrastructure
- **Docker** containerization
- **DigitalOcean App Platform** deployment

## Project Structure

```
touken-west/
├── admin-server/           # Express API server
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose schemas (Sword, User, Changelog)
│   ├── server.js           # Main server with all API routes
│   └── package.json
├── src/                    # React frontend
│   ├── admin/              # Admin panel
│   │   ├── components/     # Admin-specific components
│   │   ├── pages/          # Admin pages (Dashboard, SwordEdit, etc.)
│   │   └── AdminApp.jsx    # Admin app entry
│   ├── library/            # Media library
│   │   ├── components/     # Library components
│   │   └── LibraryApp.jsx  # Library app entry
│   ├── components/         # Shared components
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── SwordTable.jsx
│   │   ├── SwordDetail.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   ├── context/            # React context (Auth)
│   ├── hooks/              # Custom hooks
│   ├── styles/             # CSS styles
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   └── index.jsx           # React entry point
├── public/                 # Static assets
├── docs/                   # Documentation
├── .do/                    # DigitalOcean App Platform config
├── Dockerfile
├── docker-compose.yml
├── vite.config.js
└── package.json
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- DigitalOcean Spaces bucket (for media storage)

### Environment Variables

Create `.env` files in both root and `admin-server/` directories:

```bash
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key

# DigitalOcean Spaces
SPACES_KEY=your-spaces-key
SPACES_SECRET=your-spaces-secret
SPACES_BUCKET=your-bucket-name
SPACES_REGION=nyc3
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd touken-west
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd admin-server
npm install
cd ..
```

4. Start the development servers:

```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (Express)
cd admin-server
npm run dev
```

5. Open your browser to [http://localhost:5173](http://localhost:5173)

## Available Scripts

### Frontend (root directory)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (admin-server directory)
- `npm start` - Start Express server
- `npm run dev` - Start with nodemon (auto-reload)

## API Endpoints

### Public
- `GET /api/swords` - List swords with pagination/filtering
- `GET /api/swords/:id` - Get sword by ID
- `GET /api/swords/search` - Search swords

### Protected (requires auth)
- `POST /api/swords` - Create sword
- `PUT /api/swords/:id` - Update sword
- `DELETE /api/swords/:id` - Delete sword
- `POST /api/swords/:id/media` - Upload media
- `DELETE /api/swords/:id/media/:mediaId` - Delete media
- `POST /api/swords/bulk-upload` - Bulk CSV upload

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

## Data Coverage

The database includes:
- 15,097 sword entries
- Coverage from Late Heian period through Edo period
- Multiple blade types: Tachi, Katana, Tanto, Wakizashi, and more
- Major smithing schools: Awataguchi, Ichimonji, Osafune, Sanjo, Gojo, and others
- Authentication levels from Kokuho (National Treasure) to Hozon

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for DigitalOcean App Platform deployment instructions.

## License

Data compiled from historical records and public cultural heritage documentation.
