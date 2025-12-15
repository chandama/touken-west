// Configure axios CSRF interceptors before any other imports
import './config/axios.js';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import LibraryApp from './library/LibraryApp.jsx';
import ProvincesApp from './provinces/ProvincesApp.jsx';

// Check which route we're on
const isAdminRoute = window.location.pathname.startsWith('/admin');
const isLibraryRoute = window.location.pathname.startsWith('/library');
const isProvincesRoute = window.location.pathname.startsWith('/provinces');

// Determine which app to render
const getAppComponent = () => {
  if (isAdminRoute) return <AdminApp />;
  if (isLibraryRoute) return <LibraryApp />;
  if (isProvincesRoute) return <ProvincesApp />;
  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {getAppComponent()}
  </React.StrictMode>
);
