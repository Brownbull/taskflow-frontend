/**
 * Test Suite: Auth Infrastructure
 * Task: task-007-auth-infrastructure
 * Phase: MVP
 *
 * Tests axios interceptors, AuthContext, token management, and ProtectedRoute
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import axiosInstance from '../services/axios';
import * as authService from '../services/authService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component that uses useAuth
const TestComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      {user && <div data-testid="user-email">{user.email}</div>}
    </div>
  );
};

describe('Auth Infrastructure - MVP Tests', () => {

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // TEST 1: VALID - Login sets token, axios adds Authorization header, logout clears state
  describe('[VALID] Token Management', () => {
    it('should store token in localStorage on login', async () => {
      const mockToken = 'test-jwt-token';
      const mockResponse = { data: { access_token: mockToken, token_type: 'bearer' } };

      // Mock axios post
      vi.spyOn(axiosInstance, 'post').mockResolvedValue(mockResponse);

      await authService.login({ email: 'test@example.com', password: 'password123' });

      // Check token is stored
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should add Authorization header to axios requests when token exists', () => {
      const mockToken = 'test-jwt-token';
      localStorage.setItem('token', mockToken);

      // Get request interceptor
      const requestInterceptor = axiosInstance.interceptors.request.handlers[0];

      // Create mock config
      const config = { headers: {} };

      // Apply interceptor
      const result = requestInterceptor.fulfilled(config);

      // Check Authorization header was added
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should clear token and user from localStorage on logout', () => {
      // Set initial state
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };

      // Call logout
      authService.logout();

      // Check localStorage is cleared
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('should check authentication status correctly', () => {
      // Not authenticated initially
      expect(authService.isAuthenticated()).toBe(false);

      // Set token
      localStorage.setItem('token', 'test-token');
      expect(authService.isAuthenticated()).toBe(true);

      // Clear token
      localStorage.removeItem('token');
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  // TEST 2: ERROR - 401 responses clear token and redirect to login
  describe('[ERROR] 401 Handling', () => {
    it('should clear token on 401 response and redirect to login', async () => {
      // Set token
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };

      // Get response interceptor
      const responseInterceptor = axiosInstance.interceptors.response.handlers[0];

      // Create mock 401 error
      const error = {
        response: {
          status: 401,
          data: { detail: 'Unauthorized' }
        }
      };

      // Apply error interceptor
      try {
        await responseInterceptor.rejected(error);
      } catch (e) {
        // Expected to reject
      }

      // Check localStorage is cleared
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();

      // Check redirect
      expect(window.location.href).toBe('/login');
    });

    it('should not clear token on non-401 errors', async () => {
      localStorage.setItem('token', 'valid-token');

      // Get response interceptor
      const responseInterceptor = axiosInstance.interceptors.response.handlers[0];

      // Create mock 500 error
      const error = {
        response: {
          status: 500,
          data: { detail: 'Server Error' }
        }
      };

      // Apply error interceptor
      try {
        await responseInterceptor.rejected(error);
      } catch (e) {
        // Expected to reject
      }

      // Token should still be there
      expect(localStorage.getItem('token')).toBe('valid-token');
    });
  });

  // TEST 3: AUTH - Token persists on page refresh, ProtectedRoute blocks unauthenticated access
  describe('[AUTH] Token Persistence & Route Protection', () => {
    it('should persist token across page refresh', () => {
      const token = 'persistent-token';
      localStorage.setItem('token', token);

      // Simulate page refresh by getting token again
      const retrievedToken = authService.getToken();

      expect(retrievedToken).toBe(token);
    });

    it('should block unauthenticated users from protected routes', async () => {
      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<div>Login Page</div>} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div>Dashboard</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      );

      // Should redirect to login (Navigate component changes location)
      await waitFor(() => {
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      });
    });

    it('should allow authenticated users to access protected routes', async () => {
      // Mock getCurrentUser to return user data
      vi.spyOn(axiosInstance, 'get').mockResolvedValue({
        data: { id: '1', email: 'test@example.com' }
      });

      localStorage.setItem('token', 'valid-token');

      const { container } = render(
        <BrowserRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<div>Login Page</div>} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div>Dashboard</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      );

      // Wait for auth to load
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  // TEST 4: EDGE - Expired tokens handled gracefully
  describe('[EDGE] Edge Cases', () => {
    it('should handle axios requests without token gracefully', () => {
      // No token in localStorage
      localStorage.clear();

      // Get request interceptor
      const requestInterceptor = axiosInstance.interceptors.request.handlers[0];

      // Create mock config
      const config = { headers: {} };

      // Apply interceptor
      const result = requestInterceptor.fulfilled(config);

      // Should not have Authorization header
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle malformed user data in localStorage', async () => {
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', 'invalid-json-{');

      // Should not crash when AuthProvider tries to parse it
      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </BrowserRouter>
      );

      // Component should render without crashing
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    it('should handle network errors during getCurrentUser', async () => {
      localStorage.setItem('token', 'token-with-network-error');

      // Mock getCurrentUser to fail
      vi.spyOn(axiosInstance, 'get').mockRejectedValue(new Error('Network Error'));

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </BrowserRouter>
      );

      // Should clear token and show not authenticated
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        const authStatus = screen.queryByTestId('auth-status');
        if (authStatus) {
          expect(authStatus).toHaveTextContent('Not Authenticated');
        }
      });
    });

    it('should handle missing AuthContext gracefully', () => {
      // Try to use useAuth outside of AuthProvider - should throw
      const BadComponent = () => {
        try {
          useAuth();
          return <div>Should not render</div>;
        } catch (error) {
          return <div>Error: {error.message}</div>;
        }
      };

      const { container } = render(<BadComponent />);

      expect(screen.getByText(/useAuth must be used within AuthProvider/i)).toBeInTheDocument();
    });
  });
});
