// Configure axios CSRF interceptors before any other imports
import './config/axios.js';

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

// Lazy load all app bundles - each becomes a separate chunk
const App = lazy(() => import('./App.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
const LibraryApp = lazy(() => import('./library/LibraryApp.jsx'));
const ProvincesApp = lazy(() => import('./provinces/ProvincesApp.jsx'));
const ArticlesApp = lazy(() => import('./articles/ArticlesApp.jsx'));
const ChronologyApp = lazy(() => import('./chronology/ChronologyApp.jsx'));
const AccountApp = lazy(() => import('./account/AccountApp.jsx'));
const OAuthCallback = lazy(() => import('./components/OAuthCallback.jsx'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail.jsx'));

// Static pages
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const DataDeletion = lazy(() => import('./pages/DataDeletion.jsx'));
const Acknowledgements = lazy(() => import('./pages/Acknowledgements.jsx'));

// Simple loading spinner
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Check which route we're on
const isAdminRoute = window.location.pathname.startsWith('/admin');
const isLibraryRoute = window.location.pathname.startsWith('/library');
const isProvincesRoute = window.location.pathname.startsWith('/provinces');
const isArticlesRoute = window.location.pathname.startsWith('/articles');
const isChronologyRoute = window.location.pathname.startsWith('/chronology');
const isAccountRoute = window.location.pathname.startsWith('/account');
const isOAuthCallback = window.location.pathname.startsWith('/auth/callback');
const isVerifyEmail = window.location.pathname.startsWith('/verify-email');
const isPrivacy = window.location.pathname === '/privacy';
const isDataDeletion = window.location.pathname === '/data-deletion';
const isAcknowledgements = window.location.pathname === '/acknowledgements';

// Determine which app to render
const getAppComponent = () => {
  if (isOAuthCallback) return <OAuthCallback />;
  if (isVerifyEmail) return <VerifyEmail />;
  if (isPrivacy) return <Privacy />;
  if (isDataDeletion) return <DataDeletion />;
  if (isAcknowledgements) return <Acknowledgements />;
  if (isAccountRoute) return <AccountApp />;
  if (isAdminRoute) return <AdminApp />;
  if (isLibraryRoute) return <LibraryApp />;
  if (isProvincesRoute) return <ProvincesApp />;
  if (isArticlesRoute) return <ArticlesApp />;
  if (isChronologyRoute) return <ChronologyApp />;
  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      {getAppComponent()}
    </Suspense>
  </React.StrictMode>
);
