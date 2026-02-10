import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppProvider, useAppContext } from '../AppContext';
import { AuthProvider, useAuth } from '../AuthContext';
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
    exportApi: {
        getSalesCsv: vi.fn(),
        getWastageCsv: vi.fn(),
        getForecastCsv: vi.fn(),
    },
}));

describe('AppContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock implementations
        vi.mocked(api.setAuthToken).mockImplementation(() => { });
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
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

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

    describe('Profile Management', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        beforeEach(() => {
            vi.mocked(api.authApi.login).mockResolvedValue({
                token: 'test-token',
                user: { id: '1', username: 'testuser', name: 'Test', email: 'test@test.com', role: 'Owner', status: 'Active' },
                storeSetupRequired: false,
            });
        });

        it('should update user profile', async () => {
            const updateProfileMock = vi.fn().mockResolvedValue({
                id: '1',
                username: 'testuser',
                name: 'Updated Name',
                email: 'updated@test.com',
                role: 'Owner',
                status: 'Active',
            });
            vi.mocked(api.authApi as any).updateProfile = updateProfileMock;

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.login('testuser', 'password');
            });

            await act(async () => {
                await result.current.updateProfile({ name: 'Updated Name', email: 'updated@test.com' });
            });

            expect(updateProfileMock).toHaveBeenCalledWith({ name: 'Updated Name', email: 'updated@test.com' });
        });

        it('should change password', async () => {
            const changePasswordMock = vi.fn().mockResolvedValue({});
            vi.mocked(api.authApi as any).changePassword = changePasswordMock;

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.login('testuser', 'password');
            });

            await act(async () => {
                await result.current.changePassword('oldpass', 'newpass');
            });

            expect(changePasswordMock).toHaveBeenCalledWith({
                currentPassword: 'oldpass',
                newPassword: 'newpass',
            });
        });
    });

    describe('Store Management', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        it('should setup store', async () => {
            const setupMock = vi.mocked(api.storeApi.setup).mockResolvedValue({
                id: 1,
                companyName: 'Test Company',
                storeName: 'Test Store',
                latitude: 1.3521,
                longitude: 103.8198,
                countryCode: 'SG',
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.setupStore({
                    storeName: 'Test Store',
                    latitude: 1.3521,
                    longitude: 103.8198,
                    countryCode: 'SG',
                });
            });

            expect(setupMock).toHaveBeenCalled();
        });

        it('should update store settings', async () => {
            const updateMock = vi.mocked(api.storeApi.update).mockResolvedValue({
                id: 1,
                companyName: 'Test Company',
                storeName: 'Updated Store',
                latitude: 1.3521,
                longitude: 103.8198,
                countryCode: 'SG',
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.updateStoreSettings({
                    storeName: 'Updated Store',
                    latitude: 1.3521,
                    longitude: 103.8198,
                    countryCode: 'SG',
                });
            });

            expect(updateMock).toHaveBeenCalled();
        });
    });

    describe('Ingredient CRUD', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        beforeEach(() => {
            vi.mocked(api.ingredientsApi as any).create = vi.fn();
            vi.mocked(api.ingredientsApi as any).update = vi.fn();
            vi.mocked(api.ingredientsApi as any).delete = vi.fn();
        });

        it('should add ingredient', async () => {
            const createMock = vi.mocked(api.ingredientsApi as any).create.mockResolvedValue({
                id: '1',
                name: 'Tomato',
                unit: 'kg',
                carbonFootprint: 0.5,
                globalIngredientId: null,
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.addIngredient({
                    name: 'Tomato',
                    unit: 'kg',
                    carbonFootprint: 0.5,
                    globalIngredientId: null,
                });
            });

            expect(createMock).toHaveBeenCalled();
        });

        it('should update ingredient', async () => {
            const updateMock = vi.mocked(api.ingredientsApi as any).update = vi.fn().mockResolvedValue({
                id: '1',
                name: 'Cherry Tomato',
                unit: 'kg',
                carbonFootprint: 0.6,
                globalIngredientId: null,
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            // Manually set initial ingredients state
            act(() => {
                result.current.ingredients.push({ id: '1', name: 'Tomato', unit: 'kg', carbonFootprint: 0.5, globalIngredientId: null, createdAt: '', updatedAt: '' });
            });

            await act(async () => {
                await result.current.updateIngredient('1', { name: 'Cherry Tomato', carbonFootprint: 0.6 });
            });

            expect(updateMock).toHaveBeenCalled();
        });

        it('should delete ingredient', async () => {
            const deleteMock = vi.mocked(api.ingredientsApi as any).delete = vi.fn().mockResolvedValue({});

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.deleteIngredient('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });
    });

    describe('Recipe CRUD', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        beforeEach(() => {
            vi.mocked(api.recipesApi as any).create = vi.fn();
            vi.mocked(api.recipesApi as any).update = vi.fn();
            vi.mocked(api.recipesApi as any).delete = vi.fn();
        });

        it('should add recipe', async () => {
            const createMock = vi.mocked(api.recipesApi as any).create.mockResolvedValue({
                id: '1',
                name: 'Salad',
                isSellable: true,
                isSubRecipe: false,
                ingredients: [],
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.addRecipe({
                    name: 'Salad',
                    isSellable: true,
                    isSubRecipe: false,
                    ingredients: [],
                });
            });

            expect(createMock).toHaveBeenCalled();
        });

        it('should delete recipe', async () => {
            const deleteMock = vi.mocked(api.recipesApi as any).delete = vi.fn().mockResolvedValue({});

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.deleteRecipe('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });
    });

    describe('Sales Data CRUD', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        beforeEach(() => {
            vi.mocked(api.salesApi as any).create = vi.fn();
            vi.mocked(api.salesApi as any).update = vi.fn();
            vi.mocked(api.salesApi as any).delete = vi.fn();
            vi.mocked(api.salesApi as any).import = vi.fn();
        });

        it('should add sales data', async () => {
            const createMock = vi.mocked(api.salesApi as any).create.mockResolvedValue({
                id: '1',
                date: '2024-01-01',
                recipeId: 'r1',
                recipeName: 'Salad',
                quantity: 10,
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.addSalesData({
                    date: '2024-01-01',
                    recipeId: 'r1',
                    quantity: 10,
                });
            });

            expect(createMock).toHaveBeenCalled();
        });

        it('should delete sales data', async () => {
            const deleteMock = vi.mocked(api.salesApi as any).delete = vi.fn().mockResolvedValue({});

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.deleteSalesData('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });

        it('should import sales data', async () => {
            const importMock = vi.mocked(api.salesApi as any).import.mockResolvedValue({ message: 'Success', count: 2 });
            vi.mocked(api.salesApi.getAll).mockResolvedValue([]);

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.importSalesData([
                    { id: '1', date: '2024-01-01', recipeId: 'r1', quantity: 10 },
                    { id: '2', date: '2024-01-02', recipeId: 'r1', quantity: 15 },
                ]);
            });

            expect(importMock).toHaveBeenCalled();
        });
    });

    describe('Wastage Data CRUD', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        beforeEach(() => {
            vi.mocked(api.wastageApi as any).create = vi.fn();
            vi.mocked(api.wastageApi as any).update = vi.fn();
            vi.mocked(api.wastageApi as any).delete = vi.fn();
        });

        it('should add wastage data', async () => {
            const createMock = vi.mocked(api.wastageApi as any).create.mockResolvedValue({
                id: '1',
                date: '2024-01-01',
                ingredientId: 'i1',
                quantity: 2,
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.addWastageData({
                    date: '2024-01-01',
                    ingredientId: 'i1',
                    quantity: 2,
                });
            });

            expect(createMock).toHaveBeenCalled();
        });

        it('should delete wastage data', async () => {
            const deleteMock = vi.mocked(api.wastageApi as any).delete = vi.fn().mockResolvedValue({});

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.deleteWastageData('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });
    });

    describe('Data Refresh', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        it('should refresh all data', async () => {
            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.refreshData();
            });

            expect(api.ingredientsApi.getAll).toHaveBeenCalled();
            expect(api.recipesApi.getAll).toHaveBeenCalled();
            expect(api.salesApi.getAll).toHaveBeenCalled();
            expect(api.wastageApi.getAll).toHaveBeenCalled();
        });
    });

    describe('User Management', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        beforeEach(() => {
            vi.mocked(api.authApi.login).mockResolvedValue({
                token: 'test-token',
                user: { id: '1', username: 'admin', name: 'Admin', email: 'admin@test.com', role: 'Owner', status: 'Active' },
                storeSetupRequired: false,
            });
            vi.mocked(api.usersApi as any).create = vi.fn();
            vi.mocked(api.usersApi as any).update = vi.fn();
            vi.mocked(api.usersApi as any).delete = vi.fn();
        });

        it('should add user', async () => {
            const createMock = vi.mocked(api.usersApi as any).create.mockResolvedValue({
                id: '2',
                username: 'newuser',
                name: 'New User',
                email: 'new@test.com',
                role: 'Manager',
                status: 'Active',
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.login('admin', 'password');
            });

            await act(async () => {
                await result.current.addUser({
                    username: 'newuser',
                    password: 'password123',
                    name: 'New User',
                    email: 'new@test.com',
                    role: 'Manager',
                });
            });

            expect(createMock).toHaveBeenCalled();
        });

        it('should update user', async () => {
            const updateMock = vi.mocked(api.usersApi as any).update = vi.fn().mockResolvedValue({
                id: '2',
                username: 'newuser',
                name: 'Updated User',
                email: 'updated@test.com',
                role: 'Manager',
                status: 'Active',
            });

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.login('admin', 'password');
            });

            await act(async () => {
                await result.current.updateUser('2', { name: 'Updated User', email: 'updated@test.com' });
            });

            expect(updateMock).toHaveBeenCalled();
        });

        it('should delete user', async () => {
            const deleteMock = vi.mocked(api.usersApi as any).delete = vi.fn().mockResolvedValue({});

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.login('admin', 'password');
            });

            await act(async () => {
                await result.current.deleteUser('2');
            });

            expect(deleteMock).toHaveBeenCalledWith('2');
        });
    });

    describe('Export Data', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AppProvider>{children}</AppProvider>
        );

        beforeEach(() => {
            vi.mocked(api.exportApi).getSalesCsv = vi.fn();
            vi.mocked(api.exportApi).getWastageCsv = vi.fn();
            vi.mocked(api.exportApi).getForecastCsv = vi.fn();
        });

        it('should export sales data', async () => {
            const exportMock = vi.mocked(api.exportApi).getSalesCsv.mockResolvedValue(new Blob(['sales data']));

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.exportData('sales');
            });

            expect(exportMock).toHaveBeenCalled();
        });

        it('should export wastage data', async () => {
            const exportMock = vi.mocked(api.exportApi).getWastageCsv.mockResolvedValue(new Blob(['wastage data']));

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.exportData('wastage');
            });

            expect(exportMock).toHaveBeenCalled();
        });

        it('should export forecast data', async () => {
            const exportMock = vi.mocked(api.exportApi).getForecastCsv.mockResolvedValue(new Blob(['forecast data']));

            const { result } = renderHook(() => useAppContext(), { wrapper });

            await act(async () => {
                await result.current.exportData('forecast');
            });

            expect(exportMock).toHaveBeenCalled();
        });
    });
});
