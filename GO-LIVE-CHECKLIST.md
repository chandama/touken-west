# Go-Live Checklist for nihonto-db.com

## ✅ Completed Setup

### Infrastructure
- [x] DigitalOcean account created
- [x] MongoDB Atlas account created and cluster configured
- [x] DigitalOcean Spaces bucket created
- [x] CloudFlare domain purchased (nihonto-db.com)
- [x] GitHub repository exists (chandama/touken-west)

### Database
- [x] MongoDB cluster created (nihonto-cluster)
- [x] Database migrated: 15,100 swords, 2 users, 1,000 changelog entries
- [x] Indexes created for performance
- [x] Connection string obtained

### Application Code
- [x] Environment variables configured (.env, .env.example)
- [x] Backend updated to use MongoDB (no more CSV files)
- [x] Backend updated to use DigitalOcean Spaces (no more local uploads)
- [x] Security middleware added (helmet, rate limiting, mongo sanitize)
- [x] JWT authentication working
- [x] All API endpoints tested and working
- [x] Mongoose models created (Sword, User, Changelog)

### Deployment Configuration
- [x] Dockerfile created
- [x] docker-compose.yml created
- [x] .dockerignore created
- [x] DigitalOcean App Platform spec created (.do/app.yaml)
- [x] Deployment documentation created (DEPLOYMENT.md)

## 📋 Pre-Deployment Checklist

### Code Repository
- [ ] Commit all changes to git
- [ ] Push to GitHub main branch
- [ ] Verify GitHub repository is accessible
- [ ] Tag release version (optional): `git tag v1.0.0`

### Environment Variables Ready
Copy these from your .env file - you'll need them for DigitalOcean:

```
✓ MONGODB_URI
✓ JWT_SECRET
✓ SESSION_SECRET
✓ SPACES_ENDPOINT
✓ SPACES_BUCKET
✓ SPACES_ACCESS_KEY_ID
✓ SPACES_SECRET_ACCESS_KEY
✓ SPACES_CDN_ENDPOINT
```

### MongoDB Atlas
- [ ] Verify network access allows 0.0.0.0/0 (temporary for initial deployment)
- [ ] Test connection from local machine
- [ ] Verify all collections exist and have data

### DigitalOcean Spaces
- [ ] Verify CDN is enabled
- [ ] Verify CORS is configured
- [ ] Test upload from local server
- [ ] Note CDN endpoint URL

### CloudFlare
- [ ] Domain active in CloudFlare
- [ ] DNS ready to be configured
- [ ] SSL/TLS settings reviewed

## 🚀 Deployment Steps

### Step 1: Deploy to DigitalOcean App Platform (30-45 minutes)

1. **Create App**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Connect GitHub repository: chandama/touken-west
   - Branch: main
   - Enable auto-deploy

2. **Configure Backend Service**
   - Name: nihonto-api
   - Build command: `cd admin-server && npm install`
   - Run command: `cd admin-server && node server.js`
   - Port: 3002
   - Instance size: Basic ($5/month)
   - Health check: `/api/health`

3. **Configure Frontend Static Site**
   - Name: nihonto-frontend
   - Build command: `npm run build`
   - Output directory: `build`

4. **Add Environment Variables**
   - Add all required secrets (see list above)
   - Mark sensitive values as SECRET

5. **Create and Deploy**
   - Review configuration
   - Click "Create Resources"
   - Wait for build (5-10 minutes)

6. **Test Deployment**
   ```bash
   curl https://<app-url>.ondigitalocean.app/api/health
   curl https://<app-url>.ondigitalocean.app/api/swords?limit=1
   ```

### Step 2: Configure Custom Domain (10-15 minutes)

1. **Add Domain in DigitalOcean**
   - App Settings → Domains
   - Add: nihonto-db.com
   - Add: www.nihonto-db.com
   - Note CNAME records

2. **Update CloudFlare DNS**
   - Add CNAME for @ → app.ondigitalocean.app
   - Add CNAME for www → app.ondigitalocean.app
   - Enable proxy (orange cloud)

3. **Configure CloudFlare SSL**
   - SSL/TLS → Full (strict)
   - Enable Always Use HTTPS
   - Enable Automatic HTTPS Rewrites

