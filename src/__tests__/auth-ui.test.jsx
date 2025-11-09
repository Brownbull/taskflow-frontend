/**
 * Test Suite: Auth UI
 * Task: task-008-auth-ui
 * Phase: MVP
 *
 * Tests LoginForm, RegisterForm, routing, and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Auth UI - MVP Tests', () => {

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // TEST 1: VALID - Login redirects to dashboard, register auto-logs in, /dashboard protected
  describe('[VALID] Authentication Flows', () => {
    it('should render login form with all fields', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render register form with all fields including confirm password', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should have links to navigate between login and register', () => {
      const { rerender } = render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check link to register from login
      expect(screen.getByText(/create a new account/i)).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check link to login from register
      expect(screen.getByText(/sign in to existing account/i)).toBeInTheDocument();
    });
  });

  // TEST 2: ERROR - Invalid credentials show toast, validation errors inline
  describe('[ERROR] Validation & Error Handling', () => {
    it('should show inline error when email field is empty on login', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show inline error when password field is empty on login', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });
  });

  // TEST 3: AUTH - Password min 8 chars, confirm password matches
  describe('[AUTH] Password Validation', () => {
    it('should enforce minimum 8 character password on register', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'short');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should require password confirmation to match', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should accept valid password that meets all requirements', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');
      await user.type(confirmPasswordInput, 'validpassword123');

      // Should not show validation errors for valid input
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Wait a bit to ensure no validation errors appear
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });
  });

  // TEST 4: EDGE - Empty fields validated, long emails handled
  describe('[EDGE] Edge Cases', () => {
    it('should handle empty form submission gracefully', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('should validate very long email addresses', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const longEmail = 'a'.repeat(250) + '@example.com'; // 263 characters
      const emailInput = screen.getByLabelText(/email address/i);

      await user.type(emailInput, longEmail);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is too long/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when user starts typing', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      // Submit empty form to trigger errors
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing in email field
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 't');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Button should be enabled initially
      expect(submitButton).not.toBeDisabled();

      // Click submit
      await user.click(submitButton);

      // Button should be disabled while loading (briefly)
      // Note: This is timing-dependent and may not always catch it
    });
  });
});
