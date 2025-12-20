import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios.js';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Role hierarchy from lowest to highest privilege
const ROLE_HIERARCHY = ['user', 'subscriber', 'editor', 'admin'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState(null);

  // Check if user is authenticated on mount and fetch auth config
  useEffect(() => {
    checkAuth();
    fetchAuthConfig();
  }, []);

  const fetchAuthConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/config`);
      setAuthConfig(response.data);
    } catch (error) {
      console.error('Failed to fetch auth config:', error);
      setAuthConfig({ providers: [], captchaEnabled: false });
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
        code: error.response?.data?.code,
        authMethod: error.response?.data?.authMethod
      };
    }
  };

  const register = async (email, password, username, captchaToken = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        username,
        captchaToken
      });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
        code: error.response?.data?.code
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user anyway
      setUser(null);
    }
  };

  // OAuth login helpers - redirect to backend OAuth endpoints
  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const loginWithFacebook = () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  };

  // Role-based permission helpers
  const isAuthenticated = () => !!user;

  const hasRole = (requiredRole) => {
    if (!user) return false;
    const userLevel = ROLE_HIERARCHY.indexOf(user.role);
    const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
    if (userLevel === -1 || requiredLevel === -1) return false;
    return userLevel >= requiredLevel;
  };

  const isAdmin = () => user?.role === 'admin';
  const isEditor = () => hasRole('editor');
  const isSubscriber = () => hasRole('subscriber');

  // Permission checks
  const canAccessLibrary = () => hasRole('subscriber');
  const canAccessMedia = () => hasRole('subscriber');
  const canAccessAdmin = () => hasRole('editor');
  const canManageUsers = () => user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authConfig,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithFacebook,
        checkAuth,
        isAuthenticated,
        hasRole,
        isAdmin,
        isEditor,
        isSubscriber,
        canAccessLibrary,
        canAccessMedia,
        canAccessAdmin,
        canManageUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
