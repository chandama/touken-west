#!/bin/bash

# Security Scanning Script for Touken West
# This script runs various security scans and generates a report
# Usage: ./scripts/security-scan.sh [--full]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="./security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${REPORT_DIR}/security-scan-${TIMESTAMP}.txt"
FULL_SCAN=false

# Parse arguments
if [[ "$1" == "--full" ]]; then
    FULL_SCAN=true
fi

# Create report directory
mkdir -p "${REPORT_DIR}"

echo "============================================" | tee "${REPORT_FILE}"
echo "Touken West Security Scan" | tee -a "${REPORT_FILE}"
echo "Timestamp: $(date)" | tee -a "${REPORT_FILE}"
echo "Scan Type: $([ "$FULL_SCAN" = true ] && echo "FULL" || echo "QUICK")" | tee -a "${REPORT_FILE}"
echo "============================================" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Function to print section header
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}" | tee -a "${REPORT_FILE}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "${REPORT_FILE}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "${REPORT_FILE}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "${REPORT_FILE}"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm."
    exit 1
fi

# 1. NPM AUDIT
print_section "NPM Audit (Dependency Vulnerability Scan)"
if npm audit --production > "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" 2>&1; then
    print_success "No vulnerabilities found in dependencies"
else
    AUDIT_RESULT=$?
    if [ $AUDIT_RESULT -eq 1 ]; then
        print_error "Vulnerabilities found in dependencies. Check ${REPORT_DIR}/npm-audit-${TIMESTAMP}.json"
        npm audit --production | tee -a "${REPORT_FILE}"
    fi
fi

# 2. OUTDATED PACKAGES CHECK
print_section "Outdated Packages Check"
npm outdated | tee -a "${REPORT_FILE}" || true

# 3. ESLINT SECURITY CHECK
print_section "ESLint Security Plugin"
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
    if npm run lint 2>&1 | tee -a "${REPORT_FILE}"; then
        print_success "ESLint security checks passed"
    else
        print_warning "ESLint found issues. Review above output."
    fi
else
    print_warning "ESLint not configured. Run: npm install --save-dev eslint-plugin-security"
fi

# 4. SECRET SCANNING (if GitLeaks is installed)
if [ "$FULL_SCAN" = true ]; then
    print_section "Secret Scanning (GitLeaks)"
    if command -v gitleaks &> /dev/null; then
        if gitleaks detect --source=. --report-path="${REPORT_DIR}/gitleaks-${TIMESTAMP}.json" --no-git 2>&1 | tee -a "${REPORT_FILE}"; then
            print_success "No secrets detected"
        else
            print_error "Secrets detected! Check ${REPORT_DIR}/gitleaks-${TIMESTAMP}.json"
        fi
    else
        print_warning "GitLeaks not installed. Install: brew install gitleaks (macOS) or visit https://github.com/gitleaks/gitleaks"
    fi

    # 5. SNYK SCAN (if Snyk is installed)
    print_section "Snyk Vulnerability Scan"
    if command -v snyk &> /dev/null; then
        if snyk auth --auth-type=token "${SNYK_TOKEN}" 2>/dev/null; then
            if snyk test --json > "${REPORT_DIR}/snyk-${TIMESTAMP}.json" 2>&1; then
                print_success "Snyk scan passed - no vulnerabilities"
            else
                print_error "Snyk found vulnerabilities. Check ${REPORT_DIR}/snyk-${TIMESTAMP}.json"
                snyk test | tee -a "${REPORT_FILE}"
            fi
        else
            print_warning "Snyk not authenticated. Run: snyk auth"
        fi
    else
        print_warning "Snyk not installed. Install: npm install -g snyk"
    fi
fi

# 6. CHECK FOR COMMON SECURITY ISSUES
print_section "Common Security Issues Check"

# Check for console.log in production code
if grep -r "console\.log" src/ --exclude-dir=node_modules >/dev/null 2>&1; then
    print_warning "console.log statements found in code (should be removed for production)"
    grep -rn "console\.log" src/ --exclude-dir=node_modules | head -5 | tee -a "${REPORT_FILE}"
else
    print_success "No console.log statements found"
fi

# Check for dangerouslySetInnerHTML
if grep -r "dangerouslySetInnerHTML" src/ --exclude-dir=node_modules >/dev/null 2>&1; then
    print_warning "dangerouslySetInnerHTML found - ensure proper sanitization"
    grep -rn "dangerouslySetInnerHTML" src/ --exclude-dir=node_modules | tee -a "${REPORT_FILE}"
else
    print_success "No dangerouslySetInnerHTML usage found"
fi

# Check for eval()
if grep -r "eval\s*(" src/ --exclude-dir=node_modules >/dev/null 2>&1; then
    print_error "eval() usage found - SECURITY RISK"
    grep -rn "eval\s*(" src/ --exclude-dir=node_modules | tee -a "${REPORT_FILE}"
else
    print_success "No eval() usage found"
fi

# Check for .env files in git
if git ls-files | grep -q "\.env$"; then
    print_error ".env file tracked in git - SECURITY RISK"
else
    print_success ".env files not tracked in git"
fi

# Check if .env is in .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        print_success ".env is in .gitignore"
    else
        print_warning ".env not found in .gitignore - should be added"
    fi
fi

# 7. FILE PERMISSIONS CHECK
print_section "File Permissions Check"
if [ -f ".env" ]; then
    PERMS=$(stat -c %a .env 2>/dev/null || stat -f %A .env 2>/dev/null)
    if [ "$PERMS" = "600" ] || [ "$PERMS" = "400" ]; then
        print_success ".env has secure permissions ($PERMS)"
    else
        print_warning ".env has insecure permissions ($PERMS). Set to 600: chmod 600 .env"
    fi
fi

# 8. DEPENDENCY LICENSE CHECK
if [ "$FULL_SCAN" = true ]; then
    print_section "License Compliance Check"
    if command -v license-checker &> /dev/null; then
        license-checker --summary | tee -a "${REPORT_FILE}"
    else
        print_warning "license-checker not installed. Install: npm install -g license-checker"
    fi
fi

# 9. SUMMARY
print_section "Scan Summary"
echo "Report saved to: ${REPORT_FILE}" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Count issues
CRITICAL_COUNT=$(grep -c "✗" "${REPORT_FILE}" || true)
WARNING_COUNT=$(grep -c "⚠" "${REPORT_FILE}" || true)
SUCCESS_COUNT=$(grep -c "✓" "${REPORT_FILE}" || true)

echo "Critical Issues: ${CRITICAL_COUNT}" | tee -a "${REPORT_FILE}"
echo "Warnings: ${WARNING_COUNT}" | tee -a "${REPORT_FILE}"
echo "Passed Checks: ${SUCCESS_COUNT}" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

if [ $CRITICAL_COUNT -gt 0 ]; then
    print_error "SCAN FAILED: Critical security issues found"
    exit 1
elif [ $WARNING_COUNT -gt 0 ]; then
    print_warning "SCAN PASSED WITH WARNINGS: Review warnings before deployment"
    exit 0
else
    print_success "SCAN PASSED: No security issues found"
    exit 0
fi
