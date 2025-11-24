# Deployment Guide for nihonto-db.com

This guide covers deploying the Nihonto Database application to DigitalOcean App Platform with MongoDB Atlas and DigitalOcean Spaces.

## Prerequisites

- [x] DigitalOcean account with payment method
- [x] MongoDB Atlas account with cluster created
- [x] DigitalOcean Spaces bucket created
- [x] CloudFlare account with nihonto-db.com domain
- [x] GitHub repository: chandama/touken-west

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFlare DNS                        │
│                     nihonto-db.com                          │
└────────────────────┬───────────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                           │
    ┌────▼─────┐              ┌─────▼──────┐
    │ Frontend │              │  Backend   │
    │  (Static)│              │    API     │
    │          │              │ (Node.js)  │
    └──────────┘              └─────┬──────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                 │
               ┌────▼────┐    ┌────▼─────┐    ┌─────▼──────┐
               │ MongoDB │    │ DO Spaces │    │ CloudFlare │
               │  Atlas  │    │  (Images) │    │    CDN     │
               └─────────┘    └───────────┘    └────────────┘
```

## Step 1: Prepare MongoDB Atlas

### 1.1 Configure Network Access

1. Log into MongoDB Atlas: https://cloud.mongodb.com
2. Go to **Network Access**
3. Click **Add IP Address**
4. For DigitalOcean App Platform, add: `0.0.0.0/0`
   - Description: "DigitalOcean App Platform (temporary - will restrict after deployment)"
   - Note: After deployment, DigitalOcean will provide specific IP addresses to whitelist

### 1.2 Verify Database

1. Go to **Database** → **Browse Collections**
2. Verify you see:
   - Database: `nihonto_db`
   - Collections: `swords` (15,100 documents), `users`, `changelog`

### 1.3 Get Connection String

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy connection string - should look like:
   ```
   mongodb+srv://nihontodb_db_user:PASSWORD@nihonto-cluster.xxxxx.mongodb.net/nihonto_db?retryWrites=true&w=majority
   ```

## Step 2: Verify DigitalOcean Spaces

1. Log into DigitalOcean: https://cloud.digitalocean.com
2. Go to **Spaces** in left sidebar
3. Verify your Space exists (e.g., `nihonto-db-bucket`)
4. Click **Settings** tab
5. Verify:
   - CDN is enabled ✓
   - CORS is configured ✓
6. Note down:
   - Endpoint: `https://sfo3.digitaloceanspaces.com`
   - CDN Endpoint: `https://nihonto-db-bucket.sfo3.cdn.digitaloceanspaces.com`

## Step 3: Deploy to DigitalOcean App Platform

### Option A: Deploy via Web Interface (Recommended for first deployment)

1. Go to https://cloud.digitalocean.com/apps
2. Click **Create App**
3. Choose **GitHub** as source
4. Select repository: `chandama/touken-west`
5. Select branch: `main`
6. Click **Autodeploy** to deploy on git push

#### Configure Components:

**Backend API Service:**
- Name: `nihonto-api`
- Type: Web Service
- Build Command: `cd admin-server && npm install`
- Run Command: `cd admin-server && node server.js`
- HTTP Port: `3002`
- HTTP Routes: `/api`
- Instance Size: Basic (512MB RAM, $5/month)
- Health Check: `/api/health`

**Frontend Static Site:**
- Name: `nihonto-frontend`
- Type: Static Site
- Build Command: `npm run build`
- Output Directory: `build`
- HTTP Routes: `/`

#### Add Environment Variables (Backend API only):

Click **Edit** next to `nihonto-api` → **Environment Variables** → Add:

