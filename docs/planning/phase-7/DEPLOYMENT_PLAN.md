# Phase 7: Production Deployment Plan

**Status**: 🔵 Planned (Not Started)
**Priority**: High
**Prerequisites**: Phase 6 (Security Hardening) must be complete

## Overview

This phase documents the plan for deploying Touken West to production on DigitalOcean infrastructure, including backend services with Payload CMS for media management.

## Architecture

### Production Stack

```
┌─────────────────────────────────┐
│   Frontend (React + Vite)       │
│   - Vercel/Netlify (free tier) │
│   - Or DO App Platform ($5)    │
└────────────┬────────────────────┘
             │
             ↓ API Requests
┌─────────────────────────────────┐
│   Payload CMS Backend           │
│   - DigitalOcean Droplet ($6)  │
│   - Node.js + Express          │
│   - Admin UI: /admin           │
│   - API: /api/*                │
└────────────┬────────────────────┘
             │
             ├───────────────┐
             ↓               ↓
┌──────────────────┐  ┌──────────────────┐
│  MongoDB Atlas   │  │  DO Spaces       │
│  Free tier       │  │  $5/month        │
│  (512MB)         │  │  (250GB + CDN)   │
└──────────────────┘  └──────────────────┘
```

## Infrastructure Components

### 1. MongoDB Atlas (Database)
- **Purpose**: Store sword records and metadata
- **Plan**: Free M0 Shared Cluster
- **Storage**: 512MB (expandable)
- **Region**: NYC (or closest to DO droplet)
- **Cost**: $0/month

### 2. DigitalOcean Droplet (Backend)
- **Purpose**: Host Payload CMS backend
- **Plan**: Basic Droplet $6/month
- **Specs**: 1 vCPU, 1GB RAM, 25GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Location**: NYC3
- **Cost**: $6/month

### 3. DigitalOcean Spaces (Media Storage)
- **Purpose**: Store JPG/PDF files
- **Plan**: Standard $5/month
- **Storage**: 250GB included
- **Bandwidth**: 1TB included
- **CDN**: Included
- **Region**: NYC3
- **Cost**: $5/month

### 4. Frontend Hosting
**Option A: Vercel/Netlify (Recommended)**
- Cost: $0/month (free tier)
- Auto-deploy from GitHub
- Global CDN
- SSL included

**Option B: DigitalOcean App Platform**
- Cost: $5/month
- Integrated with DO ecosystem
- Auto-deploy from GitHub

### Total Monthly Cost
- **Minimal**: $11/month (MongoDB free + DO Droplet + Spaces)
- **With Frontend**: $11-16/month

## Deployment Steps

### Phase 1: Backend Setup (Payload CMS)

#### Step 1: Set Up Payload Backend
```bash
# In project root
mkdir backend
cd backend
npm init -y
npm install payload express dotenv mongodb

# Create Payload config
# Create collections (Swords, Media)
# Set up authentication
```

#### Step 2: Import CSV Data to MongoDB
```bash
# Create migration script
node scripts/import-csv-to-payload.js

# Imports all 15,097 swords
# Preserves all fields
# Links existing media attachments
```

#### Step 3: Configure Media Storage (DO Spaces)
```javascript
// payload.config.ts
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

export default buildConfig({
  collections: [
    {
      slug: 'media',
      upload: {
        adapter: s3Adapter({
          bucket: process.env.S3_BUCKET,
          config: {
            endpoint: 'https://nyc3.digitaloceanspaces.com',
            region: 'nyc3',
            credentials: {
              accessKeyId: process.env.SPACES_KEY,
              secretAccessKey: process.env.SPACES_SECRET,
            },
          },
        }),
      },
    },
  ],
})
```

### Phase 2: Deploy Backend to DigitalOcean

#### Create Droplet
```bash
# Via DO dashboard:
# - Create Droplet
# - Ubuntu 22.04
# - $6/month plan
# - NYC3 region
# - Add SSH key
```

#### Configure Server
```bash
# SSH into droplet
ssh root@droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install nginx

# Install certbot (SSL)
apt install certbot python3-certbot-nginx
```

#### Deploy Backend
```bash
# Clone repo
git clone https://github.com/your-username/touken-west.git
cd touken-west/backend

# Install dependencies
npm install --production

# Set up environment variables
nano .env
# Add: MONGODB_URI, PAYLOAD_SECRET, SPACES_KEY, etc.

# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name payload-cms
pm2 startup
pm2 save
```

#### Configure Nginx
```nginx
# /etc/nginx/sites-available/api.touken-west.com
server {
    listen 80;
    server_name api.touken-west.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/api.touken-west.com /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d api.touken-west.com
```

### Phase 3: Deploy Frontend

#### Update API Endpoints
```javascript
// src/config/api.js
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.touken-west.com/api'
  : 'http://localhost:3001/api';
```

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or via Vercel dashboard:
1. Connect GitHub repo
2. Select branch
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Deploy

