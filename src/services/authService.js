/**
 * Authentication Service
 * Handles login, register, logout, and user session management
 */

import axiosInstance from './axios';

/**
 * Register a new user
 * @param {Object} userData - {email, password}
 * @returns {Promise<Object>} User data
 */
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - {email, password}
 * @returns {Promise<Object>} {access_token, token_type}
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);

  if (response.data.access_token) {
    // Store token in localStorage
    localStorage.setItem('token', response.data.access_token);
  }

  return response.data;
};

/**
 * Get current user info
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

/**
 * Logout user
 * Clears token and user data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored token
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};
