import React, { useState } from 'react';
import DarkModeToggle from './DarkModeToggle.jsx';

/**
 * Shared Header component for all pages
 *
 * Props:
 * - variant: 'main' | 'subpage' - header style
 * - currentPage: 'database' | 'library' | 'articles' | 'provinces' | 'chronology' | 'admin' | 'account'
 * - subtitle: string - subtitle text for subpage variant
 * - swordCount: number - for main page subtitle (optional)
 * - user: object | null - current user
 * - canAccessLibrary: boolean - whether user can access library
 * - isDarkMode: boolean
 * - onToggleDarkMode: function
 * - onLoginClick: function - callback when login button clicked
 * - onLogout: function - callback for logout
 */
function Header({
  variant = 'subpage',
  currentPage = '',
  subtitle = '',
  swordCount,
  user,
  canAccessLibrary = false,
  isDarkMode,
  onToggleDarkMode,
  onLoginClick,
  onLogout
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowUserDropdown(false);
  };

  const isToolsPage = currentPage === 'provinces' || currentPage === 'chronology';

  // Check if user is admin or editor
  const isAdminOrEditor = user && (user.role === 'admin' || user.role === 'editor');

  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile ? 'mobile-nav-link' : 'header-nav-link';

    if (isMobile) {
      return (
        <>
          {currentPage === 'database' ? (
            <span className={`${linkClass} active`}>Sword Database</span>
          ) : (
            <a href="/" className={linkClass}>Sword Database</a>
          )}
          {canAccessLibrary && (
            currentPage === 'library' ? (
              <span className={`${linkClass} active`}>Digital Library</span>
            ) : (
              <a href="/library" className={linkClass}>Digital Library</a>
            )
          )}
          {currentPage === 'articles' ? (
            <span className={`${linkClass} active`}>Articles</span>
          ) : (
            <a href="/articles" className={linkClass}>Articles</a>
          )}
          {/* Tools as a group in mobile */}
          <div className="mobile-nav-group">
            <span className="mobile-nav-group-label">Tools</span>
            {currentPage === 'provinces' ? (
              <span className={`${linkClass} mobile-nav-sublink active`}>Province Map</span>
            ) : (
              <a href="/provinces" className={`${linkClass} mobile-nav-sublink`}>Province Map</a>
            )}
            {currentPage === 'chronology' ? (
              <span className={`${linkClass} mobile-nav-sublink active`}>Gokaden Timeline</span>
            ) : (
              <a href="/chronology" className={`${linkClass} mobile-nav-sublink`}>Gokaden Timeline</a>
            )}
          </div>
          {user && (
            <>
              <hr className="mobile-menu-divider" />
              <a href="/account" className={linkClass}>My Account</a>
              {isAdminOrEditor && (
                <a href="/admin" className={linkClass}>Admin Panel</a>
              )}
            </>
          )}
        </>
      );
    }

    // Desktop nav links
    return (
      <>
        {currentPage === 'database' ? (
          <span className={`${linkClass} active`}>Sword Database</span>
        ) : (
          <a href="/" className={linkClass}>Sword Database</a>
        )}
        {canAccessLibrary && (
          currentPage === 'library' ? (
            <span className={`${linkClass} active`}>Digital Library</span>
          ) : (
            <a href="/library" className={linkClass}>Digital Library</a>
          )
        )}
        {currentPage === 'articles' ? (
          <span className={`${linkClass} active`}>Articles</span>
        ) : (
          <a href="/articles" className={linkClass}>Articles</a>
        )}
        {/* Tools dropdown */}
        <div className="tools-menu">
          <button
            className="header-nav-link tools-menu-button"
            onClick={() => setShowToolsDropdown(!showToolsDropdown)}
            aria-label="Tools menu"
            aria-expanded={showToolsDropdown}
          >
            Tools
            <svg viewBox="0 0 24 24" fill="currentColor" className="tools-menu-arrow">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
          {showToolsDropdown && (
            <>
              <div className="tools-dropdown-backdrop" onClick={() => setShowToolsDropdown(false)} />
              <div className="tools-dropdown">
                <a href="/provinces" className="tools-dropdown-item">Province Map</a>
                <a href="/chronology" className="tools-dropdown-item">Gokaden Timeline</a>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const renderUserMenu = () => {
    if (user) {
      return (
        <div className="user-menu">
          <button
            className="user-avatar-button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            aria-label="User menu"
            aria-expanded={showUserDropdown}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="user-avatar-icon">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
          {showUserDropdown && (
            <>
              <div className="user-dropdown-backdrop" onClick={() => setShowUserDropdown(false)} />
              <div className="user-dropdown">
                <div className="user-dropdown-email">{user.username || user.email}</div>
                <a href="/account" className="user-dropdown-item">My Account</a>
                {isAdminOrEditor && (
                  <a href="/admin" className="user-dropdown-admin">Admin Panel</a>
                )}
                <button onClick={handleLogout} className="user-dropdown-logout">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    // Not logged in - show login button with profile icon
    return (
      <button onClick={onLoginClick} className="login-button-with-icon">
        <svg viewBox="0 0 24 24" fill="currentColor" className="login-icon">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span className="login-text">Login</span>
      </button>
    );
  };

  if (variant === 'main') {
    return (
      <header className="App-header">
        <div className="header-content">
          {/* Left side: Mobile hamburger + Logo + Title */}
          <div className="header-left">
            {/* Mobile hamburger menu - shown on mobile only */}
            <div className="mobile-menu mobile-menu-left">
              <button
                className="mobile-menu-button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Navigation menu"
                aria-expanded={showMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="mobile-menu-icon">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
              </button>
              {showMobileMenu && (
                <>
                  <div className="mobile-menu-backdrop" onClick={() => setShowMobileMenu(false)} />
                  <div className="mobile-menu-dropdown mobile-menu-dropdown-left">
                    {renderNavLinks(true)}
                  </div>
                </>
              )}
            </div>
            <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="header-logo" />
            <div className="header-title-group">
              <h1>Touken West - Nihontō Database</h1>
              <p>Japanese Sword Database - {(swordCount || 0).toLocaleString()} Historical Blades</p>
            </div>
          </div>
          {/* Right side: Nav links + Dark mode + User menu */}
          <div className="header-actions">
            {/* Desktop nav links */}
            {renderNavLinks(false)}
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            {renderUserMenu()}
          </div>
        </div>
      </header>
    );
  }

  // Subpage variant
  return (
    <header className="subpage-header">
      <div className="subpage-header-content">
        {/* Left side: Mobile hamburger + Logo + Title */}
        <div className="subpage-header-left">
          {/* Mobile hamburger menu - shown on mobile only */}
          <div className="mobile-menu mobile-menu-left">
            <button
              className="mobile-menu-button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Navigation menu"
              aria-expanded={showMobileMenu}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="mobile-menu-icon">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            {showMobileMenu && (
              <>
                <div className="mobile-menu-backdrop" onClick={() => setShowMobileMenu(false)} />
                <div className="mobile-menu-dropdown mobile-menu-dropdown-left">
                  {renderNavLinks(true)}
                </div>
              </>
            )}
          </div>
          <a href="/">
            <img src="/shimazu-mon.svg" alt="Shimazu Clan Mon" className="subpage-header-logo" />
          </a>
          <div className="subpage-header-title">
            <h1>Touken West - Nihontō Database</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        {/* Right side: Nav links + Dark mode + User menu */}
        <div className="subpage-header-actions">
          {/* Desktop nav links */}
          {renderNavLinks(false)}
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          {renderUserMenu()}
        </div>
      </div>
    </header>
  );
}

export default Header;
