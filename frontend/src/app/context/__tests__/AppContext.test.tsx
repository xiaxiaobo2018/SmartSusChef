import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppProvider, useAppContext } from '../AppContext';
import * as api from '@/app/services/api';

// Mock the API module with factory function
vi.mock('@/app/services/api', () => ({
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn(() => null),
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  storeApi: {
    get: vi.fn(),
    getStatus: vi.fn(),
    setup: vi.fn(),
    update: vi.fn(),
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
    getHolidays: vi.fn(() => Promise.resolve([])),
    getWeather: vi.fn(() => Promise.resolve(null)),
  },
  usersApi: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
}));

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementations
    vi.mocked(api.setAuthToken).mockImplementation(() => {});
    vi.mocked(api.getAuthToken).mockReturnValue(null);
    vi.mocked(api.authApi.login).mockResolvedValue({
      token: 'test-token',
      user: { 
        id: 'user-1', 
        username: 'testuser', 
        name: 'Test User',
        email: 'test@example.com',
        role: 'manager',
        status: 'Active'
      },
      storeSetupRequired: false,
    });
    vi.mocked(api.authApi.register).mockResolvedValue({
      token: 'test-token',
      user: { 
        id: 'user-1', 
        username: 'testuser', 
        name: 'Test User',
        email: 'test@example.com',
        role: 'manager',
        status: 'Active'
      },
      storeSetupRequired: false,
    });
    vi.mocked(api.authApi.getCurrentUser).mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      role: 'manager',
      status: 'Active'
    });
    vi.mocked(api.storeApi.get).mockResolvedValue(null);
    vi.mocked(api.ingredientsApi.getAll).mockResolvedValue([]);
    vi.mocked(api.recipesApi.getAll).mockResolvedValue([]);
    vi.mocked(api.salesApi.getAll).mockResolvedValue([]);
    vi.mocked(api.wastageApi.getAll).mockResolvedValue([]);
    vi.mocked(api.forecastApi.get).mockResolvedValue([]);
    vi.mocked(api.forecastApi.getHolidays).mockResolvedValue([]);
    vi.mocked(api.forecastApi.getWeather).mockResolvedValue(null);
    vi.mocked(api.usersApi.getAll).mockResolvedValue([]);
  });

  describe('Provider Rendering', () => {
    it('should render children', () => {
      render(
        <AppProvider>
          <div>Test Child</div>
        </AppProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide context to children', () => {
      const TestComponent = () => {
        const context = useAppContext();
        return <div>{context ? 'Context Available' : 'No Context'}</div>;
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByText('Context Available')).toBeInTheDocument();
    });
  });

  describe('useAppContext Hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleError.mockRestore();
    });

    it('should return context when used inside provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.login).toBeInstanceOf(Function);
      expect(result.current.logout).toBeInstanceOf(Function);
    });
  });

  describe('Authentication', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    describe('login', () => {
      it('should call authApi.login and set user on success', async () => {
        const mockUser = {
          id: 'user-1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          role: 'manager',
          status: 'Active',
        };

        vi.mocked(api.authApi.login).mockResolvedValue({
          token: 'test-token',
          user: mockUser,
          storeSetupRequired: false,
        });

        const { result } = renderHook(() => useAppContext(), { wrapper });

        let loginResult;
        await act(async () => {
          loginResult = await result.current.login('testuser', 'password123');
        });

        expect(api.authApi.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
        expect(api.setAuthToken).toHaveBeenCalledWith('test-token');
        expect(loginResult).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      it('should return false on login failure', async () => {
        vi.mocked(api.authApi.login).mockRejectedValue(new Error('Invalid credentials'));

        const { result } = renderHook(() => useAppContext(), { wrapper });

        let loginResult;
        await act(async () => {
          loginResult = await result.current.login('testuser', 'wrongpassword');
        });

        expect(loginResult).toBe(false);
        expect(result.current.user).toBeNull();
      });

      it('should set storeSetupRequired flag', async () => {
        vi.mocked(api.authApi.login).mockResolvedValue({
          token: 'test-token',
          user: {
            id: 'user-1',
            username: 'newuser',
            name: 'New User',
            email: 'new@example.com',
            role: 'manager',
            status: 'Active',
          },
          storeSetupRequired: true,
        });

        const { result } = renderHook(() => useAppContext(), { wrapper });

        await act(async () => {
          await result.current.login('newuser', 'password123');
        });

        expect(result.current.storeSetupRequired).toBe(true);
      });
    });

    describe('logout', () => {
      it('should clear user and token', async () => {
        const mockUser = {
          id: 'user-1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          role: 'manager',
          status: 'Active',
        };

        vi.mocked(api.authApi.login).mockResolvedValue({
          token: 'test-token',
          user: mockUser,
          storeSetupRequired: false,
        });

        const { result } = renderHook(() => useAppContext(), { wrapper });

        // Login first
        await act(async () => {
          await result.current.login('testuser', 'password123');
        });

        expect(result.current.user).toEqual(mockUser);

        // Then logout
        act(() => {
          result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(api.setAuthToken).toHaveBeenCalledWith(null);
      });
    });

    describe('register', () => {
      it('should call authApi.register and return success', async () => {
        const mockUser = {
          id: 'user-2',
          username: 'newuser',
          name: 'New User',
          email: 'new@example.com',
          role: 'employee',
          status: 'Active',
        };

        vi.mocked(api.authApi.register).mockResolvedValue({
          token: 'new-token',
          user: mockUser,
          storeSetupRequired: true,
        });

        const { result } = renderHook(() => useAppContext(), { wrapper });

        let registerResult;
        await act(async () => {
          registerResult = await result.current.register(
            'newuser',
            'password123',
            'New User',
            'new@example.com'
          );
        });

        expect(api.authApi.register).toHaveBeenCalledWith({
          username: 'newuser',
          password: 'password123',
          name: 'New User',
          email: 'new@example.com',
        });
        expect(registerResult).toEqual({
          success: true,
          storeSetupRequired: true,
        });
        expect(result.current.user).toEqual(mockUser);
      });

      it('should return error on registration failure', async () => {
        vi.mocked(api.authApi.register).mockRejectedValue(
          new Error('Username already exists')
        );

        const { result } = renderHook(() => useAppContext(), { wrapper });

        let registerResult;
        await act(async () => {
          registerResult = await result.current.register(
            'duplicate',
            'password123',
            'User',
            'email@example.com'
          );
        });

        expect(registerResult).toEqual({
          success: false,
          storeSetupRequired: false,
          error: 'Username already exists',
        });
        expect(result.current.user).toBeNull();
      });
    });
  });

  describe('Initial State', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    it('should have initial state with null user', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.storeSetupRequired).toBe(false);
    });

    it('should have empty arrays for data', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.ingredients).toEqual([]);
      expect(result.current.recipes).toEqual([]);
      expect(result.current.salesData).toEqual([]);
      expect(result.current.wastageData).toEqual([]);
      expect(result.current.forecastData).toEqual([]);
    });

    it('should have empty store settings', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.storeSettings).toBeDefined();
      expect(result.current.storeSettings.storeId).toBe('');
      expect(result.current.storeSettings.companyName).toBe('');
    });
  });

  describe('Context Methods', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Auth methods
      expect(result.current.login).toBeInstanceOf(Function);
      expect(result.current.logout).toBeInstanceOf(Function);
      expect(result.current.register).toBeInstanceOf(Function);
      expect(result.current.updateProfile).toBeInstanceOf(Function);
      expect(result.current.changePassword).toBeInstanceOf(Function);

      // Store methods
      expect(result.current.setupStore).toBeInstanceOf(Function);
      expect(result.current.updateStoreSettings).toBeInstanceOf(Function);

      // Data methods
      expect(result.current.addIngredient).toBeInstanceOf(Function);
      expect(result.current.addRecipe).toBeInstanceOf(Function);
      expect(result.current.addSalesData).toBeInstanceOf(Function);
      expect(result.current.addWastageData).toBeInstanceOf(Function);
      expect(result.current.refreshData).toBeInstanceOf(Function);
    });
  });
});
