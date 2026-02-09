import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { authApi } from '@/app/services/api';

const loginMock = vi.fn();

vi.mock('@/app/context/AppContext', () => ({
  useApp: () => ({
    login: loginMock,
  }),
}));

vi.mock('@/app/services/api', () => ({
  authApi: {
    forgotPassword: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginPage', () => {
  const mockOnNavigateToRegister = vi.fn();
  const mockOnLoginSuccess = vi.fn();

  const renderPage = (props = {}) =>
    render(
      <LoginPage
        onNavigateToRegister={mockOnNavigateToRegister}
        onLoginSuccess={mockOnLoginSuccess}
        {...props}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderPage();
    expect(screen.getByText('SmartSus Chef')).toBeInTheDocument();
    expect(screen.getByText('Demand Forecasting & Food Prep Recommendation')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows register link and triggers callback', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /register as manager/i }));
    expect(mockOnNavigateToRegister).toHaveBeenCalledTimes(1);
  });

  it('submits login and calls onLoginSuccess when successful', async () => {
    loginMock.mockResolvedValue(true);
    renderPage();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error when login returns false', async () => {
    loginMock.mockResolvedValue(false);
    renderPage();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/username/i), 'bad');
    await user.type(screen.getByLabelText(/password/i), 'bad');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('shows error when login throws', async () => {
    loginMock.mockRejectedValue(new Error('Network error'));
    renderPage();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/username/i), 'user');
    await user.type(screen.getByLabelText(/password/i), 'pass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/failed to connect to the server/i)).toBeInTheDocument();
  });

  it('disables sign in button while loading', async () => {
    let resolveLogin: (value: boolean) => void;
    const loginPromise = new Promise<boolean>((resolve) => {
      resolveLogin = resolve;
    });
    loginMock.mockReturnValue(loginPromise);

    renderPage();
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /sign in/i });

    await user.type(screen.getByLabelText(/username/i), 'test');
    await user.type(screen.getByLabelText(/password/i), 'test');
    await user.click(button);

    expect(button).toBeDisabled();
    resolveLogin!(true);
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('switches to forgot password view and submits request', async () => {
    vi.mocked(authApi.forgotPassword).mockResolvedValue({ message: 'Reset sent' });
    renderPage();

    const user = userEvent.setup();
    await user.click(screen.getByText(/forgot password/i));
    expect(screen.getByText(/request password reset/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/email or username/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith({ emailOrUsername: 'test@example.com' });
    });
  });

  it('shows success view after password reset and returns to login', async () => {
    vi.mocked(authApi.forgotPassword).mockResolvedValue({ message: 'Password reset successfully' });
    renderPage();

    const user = userEvent.setup();
    await user.click(screen.getByText(/forgot password/i));
    await user.type(screen.getByPlaceholderText(/email or username/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByRole('heading', { name: /password reset/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /return to login/i }));
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
