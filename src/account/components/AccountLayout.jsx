import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Layout wrapper for account pages
 * Includes navigation sidebar and header
 */
const AccountLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="account-container">
      <header className="account-header">
        <div className="account-header-content">
          <a href="/" className="account-logo">
            Nihonto DB
          </a>
          <div className="account-header-right">
            <span className="account-user-email">{user?.email}</span>
            <button onClick={handleLogout} className="account-logout-btn">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="account-body">
        <nav className="account-nav">
          <h3 className="account-nav-title">Account</h3>
          <ul className="account-nav-list">
            <li>
              <NavLink to="/account/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/account/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                Settings
              </NavLink>
            </li>
            <li>
              <NavLink to="/account/security" className={({ isActive }) => isActive ? 'active' : ''}>
                Security
              </NavLink>
            </li>
            <li>
              <NavLink to="/account/subscription" className={({ isActive }) => isActive ? 'active' : ''}>
                Subscription
              </NavLink>
            </li>
          </ul>

          <div className="account-nav-footer">
            <a href="/">← Back to Site</a>
          </div>
        </nav>

        <main className="account-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
