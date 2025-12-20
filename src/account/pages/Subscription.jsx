import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Subscription page - Shows current subscription status and upgrade options
 * This is a placeholder for future payment integration
 */
const Subscription = () => {
  const { user, canAccessLibrary } = useAuth();

  const getRoleInfo = (role) => {
    const info = {
      user: {
        name: 'Free',
        description: 'Basic access to the sword database',
        features: [
          'Browse sword database',
          'Search and filter swords',
          'View sword details (text only)',
          'Read published articles'
        ],
        color: '#666'
      },
      subscriber: {
        name: 'Subscriber',
        description: 'Full access to media and digital library',
        features: [
          'Everything in Free',
          'View high-resolution sword images',
          'Access Digital Library',
          'View media attachments',
          'Priority support'
        ],
        color: '#4caf50'
      },
      editor: {
        name: 'Editor',
        description: 'Content management access',
        features: [
          'Everything in Subscriber',
          'Create and edit articles',
          'Publish content',
          'Access admin dashboard'
        ],
        color: '#2196f3'
      },
      admin: {
        name: 'Administrator',
        description: 'Full system access',
        features: [
          'Everything in Editor',
          'Manage users',
          'Manage sword database',
          'Full admin access'
        ],
        color: '#9c27b0'
      }
    };
    return info[role] || info.user;
  };

  const currentPlan = getRoleInfo(user?.role);

  return (
    <div className="account-page">
      <h1>Subscription</h1>

      {/* Current Plan */}
      <div className="account-card">
        <div className="subscription-current">
          <div className="subscription-badge" style={{ backgroundColor: currentPlan.color }}>
            {currentPlan.name}
          </div>
          <h2>Current Plan</h2>
          <p className="account-card-desc">{currentPlan.description}</p>

          <ul className="subscription-features">
            {currentPlan.features.map((feature, index) => (
              <li key={index}>
                <span className="feature-check">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade Options (for non-subscribers) */}
      {user?.role === 'user' && (
        <div className="account-card highlight">
          <h2>Upgrade to Subscriber</h2>
          <p className="account-card-desc">
            Get full access to high-resolution sword images and the Digital Library.
          </p>

          <div className="subscription-upgrade">
            <ul className="subscription-features">
              <li>
                <span className="feature-check">✓</span>
                High-resolution sword images
              </li>
              <li>
                <span className="feature-check">✓</span>
                Full Digital Library access
              </li>
              <li>
                <span className="feature-check">✓</span>
                Media attachments on all swords
              </li>
              <li>
                <span className="feature-check">✓</span>
                Priority support
              </li>
            </ul>

            <div className="subscription-cta">
              <p className="coming-soon">
                Subscription plans coming soon!
              </p>
              <p className="coming-soon-desc">
                We're working on bringing you flexible subscription options.
                Check back later for updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Access Status */}
      <div className="account-card">
        <h2>Access Status</h2>
        <div className="access-status-list">
          <div className="access-status-item">
            <span className="access-label">Sword Database</span>
            <span className="access-value granted">✓ Full Access</span>
          </div>
          <div className="access-status-item">
            <span className="access-label">Digital Library</span>
            <span className={`access-value ${canAccessLibrary() ? 'granted' : 'denied'}`}>
              {canAccessLibrary() ? '✓ Full Access' : '✕ Subscriber Required'}
            </span>
          </div>
          <div className="access-status-item">
            <span className="access-label">Media Attachments</span>
            <span className={`access-value ${canAccessLibrary() ? 'granted' : 'denied'}`}>
              {canAccessLibrary() ? '✓ Full Access' : '✕ Subscriber Required'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
