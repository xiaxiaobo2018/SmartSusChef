import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreSetupPage } from '../StoreSetupPage';

const setupStoreMock = vi.fn();

vi.mock('@/app/context/AppContext', () => ({
  useApp: () => ({
    setupStore: setupStoreMock,
    user: { name: 'Jane Doe' },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('StoreSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders store setup form', () => {
    render(<StoreSetupPage />);
    expect(screen.getByText('SmartSus Chef')).toBeInTheDocument();
    expect(screen.getByText(/welcome, jane doe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/store name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/outlet location/i)).toBeInTheDocument();
  });

  it('validates required store name', async () => {
    render(<StoreSetupPage />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /complete store setup/i }));
    expect(await screen.findByText(/store name is required/i)).toBeInTheDocument();
    expect(setupStoreMock).not.toHaveBeenCalled();
  });

  it('validates latitude range', async () => {
    render(<StoreSetupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/store name/i), 'SmartSus Kitchen');
    await user.type(screen.getByLabelText(/latitude/i), '200');
    await user.click(screen.getByRole('button', { name: /complete store setup/i }));
    expect(await screen.findByText(/latitude must be between -90 and 90/i)).toBeInTheDocument();
    expect(setupStoreMock).not.toHaveBeenCalled();
  });

  it('validates longitude range', async () => {
    render(<StoreSetupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/store name/i), 'SmartSus Kitchen');
    await user.type(screen.getByLabelText(/longitude/i), '200');
    await user.click(screen.getByRole('button', { name: /complete store setup/i }));
    expect(await screen.findByText(/longitude must be between -180 and 180/i)).toBeInTheDocument();
    expect(setupStoreMock).not.toHaveBeenCalled();
  });

  it('submits setupStore with parsed coordinates', async () => {
    setupStoreMock.mockResolvedValue(undefined);
    render(<StoreSetupPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/store name/i), 'SmartSus Kitchen');
    await user.type(screen.getByLabelText(/company name/i), 'SmartSus Pte Ltd');
    await user.type(screen.getByLabelText(/uen/i), '202012345A');
    await user.type(screen.getByLabelText(/contact number/i), '+65 6123 4567');
    await user.type(screen.getByLabelText(/outlet location/i), 'Orchard');
    await user.type(screen.getByLabelText(/full address/i), '123 Orchard Road');
    await user.type(screen.getByLabelText(/latitude/i), '1.3521');
    await user.type(screen.getByLabelText(/longitude/i), '103.8198');

    await user.click(screen.getByRole('button', { name: /complete store setup/i }));

    await waitFor(() => {
      expect(setupStoreMock).toHaveBeenCalledWith({
        storeName: 'SmartSus Kitchen',
        companyName: 'SmartSus Pte Ltd',
        uen: '202012345A',
        outletLocation: 'Orchard',
        address: '123 Orchard Road',
        contactNumber: '+65 6123 4567',
        latitude: 1.3521,
        longitude: 103.8198,
      });
    });
  });

  it('shows error when setupStore fails', async () => {
    setupStoreMock.mockRejectedValue(new Error('Failed'));
    render(<StoreSetupPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/store name/i), 'SmartSus Kitchen');
    await user.click(screen.getByRole('button', { name: /complete store setup/i }));

    expect(await screen.findByText(/failed to setup store/i)).toBeInTheDocument();
  });
});
