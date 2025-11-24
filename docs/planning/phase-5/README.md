# Phase 5: Authentication & Subscriptions

**Status**: 🟡 In Progress (Authentication Complete)
**Timeline**: Started 2025-11-24
**Priority**: Medium
**Complexity**: High

## Overview

Phase 5 introduces user accounts, authentication, and a subscription-based business model to Touken West. This phase enables user registration, login functionality, role-based access control, and premium content gating, potentially creating a revenue stream for the application.

## Objectives

1. **Implement user authentication** ✅ - Secure login and signup functionality with JWT
2. **Create role-based access control** ✅ - Admin, subscriber, and free user tiers implemented
3. **Integrate payment processing** ⏳ - Subscription payments via Stripe (Not Started)
4. **Gate premium content** ⏳ - Restrict certain features to paying subscribers (Not Started)
5. **Build account management** ⏳ - User profile, subscription management (Partially Complete)
6. **Admin user management** ✅ - Admin console with user management capabilities

## Key Features

### 1. User Authentication ✅
- ✅ Email/password registration
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ HTTP-only cookie-based token storage
- ✅ Logout functionality
- ✅ Authentication context with React Context API
- ⏳ Email verification (Not Implemented)
- ⏳ Password reset functionality (Not Implemented)
- ⏳ Social login (Not Implemented)

### 2. User Roles & Permissions ✅
**Admin Tier** ✅
- ✅ Add/edit/delete sword entries via Admin Console
- ✅ Upload/manage photos and media
- ✅ View and manage changelog
- ✅ Create and manage user accounts
- ✅ Role assignment (admin/subscriber/free)
- ✅ Full access to all features

**Subscriber Tier** (Defined, not yet enforced)
- ⏳ Everything in free tier
- ⏳ View all photos for each sword
- ⏳ Access detailed provenance information
- ⏳ Download high-resolution photos
- ⏳ Advanced search features
- ⏳ Save favorites/collections

**Free Tier** (Current default behavior)
- ✅ View basic sword information
- ✅ Search and filter swords
- ✅ View all photos (not yet restricted)
- ✅ Basic sword details

### 3. Subscription Management ⏳
- ⏳ Monthly or annual subscription plans (Not Implemented)
- ⏳ Stripe payment integration (Not Implemented)
- ⏳ Subscription status tracking (Schema prepared)
- ⏳ Automatic renewal (Not Implemented)
- ⏳ Cancellation handling (Not Implemented)
- ⏳ Upgrade/downgrade plans (Not Implemented)
- ⏳ Payment history (Not Implemented)
- ⏳ Invoice generation (Not Implemented)

### 4. User Interface Components
- ✅ Login page with email/password
- ✅ Registration functionality (via admin console)
- ✅ Admin Console dashboard with user management
- ✅ Authentication state management (AuthContext)
- ⏳ User profile page (Not Implemented)
- ⏳ Password reset page (Not Implemented)
- ⏳ Subscription management page (Not Implemented)
- ⏳ Payment form (Not Implemented)
- ⏳ Account settings (Not Implemented)

### 5. Content Gating ⏳
- ⏳ Show preview with "Subscribe to view more" prompts (Not Implemented)
- ⏳ Blur or hide premium content for free users (Not Implemented)
- ⏳ Display subscription benefits (Not Implemented)
- ⏳ Easy upgrade flow (Not Implemented)
- ⏳ Trial period (Not Implemented)

**Note**: Content gating awaits Stripe integration and subscription management implementation.

## Authentication Strategy Options

### Option 1: Auth0
- ✅ Fully managed authentication service
- ✅ Social logins, MFA, password reset built-in
- ✅ Excellent documentation
- ❌ Cost can add up with many users
- Cost: Free up to 7,000 users, then $0.023/user

### Option 2: Clerk
- ✅ Modern, React-first authentication
- ✅ Beautiful pre-built UI components
- ✅ User management dashboard
- ❌ Pricing can be expensive at scale
- Cost: Free up to 10,000 MAUs, then tiered pricing

### Option 3: NextAuth.js (Auth.js)
- ✅ Open-source, self-hosted
- ✅ Great Next.js integration
- ✅ No per-user costs
- ❌ More setup required
- Cost: Free (self-hosted)

### Option 4: Supabase Auth
- ✅ Integrated with Supabase database
- ✅ Built-in user management
- ✅ Generous free tier
- Cost: Included in Supabase plan

### Option 5: Custom JWT Implementation
- ✅ Complete control
- ✅ No third-party dependencies
- ❌ More complex, security-critical
- ❌ Need to implement all features
- Cost: Free (development time)

**Decision Made**: ✅ Custom JWT Implementation - Complete control, no third-party dependencies, secure bcrypt password hashing with HTTP-only cookies.

## Payment Processing Options

### Option 1: Stripe
- ✅ Industry standard
- ✅ Excellent documentation
- ✅ Subscription management built-in
- ✅ Customer portal
- Cost: 2.9% + $0.30 per transaction

### Option 2: Paddle
- ✅ Merchant of record (handles VAT/tax)
- ✅ Good for SaaS subscriptions
- Cost: 5% + $0.50 per transaction

