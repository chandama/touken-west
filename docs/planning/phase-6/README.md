# Phase 6: Security Hardening & Testing

**Status**: 🔵 Not Started
**Priority**: Critical
**Estimated Complexity**: Medium-High
**Prerequisites**: Phases 1-5 complete

## Overview

Phase 6 focuses on comprehensive security assessment, vulnerability remediation, and hardening of the Touken West application before production deployment. This phase implements security best practices based on OWASP Top 10, NIST guidelines, and industry standards for web application security.

**IMPORTANT**: This phase must be completed BEFORE Phase 4 (Deployment). No production deployment should occur until all critical and high-severity security issues are resolved.

## Objectives

1. **SAST (Static Application Security Testing)** - Automated code analysis for vulnerabilities
2. **SCA (Software Composition Analysis)** - Dependency vulnerability scanning
3. **Injection Vulnerability Testing** - XSS, SQLi, and other injection attack prevention
4. **Authentication & Authorization Security** - Secure credential handling and access control
5. **Data Protection** - Encryption, sanitization, and secure data handling
6. **Security Headers & CSP** - Browser security controls
7. **Penetration Testing** - Manual security testing and validation

## Architecture Security Context

### Current Stack (Phase 1-2)
- **Frontend**: React 19.2.0, single-page application
- **Data Processing**: Client-side CSV parsing (PapaParse)
- **User Input**: Search bars, filters, form inputs
- **Attack Surface**: XSS, prototype pollution, dependency vulnerabilities

### Future Stack (Phase 3-5)
- **Backend**: API server (Node.js/Express or similar)
- **Database**: Relational DB for sword data, user accounts
- **Authentication**: User registration, login, JWT/session management
- **File Uploads**: Photo uploads and storage
- **Payment Processing**: Subscription payments (Phase 5)
- **Expanded Attack Surface**: SQLi, CSRF, authentication bypass, file upload vulnerabilities, API security

## OWASP Top 10 (2021) Threat Analysis

### A01:2021 – Broken Access Control ⚠️ HIGH PRIORITY
**Relevance**: Critical (Phase 5 - Authentication)

**Threats**:
- Users accessing data they shouldn't see
- Privilege escalation (regular user → admin)
- Insecure direct object references (IDOR)
- Missing authorization checks on API endpoints

**Mitigations**:
- [ ] Implement role-based access control (RBAC)
- [ ] Server-side authorization checks on ALL API endpoints
- [ ] Use indirect object references or UUIDs
- [ ] Test authorization with different user roles
- [ ] Implement deny-by-default access control

