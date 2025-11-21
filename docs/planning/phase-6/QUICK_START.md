# Phase 6: Quick Start Guide

This guide helps you get started with security testing for Touken West.

## Prerequisites

Before starting Phase 6, ensure:
- ✅ Phase 1-5 are complete (or at least Phase 1-2 for current testing)
- ✅ Node.js and npm are installed
- ✅ Git is installed and repository is clean

## Step 1: Install Security Tools

### Required Tools

```bash
# Install ESLint security plugin
npm install --save-dev eslint-plugin-security

# Install Snyk CLI (global)
npm install -g snyk

# Authenticate with Snyk (requires free account)
snyk auth
```

### Optional Tools (for comprehensive scanning)

```bash
# GitLeaks (secret scanning)
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64
chmod +x gitleaks-linux-amd64
sudo mv gitleaks-linux-amd64 /usr/local/bin/gitleaks

# OWASP ZAP (DAST scanning - GUI application)
# Download from: https://www.zaproxy.org/download/

# License checker
npm install -g license-checker
```

## Step 2: Configure Security Scanning

### Configure ESLint

Option A: Replace existing .eslintrc
```bash
mv .eslintrc.security.js .eslintrc.js
```

Option B: Merge into existing .eslintrc.js
```javascript
// Add to your existing .eslintrc.js
{
  "extends": [
    "react-app",
    "plugin:security/recommended"
  ],
  "plugins": ["security"]
}
```

### Enable GitHub Dependabot

1. Go to your GitHub repository
2. Navigate to Settings → Security & analysis
3. Enable "Dependabot alerts"
4. Enable "Dependabot security updates"

### Set up GitHub Secrets (for CI/CD)