### Phase 4: Configure DNS

```
# DNS Records (via DigitalOcean or your registrar)

A Record:
api.touken-west.com → [Droplet IP]

CNAME Record (if using Vercel):
touken-west.com → cname.vercel-dns.com
www.touken-west.com → cname.vercel-dns.com
```

## Media Migration Strategy

### Initial Upload (287 current files)
```bash
# Upload from local to Spaces
s3cmd sync public/documents/juyo48/ \
  s3://touken-west-media/documents/juyo48/ \
  --acl-public
```

### Future Uploads (via Admin UI)
1. Login to admin: https://api.touken-west.com/admin
2. Navigate to sword record
3. Upload JPG/PDF
4. Payload automatically uploads to Spaces
5. Database updated with media URLs

## Scaling Considerations

### Current Scale (140 swords with media)
- Storage: 70MB
- Monthly cost: $11
- Handles easily

### Medium Scale (5,000 swords)
- Storage: ~4GB
- Still within $11/month plan
- May need Droplet upgrade to $12 (2GB RAM)

### Full Scale (15,000 swords)
- Storage: ~10GB
- Still within 250GB Spaces limit
- Consider Droplet upgrade: $18/month (4GB RAM)
- **Total: ~$23-28/month**

### Beyond 15,000 (50,000+ swords)
- Storage: 30-50GB
- Upgrade Spaces: $10/month (1TB)
- Droplet: $24/month (8GB RAM)
- Consider load balancer
- **Total: ~$34-40/month**

## Backup Strategy

### Database Backups
- MongoDB Atlas: Automatic daily backups (free tier)
- Retention: 7 days
- Manual backups before major migrations

### Media Backups
- DO Spaces: Enable versioning
- Weekly snapshots to separate bucket
- Consider Backblaze B2 for cold storage

### Application Backups
- Git repository (source code)
- Environment variables documented
- Infrastructure as Code (Terraform/DO API)

## Monitoring & Alerts

### Application Monitoring
- PM2 monitoring (built-in)
- Consider: Sentry for error tracking
- Uptime monitoring: UptimeRobot (free)

### Server Monitoring
- DO built-in monitoring (CPU, RAM, disk)
- Set up alerts for high usage
- Log rotation configured

### Security Monitoring
- Fail2ban for SSH protection
- Cloudflare for DDoS protection (optional)
- Regular security scans

## CI/CD Pipeline (Future)

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
      - run: npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /root/touken-west/backend
            git pull origin main
            npm install --production
            npm run build
            pm2 restart payload-cms

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Success Criteria

- [ ] Backend deployed and accessible at api.touken-west.com
- [ ] Frontend deployed at touken-west.com
- [ ] SSL certificates installed and working
- [ ] Database connected and seeded with data
- [ ] Media files accessible via Spaces CDN
- [ ] Admin UI accessible and functional
- [ ] API endpoints responding correctly
- [ ] Authentication working
- [ ] File upload working
- [ ] Monitoring and alerts configured
- [ ] Backups automated
- [ ] DNS configured correctly
- [ ] Load testing passed (100+ concurrent users)

## Rollback Plan

If deployment fails:
1. Keep old infrastructure running
2. Revert DNS changes
3. Restore from backups if needed
4. Document issues
5. Fix in staging environment
6. Retry deployment

## Cost Summary

### Monthly Operating Costs

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | Free M0 | $0 |
| DO Droplet | 1GB RAM | $6 |
| DO Spaces | 250GB + CDN | $5 |
| Frontend Hosting | Vercel free | $0 |
| **Total** | | **$11/month** |

### Growth Projections

| Scale | Swords | Storage | Monthly Cost |
|-------|--------|---------|--------------|
| Current | 140 | 70MB | $11 |
| Small | 1,000 | 700MB | $11 |
| Medium | 5,000 | 3.5GB | $11-18 |
| Large | 15,000 | 10GB | $23-28 |
| XL | 50,000 | 35GB | $34-40 |

## Timeline

- **Week 1**: Set up Payload backend locally
- **Week 2**: Import CSV data, configure Spaces
- **Week 3**: Deploy backend to Droplet
- **Week 4**: Update frontend, deploy
- **Week 5**: Testing, monitoring, documentation
- **Week 6**: Go live

**Total**: 6 weeks (after Phase 6 Security complete)

## Prerequisites

Before deployment:
- [ ] Phase 6 Security Hardening complete
- [ ] All HIGH/CRITICAL vulnerabilities resolved
- [ ] Security audit passed
- [ ] MongoDB Atlas account created
- [ ] DigitalOcean account with payment method
- [ ] Domain name registered (optional but recommended)
- [ ] SSL certificates ready
- [ ] Backup strategy tested
- [ ] Monitoring tools configured
- [ ] Documentation complete

## Next Phase

After successful deployment, proceed to ongoing maintenance:
- Regular security updates
- Feature enhancements
- Performance optimization
- User feedback incorporation
- Media library expansion