```
NODE_ENV=production
PORT=3002

# MongoDB (mark as SECRET)
MONGODB_URI=mongodb+srv://nihontodb_db_user:YOUR_PASSWORD@nihonto-cluster.xxxxx.mongodb.net/nihonto_db?retryWrites=true&w=majority

# Security (mark as SECRET)
JWT_SECRET=<your-generated-secret-from-.env>
SESSION_SECRET=<your-generated-secret-from-.env>

# DigitalOcean Spaces
SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
SPACES_REGION=us-east-1
SPACES_BUCKET=nihonto-db-bucket

# Spaces Credentials (mark as SECRET)
SPACES_ACCESS_KEY_ID=<your-spaces-access-key>
SPACES_SECRET_ACCESS_KEY=<your-spaces-secret-key>

# Spaces CDN
SPACES_CDN_ENDPOINT=https://nihonto-db-bucket.sfo3.cdn.digitaloceanspaces.com

# File Upload
UPLOAD_MAX_SIZE=15728640
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,application/pdf

# CORS
CORS_ORIGIN=https://nihonto-db.com,https://www.nihonto-db.com
```

7. Click **Next**
8. Review your configuration
9. Click **Create Resources**

### Option B: Deploy via CLI

```bash
# Install doctl
brew install doctl  # macOS
# or
snap install doctl  # Linux

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml

# Add secrets via CLI or web interface
doctl apps update <APP_ID> --env MONGODB_URI=<value>
```

## Step 4: Configure Custom Domain (CloudFlare)

### 4.1 Get App Platform URLs

After deployment completes:
1. Go to **Settings** tab in your app
2. Note the auto-generated URLs:
   - Frontend: `nihonto-frontend-xxxxx.ondigitalocean.app`
   - API: `nihonto-api-xxxxx.ondigitalocean.app`

### 4.2 Add Custom Domain in DigitalOcean

1. In your app, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `nihonto-db.com`
4. Add another: `www.nihonto-db.com`
5. DigitalOcean will provide CNAME records

### 4.3 Configure CloudFlare DNS

1. Log into CloudFlare: https://dash.cloudflare.com
2. Select domain: `nihonto-db.com`
3. Go to **DNS** → **Records**
4. Add records as instructed by DigitalOcean:

   **For root domain (nihonto-db.com):**
   - Type: `CNAME`
   - Name: `@`
   - Target: `<your-app>.ondigitalocean.app`
   - Proxy status: **Proxied** (orange cloud)

   **For www subdomain:**
   - Type: `CNAME`
   - Name: `www`
   - Target: `<your-app>.ondigitalocean.app`
   - Proxy status: **Proxied** (orange cloud)

5. Save changes

### 4.4 Configure CloudFlare SSL

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to: **Full (strict)**
3. Go to **Edge Certificates**
4. Enable:
   - ✓ Always Use HTTPS
   - ✓ Automatic HTTPS Rewrites
   - ✓ Minimum TLS Version: 1.2

### 4.5 Configure CloudFlare Caching

1. Go to **Caching** → **Configuration**
2. Add Page Rules (Rules → Page Rules):

   **Rule 1: API - No Cache**
   - URL: `nihonto-db.com/api/*`
   - Setting: Cache Level → Bypass

   **Rule 2: Images - Cache Everything**
   - URL: `*.digitaloceanspaces.com/*`
   - Settings:
     - Cache Level → Cache Everything
     - Edge Cache TTL → 1 month

   **Rule 3: Frontend - Cache with revalidation**
   - URL: `nihonto-db.com/*`
   - Settings:
     - Cache Level → Standard
     - Browser Cache TTL → 4 hours

## Step 5: Update Application URLs

### 5.1 Update CORS in Backend

Once your domain is live, update the CORS_ORIGIN environment variable:

```
CORS_ORIGIN=https://nihonto-db.com,https://www.nihonto-db.com
```

### 5.2 Update Frontend API URL

If the frontend has hardcoded API URLs, update them to:
```
https://nihonto-db.com/api
```

## Step 6: Verify Deployment

### 6.1 Test Health Endpoint

```bash
curl https://nihonto-db.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Admin server running",
  "database": "MongoDB",
  "storage": "DigitalOcean Spaces"
}
```

### 6.2 Test Database Connection

