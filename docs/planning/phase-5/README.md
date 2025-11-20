# Phase 5: Authentication & Subscriptions

**Status**: 🔵 Not Started
**Priority**: Medium
**Estimated Complexity**: High

## Overview

Phase 5 introduces user accounts, authentication, and a subscription-based business model to Touken West. This phase enables user registration, login functionality, role-based access control, and premium content gating, potentially creating a revenue stream for the application.

## Objectives

1. **Implement user authentication** - Secure login and signup functionality
2. **Create role-based access control** - Admin, subscriber, and free user tiers
3. **Integrate payment processing** - Subscription payments via Stripe or similar
4. **Gate premium content** - Restrict certain features to paying subscribers
5. **Build account management** - User profile, subscription management
6. **Admin user management** - Tools for managing users and subscriptions

## Key Features

### 1. User Authentication
- Email/password registration
- Email verification
- Secure login with JWT or sessions
- Password reset functionality
- Social login (Google, GitHub - optional)
- Remember me functionality
- Logout

### 2. User Roles & Permissions
**Free Tier (Unauthenticated or registered free users)**
- View basic sword information
- Search and filter swords
- View limited photos (e.g., 1 per sword)
- Basic sword details

**Subscriber Tier (Paid users)**
- Everything in free tier
- View all photos for each sword
- Access detailed provenance information
- Download high-resolution photos
- Advanced search features
- Save favorites/collections
- No ads (if ads are added)

**Admin Tier**
- Everything in subscriber tier
- Add/edit/delete sword entries
- Upload/manage photos
- Manage user accounts
- View analytics dashboard
- Moderate content

### 3. Subscription Management
- Monthly or annual subscription plans
- Stripe payment integration
- Subscription status tracking
- Automatic renewal
- Cancellation handling
- Upgrade/downgrade plans
- Payment history
- Invoice generation

### 4. User Interface Components
- Login page
- Signup page
- Password reset page
- User profile page
- Subscription management page
- Payment form
- Account settings
- Admin dashboard

### 5. Content Gating
- Show preview with "Subscribe to view more" prompts
- Blur or hide premium content for free users
- Display subscription benefits
- Easy upgrade flow
- Trial period (optional)

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

**Recommendation**: Clerk or Auth0 for ease of use, Supabase Auth if using Supabase, NextAuth.js for cost-effectiveness.

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

- [ ] Users can register and log in securely
- [ ] Email verification working
- [ ] Password reset functional
- [ ] Role-based access control enforced
- [ ] Stripe subscription flow working
- [ ] Payment processing successful
- [ ] Subscription status tracked correctly
- [ ] Premium content properly gated
- [ ] Admin panel functional
- [ ] User profile/settings working
- [ ] Security best practices followed
- [ ] GDPR/privacy compliant

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

## Files to Create/Modify

### Backend
- Create: `/server/routes/auth.js` - Authentication routes
- Create: `/server/routes/users.js` - User management
- Create: `/server/routes/subscriptions.js` - Subscription endpoints
- Create: `/server/middleware/auth.js` - Auth middleware
- Create: `/server/middleware/checkRole.js` - Role checking
- Create: `/server/services/stripe.js` - Stripe integration
- Modify: All protected routes to require authentication

### Frontend
- Create: `src/pages/Login.jsx`
- Create: `src/pages/Signup.jsx`
- Create: `src/pages/ForgotPassword.jsx`
- Create: `src/pages/Profile.jsx`
- Create: `src/pages/Subscription.jsx`
- Create: `src/pages/AdminDashboard.jsx`
- Create: `src/components/ProtectedRoute.jsx`
- Create: `src/components/SubscriptionGate.jsx`
- Create: `src/context/AuthContext.jsx`
- Create: `src/services/authService.js`

### Configuration
- Create: `.env` entries for auth secrets
- Update API routes with auth middleware

## Next Steps

See [tasks.md](./tasks.md) for detailed implementation checklist.

---

**Estimated Duration**: TBD
**Blockers**: Requires Phase 3 and Phase 4 to be complete
