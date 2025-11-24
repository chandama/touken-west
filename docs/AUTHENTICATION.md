# Authentication System

This document describes the authentication and authorization system for Touken West.

## Overview

The site implements a two-tier authentication system:
- **Public Users**: Can log in to view all media attachments
- **Admin Users**: Can access the admin dashboard to manage sword records

## User Roles

### Regular Users (role: 'user')
- Can register and log in via the main site
- Can view all media attachments, including those tagged with:
  - "Juyo"
  - "Juyo Bijutsuhin"
  - "Tokubetsu Juyo"
- Cannot access the admin dashboard

### Admin Users (role: 'admin')
- Full access to admin dashboard at `/admin`
- Can create, edit, and delete sword records
- Can upload and manage media attachments
- Can perform bulk uploads

## Media Attachment Restrictions

When a user is **NOT logged in**:
- Media attachments tagged with "Juyo", "Juyo Bijutsuhin", or "Tokubetsu Juyo" are hidden
- Other media attachments are visible
- No indication is shown that restricted media exists

When a user **IS logged in** (any role):
- All media attachments are visible regardless of tags

## Default Admin Account

An admin account is created for initial setup:

```
Email: admin@touken-west.com
Password: admin123
```

**⚠️ IMPORTANT**: Change this password immediately after first login in production!

## API Endpoints

### Authentication Routes

#### Register
```
POST /api/auth/register
Body: { email, password, username }
Returns: { success, user, token }
```
- Creates a new user with role 'user'
- Automatically logs in the user
- Sets httpOnly cookie with JWT token

#### Login
```
POST /api/auth/login
Body: { email, password }
Returns: { success, user, token }
```
- Validates credentials
- Sets httpOnly cookie with JWT token
- Token expires in 7 days

#### Logout
```
POST /api/auth/logout
Returns: { success, message }
```
- Clears authentication cookie

#### Get Current User
```
GET /api/auth/me
Requires: Authentication token (cookie or header)
Returns: { user: { id, email, role } }
```

### Protected Routes

All admin endpoints require authentication AND admin role:
- `POST /api/swords` - Create sword
- `PATCH /api/swords/:index` - Update sword
- `DELETE /api/swords/:index` - Delete sword
- `POST /api/swords/:index/media` - Upload media
- `DELETE /api/swords/:index/media` - Delete media
- `POST /api/swords/bulk` - Bulk upload

## Frontend Components

### Public Site (`/`)
- **Login/Register Modals**: Accessible from header "Login" button
- **SwordDetail Component**: Filters restricted media for non-authenticated users
- **User Menu**: Shows logged-in user's email and logout button

### Admin Dashboard (`/admin`)
- **ProtectedRoute**: Wraps entire admin app
- **Admin Login**: Required before accessing any admin pages
- Only accepts users with role 'admin'

## Implementation Details

### Backend (admin-server/server.js)

**Authentication Middleware**:
```javascript
function authenticateToken(req, res, next)
```
- Validates JWT token from cookie or Authorization header
- Attaches user info to `req.user`

**Admin Authorization Middleware**:
```javascript
function requireAdmin(req, res, next)
```
- Checks if `req.user.role === 'admin'`
- Returns 403 if not admin

**User Storage**:
- Users stored in `/data/users.json`
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with `JWT_SECRET` environment variable

### Frontend Components

**App.jsx**:
- Checks auth status on mount
- Displays login/register modals
- Passes `user` prop to SwordDetail

**SwordDetail.jsx**:
- Filters media attachments based on tags and auth status
- Hides restricted media silently (no message shown)

**ProtectedRoute.jsx**:
- Checks authentication on mount
- Shows inline login form if not authenticated
- Validates admin role if `requireAdmin={true}`

## Security Features

1. **Password Hashing**: bcrypt with 10 rounds
2. **HTTP-Only Cookies**: JWT tokens not accessible via JavaScript
3. **Token Expiration**: 7-day token lifetime
4. **Role-Based Access**: Separate user and admin roles
5. **CORS Configuration**: Credentials enabled for localhost development

## Environment Variables

For production, set these environment variables:

```bash
# JWT Secret (REQUIRED - change in production!)
JWT_SECRET=your-secure-random-secret-key

# Server Port (optional, defaults to 3002)
PORT=3002
```

## Creating Additional Admin Users

### Option 1: Via Script
```bash
node scripts/create-admin-user.js
```

### Option 2: Manual Modification
1. Register a normal user via the site
2. Edit `/data/users.json`
3. Change the user's `"role": "user"` to `"role": "admin"`

### Option 3: Via Database (when migrated to MongoDB)
Update the user document to set `role: 'admin'`

## Future Enhancements

When migrating to MongoDB:
- Replace `/data/users.json` with MongoDB Users collection
- Add password reset functionality
- Add email verification
- Add user management page in admin dashboard
- Add audit logging for admin actions
- Add session management (view/revoke active sessions)

## Testing

### Test User Registration
1. Go to main site
2. Click "Login"
3. Click "Register"
4. Create an account
5. Verify you can see restricted media after logging in

### Test Admin Access
1. Go to `/admin`
2. Log in with admin credentials
3. Verify you can access all admin pages
4. Try logging in with regular user - should be denied

### Test Media Filtering
1. Create a sword record with media
2. Tag media with "Juyo"
3. View sword detail while logged out - media hidden
4. Log in and view again - media visible