```bash
curl "https://nihonto-db.com/api/swords?limit=1"
```

Should return sword data from MongoDB.

### 6.3 Test Frontend

Visit: https://nihonto-db.com

Should load the React application.

### 6.4 Test Image Upload (Admin Only)

1. Login to admin panel
2. Upload a test image
3. Verify it appears in DigitalOcean Spaces
4. Verify it loads via CDN URL

## Step 7: Post-Deployment Tasks

### 7.1 Restrict MongoDB Access

1. Go to MongoDB Atlas → **Network Access**
2. Remove `0.0.0.0/0`
3. Add DigitalOcean App Platform IP addresses:
   - Find in App Platform → Settings → Component Details
   - Usually shown after first deployment
4. Add your local IP for development access

### 7.2 Monitor Application

1. **DigitalOcean Monitoring:**
   - Go to app → **Insights** tab
   - Monitor CPU, memory, response times

2. **MongoDB Monitoring:**
   - MongoDB Atlas → **Metrics**
   - Watch connections, operations/sec

3. **Set Up Alerts:**
   - DigitalOcean: Settings → Alerts
   - MongoDB: Atlas → Alerts

### 7.3 Set Up Backups

**MongoDB Atlas:**
- Automated backups enabled by default
- Go to **Backup** tab to configure retention

**DigitalOcean Spaces:**
- Consider enabling versioning
- Set up lifecycle rules for old files

### 7.4 Configure Rate Limiting

The application has built-in rate limiting (100 requests/15min per IP). Monitor and adjust in `server.js` if needed:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

## Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Check MongoDB Atlas Network Access whitelist
2. Verify connection string is correct
3. Check MongoDB Atlas cluster status

### Issue: "Files not uploading to Spaces"

**Solution:**
1. Verify Spaces credentials in environment variables
2. Check Spaces CORS configuration
3. Verify bucket name matches

### Issue: "CORS errors in browser"

**Solution:**
1. Check CORS_ORIGIN environment variable
2. Verify CloudFlare proxy is enabled
3. Check backend CORS configuration

### Issue: "App deployment failing"

**Solution:**
1. Check build logs in DigitalOcean console
2. Verify all dependencies in package.json
3. Test build locally: `npm run build`

## Cost Breakdown

| Service | Resource | Monthly Cost |
|---------|----------|--------------|
| MongoDB Atlas | M0 Cluster (512MB) | $0 (Free) |
| DO Spaces | 250GB + 1TB transfer | $5 |
| DO App Platform | Backend (512MB) | $5 |
| DO App Platform | Frontend (Static) | $0-3 |
| CloudFlare | DNS + CDN | $0 (Free) |
| **Total** | | **$10-13/month** |

## Maintenance

### Weekly:
- Check application logs for errors
- Review MongoDB metrics

### Monthly:
- Review Spaces storage usage
- Check for dependency updates: `npm outdated`
- Review and update MongoDB indexes if needed

### Quarterly:
- Security updates: `npm audit fix`
- Review and optimize database queries
- Check CloudFlare analytics for traffic patterns

## Rollback Procedure

If deployment fails:

1. **Via Web Interface:**
   - Go to app → **Settings** → **App Spec**
   - Rollback to previous deployment

2. **Via Git:**
   ```bash
   git revert HEAD
   git push
   ```

3. **Via CLI:**
   ```bash
   doctl apps list-deployments <APP_ID>
   doctl apps create-deployment <APP_ID> --deployment-id <PREVIOUS_ID>
   ```

## Support & Resources

- **DigitalOcean Docs:** https://docs.digitalocean.com/products/app-platform/
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **CloudFlare Docs:** https://developers.cloudflare.com/
- **Project Repository:** https://github.com/chandama/touken-west

---

## Next Steps After Deployment

1. Set up monitoring and alerts
2. Configure automated backups
3. Implement CI/CD pipeline with GitHub Actions
4. Set up error tracking (Sentry)
5. Configure performance monitoring
6. Document admin procedures
7. Create user documentation
