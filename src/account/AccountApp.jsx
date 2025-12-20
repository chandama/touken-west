import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AccountLayout from './components/AccountLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Security from './pages/Security';
import Subscription from './pages/Subscription';
import './styles/Account.css';

/**
 * Account management application
 * Handles user profile, settings, security, and subscription
 */
function AccountApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedRoute>
          <AccountLayout>
            <Routes>
              <Route path="/account" element={<Profile />} />
              <Route path="/account/profile" element={<Profile />} />
              <Route path="/account/settings" element={<Settings />} />
              <Route path="/account/security" element={<Security />} />
              <Route path="/account/subscription" element={<Subscription />} />
              <Route path="*" element={<Navigate to="/account" replace />} />
            </Routes>
          </AccountLayout>
        </ProtectedRoute>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AccountApp;
