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

// Determine which app to render
const getAppComponent = () => {
  if (isAdminRoute) return <AdminApp />;
  if (isLibraryRoute) return <LibraryApp />;
  if (isProvincesRoute) return <ProvincesApp />;
  if (isArticlesRoute) return <ArticlesApp />;
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