### Option 3: LemonSqueezy
- ✅ Merchant of record
- ✅ Simple integration
- ✅ Good for digital products
- Cost: 5% per transaction

**Recommendation**: Stripe for flexibility and features, LemonSqueezy for simplicity.

## Database Schema Extensions

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- if using custom auth
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'free', -- 'free', 'subscriber', 'admin'
  subscription_status VARCHAR(50), -- 'active', 'canceled', 'past_due'
  subscription_plan VARCHAR(50), -- 'monthly', 'annual'
  stripe_customer_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan VARCHAR(50),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Favorites (Optional)
```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sword_id INTEGER REFERENCES swords(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, sword_id)
);
```

## Success Criteria

- [x] Users can register and log in securely
- [x] Role-based access control implemented
- [x] Admin panel functional with user management
- [x] Security best practices followed (JWT, bcrypt, HTTP-only cookies)
- [x] Password hashing with bcrypt
- [x] Authentication context provides app-wide auth state
- [ ] Email verification working (Not Implemented)
- [ ] Password reset functional (Not Implemented)
- [ ] Stripe subscription flow working (Not Started)
- [ ] Payment processing successful (Not Started)
- [ ] Subscription status tracked correctly (Not Started)
- [ ] Premium content properly gated (Not Started)
- [ ] User profile/settings working (Not Started)
- [ ] GDPR/privacy compliant (Pending subscription implementation)

## Out of Scope

- Multi-factor authentication (MFA)
- Social login beyond email/password
- Gift subscriptions
- Affiliate program
- Referral system
- Team/organization accounts
- API access for developers

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment processing failures | High | Robust error handling, webhook monitoring |
| Security vulnerabilities | Critical | Use established auth libraries, security audit |
| Subscription management complexity | Medium | Use Stripe's built-in subscription tools |
| Low conversion rate | Medium | Clear value proposition, free trial |
| Privacy/GDPR compliance | High | Implement proper data handling, privacy policy |

## Legal & Compliance

### Required Pages/Policies
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Refund Policy
- [ ] GDPR compliance (for EU users)
- [ ] Data deletion requests

### Compliance Checklist
- [ ] Store passwords securely (bcrypt/argon2)
- [ ] HTTPS everywhere
- [ ] PCI DSS compliance (via Stripe)
- [ ] GDPR data handling
- [ ] Cookie consent banner
- [ ] User data export capability
- [ ] Account deletion capability

## Pricing Strategy

### Suggested Plans
**Free Tier**
- Basic search and filtering
- View 1 photo per sword
- Limited search results
- Price: $0

**Subscriber Tier**
- All features unlocked
- All photos viewable
- Download high-res images
- Save favorites
- Advanced search
- Price: $9.99/month or $99/year (save 17%)

**Admin Tier**
- Internal use only (not for sale)

### Considerations
- Start with simple pricing (one paid tier)
- Offer annual discount to encourage commitment
- Consider free trial (7 or 14 days)
- Grandfather early adopters with discounts

## Files Created/Modified

### Backend ✅
- ✅ `/admin-server/server.js` - Authentication routes (register, login)
- ✅ JWT authentication middleware implemented
- ✅ User management endpoints in admin-server
- ✅ Role-based access control (admin/subscriber/free)
- ✅ bcrypt password hashing
- ⏳ `/server/routes/subscriptions.js` - Not yet implemented
- ⏳ `/server/services/stripe.js` - Not yet implemented

### Frontend ✅
- ✅ `src/components/Login.jsx` - Login page
- ✅ `src/context/AuthContext.jsx` - Authentication context
- ✅ `src/styles/Login.css` - Login page styling
- ✅ Admin console user management interface
- ⏳ `src/pages/ForgotPassword.jsx` - Not implemented
- ⏳ `src/pages/Profile.jsx` - Not implemented
- ⏳ `src/pages/Subscription.jsx` - Not implemented
- ⏳ `src/components/ProtectedRoute.jsx` - Not implemented
- ⏳ `src/components/SubscriptionGate.jsx` - Not implemented

### Configuration ✅
- ✅ JWT_SECRET environment variable support
- ✅ Cookie-based authentication
- ✅ CORS configuration for credentials

## Implementation Summary

### Completed (2025-11-24) ✅
- ✅ User authentication with JWT tokens
- ✅ Email/password registration and login
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ HTTP-only cookie-based token storage
- ✅ Role-based access control (admin/subscriber/free)
- ✅ Admin user management interface
- ✅ Authentication context for React app
- ✅ Login page with error handling
- ✅ User data storage in users.json

### Remaining Work ⏳
- ⏳ Stripe payment integration
- ⏳ Subscription management (create, update, cancel)
- ⏳ Premium content gating
- ⏳ User profile page
- ⏳ Password reset flow
- ⏳ Email verification
- ⏳ Subscription status tracking
- ⏳ Payment webhooks
- ⏳ Legal pages (privacy policy, terms of service)

### Next Steps
1. Integrate Stripe for subscription payments
2. Implement subscription CRUD operations
3. Build content gating logic based on user role
4. Create user profile/account management pages
5. Implement password reset flow
6. Add email verification

---

**Status**: 🟡 In Progress (Authentication Complete, Subscriptions Pending)
**Started**: 2025-11-24
**Authentication Completed**: 2025-11-24
