import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppProvider, useAppContext } from '../AppContext';
import * as api from '@/app/services/api';

const mockLogout = vi.fn();

// Stable user reference to prevent infinite re-renders in AppProvider's useEffect
const mockUser = { id: '1', username: 'admin', name: 'Admin', email: 'admin@test.com', role: 'manager', status: 'Active' };

// Helper to renderHook with AppProvider and properly await async effects
async function renderAppHook() {
    let result: any;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
    );
    await act(async () => {
        const hook = renderHook(() => useAppContext(), { wrapper });
        result = hook.result;
    });
    return result;
}

// Mock AuthContext since AppProvider now depends on useAuth()
vi.mock('../AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        loading: false,
        login: vi.fn(),
        logout: mockLogout,
        register: vi.fn(),
        updateProfile: vi.fn(),
        changePassword: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the API module with factory function
vi.mock('@/app/services/api', () => ({
    setAuthToken: vi.fn(),
    getAuthToken: vi.fn(() => null),
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        forgotPassword: vi.fn(),
        getCurrentUser: vi.fn(),
        checkStoreSetupRequired: vi.fn(() => Promise.resolve({ storeSetupRequired: false })),
        updateProfile: vi.fn(),
        changePassword: vi.fn(),
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
        it('should render children', async () => {
            await act(async () => {
                render(
                    <AppProvider>
                        <div>Test Child</div>
                    </AppProvider>
                );
            });

            expect(screen.getByText('Test Child')).toBeInTheDocument();
        });

        it('should provide context to children', async () => {
            const TestComponent = () => {
                const context = useAppContext();
                return <div>{context ? 'Context Available' : 'No Context'}</div>;
            };

            await act(async () => {
                render(
                    <AppProvider>
                        <TestComponent />
                    </AppProvider>
                );
            });

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

        it('should return context when used inside provider', async () => {
            const result = await renderAppHook();

            expect(result.current).toBeDefined();
            expect(result.current.logout).toBeInstanceOf(Function);
        });
    });

    describe('Logout', () => {
        it('should call authLogout when logout is called', async () => {
            const result = await renderAppHook();

            act(() => {
                result.current.logout();
            });

            expect(mockLogout).toHaveBeenCalled();
        });
    });

    describe('Initial State', () => {
        it('should have initial state with user from AuthContext', async () => {
            const result = await renderAppHook();

            expect(result.current.user).toBeDefined();
            expect(result.current.loading).toBe(false);
            expect(result.current.storeSetupRequired).toBe(false);
        });

        it('should have empty arrays for data', async () => {
            const result = await renderAppHook();

            expect(result.current.ingredients).toEqual([]);
            expect(result.current.recipes).toEqual([]);
            expect(result.current.salesData).toEqual([]);
            expect(result.current.wastageData).toEqual([]);
            expect(result.current.forecastData).toEqual([]);
        });

        it('should have empty store settings', async () => {
            const result = await renderAppHook();

            expect(result.current.storeSettings).toBeDefined();
            expect(result.current.storeSettings.storeId).toBe('');
            expect(result.current.storeSettings.companyName).toBe('');
        });
    });

    describe('Context Methods', () => {
        it('should expose all required methods', async () => {
            const result = await renderAppHook();

            // Logout method
            expect(result.current.logout).toBeInstanceOf(Function);

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

    describe('Store Management', () => {
        it('should setup store', async () => {
            const setupMock = vi.mocked(api.storeApi.setup).mockResolvedValue({
                id: 1,
                companyName: 'Test Company',
                uen: '123456789A',
                storeName: 'Test Store',
                outletLocation: 'Downtown',
                contactNumber: '+6512345678',
                openingDate: '2024-01-01',
                latitude: 1.3521,
                longitude: 103.8198,
                countryCode: 'SG',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            const result = await renderAppHook();

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
                uen: '123456789A',
                storeName: 'Updated Store',
                outletLocation: 'Downtown',
                contactNumber: '+6512345678',
                openingDate: '2024-01-01',
                latitude: 1.3521,
                longitude: 103.8198,
                countryCode: 'SG',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            const result = await renderAppHook();

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

            const result = await renderAppHook();

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

            const result = await renderAppHook();

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

            const result = await renderAppHook();

            await act(async () => {
                await result.current.deleteIngredient('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });
    });

    describe('Recipe CRUD', () => {
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

            const result = await renderAppHook();

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

            const result = await renderAppHook();

            await act(async () => {
                await result.current.deleteRecipe('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });

        it('should cascade delete related sales and wastage data when deleting recipe', async () => {
            const deleteMock = vi.mocked(api.recipesApi as any).delete = vi.fn().mockResolvedValue({});

            // Mock initial data with recipe, sales, and wastage
            vi.mocked(api.recipesApi.getAll).mockResolvedValue([
                { id: 'recipe-1', name: 'Test Recipe', isSellable: true, isSubRecipe: false, ingredients: [] }
            ]);
            vi.mocked(api.salesApi.getAll).mockResolvedValue([
                { id: 'sales-1', date: '2024-01-01', recipeId: 'recipe-1', recipeName: 'Test Recipe', quantity: 10 },
                { id: 'sales-2', date: '2024-01-02', recipeId: 'recipe-2', recipeName: 'Other Recipe', quantity: 5 }
            ]);
            vi.mocked(api.wastageApi.getAll).mockResolvedValue([
                { id: 'waste-1', date: '2024-01-01', recipeId: 'recipe-1', quantity: 2, ingredientId: undefined, displayName: 'Test Recipe', unit: 'portions', carbonFootprint: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
                { id: 'waste-2', date: '2024-01-02', recipeId: 'recipe-2', quantity: 1, ingredientId: undefined, displayName: 'Other Recipe', unit: 'portions', carbonFootprint: 0, createdAt: '2024-01-02', updatedAt: '2024-01-02' }
            ]);

            const result = await renderAppHook();

            // Verify initial state
            expect(result.current.recipes).toHaveLength(1);
            expect(result.current.salesData).toHaveLength(2);
            expect(result.current.wastageData).toHaveLength(2);

            // Delete the recipe
            await act(async () => {
                await result.current.deleteRecipe('recipe-1');
            });

            expect(deleteMock).toHaveBeenCalledWith('recipe-1');

            // Verify cascade deletion from local state
            expect(result.current.recipes).toHaveLength(0);
            expect(result.current.salesData).toHaveLength(1);
            expect(result.current.salesData[0].id).toBe('sales-2');
            expect(result.current.wastageData).toHaveLength(1);
            expect(result.current.wastageData[0].id).toBe('waste-2');
        });
    });

    describe('Sales Data CRUD', () => {
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

            const result = await renderAppHook();

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

            const result = await renderAppHook();

            await act(async () => {
                await result.current.deleteSalesData('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });

        it('should import sales data', async () => {
            const importMock = vi.mocked(api.salesApi as any).import.mockResolvedValue({ message: 'Success', count: 2 });
            vi.mocked(api.salesApi.getAll).mockResolvedValue([]);

            const result = await renderAppHook();

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

            const result = await renderAppHook();

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

            const result = await renderAppHook();

            await act(async () => {
                await result.current.deleteWastageData('1');
            });

            expect(deleteMock).toHaveBeenCalledWith('1');
        });
    });

    describe('Data Refresh', () => {
        it('should refresh all data', async () => {
            const result = await renderAppHook();

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
        beforeEach(() => {
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

            const result = await renderAppHook();

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

            const result = await renderAppHook();

            await act(async () => {
                await result.current.updateUser('2', { name: 'Updated User', email: 'updated@test.com' });
            });

            expect(updateMock).toHaveBeenCalled();
        });

        it('should delete user', async () => {
            const deleteMock = vi.mocked(api.usersApi as any).delete = vi.fn().mockResolvedValue({});

            const result = await renderAppHook();

            await act(async () => {
                await result.current.deleteUser('2');
            });

            expect(deleteMock).toHaveBeenCalledWith('2');
        });
    });

    describe('Export Data', () => {
        beforeEach(() => {
            vi.mocked(api.exportApi).getSalesCsv = vi.fn();
            vi.mocked(api.exportApi).getWastageCsv = vi.fn();
            vi.mocked(api.exportApi).getForecastCsv = vi.fn();
        });

        it('should export sales data', async () => {
            const exportMock = vi.mocked(api.exportApi).getSalesCsv.mockResolvedValue(new Blob(['sales data']));

            const result = await renderAppHook();

            await act(async () => {
                await result.current.exportData('sales');
            });

            expect(exportMock).toHaveBeenCalled();
        });

        it('should export wastage data', async () => {
            const exportMock = vi.mocked(api.exportApi).getWastageCsv.mockResolvedValue(new Blob(['wastage data']));

            const result = await renderAppHook();

            await act(async () => {
                await result.current.exportData('wastage');
            });

            expect(exportMock).toHaveBeenCalled();
        });

        it('should export forecast data', async () => {
            const exportMock = vi.mocked(api.exportApi).getForecastCsv.mockResolvedValue(new Blob(['forecast data']));

            const result = await renderAppHook();

            await act(async () => {
                await result.current.exportData('forecast');
            });

            expect(exportMock).toHaveBeenCalled();
        });
    });
});
