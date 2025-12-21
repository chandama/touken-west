import React from 'react';
import Footer from '../components/Footer';
import DarkModeToggle from '../components/DarkModeToggle';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import '../styles/StaticPage.css';

const SITE_URL = 'https://nihonto-db.com';

const Privacy = () => {
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
    title: 'Privacy Policy - Nihonto DB',
    description: 'Privacy policy for Nihonto DB. Learn how we collect, use, and protect your personal information.',
    canonicalUrl: `${SITE_URL}/privacy`,
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
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: December 2025</p>

        <section>
          <h2>1. Information We Collect</h2>

          <h3>Account Information</h3>
          <ul>
            <li>Email address</li>
            <li>Username</li>
            <li>Password (stored encrypted)</li>
            <li>Display name (optional)</li>
          </ul>

          <h3>OAuth Data</h3>
          <p>If you sign in with Google or Facebook, we receive:</p>
          <ul>
            <li>Your name and email from the OAuth provider</li>
            <li>Profile picture URL (optional)</li>
          </ul>

          <h3>Usage Data</h3>
          <ul>
            <li>Pages visited</li>
            <li>Search queries</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To authenticate you when you log in</li>
            <li>To send verification and password reset emails</li>
            <li>To improve our service</li>
          </ul>
        </section>

        <section>
          <h2>3. Third-Party Services</h2>
          <p>We use these services that may process your data:</p>
          <ul>
            <li><strong>Google OAuth</strong> - for sign-in authentication</li>
            <li><strong>Facebook OAuth</strong> - for sign-in authentication</li>
            <li><strong>Resend</strong> - for sending transactional emails</li>
            <li><strong>MongoDB Atlas</strong> - database hosting</li>
            <li><strong>DigitalOcean</strong> - application hosting</li>
          </ul>
        </section>

        <section>
          <h2>4. Cookies</h2>
          <p>
            We use a single authentication cookie (<code>token</code>) to keep you logged in.
            This is a functional cookie required for the service to work. We do not use
            tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain your account data for as long as your account is active.
            When you delete your account, all associated data is permanently removed.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data (available in Account Settings)</li>
            <li>Update or correct your information</li>
            <li>Delete your account and all associated data</li>
            <li>Export your data upon request</li>
          </ul>
        </section>

        <section>
          <h2>7. Data Deletion</h2>
          <p>
            To delete your data, go to <a href="/account/settings">Account Settings</a> and
            click "Delete Account". This will permanently remove all your personal information
            from our systems.
          </p>
          <p>
            Alternatively, you can visit our <a href="/data-deletion">Data Deletion</a> page
            for more information.
          </p>
        </section>

        <section>
          <h2>8. Security</h2>
          <p>
            We implement industry-standard security measures including encrypted passwords,
            HTTPS encryption, and secure authentication tokens to protect your data.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this privacy policy or your personal data,
            please contact us at: <a href="mailto:support@nihonto-db.com">support@nihonto-db.com</a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
