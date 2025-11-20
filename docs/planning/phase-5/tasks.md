# Phase 5: Tasks Checklist

## 1. Authentication System Selection & Setup

### Research & Planning
- [ ] Compare authentication solutions (Auth0, Clerk, NextAuth, Supabase, Custom)
- [ ] Evaluate costs at different user scales
- [ ] Review security features of each option
- [ ] Make final decision and document reasoning
- [ ] Design authentication flow diagrams

### Authentication Provider Setup
- [ ] Create account with chosen auth provider
- [ ] Set up application/project
- [ ] Configure allowed callback URLs
- [ ] Set up email templates (verification, password reset)
- [ ] Configure session duration
- [ ] Set up JWT settings (if applicable)
- [ ] Test authentication in development

### Database Schema
- [ ] Create users table migration
- [ ] Create subscriptions table migration
- [ ] Create favorites table migration (optional)
- [ ] Add indexes for performance
- [ ] Run migrations in development
- [ ] Seed test user data

---

## 2. User Registration & Login

### Backend Implementation
- [ ] Create POST `/api/auth/register` endpoint
- [ ] Implement email validation
- [ ] Hash passwords (bcrypt/argon2)
- [ ] Create user in database
- [ ] Send verification email
- [ ] Create POST `/api/auth/login` endpoint
- [ ] Verify email/password
- [ ] Generate JWT or session
- [ ] Return auth token
- [ ] Create POST `/api/auth/logout` endpoint
- [ ] Implement token refresh mechanism

### Frontend - Login Page
- [ ] Create Login component
- [ ] Build login form (email, password)
- [ ] Add form validation
- [ ] Handle login API call
- [ ] Store auth token (localStorage, cookie, or context)
- [ ] Redirect after successful login
- [ ] Show error messages
- [ ] Add "Forgot Password?" link
- [ ] Add "Sign up" link
- [ ] Style login page

### Frontend - Signup Page
- [ ] Create Signup component
- [ ] Build signup form (email, password, confirm password)
- [ ] Add client-side validation
- [ ] Check password strength
- [ ] Handle signup API call
- [ ] Show success message
- [ ] Redirect to verification message or login
- [ ] Show error messages
- [ ] Add "Already have an account?" link
- [ ] Style signup page

### Email Verification
- [ ] Create email verification endpoint
- [ ] Generate verification tokens
- [ ] Send verification email
- [ ] Create verification page/component
- [ ] Handle verification token validation
- [ ] Update user status on verification
- [ ] Show success/error messages

---

## 3. Password Reset Flow

### Backend
- [ ] Create POST `/api/auth/forgot-password` endpoint
- [ ] Generate password reset token
- [ ] Send reset email with link
- [ ] Create POST `/api/auth/reset-password` endpoint
- [ ] Validate reset token
- [ ] Update user password
- [ ] Invalidate token after use
- [ ] Add rate limiting to prevent abuse

### Frontend
- [ ] Create ForgotPassword component
- [ ] Build email input form
- [ ] Handle forgot password API call
- [ ] Show confirmation message
- [ ] Create ResetPassword component
- [ ] Build new password form
- [ ] Handle reset password API call
- [ ] Redirect to login on success
- [ ] Handle expired/invalid tokens

---

## 4. Authentication Context & State

### Auth Context
- [ ] Create AuthContext with React Context API
- [ ] Implement login function
- [ ] Implement logout function
- [ ] Implement user state management
- [ ] Persist auth state (localStorage/cookies)
- [ ] Auto-refresh tokens
- [ ] Check authentication on app load
- [ ] Provide auth status to components

### Protected Routes
- [ ] Create ProtectedRoute component
- [ ] Check authentication before rendering
- [ ] Redirect to login if not authenticated
- [ ] Show loading state while checking auth
- [ ] Support role-based route protection

### Auth Service
- [ ] Create authService module
- [ ] Implement login API call
- [ ] Implement signup API call
- [ ] Implement logout API call
- [ ] Implement token refresh
- [ ] Implement get current user
- [ ] Add interceptors for auth headers

---

## 5. Role-Based Access Control (RBAC)

### Backend Middleware
- [ ] Create auth middleware to verify tokens
- [ ] Create role-checking middleware
- [ ] Protect admin-only endpoints
- [ ] Protect subscriber-only endpoints
- [ ] Return 401 Unauthorized for invalid tokens
- [ ] Return 403 Forbidden for insufficient permissions

