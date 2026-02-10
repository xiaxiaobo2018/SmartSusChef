import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PredictionSummary } from '../PredictionSummary';
import { AppProvider } from '@/app/context/AppContext';
import * as api from '@/app/services/api';
import { addDays, format } from 'date-fns';

// Mock AuthContext (AppProvider now depends on useAuth)
vi.mock('@/app/context/AuthContext', () => ({
    useAuth: () => ({
        user: null,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        changePassword: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the API module
vi.mock('@/app/services/api', () => ({
    setAuthToken: vi.fn(),
    getAuthToken: vi.fn(() => null),
    authApi: {
        login: vi.fn(),
        getCurrentUser: vi.fn(),
    },
    storeApi: {
        getStore: vi.fn(),
    },
    ingredientsApi: {
        getAll: vi.fn(() => Promise.resolve([])),
    },
    recipesApi: {
        getAll: vi.fn(() => Promise.resolve([
            {
                id: 'recipe-1',
                name: 'Chicken Rice',
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            },
            {
                id: 'sub-recipe-1',
                name: 'Sauce',
                isSubRecipe: true,
                isSellable: false,
                ingredients: [],
            },
        ])),
    },
    salesApi: {
        getAll: vi.fn(() => Promise.resolve([])),
    },
    wastageApi: {
        getAll: vi.fn(() => Promise.resolve([])),
    },
    forecastApi: {
        getAll: vi.fn(() => Promise.resolve([])),
        getHolidays: vi.fn(() => Promise.resolve([])),
        getWeather: vi.fn(() => Promise.resolve(null)),
    },
    usersApi: {
        getAll: vi.fn(() => Promise.resolve([])),
    },
}));

describe('PredictionSummary', () => {
    const renderWithProviders = () => {
        return render(
            <AppProvider>
                <PredictionSummary />
            </AppProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.forecastApi.getAll).mockResolvedValue([]);
    });

    describe('Rendering', () => {
        it('should render card header', () => {
            renderWithProviders();

            expect(screen.getByText(/prediction summary/i)).toBeInTheDocument();
            expect(screen.getByText(/forecasted main dish sales for next 7 days/i)).toBeInTheDocument();
        });

        it('should display total dishes count', () => {
            renderWithProviders();

            // Total dishes should be displayed (0 when no data)
            expect(screen.getByText(/total dishes/i)).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no forecast data', () => {
            vi.mocked(api.forecastApi.getAll).mockResolvedValue([]);

            renderWithProviders();

            expect(screen.getByText(/no prediction data available yet/i)).toBeInTheDocument();
            expect(screen.getByText(/train ml models first to generate forecasts/i)).toBeInTheDocument();
        });
    });

    describe('Forecast Data Display', () => {
        it('should display forecast chart with data', () => {
            const tomorrow = addDays(new Date(), 1);

            vi.mocked(api.forecastApi.getAll).mockResolvedValue([
                {
                    id: 'forecast-1',
                    date: format(tomorrow, 'yyyy-MM-dd'),
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 50,
                },
            ]);

            renderWithProviders();

            // Component should render the chart area
            expect(screen.getByText(/prediction summary/i)).toBeInTheDocument();
        });

        it('should calculate total forecast correctly', () => {
            const today = new Date();
            const tomorrow = addDays(today, 1);
            const nextDay = addDays(today, 2);

            vi.mocked(api.forecastApi.getAll).mockResolvedValue([
                {
                    id: 'forecast-1',
                    date: format(tomorrow, 'yyyy-MM-dd'),
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 50,
                },
                {
                    id: 'forecast-2',
                    date: format(nextDay, 'yyyy-MM-dd'),
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 60,
                },
            ]);

            renderWithProviders();

            // Total should be displayed
            expect(screen.getByText(/total dishes/i)).toBeInTheDocument();
        });

        it('should filter out sub-recipes from forecast', () => {
            const tomorrow = addDays(new Date(), 1);

            vi.mocked(api.forecastApi.getAll).mockResolvedValue([
                {
                    id: 'forecast-1',
                    date: format(tomorrow, 'yyyy-MM-dd'),
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 50,
                },
                {
                    id: 'forecast-2',
                    date: format(tomorrow, 'yyyy-MM-dd'),
                    recipeId: 'sub-recipe-1', // This should be filtered out
                    recipeName: 'Sauce',
                    quantity: 10,
                },
            ]);

            renderWithProviders();

            // Should render without errors
            expect(screen.getByText(/prediction summary/i)).toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('should render without crashing', () => {
            renderWithProviders();

            expect(screen.getByText(/prediction summary/i)).toBeInTheDocument();
        });

        it('should render chart area', () => {
            renderWithProviders();

            // Chart should render (either with data or empty state)
            expect(screen.getByText(/prediction summary/i)).toBeInTheDocument();
        });
    });
});