1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:
   - `SNYK_TOKEN`: Your Snyk API token (from https://app.snyk.io/account)
   - `GITLEAKS_LICENSE`: (optional, for GitLeaks Pro features)

## Step 3: Run Initial Security Scans

### Quick Scan (5 minutes)

```bash
# Run the quick security scan
./scripts/security-scan.sh
```

This will:
- ✅ Run `npm audit` for dependency vulnerabilities
- ✅ Check for outdated packages
- ✅ Run ESLint security checks
- ✅ Scan for common security issues (console.log, eval, etc.)
- ✅ Verify .env file is not committed

### Full Scan (15-30 minutes)

```bash
# Run comprehensive security scan
./scripts/security-scan.sh --full
```

This includes everything from quick scan plus:
- ✅ Secret scanning with GitLeaks (if installed)
- ✅ Snyk dependency scan
- ✅ License compliance check

## Step 4: Review and Fix Issues

### Critical Issues (Fix Immediately)

1. **High/Critical npm vulnerabilities**
   ```bash
   npm audit fix
   # Review changes before committing
   ```

2. **Found secrets in code**
   - Remove secrets from code
   - Add to environment variables
   - Rotate exposed credentials
   - Add to .gitignore

3. **eval() or dangerouslySetInnerHTML usage**
   - Remove eval() completely
   - Replace with safe alternatives
   - Sanitize HTML with DOMPurify if needed

### Warnings (Address Before Production)

1. **console.log statements**
   - Remove or replace with proper logging
   - Safe to leave during development

2. **Outdated dependencies**
   - Update carefully and test
   - Review breaking changes

3. **Medium severity vulnerabilities**
   - Update packages if possible
   - Document if update breaks functionality

## Step 5: Set Up Continuous Security Scanning

### GitHub Actions (Automated)

The `.github/workflows/security-scan.yml` workflow will automatically:
- ✅ Run on every pull request
- ✅ Run on push to main branch
- ✅ Run weekly on Mondays at 9 AM UTC
- ✅ Block PRs with critical security issues

### Local Development (Manual)

Add to your development workflow:

```bash
# Before committing code
npm run lint
npm audit

# Before creating a pull request
./scripts/security-scan.sh

# Weekly maintenance
npm outdated
npm audit
```

## Step 6: Address Current Application Security

### Phase 1-2 Security (Current State)

**Input Validation**:
```javascript
// Example: Add input length validation to SearchBar.jsx
const MAX_TAG_LENGTH = 100;

const handleAddTag = () => {
  const trimmed = inputValue.trim();

  // Security: Validate length
  if (trimmed.length > MAX_TAG_LENGTH) {
    alert(`Search tags must be ${MAX_TAG_LENGTH} characters or less`);
    return;
  }

  // Security: Basic sanitization (React handles the rest)
  if (trimmed && !searchTags.includes(trimmed)) {
    onSearchTagsChange([...searchTags, trimmed]);
    setInputValue('');
  }
};
```

**CSV Security** (csvParser.js):
```javascript
// When exporting CSV (future feature), prevent CSV injection
function sanitizeCsvCell(cell) {
  const cellStr = String(cell);
  // Prefix cells starting with =, +, -, @ to prevent formula injection
  if (/^[=+\-@]/.test(cellStr)) {
    return "'" + cellStr;
  }
  return cellStr;
}
```

## Step 7: Plan for Future Phases

### Phase 3 (Backend) Security Checklist

When implementing backend:
- [ ] Use parameterized queries (NEVER string concatenation)
- [ ] Implement input validation with Joi/Yup/Zod
- [ ] Add rate limiting on all endpoints
- [ ] Use helmet.js for security headers
- [ ] Implement proper error handling (no stack traces to users)

### Phase 5 (Authentication) Security Checklist

When implementing auth:
- [ ] Use bcrypt (12+ rounds) or Argon2 for passwords
- [ ] Implement rate limiting on login (5 attempts per 15 min)
- [ ] Use httpOnly, secure, sameSite cookies
- [ ] Implement session timeout (15-30 min)
- [ ] Add 2FA/MFA support
- [ ] Secure password reset flow

## Common Commands Reference

```bash
# Check for vulnerabilities
npm audit
npm audit --production # Production dependencies only
npm audit fix # Auto-fix vulnerabilities

# Update dependencies
npm outdated # See outdated packages
npm update # Update to latest within semver range

# Security scanning
./scripts/security-scan.sh # Quick scan
./scripts/security-scan.sh --full # Full scan

# Snyk
snyk test # Test for vulnerabilities
snyk monitor # Monitor project continuously
snyk wizard # Interactive vulnerability fixing

# GitLeaks
gitleaks detect --source=. # Scan for secrets
```

## Security Resources

### Learning
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **OWASP Cheat Sheets**: https://cheatsheetseries.owasp.org/
- **Web Security Academy**: https://portswigger.net/web-security
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/

### Tools
- **npm audit docs**: https://docs.npmjs.com/cli/v8/commands/npm-audit
- **Snyk**: https://snyk.io/
- **GitLeaks**: https://github.com/gitleaks/gitleaks
- **OWASP ZAP**: https://www.zaproxy.org/

### Vulnerability Databases
- **CVE**: https://cve.mitre.org/
- **NVD**: https://nvd.nist.gov/
- **Snyk Vulnerability DB**: https://snyk.io/vuln/

## Troubleshooting

### "npm audit fix" breaks the application

```bash
# Revert changes
git checkout package-lock.json package.json
npm install

# Try less aggressive fix
npm audit fix --package-lock-only

# Or update specific package
npm update package-name@version
```

### ESLint errors after adding security plugin

```bash
# Check what rules are failing
npm run lint

# Temporarily disable rule (not recommended)
// eslint-disable-next-line security/detect-object-injection

# Or adjust rule severity in .eslintrc.js
"security/detect-object-injection": "warn" // Instead of "error"
```

### Snyk requires authentication

```bash
# Sign up at https://snyk.io/
# Get API token from https://app.snyk.io/account

# Authenticate
snyk auth

# Or set token directly
export SNYK_TOKEN=your-token-here
```

## Next Steps

1. ✅ Run initial security scan
2. ✅ Fix all critical and high severity issues
3. ✅ Set up CI/CD security scanning
4. ✅ Review and implement input validation
5. ✅ Document security decisions
6. 📖 Read full [Phase 6 README](./README.md) for comprehensive security plan
7. 📋 Work through [Phase 6 Tasks](./tasks.md) checklist

## Support

- **Security Issues**: See [SECURITY.md](../../SECURITY.md) for vulnerability reporting
- **Questions**: Create an issue in the repository
- **Documentation**: Review the comprehensive Phase 6 documentation

---

**Remember**: Security is an ongoing process, not a one-time task. Continuously monitor, test, and improve security posture throughout the application lifecycle.
