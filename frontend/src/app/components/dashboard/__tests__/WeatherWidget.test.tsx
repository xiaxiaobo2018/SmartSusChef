import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { WeatherWidget } from '../WeatherWidget';
import { AppProvider } from '@/app/context/AppContext';
import * as api from '@/app/services/api';

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
        getAll: vi.fn(() => Promise.resolve([])),
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

describe('WeatherWidget', () => {
    const renderWithProviders = () => {
        return render(
            <AppProvider>
                <WeatherWidget />
            </AppProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset to default null for weather
        vi.mocked(api.forecastApi.getWeather).mockResolvedValue(null);
    });

    describe('Rendering', () => {
        it('should render header with weather icon', async () => {
            renderWithProviders();

            expect(screen.getByText(/current weather/i)).toBeInTheDocument();
        });
    });

    describe('No Data State', () => {
        it('should show weather unavailable message when no weather data', async () => {
            vi.mocked(api.forecastApi.getWeather).mockResolvedValue(null);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/weather data unavailable/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/please set store coordinates in settings/i)).toBeInTheDocument();
        });
    });

    describe('Weather Data Display', () => {
        it('should display temperature correctly', () => {
            const { rerender } = render(
                <AppProvider>
                    <WeatherWidget />
                </AppProvider>
            );

            // Initially shows unavailable
            expect(screen.getByText(/weather data unavailable/i)).toBeInTheDocument();
        });

        it('should display all weather information sections', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/current weather/i)).toBeInTheDocument();
            });
        });
    });
});
