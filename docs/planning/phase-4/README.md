# Phase 4: Deployment & CI/CD

**Status**: 🔵 Not Started
**Priority**: High
**Estimated Complexity**: Medium

## Overview

Phase 4 prepares Touken West for production deployment and establishes a continuous integration and continuous deployment (CI/CD) pipeline. This phase ensures the application is production-ready, performant, and can be updated smoothly with automated workflows.

## Objectives

1. **Choose and configure hosting platform** - Select and set up production hosting
2. **Configure production environment** - Set up environment variables, databases, storage
3. **Implement CI/CD pipeline** - Automate testing and deployment with GitHub Actions
4. **Optimize for production** - Bundle optimization, caching, CDN
5. **Set up monitoring** - Error tracking, analytics, uptime monitoring
6. **Establish deployment workflow** - Define development → staging → production flow

## Key Features

### 1. Hosting Platform Setup
- Production server/platform configuration
- Domain name and DNS setup
- SSL/TLS certificate configuration
- CDN setup for static assets
- Database hosting configuration
- Photo storage configuration (cloud)

### 2. CI/CD Pipeline
- GitHub Actions workflows
- Automated testing on pull requests
- Automated deployment on merge to main
- Build optimization and caching
- Environment-specific deployments
- Rollback capability

### 3. Production Optimization
- Code minification and bundling
- Image optimization
- Lazy loading and code splitting
- Browser caching headers
- Compression (gzip/brotli)
- Performance monitoring

### 4. Monitoring & Observability
- Error tracking (Sentry, LogRocket)
- Application performance monitoring
- Database query monitoring
- Uptime monitoring
- User analytics (privacy-respecting)
- Logging infrastructure

### 5. Security Hardening
- HTTPS enforcement
- Security headers (CSP, HSTS, etc.)
- Rate limiting
- DDoS protection
- Input validation
- Dependency vulnerability scanning

## Hosting Platform Options

### Frontend + Backend Hosting

**Option 1: Vercel (Next.js)**
- ✅ Excellent for Next.js applications
- ✅ Automatic CI/CD from GitHub
- ✅ Edge functions, global CDN
- ✅ Easy environment management
- ❌ Database requires separate hosting
- Cost: Free tier available, scales based on usage

**Option 2: Netlify**
- ✅ Great for static sites + serverless functions
- ✅ Automatic deployments from Git
- ✅ Edge functions
- ❌ Better for simpler backends
- Cost: Free tier available

**Option 3: Railway**
- ✅ Full-stack hosting (frontend + backend + database)
- ✅ Simple deployment from GitHub
- ✅ Integrated database hosting
- ✅ Reasonable pricing
- Cost: $5/month credit, pay-as-you-go

**Option 4: AWS (EC2/ECS + S3 + RDS)**
- ✅ Maximum flexibility and control
- ✅ Scalable to any size
- ❌ More complex setup
- ❌ Steeper learning curve
- Cost: Variable, can optimize costs

**Option 5: DigitalOcean App Platform**
- ✅ Simple full-stack hosting
- ✅ Managed databases
- ✅ Good documentation
- Cost: Starts at $5/month per component

**Recommendation**: Railway or Vercel (Next.js) + external database for balance of simplicity and capability.

### Database Hosting

**Option 1: Railway**
- ✅ Integrated with app hosting
- ✅ PostgreSQL/MongoDB support
- Cost: Included in Railway plan

**Option 2: Supabase**
- ✅ PostgreSQL with built-in features (auth, storage)
- ✅ Free tier available
- ✅ Good developer experience
- Cost: Free tier, then $25/month

**Option 3: PlanetScale**
- ✅ MySQL-compatible serverless database
- ✅ Automatic branching
- Cost: Free tier available

**Option 4: Neon**
- ✅ Serverless PostgreSQL
- ✅ Generous free tier
- Cost: Free tier, scales with usage

**Recommendation**: Supabase for PostgreSQL + bonus features, or Neon for pure PostgreSQL.

### Photo Storage

**Option 1: Cloudflare R2**
- ✅ S3-compatible
- ✅ No egress fees
- Cost: $0.015/GB storage

**Option 2: AWS S3**
- ✅ Industry standard
- ✅ Highly reliable
- ❌ Egress fees can add up
- Cost: $0.023/GB storage + egress

**Option 3: Vercel Blob**
- ✅ Integrated with Vercel
- ✅ Simple API
- Cost: Free 500GB egress/month

**Recommendation**: Cloudflare R2 for cost-effectiveness or Vercel Blob if using Vercel.

## CI/CD Workflow

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    - Run linting
    - Run unit tests
    - Run integration tests

  build:
    - Install dependencies
    - Build production bundle
    - Upload artifacts

  deploy:
    - Deploy to hosting platform
    - Run database migrations
    - Smoke tests
    - Notify on completion
```

### Deployment Environments
- **Development**: Local development
- **Preview**: Automatic deploy for each PR (staging)
- **Production**: Deploy on merge to main

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Core Web Vitals: All "Good"
- API Response Time: < 200ms (p95)

## Success Criteria

- [ ] Application deployed and accessible via custom domain
- [ ] HTTPS enabled with valid certificate
- [ ] CI/CD pipeline automatically deploys on commits
- [ ] Tests run automatically on pull requests
- [ ] Production environment variables configured
- [ ] Database accessible and performant
- [ ] Photos loading from cloud storage
- [ ] Error monitoring active
- [ ] Performance meets targets
- [ ] Rollback process tested and documented

## Out of Scope

- Multi-region deployment
- Auto-scaling configuration
- Advanced CDN optimization
- Blue-green deployments
- Canary releases

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Deployment failures | High | Automated rollback, staging environment |
| Database migration errors | Critical | Test migrations thoroughly, backups |
| Cost overruns | Medium | Monitor usage, set up billing alerts |
| Performance issues in production | High | Load testing before launch, monitoring |
| Security vulnerabilities | Critical | Security scanning, regular updates |

## Security Checklist

- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Sensitive data not in logs
- [ ] Environment variables secured
- [ ] Dependencies vulnerability-free

## Files to Create/Modify

### CI/CD
- Create: `.github/workflows/deploy.yml` - Production deployment
- Create: `.github/workflows/test.yml` - Run tests on PRs
- Create: `.github/workflows/preview.yml` - Deploy preview environments

### Configuration
- Create: `vercel.json` or `railway.json` - Hosting config
- Modify: `.env.production` - Production environment variables
- Create: `nginx.conf` or equivalent - Server configuration (if applicable)

### Scripts
- Create: `scripts/build-prod.sh` - Production build script
- Create: `scripts/deploy.sh` - Deployment script
- Create: `scripts/migrate.sh` - Database migration script

### Monitoring
- Create: `sentry.config.js` - Error tracking config
- Configure analytics script

## Next Steps

See [tasks.md](./tasks.md) for detailed implementation checklist.

---

**Estimated Duration**: TBD
**Blockers**: Requires Phase 3 (backend) to be substantially complete
