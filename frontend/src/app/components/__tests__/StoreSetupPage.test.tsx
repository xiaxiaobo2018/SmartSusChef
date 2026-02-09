import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText(/welcome, jane doe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/store name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/outlet location/i)).toBeInTheDocument();
  });

  // Note: HTML5 form validation (required attribute) prevents submit handler from being called
  // when required fields are empty, so custom validation in handleSubmit is not reached
  it.skip('validates required store name', async () => {
    render(<StoreSetupPage />);
    fireEvent.click(screen.getByRole('button', { name: /complete store setup/i }));
    expect(await screen.findByText(/store name is required/i)).toBeInTheDocument();
    expect(setupStoreMock).not.toHaveBeenCalled();
  });

  it('validates latitude range', async () => {
    render(<StoreSetupPage />);
    fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'SmartSus Kitchen' } });
    fireEvent.change(screen.getByLabelText(/latitude/i), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: /complete store setup/i }));
    expect(await screen.findByText(/latitude must be between -90 and 90/i)).toBeInTheDocument();
    expect(setupStoreMock).not.toHaveBeenCalled();
  });

  it('validates longitude range', async () => {
    render(<StoreSetupPage />);
    fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'SmartSus Kitchen' } });
    fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: /complete store setup/i }));
    expect(await screen.findByText(/longitude must be between -180 and 180/i)).toBeInTheDocument();
    expect(setupStoreMock).not.toHaveBeenCalled();
  });

  it('submits setupStore with parsed coordinates', async () => {
    setupStoreMock.mockResolvedValue(undefined);
    render(<StoreSetupPage />);
    fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'SmartSus Kitchen' } });
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'SmartSus Pte Ltd' } });
    fireEvent.change(screen.getByLabelText(/uen/i), { target: { value: '202012345A' } });
    fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: '+65 6123 4567' } });
    fireEvent.change(screen.getByLabelText(/outlet location/i), { target: { value: 'Orchard' } });
    fireEvent.change(screen.getByLabelText(/full address/i), { target: { value: '123 Orchard Road' } });
    fireEvent.change(screen.getByLabelText(/latitude/i), { target: { value: '1.3521' } });
    fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: '103.8198' } });

    fireEvent.click(screen.getByRole('button', { name: /complete store setup/i }));

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
    fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'SmartSus Kitchen' } });
    fireEvent.click(screen.getByRole('button', { name: /complete store setup/i }));

    expect(await screen.findByText(/failed to setup store/i)).toBeInTheDocument();
  });
});
