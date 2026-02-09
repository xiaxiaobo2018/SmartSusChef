import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterPage } from '../RegisterPage';

const registerMock = vi.fn();

vi.mock('@/app/context/AppContext', () => ({
  useApp: () => ({
    register: registerMock,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RegisterPage', () => {
  const onBackToLogin = vi.fn();
  const onRegisterSuccess = vi.fn();

  const renderPage = () =>
    render(
      <RegisterPage
        onBackToLogin={onBackToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    renderPage();
    expect(screen.getByText('SmartSus Chef')).toBeInTheDocument();
    expect(screen.getByText('Create a new manager account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('validates username length', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'ab');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('validates password mismatch', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('submits registration and calls onRegisterSuccess on success', async () => {
    registerMock.mockResolvedValue({ success: true, storeSetupRequired: false });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('testuser', 'Password123!', 'Test User', 'test@example.com');
      expect(onRegisterSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error on failed registration response', async () => {
    registerMock.mockResolvedValue({ success: false, storeSetupRequired: false, error: 'Username exists' });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/username exists/i)).toBeInTheDocument();
  });

  it('calls onBackToLogin when back button clicked', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /back to login/i }));
    expect(onBackToLogin).toHaveBeenCalledTimes(1);
  });
});