4. **Add CloudFlare Page Rules**
   - API: nihonto-db.com/api/* → Bypass cache
   - Spaces: *.digitaloceanspaces.com/* → Cache everything
   - Frontend: nihonto-db.com/* → Standard cache

### Step 3: Post-Deployment Configuration (15-20 minutes)

1. **Update CORS Origin**
   - In DigitalOcean app environment variables
   - Change CORS_ORIGIN to: `https://nihonto-db.com,https://www.nihonto-db.com`
   - Redeploy

2. **Restrict MongoDB Access**
   - MongoDB Atlas → Network Access
   - Remove 0.0.0.0/0
   - Add DigitalOcean App Platform IPs
   - Add your local IP for development

3. **Test Full Stack**
   - Visit https://nihonto-db.com
   - Test search functionality
   - Test login (if you have admin account)
   - Test image loading from CDN

4. **Set Up Monitoring**
   - DigitalOcean: Enable alerts
   - MongoDB Atlas: Configure alerts
   - Set up uptime monitoring (optional)

## 🔍 Verification Tests

### Health Checks
- [ ] `curl https://nihonto-db.com/api/health` returns 200 OK
- [ ] `curl https://www.nihonto-db.com/api/health` returns 200 OK (www redirect)
- [ ] `curl https://nihonto-db.com/api/swords?limit=1` returns sword data

### Frontend Tests
- [ ] https://nihonto-db.com loads successfully
- [ ] Search functionality works
- [ ] Pagination works
- [ ] Filter by school/type works
- [ ] SSL certificate is valid (green padlock)

### Backend Tests
- [ ] MongoDB connection successful (check logs)
- [ ] Authentication endpoints work (/api/auth/login)
- [ ] Admin endpoints require authentication
- [ ] Rate limiting works (make 100+ requests)

### Spaces/CDN Tests
- [ ] Existing images load from CDN
- [ ] Admin can upload new images
- [ ] Uploaded images accessible via CDN URL
- [ ] Thumbnails generate correctly

## 📊 Monitoring Setup

### Application Monitoring
- [ ] DigitalOcean Insights configured
- [ ] MongoDB Atlas alerts configured
- [ ] Error logging reviewed
- [ ] Performance metrics baseline established

### Alerts to Configure
- [ ] App is down
- [ ] High error rate (>5%)
- [ ] High response time (>2s)
- [ ] MongoDB connections >80%
- [ ] Disk usage >80%

## 🔐 Security Checklist

- [x] JWT_SECRET is strong (32+ characters)
- [x] SESSION_SECRET is strong (32+ characters)
- [x] Passwords hashed with bcrypt
- [x] Rate limiting enabled
- [x] CORS configured for production domains only
- [x] MongoDB credentials secured
- [x] Spaces credentials secured
- [x] All secrets marked as SECRET in DigitalOcean
- [ ] MongoDB network access restricted to app IPs only
- [ ] SSL/TLS enforced (CloudFlare)
- [x] Helmet.js security headers enabled

## 📝 Documentation

- [x] DEPLOYMENT.md created with step-by-step guide
- [ ] README.md updated with production information
- [ ] API documentation created (optional)
- [ ] Admin user guide created (optional)

## 💰 Cost Tracking

Initial monthly costs:
- MongoDB Atlas M0: $0 (free)
- DigitalOcean Spaces: $5
- DigitalOcean App Platform (Backend): $5
- DigitalOcean App Platform (Frontend): $0-3
- CloudFlare: $0 (free)
- **Total: $10-13/month**

Set budget alerts at $15/month.

## 🐛 Rollback Plan

If deployment fails:

1. **Quick Rollback**
   - DigitalOcean: Settings → Rollback to previous deployment
   - Or: `git revert HEAD && git push`

2. **Full Rollback**
   - Revert to old CSV-based server
   - Keep MongoDB as backup
   - Investigate issues before re-deploying

## 📞 Support Contacts

- **DigitalOcean Support**: https://cloud.digitalocean.com/support
- **MongoDB Atlas Support**: https://support.mongodb.com
- **CloudFlare Support**: https://dash.cloudflare.com/support

## ✨ Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Verify backups working
- [ ] Test all major features
- [ ] Get user feedback

### Week 2-4
- [ ] Optimize slow queries
- [ ] Review and adjust rate limits
- [ ] Add any missing indexes
- [ ] Document any issues found
- [ ] Plan feature improvements

### Month 2+
- [ ] Review usage patterns
- [ ] Optimize costs if needed
- [ ] Plan scaling strategy
- [ ] Implement CI/CD pipeline
- [ ] Add automated testing

## 🎉 Launch Announcement

Once everything is verified:

1. Announce on social media (if applicable)
2. Notify stakeholders
3. Update any existing links
4. Monitor traffic spike
5. Celebrate! 🎊

---

## Quick Reference Commands

```bash
# Test API health
curl https://nihonto-db.com/api/health

# Test sword data
curl "https://nihonto-db.com/api/swords?limit=1"

# Check MongoDB connection locally
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌ Error:', err))"

# View DigitalOcean app logs
doctl apps logs <APP_ID> --follow

# Redeploy current version
doctl apps create-deployment <APP_ID>
```

## Status Tracking

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Accounts Created | ✅ Complete | [Date] | All accounts set up |
| Database Migrated | ✅ Complete | [Date] | 15,100 swords migrated |
| Code Updated | ✅ Complete | [Date] | MongoDB + Spaces integrated |
| Deployment Config | ✅ Complete | [Date] | All files created |
| Deployed to DO | ⏳ Pending | - | Ready to deploy |
| Domain Configured | ⏳ Pending | - | Awaiting deployment |
| Post-Deploy Config | ⏳ Pending | - | After deployment |
| Monitoring Setup | ⏳ Pending | - | After deployment |
| Go Live | ⏳ Pending | - | Final verification |

---

**Ready to deploy? Follow DEPLOYMENT.md for detailed step-by-step instructions!**