### Frontend Authorization
- [ ] Create useAuth hook
- [ ] Create useRole hook
- [ ] Conditionally render based on role
- [ ] Show/hide admin features
- [ ] Show/hide subscriber features
- [ ] Display upgrade prompts for free users

### API Protection
- [ ] Protect POST/PUT/DELETE /api/swords (admin only)
- [ ] Protect photo upload (admin only)
- [ ] Protect user management endpoints (admin only)
- [ ] Limit photo viewing based on tier
- [ ] Rate limit by user tier

---

## 6. Stripe Integration

### Stripe Setup
- [ ] Create Stripe account
- [ ] Get API keys (test and live)
- [ ] Set up products in Stripe Dashboard
- [ ] Create monthly subscription plan
- [ ] Create annual subscription plan
- [ ] Configure webhook endpoints
- [ ] Set up customer portal

### Backend Integration
- [ ] Install Stripe SDK
- [ ] Create POST `/api/subscriptions/create-checkout-session`
- [ ] Create subscription in Stripe
- [ ] Return checkout session URL
- [ ] Create POST `/api/webhooks/stripe` endpoint
- [ ] Handle `checkout.session.completed` webhook
- [ ] Handle `customer.subscription.updated` webhook
- [ ] Handle `customer.subscription.deleted` webhook
- [ ] Handle `invoice.payment_failed` webhook
- [ ] Update user subscription status in database
- [ ] Verify webhook signatures

### Frontend Integration
- [ ] Create Pricing component
- [ ] Display subscription plans
- [ ] Add "Subscribe" buttons
- [ ] Integrate Stripe Checkout
- [ ] Redirect to Stripe hosted checkout
- [ ] Handle successful payment redirect
- [ ] Handle failed payment
- [ ] Create SubscriptionSuccess page
- [ ] Create SubscriptionCanceled page

---

## 7. Subscription Management

### User Subscription Page
- [ ] Create Subscription component
- [ ] Display current plan
- [ ] Show subscription status (active, canceled, etc.)
- [ ] Display next billing date
- [ ] Show payment method
- [ ] Add "Update Payment Method" button
- [ ] Add "Cancel Subscription" button
- [ ] Add "Change Plan" button
- [ ] Show billing history

### Backend Endpoints
- [ ] GET `/api/subscriptions/status` - Get user's subscription
- [ ] POST `/api/subscriptions/cancel` - Cancel subscription
- [ ] POST `/api/subscriptions/resume` - Resume subscription
- [ ] POST `/api/subscriptions/change-plan` - Upgrade/downgrade
- [ ] GET `/api/subscriptions/portal-link` - Get Stripe portal URL

### Subscription Logic
- [ ] Check subscription status on protected content
- [ ] Handle subscription expiration
- [ ] Handle grace period for failed payments
- [ ] Downgrade user on cancellation
- [ ] Send subscription renewal emails
- [ ] Send payment failure emails

---

## 8. Content Gating & Premium Features

### Photo Gating
- [ ] Limit free users to 1 photo per sword
- [ ] Show blurred/low-res previews for gated photos
- [ ] Display "Subscribe to view all photos" message
- [ ] Allow full photo access for subscribers
- [ ] Add upgrade CTA in photo gallery

### Advanced Search Gating (Optional)
- [ ] Limit search results for free users
- [ ] Show "Subscribe for full results" message
- [ ] Allow advanced filters for subscribers only

### Download Gating
- [ ] Add download button for high-res photos (subscriber only)
- [ ] Implement photo download endpoint
- [ ] Track download limits (optional)

### Favorites/Collections (Subscriber Feature)
- [ ] Create favorites table
- [ ] Add "Add to Favorites" button (subscriber only)
- [ ] Create Favorites page
- [ ] Display saved swords
- [ ] Allow removing from favorites

---

## 9. User Profile & Account Management

### Profile Page
- [ ] Create Profile component
- [ ] Display user information (email, name)
- [ ] Add edit profile form
- [ ] Update user name
- [ ] Change email address (with verification)
- [ ] Change password form
- [ ] Display account creation date
- [ ] Show subscription tier badge

### Account Settings
- [ ] Email notification preferences
- [ ] Privacy settings
- [ ] Delete account button
- [ ] Export user data button (GDPR)
- [ ] Save settings to database

### Backend Endpoints
- [ ] GET `/api/users/profile` - Get current user
- [ ] PUT `/api/users/profile` - Update profile
- [ ] POST `/api/users/change-password` - Change password
- [ ] DELETE `/api/users/account` - Delete account
- [ ] GET `/api/users/export-data` - Export user data

---

## 10. Admin Dashboard

