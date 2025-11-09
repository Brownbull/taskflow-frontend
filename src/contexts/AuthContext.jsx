/**
 * AuthContext - Global Authentication State Management
 * Provides user authentication state and methods to entire app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as loginService, logout as logoutService, isAuthenticated } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isAuthenticated()) {
          const userData = await getCurrentUser();
          setUser(userData);

          // Store user in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        // If token is invalid, clear it
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user
   * @param {Object} credentials - {email, password}
   */
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      // Call login service
      const { access_token } = await loginService(credentials);

      // Get user info
      const userData = await getCurrentUser();
      setUser(userData);

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    logoutService();
  };

  /**
   * Update user state after registration
   * @param {Object} userData - User data
   */
  const setAuthUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setAuthUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default AuthContext;
