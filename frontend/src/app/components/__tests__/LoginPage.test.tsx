import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LoginPage } from '../LoginPage';
import { AppProvider } from '@/app/context/AppContext';
import * as api from '@/app/services/api';

// Mock the API module
vi.mock('@/app/services/api', () => ({
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn(() => null),
  authApi: {
    login: vi.fn(),
    forgotPassword: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  storeApi: {
    getStore: vi.fn(),
  },
  ingredientsApi: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
  recipesApi: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
  salesApi: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
  wastageApi: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
  forecastApi: {
    get: vi.fn(() => Promise.resolve([])),
    getAll: vi.fn(() => Promise.resolve([])),
    getHolidays: vi.fn(() => Promise.resolve([])),
    getWeather: vi.fn(() => Promise.resolve(null)),
  },
  usersApi: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginPage', () => {
  const mockOnNavigateToRegister = vi.fn();
  const mockOnLoginSuccess = vi.fn();

  const renderWithProviders = (props = {}) => {
    return render(
      <AppProvider>
        <LoginPage
          onNavigateToRegister={mockOnNavigateToRegister}
          onLoginSuccess={mockOnLoginSuccess}
          {...props}
        />
      </AppProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form', () => {
      renderWithProviders();

      expect(screen.getByText('SmartSus Chef')).toBeInTheDocument();
      expect(screen.getByText('Demand Forecasting & Food Prep Recommendation')).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      renderWithProviders();

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
      expect(screen.getByText(/register as manager/i)).toBeInTheDocument();
    });

    it('should render logo icon', () => {
      renderWithProviders();

      // ChefHat icon should be present
      const logo = document.querySelector('.lucide-chef-hat');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Login Form Submission', () => {
    it('should call login function with correct credentials', async () => {
      const mockLogin = {
        token: 'test-token',
        user: {
          id: 'user-1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          role: 'manager',
          status: 'Active',
        },
        storeSetupRequired: false,
      };

      vi.mocked(api.authApi.login).mockResolvedValue(mockLogin);

      renderWithProviders();

      const user = userEvent.setup();
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(api.authApi.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should call onLoginSuccess callback on successful login', async () => {
      vi.mocked(api.authApi.login).mockResolvedValue({
        token: 'test-token',
        user: {
          id: 'user-1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          role: 'manager',
          status: 'Active',
        },
        storeSetupRequired: false,
      });

      renderWithProviders();

      const user = userEvent.setup();
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockOnLoginSuccess).toHaveBeenCalled();
      });
    });

    it('should display error message on failed login', async () => {
      vi.mocked(api.authApi.login).mockRejectedValue(new Error('Invalid credentials'));

      renderWithProviders();

      const user = userEvent.setup();
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should prevent submission with empty fields', async () => {
      renderWithProviders();

      const user = userEvent.setup();
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.click(loginButton);

      // Form validation should prevent API call
      expect(api.authApi.login).not.toHaveBeenCalled();
    });

    it('should disable button while loading', async () => {
      vi.mocked(api.authApi.login).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders();

      const user = userEvent.setup();
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Button should be disabled during loading
      expect(loginButton).toBeDisabled();

      await waitFor(() => {
        expect(loginButton).not.toBeDisabled();
      });
    });
  });

  describe('Forgot Password Flow', () => {
    it('should navigate to forgot password view', async () => {
      renderWithProviders();

      const user = userEvent.setup();
      const forgotPasswordLink = screen.getByText(/forgot password/i);

      await user.click(forgotPasswordLink);

      await waitFor(() => {
        expect(screen.getByText(/request password reset/i)).toBeInTheDocument();
      });
    });

    it('should submit forgot password request', async () => {
      vi.mocked(api.authApi.forgotPassword).mockResolvedValue({
        message: 'Password reset email sent',
      });

      renderWithProviders();

      const user = userEvent.setup();
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      await user.click(forgotPasswordLink);

      const emailInput = await screen.findByPlaceholderText(/email or username/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.authApi.forgotPassword).toHaveBeenCalledWith({
          emailOrUsername: 'test@example.com',
        });
      });
    });

    it('should show success message after password reset', async () => {
      vi.mocked(api.authApi.forgotPassword).mockResolvedValue({
        message: 'Password reset successfully',
      });

      renderWithProviders();

      const user = userEvent.setup();
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      await user.click(forgotPasswordLink);

      const emailInput = await screen.findByPlaceholderText(/email or username/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /password reset/i })).toBeInTheDocument();
      });
    });

    it('should return to login from success view', async () => {
      vi.mocked(api.authApi.forgotPassword).mockResolvedValue({
        message: 'Password reset successfully',
      });

      renderWithProviders();

      const user = userEvent.setup();
      
      // Go to forgot password
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      await user.click(forgotPasswordLink);

      // Submit reset request
      const emailInput = await screen.findByPlaceholderText(/email or username/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      await user.click(submitButton);

      // Wait for success view
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /password reset/i })).toBeInTheDocument();
      });

      // Return to login
      const returnButton = screen.getByRole('button', { name: /return to login/i });
      await user.click(returnButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onNavigateToRegister when sign up is clicked', async () => {
      renderWithProviders();

      const user = userEvent.setup();
      const signUpLink = screen.getByRole('button', { name: /register as manager/i });

      await user.click(signUpLink);

      expect(mockOnNavigateToRegister).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display server connection error', async () => {
      vi.mocked(api.authApi.login).mockRejectedValue(new Error('Network error'));

      renderWithProviders();

      const user = userEvent.setup();
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should clear error message on new attempt', async () => {
      vi.mocked(api.authApi.login)
        .mockRejectedValueOnce(new Error('Invalid credentials'))
        .mockResolvedValueOnce({
          token: 'test-token',
          user: {
            id: 'user-1',
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            role: 'manager',
            status: 'Active',
          },
          storeSetupRequired: false,
        });

      renderWithProviders();

      const user = userEvent.setup();
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      // First attempt - fail
      await user.type(usernameInput, 'wrong');
      await user.type(passwordInput, 'wrong');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Clear inputs
      await user.clear(usernameInput);
      await user.clear(passwordInput);

      // Second attempt - success
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });
  });
});