### Admin Panel UI
- [ ] Create AdminDashboard component
- [ ] Protect route (admin only)
- [ ] Display overview statistics
- [ ] Show total users count
- [ ] Show subscriber count
- [ ] Show revenue metrics
- [ ] List recent signups

### User Management
- [ ] Create user list table
- [ ] Display user email, role, status
- [ ] Add search/filter users
- [ ] Add "Edit User" modal
- [ ] Change user role
- [ ] Deactivate/activate users
- [ ] Delete users
- [ ] View user subscription details

### Content Management
- [ ] Link to existing admin form (Phase 3)
- [ ] Show recently added swords
- [ ] Quick edit swords
- [ ] Bulk actions (optional)

### Backend Admin Endpoints
- [ ] GET `/api/admin/users` - List all users
- [ ] GET `/api/admin/stats` - Dashboard statistics
- [ ] PUT `/api/admin/users/:id` - Update user
- [ ] DELETE `/api/admin/users/:id` - Delete user
- [ ] GET `/api/admin/subscriptions` - List subscriptions

---

## 11. Legal & Compliance

### Privacy & Legal Pages
- [ ] Write Privacy Policy
- [ ] Write Terms of Service
- [ ] Write Cookie Policy
- [ ] Write Refund Policy
- [ ] Add links to footer
- [ ] Create legal pages in app

### GDPR Compliance
- [ ] Implement cookie consent banner
- [ ] Allow users to export their data
- [ ] Allow users to delete their account
- [ ] Delete user data on account deletion
- [ ] Implement data retention policy
- [ ] Add unsubscribe from emails option

### Security Measures
- [ ] Store passwords with bcrypt (cost factor 10+)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CAPTCHA to signup (optional)
- [ ] Log authentication attempts
- [ ] Monitor for suspicious activity
- [ ] Set up account lockout on failed attempts

---

## 12. Email Notifications

### Email Service Setup
- [ ] Choose email service (SendGrid, Mailgun, AWS SES)
- [ ] Set up email templates
- [ ] Configure sender domain/email
- [ ] Verify domain for sending

### Email Templates
- [ ] Welcome email on signup
- [ ] Email verification email
- [ ] Password reset email
- [ ] Subscription confirmation email
- [ ] Payment received email
- [ ] Subscription renewal reminder
- [ ] Payment failed email
- [ ] Subscription canceled email

### Email Sending
- [ ] Implement email sending service
- [ ] Queue emails for better performance
- [ ] Handle email failures gracefully
- [ ] Add unsubscribe links
- [ ] Track email delivery (optional)

---

## 13. Testing

### Authentication Testing
- [ ] Test user registration flow
- [ ] Test login/logout flow
- [ ] Test email verification
- [ ] Test password reset
- [ ] Test token expiration
- [ ] Test invalid credentials
- [ ] Test role-based access

### Subscription Testing
- [ ] Test Stripe checkout flow (test mode)
- [ ] Test successful payment
- [ ] Test failed payment
- [ ] Test subscription cancellation
- [ ] Test plan changes
- [ ] Test webhook handling
- [ ] Use Stripe test cards

### Security Testing
- [ ] Test for SQL injection
- [ ] Test for XSS vulnerabilities
- [ ] Test CSRF protection
- [ ] Test password strength requirements
- [ ] Test rate limiting
- [ ] Run security audit tools

---

## 14. Documentation

### User Documentation
- [ ] Create user guide for signup/login
- [ ] Document subscription plans and features
- [ ] Create FAQ page
- [ ] Document how to cancel subscription
- [ ] Create support contact page

### Developer Documentation
- [ ] Document authentication flow
- [ ] Document API endpoints and auth
- [ ] Document role-based access control
- [ ] Document Stripe webhook handling
- [ ] Create troubleshooting guide

---

## Phase 5 Completion Checklist

- [ ] Users can register and verify email
- [ ] Users can log in and log out
- [ ] Password reset working
- [ ] Role-based access control enforced
- [ ] Stripe integration functional
- [ ] Subscriptions can be purchased
- [ ] Subscription management working
- [ ] Premium content properly gated
- [ ] Admin dashboard complete
- [ ] User profile and settings functional
- [ ] Email notifications working
- [ ] Legal pages published
- [ ] GDPR compliance implemented
- [ ] Security best practices followed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Phase 5 merged to main and deployed

---

**Notes**:
- Start with test mode in Stripe
- Consider offering a free trial to boost conversions
- Monitor conversion funnel closely
- Get legal review of Terms/Privacy Policy
- Test with real users before going live