**Testing**:
- [ ] Attempt to access admin endpoints as regular user
- [ ] Try manipulating IDs in API requests
- [ ] Test horizontal privilege escalation (user A accessing user B's data)
- [ ] Automated IDOR scanning

---

### A02:2021 – Cryptographic Failures ⚠️ HIGH PRIORITY
**Relevance**: Critical (Phase 5 - Auth, Phase 3 - Backend)

**Threats**:
- Passwords stored in plaintext or weak hashing
- Sensitive data transmitted over HTTP
- Weak encryption algorithms
- Exposed API keys or secrets in code

**Mitigations**:
- [ ] Use bcrypt/scrypt/Argon2 for password hashing (min 10 rounds)
- [ ] Enforce HTTPS in production (HSTS headers)
- [ ] Store secrets in environment variables, never in code
- [ ] Encrypt sensitive data at rest (PII, payment info)
- [ ] Use strong, up-to-date TLS configuration (TLS 1.3)
- [ ] Implement proper key rotation procedures

**Testing**:
- [ ] Scan for exposed secrets in git history (GitLeaks, TruffleHog)
- [ ] Verify HTTPS enforcement and certificate validity
- [ ] Test for weak cipher suites
- [ ] Audit password hashing implementation

---

### A03:2021 – Injection ⚠️ CRITICAL PRIORITY
**Relevance**: Critical (Current + Phase 3)

**Threats**:
- **SQL Injection**: Manipulating database queries through user input
- **NoSQL Injection**: Similar attacks on NoSQL databases
- **XSS (Cross-Site Scripting)**: Injecting malicious JavaScript
- **CSV Injection**: Malicious formulas in CSV exports
- **Command Injection**: OS command execution through user input

**Current Injection Points** (Phase 1-2):
1. Search bar (SearchBar.jsx)
2. Filter inputs (FilterPanel.jsx, AdvancedFilterGroups.jsx)
3. URL parameters (if implemented)
4. CSV data rendering (if user-generated)

**Future Injection Points** (Phase 3-5):
5. API endpoints (all user inputs)
6. Database queries
7. File upload metadata
8. User profile data

**Mitigations**:
- [ ] **SQL Injection Prevention**:
  - Use parameterized queries / prepared statements (NEVER string concatenation)
  - Use ORM with built-in escaping (Sequelize, TypeORM, Prisma)
  - Validate and sanitize all user inputs
  - Principle of least privilege for database users

- [ ] **XSS Prevention**:
  - React automatically escapes by default (good!)
  - Never use `dangerouslySetInnerHTML` without sanitization
  - Use DOMPurify for any HTML sanitization needs
  - Implement Content Security Policy (CSP) headers
  - Validate/sanitize inputs on both client AND server
  - Escape output in non-React contexts (emails, PDFs)

- [ ] **CSV Injection Prevention**:
  - Prefix cells starting with =, +, -, @ with single quote
  - Validate export data before generation

- [ ] **Command Injection Prevention**:
  - Never use `eval()`, `Function()`, or `exec()` with user input
  - Avoid shell commands; use libraries instead
  - If unavoidable, use strict allowlists and escaping

**Testing**:
- [ ] Manual XSS testing: `<script>alert('XSS')</script>`, `<img src=x onerror=alert(1)>`
- [ ] SQL injection payloads: `' OR '1'='1`, `'; DROP TABLE users--`
- [ ] Automated scanning with OWASP ZAP or Burp Suite
- [ ] Test all input fields, URL params, headers
- [ ] CSV injection: `=cmd|'/c calc'!A1`

---

### A04:2021 – Insecure Design ⚠️ MEDIUM PRIORITY
**Relevance**: Medium (Architecture decisions)

**Threats**:
- Lack of security requirements in design phase
- Insufficient threat modeling
- Missing security controls by design

**Mitigations**:
- [ ] Threat modeling for each new feature
- [ ] Security review before implementation
- [ ] Secure design patterns (defense in depth)
- [ ] Rate limiting on sensitive endpoints
- [ ] Input validation at multiple layers

---

### A05:2021 – Security Misconfiguration ⚠️ HIGH PRIORITY
**Relevance**: High (Current + Deployment)

**Threats**:
- Default credentials still active
- Unnecessary features enabled
- Detailed error messages exposing internals
- Missing security headers
- Outdated dependencies

**Mitigations**:
- [ ] Remove default accounts and credentials
- [ ] Disable directory listing
- [ ] Custom error pages (no stack traces in production)
- [ ] Security headers (see Security Headers section)
- [ ] Regular dependency updates
- [ ] Minimal dependency footprint
- [ ] Disable unused features and endpoints
- [ ] Remove console.log statements in production

**Testing**:
- [ ] Scan with security header checker (securityheaders.com)
- [ ] Verify error handling doesn't leak info
- [ ] Check for exposed .git, .env, backup files
- [ ] Port scanning and service enumeration

---

### A06:2021 – Vulnerable and Outdated Components ⚠️ HIGH PRIORITY
**Relevance**: Critical (Current)

**Current Dependencies**:
- react: 19.2.0
- react-dom: 19.2.0
- react-scripts: 5.0.1
- papaparse: 5.5.3

**Threats**:
- Known CVEs in dependencies
- Transitive dependency vulnerabilities
- Unmaintained packages
- Supply chain attacks

**Mitigations**:
- [ ] Automated SCA scanning in CI/CD pipeline
- [ ] Regular `npm audit` runs
- [ ] Dependency update policy (monthly reviews)
- [ ] Pin dependency versions
- [ ] Review dependencies before adding new ones
- [ ] Use Snyk, GitHub Dependabot, or npm audit
- [ ] Monitor security advisories

**Testing**:
- [ ] `npm audit` and fix all HIGH/CRITICAL
- [ ] `npm outdated` review
- [ ] Snyk scan for known vulnerabilities
- [ ] OWASP Dependency-Check
- [ ] Review transitive dependencies

---

### A07:2021 – Identification and Authentication Failures ⚠️ CRITICAL PRIORITY
**Relevance**: Critical (Phase 5)

**Threats**:
- Weak password requirements
- Credential stuffing attacks
- Brute force attacks
- Session fixation
- Insecure password recovery

**Mitigations**:
- [ ] Strong password policy (min 12 chars, complexity)
- [ ] Password strength meter (zxcvbn)
- [ ] Multi-factor authentication (2FA/MFA)
- [ ] Rate limiting on login attempts (5 attempts = temporary lockout)
- [ ] Account lockout after repeated failures
- [ ] Secure session management (httpOnly, secure, sameSite cookies)
- [ ] Session timeout (15-30 min inactivity)
- [ ] Invalidate sessions on password change
- [ ] Secure password reset flow (time-limited tokens)
- [ ] No credential storage in browser localStorage
- [ ] CAPTCHA on sensitive endpoints

**Testing**:
- [ ] Brute force testing (Hydra, custom scripts)
- [ ] Session management testing
- [ ] Password reset flow testing
- [ ] Test for session fixation
- [ ] JWT security (if used): algorithm, expiration, signature

---

### A08:2021 – Software and Data Integrity Failures ⚠️ MEDIUM PRIORITY
**Relevance**: Medium (Phase 3 - File Uploads)

**Threats**:
- Unsigned/unverified software updates
- Malicious file uploads
- Insecure deserialization
- Dependency confusion attacks

**Mitigations**:
- [ ] Validate file uploads (type, size, content)
- [ ] Scan uploaded files for malware
- [ ] Store uploads outside web root
- [ ] Use Subresource Integrity (SRI) for CDN assets
- [ ] Verify npm package signatures
- [ ] Code signing for releases

**Testing**:
- [ ] Upload malicious files (exe, php, svg with script)
- [ ] Test file type validation bypass (.jpg.php)
- [ ] Large file DoS attempts
- [ ] Verify SRI hashes on external scripts

---

### A09:2021 – Security Logging and Monitoring Failures ⚠️ MEDIUM PRIORITY
**Relevance**: Medium (Phase 4 + Phase 6)

**Threats**:
- Breaches undetected for extended periods
- Insufficient audit trails
- Logs not monitored or analyzed

**Mitigations**:
- [ ] Log authentication events (login, logout, failures)
- [ ] Log authorization failures (access denied)
- [ ] Log input validation failures
- [ ] Centralized logging (Sentry, LogRocket, CloudWatch)
- [ ] Real-time alerting on suspicious activity
- [ ] Tamper-proof logs (write-only, separate storage)
- [ ] Log retention policy (90+ days)
- [ ] Regular log review

**Testing**:
- [ ] Verify security events are logged
- [ ] Test log integrity
- [ ] Ensure PII is not logged
- [ ] Test alerting mechanisms

---

### A10:2021 – Server-Side Request Forgery (SSRF) ⚠️ LOW PRIORITY
**Relevance**: Low (unless adding proxy features)

**Threats**:
- Fetching internal resources via user-controlled URLs
- Port scanning internal network
- Cloud metadata service access (AWS, Azure)

**Mitigations**:
- [ ] Validate and allowlist URLs if implementing proxying
- [ ] Block requests to internal IPs (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16)
- [ ] Disable unnecessary URL protocols (file://, gopher://)

**Testing**:
- [ ] Test with internal IPs if URL input exists
- [ ] Cloud metadata access attempts (http://169.254.169.254)

---

## NIST Security Considerations

### NIST Cybersecurity Framework Alignment

#### 1. Identify
- [ ] Asset inventory (all data, systems, dependencies)
- [ ] Risk assessment for each component
- [ ] Data classification (public, internal, confidential)
- [ ] Document security requirements

#### 2. Protect
- [ ] Access control implementation
- [ ] Data encryption (at rest and in transit)
- [ ] Secure development training
- [ ] Maintenance and updates process

#### 3. Detect
- [ ] Security monitoring and alerting
- [ ] Anomaly detection
- [ ] Vulnerability scanning
- [ ] Security event logging

#### 4. Respond
- [ ] Incident response plan
- [ ] Security incident handling procedures
- [ ] Communication plan for breaches
- [ ] Mitigation strategies

#### 5. Recover
- [ ] Backup and recovery procedures
- [ ] Disaster recovery plan
- [ ] Post-incident lessons learned

### NIST 800-53 Controls (Selected)

**Access Control (AC)**
- AC-2: Account Management
- AC-3: Access Enforcement
- AC-7: Unsuccessful Login Attempts

**Awareness and Training (AT)**
- AT-2: Security Awareness Training

**Audit and Accountability (AU)**
- AU-2: Audit Events
- AU-6: Audit Review, Analysis, and Reporting
- AU-9: Protection of Audit Information

**Identification and Authentication (IA)**
- IA-2: Identification and Authentication
- IA-5: Authenticator Management
- IA-8: Identification and Authentication (Non-Organizational Users)

**System and Communications Protection (SC)**
- SC-8: Transmission Confidentiality and Integrity
- SC-13: Cryptographic Protection
- SC-28: Protection of Information at Rest

---

## Security Tools & Scanning

### 1. SAST (Static Application Security Testing)

**Tools**:
- [ ] **ESLint Security Plugin**: `eslint-plugin-security`
- [ ] **SonarQube**: Comprehensive SAST scanning
- [ ] **Semgrep**: Fast, customizable pattern matching
- [ ] **CodeQL**: GitHub's semantic code analysis
- [ ] **Checkmarx** or **Veracode** (commercial)

**Implementation**:
```bash
# Install ESLint security plugin
npm install --save-dev eslint-plugin-security

# Add to .eslintrc
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}

# Run SAST scan
npm run lint
```

**CI/CD Integration**:
- Run on every pull request
- Fail builds on HIGH/CRITICAL findings
- Weekly full scans

---

### 2. SCA (Software Composition Analysis)

**Tools**:
- [ ] **npm audit**: Built-in vulnerability scanner
- [ ] **Snyk**: Automated dependency scanning and fixes
- [ ] **GitHub Dependabot**: Automatic PRs for updates
- [ ] **OWASP Dependency-Check**: Open-source SCA
- [ ] **Retire.js**: JavaScript library vulnerability scanner

**Implementation**:
```bash
# Run npm audit
npm audit

# Fix automatically (review changes!)
npm audit fix

# Generate report
npm audit --json > audit-report.json

# Install and run Snyk
npm install -g snyk
snyk auth
snyk test
snyk monitor

# OWASP Dependency-Check
dependency-check --project "Touken West" --scan ./
```

**CI/CD Integration**:
- Daily automated scans
- Block merges with HIGH/CRITICAL vulnerabilities
- Auto-generate PRs for updates (Dependabot)

---

### 3. DAST (Dynamic Application Security Testing)

**Tools**:
- [ ] **OWASP ZAP**: Free, automated web app scanner
- [ ] **Burp Suite Community**: Manual testing and scanning
- [ ] **Nikto**: Web server scanner
- [ ] **w3af**: Web application attack and audit framework

**Implementation**:
```bash
# OWASP ZAP automated scan
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable \
  zap-baseline.py -t http://localhost:3000 -r zap-report.html

# Nikto scan
nikto -h http://localhost:3000
```

---

### 4. Secret Scanning

**Tools**:
- [ ] **GitLeaks**: Scan git history for secrets
- [ ] **TruffleHog**: Find secrets in git repos
- [ ] **detect-secrets**: Pre-commit hook for secrets

**Implementation**:
```bash
# GitLeaks
docker run -v $(pwd):/path zricethezav/gitleaks:latest \
  detect --source="/path" --verbose

# TruffleHog
trufflehog git file://. --only-verified --json
```

---

### 5. Security Header Scanner

**Tools**:
- [ ] **securityheaders.com**: Online header checker
- [ ] **Mozilla Observatory**: Security and privacy scan

**Test**: https://securityheaders.com/?q=yourdomain.com

---

## Input Validation & Sanitization

### Current Input Points (Phase 1-2)

1. **Main Search Bar** (SearchBar.jsx)
   - User Input: `searchTags` array
   - Threat: XSS via rendering unsanitized input
   - Mitigation: React escapes by default ✅
   - Additional: Implement input length limits (max 100 chars per tag)

2. **Advanced Filter Groups** (AdvancedFilterGroups.jsx)
   - User Input: `searchTags` per group
   - Threat: Same as above
   - Mitigation: React escaping + length limits

3. **Filter Dropdowns** (FilterPanel.jsx)
   - User Input: Selected values from predefined lists
   - Threat: Low (controlled inputs)
   - Mitigation: Validate against known values

4. **URL Parameters** (if implemented)
   - User Input: Query strings for shareable links
   - Threat: XSS via URL manipulation
   - Mitigation: Strict parsing and validation

### Future Input Points (Phase 3-5)

5. **API Endpoints**
   - User Input: JSON request bodies
   - Threat: Injection, validation bypass
   - Mitigation: Schema validation (Joi, Yup, Zod)

6. **Database Queries**
   - User Input: Search/filter parameters
   - Threat: SQL/NoSQL injection
   - Mitigation: Parameterized queries, ORM

7. **File Uploads**
   - User Input: Image files, metadata
   - Threat: Malicious files, XXE, path traversal
   - Mitigation: File type validation, antivirus scanning, sandboxing

8. **User Profile Data**
   - User Input: Name, email, bio
   - Threat: XSS, injection
   - Mitigation: Sanitization, length limits, format validation

### Validation Rules

```javascript
// Example validation schema (Joi)
const searchTagSchema = Joi.string()
  .trim()
  .max(100)
  .pattern(/^[a-zA-Z0-9\s\-\_\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]+$/)
  .messages({
    'string.pattern.base': 'Search tags can only contain letters, numbers, spaces, and Japanese characters'
  });

const emailSchema = Joi.string()
  .email()
  .max(255)
  .required();

const passwordSchema = Joi.string()
  .min(12)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
  });
```

### Sanitization Libraries

- [ ] **DOMPurify**: HTML sanitization (if using `dangerouslySetInnerHTML`)
- [ ] **validator.js**: String validation and sanitization
- [ ] **xss-clean**: Express middleware for XSS prevention
- [ ] **mongo-sanitize**: NoSQL injection prevention

---

## Security Headers Configuration

### Required Headers (Production)

```javascript
// Express.js example (Phase 3 backend)
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Additional headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

### Header Checklist

- [ ] **Content-Security-Policy (CSP)**: Prevent XSS by controlling resource sources
- [ ] **Strict-Transport-Security (HSTS)**: Force HTTPS
- [ ] **X-Frame-Options**: Prevent clickjacking (DENY or SAMEORIGIN)
- [ ] **X-Content-Type-Options**: Prevent MIME sniffing (nosniff)
- [ ] **X-XSS-Protection**: Browser XSS filter (legacy but still useful)
- [ ] **Referrer-Policy**: Control referrer information
- [ ] **Permissions-Policy**: Disable unnecessary browser features

---

## Rate Limiting & DoS Prevention

### Endpoints Requiring Rate Limiting

1. **Login**: 5 attempts per 15 minutes per IP
2. **Registration**: 3 accounts per hour per IP
3. **Password Reset**: 3 attempts per hour per email
4. **API Search**: 100 requests per minute per user
5. **File Upload**: 10 uploads per hour per user

### Implementation

```javascript
const rateLimit = require('express-rate-limit');

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', loginLimiter, loginHandler);

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please slow down',
});

app.use('/api/', apiLimiter);
```

---

## Penetration Testing Checklist

### Manual Testing Tasks

**Authentication & Session Management**
- [ ] Brute force login
- [ ] Test session timeout
- [ ] Session fixation attempts
- [ ] Test logout functionality
- [ ] Password reset flow exploitation
- [ ] JWT token manipulation (if used)

**Authorization**
- [ ] Horizontal privilege escalation (access other users' data)
- [ ] Vertical privilege escalation (user → admin)
- [ ] IDOR testing (manipulate IDs in URLs)
- [ ] Missing function-level access control

**Injection Attacks**
- [ ] SQL injection (all input fields)
- [ ] XSS (reflected, stored, DOM-based)
- [ ] Command injection
- [ ] LDAP injection (if applicable)
- [ ] XML/XXE injection (file uploads)

**Business Logic**
- [ ] Bypass payment flows
- [ ] Negative testing (negative numbers, extreme values)
- [ ] Race conditions
- [ ] Price manipulation

**File Upload**
- [ ] Upload malicious files (exe, php, svg with JS)
- [ ] File type bypass (.jpg.php, null byte)
- [ ] Path traversal (../../etc/passwd)
- [ ] Large file DoS
- [ ] Image-based attacks (ImageTragick)

**API Security**
- [ ] Missing authentication on endpoints
- [ ] Excessive data exposure
- [ ] Mass assignment vulnerabilities
- [ ] API versioning issues
- [ ] GraphQL introspection (if used)

**Client-Side**
- [ ] Sensitive data in localStorage/sessionStorage
- [ ] DOM-based XSS
- [ ] CORS misconfiguration
- [ ] Postmessage vulnerabilities

---

## Security Checklist

### Pre-Deployment Security Audit

#### Code Review
- [ ] No hardcoded credentials or API keys
- [ ] No `console.log` statements in production
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No `eval()`, `Function()`, or similar dangerous functions
- [ ] Proper error handling (no stack traces to users)
- [ ] Input validation on all user inputs
- [ ] Output encoding/escaping
- [ ] Secure session management

#### Dependency Security
- [ ] `npm audit` shows 0 HIGH/CRITICAL vulnerabilities
- [ ] All dependencies up to date (or documented exceptions)
- [ ] No dependencies with known CVEs
- [ ] Snyk scan passed
- [ ] Dependency lock file (package-lock.json) committed

#### Configuration
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Environment variables used for secrets
- [ ] Debug mode disabled in production
- [ ] Default accounts disabled

#### Authentication & Authorization
- [ ] Strong password policy enforced
- [ ] Password hashing with bcrypt/scrypt/Argon2
- [ ] MFA/2FA available
- [ ] Session timeout implemented
- [ ] Authorization checks on all protected resources
- [ ] Secure password reset flow

#### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.3 for data in transit
- [ ] No sensitive data in logs
- [ ] PII handling compliant with regulations (GDPR, CCPA)
- [ ] Data retention policies defined

#### Logging & Monitoring
- [ ] Security events logged
- [ ] Logging configured (authentication, authorization, errors)
- [ ] Monitoring and alerting set up
- [ ] Log retention policy implemented
- [ ] Logs protected from tampering

#### File Upload Security (Phase 3)
- [ ] File type validation (whitelist)
- [ ] File size limits enforced
- [ ] Antivirus scanning
- [ ] Files stored outside web root
- [ ] Unique file names (prevent overwrites)
- [ ] Content-type validation

#### Database Security (Phase 3)
- [ ] Parameterized queries used everywhere
- [ ] Database user has minimal privileges
- [ ] Database credentials in environment variables
- [ ] Database backups encrypted
- [ ] Connection pooling configured

#### API Security (Phase 3)
- [ ] Authentication required on protected endpoints
- [ ] Input validation on all endpoints
- [ ] Request size limits
- [ ] API versioning implemented
- [ ] Swagger/OpenAPI documented (without exposing internals)

---

## Compliance Considerations

### GDPR (General Data Protection Regulation)
If serving EU users:
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Right to access (data export)
- [ ] Right to erasure (account deletion)
- [ ] Data breach notification plan (72 hours)
- [ ] Data processing agreements with vendors

### CCPA (California Consumer Privacy Act)
If serving California users:
- [ ] Privacy notice
- [ ] Opt-out mechanism for data sales
- [ ] Right to access and deletion

### PCI DSS (Payment Card Industry Data Security Standard)
If handling payments (Phase 5):
- [ ] Never store CVV/CVC
- [ ] Tokenize payment data (use Stripe, PayPal)
- [ ] Encrypt cardholder data
- [ ] Quarterly vulnerability scans
- [ ] Annual penetration tests

---

## Security Testing Schedule

### During Development
- **Daily**: `npm audit` in local development
- **On every PR**: ESLint security plugin
- **On every PR**: Automated unit tests with security test cases

### Pre-Release
- **Weekly**: Full SAST scan (SonarQube, Semgrep)
- **Weekly**: SCA scan (Snyk, OWASP Dependency-Check)
- **Bi-weekly**: Manual code review for security issues
- **Before major releases**: Full penetration test
- **Before major releases**: DAST scan (OWASP ZAP)

### Post-Deployment
- **Monthly**: Dependency updates and audits
- **Quarterly**: External penetration testing
- **Quarterly**: Security training for developers
- **Annually**: Comprehensive security audit

---

## Incident Response Plan

### Preparation
- [ ] Incident response team identified
- [ ] Contact information documented
- [ ] Escalation procedures defined
- [ ] Communication templates prepared

### Detection & Analysis
- [ ] Monitor alerts and logs
- [ ] Classify severity (Critical, High, Medium, Low)
- [ ] Document incident details
- [ ] Determine scope of compromise

### Containment
- [ ] Isolate affected systems
- [ ] Preserve evidence
- [ ] Apply temporary fixes
- [ ] Notify relevant parties

### Eradication
- [ ] Remove malware/backdoors
- [ ] Patch vulnerabilities
- [ ] Reset compromised credentials
- [ ] Update security controls

### Recovery
- [ ] Restore from clean backups
- [ ] Monitor for reinfection
- [ ] Gradual service restoration
- [ ] Verify security controls

### Post-Incident
- [ ] Document lessons learned
- [ ] Update security controls
- [ ] Improve detection mechanisms
- [ ] Train team on findings

---

## Tools and Resources

### Security Scanning Tools
- **SAST**: ESLint Security, SonarQube, Semgrep, CodeQL
- **SCA**: npm audit, Snyk, Dependabot, OWASP Dependency-Check
- **DAST**: OWASP ZAP, Burp Suite, Nikto
- **Secret Scanning**: GitLeaks, TruffleHog, detect-secrets
- **Container Security**: Trivy, Clair (if using Docker)

### Security Libraries
- **helmet**: Security headers for Express
- **express-rate-limit**: Rate limiting middleware
- **bcrypt**: Password hashing
- **joi** / **yup** / **zod**: Input validation
- **DOMPurify**: HTML sanitization
- **xss-clean**: XSS prevention middleware
- **hpp**: HTTP Parameter Pollution prevention

### Learning Resources
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- Web Security Academy: https://portswigger.net/web-security
- SANS Security Training: https://www.sans.org/

---

## Success Criteria

- [ ] All HIGH/CRITICAL npm audit findings resolved
- [ ] SAST scan shows zero HIGH/CRITICAL issues
- [ ] Security headers score A+ on securityheaders.com
- [ ] Manual penetration test finds no CRITICAL/HIGH issues
- [ ] All injection points tested and secured
- [ ] Rate limiting implemented on sensitive endpoints
- [ ] Security logging and monitoring operational
- [ ] Incident response plan documented
- [ ] Team trained on secure coding practices
- [ ] Security review sign-off before production deployment

---

## Dependencies

**Required Before This Phase**:
- Phase 1: Core UX Enhancements (complete)
- Phase 2: Visual Redesign (complete)
- Phase 3: Backend & Photo Management (complete)
- Phase 5: Authentication & Subscriptions (complete)

**Blocks**:
- Phase 4: Deployment & CI/CD (MUST NOT deploy until security audit complete)

---

## Files to Create/Modify

### New Files
- `scripts/security-scan.sh` - Automated security scanning script
- `.github/workflows/security-scan.yml` - GitHub Actions security workflow
- `docs/SECURITY.md` - Security policy and vulnerability reporting
- `docs/security-audit-report.md` - Security audit findings and remediation
- `.eslintrc.security.js` - ESLint security configuration
- `security-headers.js` - Security header middleware (backend)
- `validation/schemas.js` - Input validation schemas
- `INCIDENT_RESPONSE.md` - Incident response procedures

### Modified Files
- `package.json` - Add security scanning scripts and dependencies
- Backend middleware - Add security headers, rate limiting
- Authentication flows - Implement security controls
- API endpoints - Add input validation
- File upload handlers - Add security checks

---

## Estimated Duration
**4-6 weeks** (depending on findings and remediation complexity)

**Blockers**: None (but blocks deployment)

---

**Next Steps**: See [tasks.md](./tasks.md) for detailed security testing checklist.
