import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

const logoutMock = vi.fn();

vi.mock('@/app/context/AppContext', () => ({
  useApp: () => ({
    user: { name: 'Jane Doe', role: 'Manager' },
    logout: logoutMock,
    storeSettings: { storeName: 'SmartSus', outletLocation: 'Downtown' },
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it('renders app name and store context', () => {
    render(<Header />);
    expect(screen.getByText('SmartSus Chef')).toBeInTheDocument();
    expect(screen.getByText('SmartSus | Downtown')).toBeInTheDocument();
  });

  it('shows user name and role', () => {
    render(<Header />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('MANAGER')).toBeInTheDocument();
  });

  it('shows settings menu item and triggers callback', async () => {
    const user = userEvent.setup();
    const onNavigateToSettings = vi.fn();
    render(<Header onNavigateToSettings={onNavigateToSettings} showSettingsLink />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Settings'));

    expect(onNavigateToSettings).toHaveBeenCalledTimes(1);
  });

  it('does not show settings item when disabled', async () => {
    const user = userEvent.setup();
    render(<Header showSettingsLink={false} />);

    await user.click(screen.getByRole('button'));
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('calls logout when Log out is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Log out'));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
