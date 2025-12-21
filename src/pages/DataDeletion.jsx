import React from 'react';
import Footer from '../components/Footer';
import DarkModeToggle from '../components/DarkModeToggle';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import '../styles/StaticPage.css';

const SITE_URL = 'https://nihonto-db.com';

const DataDeletion = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Set meta tags for SEO
  useDocumentMeta({
    title: 'Data Deletion - Nihonto DB',
    description: 'Request deletion of your personal data from Nihonto DB. Instructions for removing your account and associated information.',
    canonicalUrl: `${SITE_URL}/data-deletion`,
    ogType: 'website'
  });

  return (
    <div className="static-page">
      <header className="static-header">
        <div className="header-content">
          <a href="/" className="header-logo-link">
            <img src="/shimazu-mon.svg" alt="Nihonto DB" className="header-logo" />
            <span className="header-title">Nihonto DB</span>
          </a>
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
        </div>
      </header>

      <main className="static-content">
        <h1>Data Deletion Request</h1>

        <section>
          <h2>How to Delete Your Data</h2>
          <p>
            We respect your right to control your personal data. You can delete your
            account and all associated data at any time using one of the following methods:
          </p>

          <h3>Option 1: Self-Service Deletion (Recommended)</h3>
          <ol>
            <li>Log in to your Nihonto DB account</li>
            <li>Go to <a href="/account/settings">Account Settings</a></li>
            <li>Scroll to the "Delete Account" section</li>
            <li>Click "Delete Account" and confirm</li>
          </ol>
          <p>
            This will immediately and permanently delete your account and all personal data.
          </p>

          <h3>Option 2: Email Request</h3>
          <p>
            If you cannot access your account or prefer to request deletion via email,
            send a request to: <a href="mailto:support@nihonto-db.com">support@nihonto-db.com</a>
          </p>
          <p>
            Please include the email address associated with your account. We will process
            your request within 30 days and confirm once complete.
          </p>
        </section>

        <section>
          <h2>What Data Is Deleted</h2>
          <p>When you delete your account, we remove:</p>
          <ul>
            <li>Your account profile (email, username, display name)</li>
            <li>Authentication credentials</li>
            <li>OAuth connections (Google, Facebook links)</li>
            <li>Account settings and preferences</li>
          </ul>
        </section>

        <section>
          <h2>Data Retention After Deletion</h2>
          <p>
            After account deletion, your personal data is permanently removed from our
            active databases. Some data may be retained in encrypted backups for up to
            30 days before being permanently purged.
          </p>
        </section>

        <section>
          <h2>Facebook Users</h2>
          <p>
            If you signed up using Facebook, deleting your Nihonto DB account will remove
            the connection between your Facebook account and Nihonto DB. To also revoke
            app permissions on Facebook's end, visit your
            <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer">
              {' '}Facebook App Settings
            </a>.
          </p>
        </section>

        <section>
          <h2>Questions?</h2>
          <p>
            If you have questions about data deletion or your privacy rights, please
            contact us at: <a href="mailto:support@nihonto-db.com">support@nihonto-db.com</a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DataDeletion;
