import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MlModelStatusCard } from '../MlModelStatus';
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
    mlApi: {
        getStatus: vi.fn(() => Promise.resolve({
            status: 'unavailable',
            message: 'ML service is not available',
            dataStats: null,
            lastTrained: null,
        })),
        train: vi.fn(),
    },
}));

describe('MlModelStatusCard', () => {
    const renderWithProviders = () => {
        return render(
            <AppProvider>
                <MlModelStatusCard />
            </AppProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render card header', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/ai prediction engine/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show loading message initially', () => {
            renderWithProviders();

            // Component shows loading message initially
            expect(screen.getByText(/checking ml model status/i)).toBeInTheDocument();
        });
    });

    describe('Status States', () => {
        it('should display unavailable status', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                storeId: 1,
                hasModels: false,
                isTraining: false,
                dishes: null,
                daysAvailable: null,
                status: 'unavailable',
                message: 'ML service is not available',
                trainingProgress: null,
            });

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/ml service unavailable/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it('should display ready status', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                storeId: 1,
                hasModels: true,
                isTraining: false,
                dishes: ['Chicken Rice', 'Nasi Lemak'],
                daysAvailable: 40,
                status: 'ready',
                message: 'Models are ready for prediction',
                trainingProgress: null,
            });

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/models ready/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it('should display insufficient data status', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                storeId: 1,
                hasModels: false,
                isTraining: false,
                dishes: null,
                daysAvailable: 2,
                status: 'insufficient_data',
                message: 'Not enough data for training',
                trainingProgress: null,
            });

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/insufficient data/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            vi.mocked(api.mlApi.getStatus).mockRejectedValue(new Error('Network error'));

            renderWithProviders();

            // Wait for the error state to render
            await waitFor(() => {
                const errorMessages = screen.getAllByText(/unable to connect to ml service/i);
                expect(errorMessages.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Integration', () => {
        it('should render without crashing', () => {
            renderWithProviders();

            expect(screen.getByText(/checking ml model status/i)).toBeInTheDocument();
        });
    });

    describe('Can Train Status', () => {
        it('should display can_train status with train button', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'can_train',
                message: 'Sufficient data available for training',
                daysAvailable: 150,
                hasModels: false,
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/ready to train/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            expect(screen.getByRole('button', { name: /train models/i })).toBeInTheDocument();
        });

        it('should show data days available', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'can_train',
                message: 'Sufficient data',
                daysAvailable: 150,
                hasModels: false,
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/150 days/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it('should call mlApi.train when train button is clicked', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'can_train',
                message: 'Ready',
                daysAvailable: 150,
                hasModels: false,
            } as any);
            vi.mocked(api.mlApi.train).mockResolvedValue({} as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /train models/i })).toBeInTheDocument();
            }, { timeout: 5000 });

            const trainButton = screen.getByRole('button', { name: /train models/i });
            await userEvent.click(trainButton);

            await waitFor(() => {
                expect(api.mlApi.train).toHaveBeenCalled();
            });
        });

        it('should handle train failure gracefully', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'can_train',
                message: 'Ready',
                daysAvailable: 150,
                hasModels: false,
            } as any);
            vi.mocked(api.mlApi.train).mockRejectedValue(new Error('Train failed'));

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /train models/i })).toBeInTheDocument();
            }, { timeout: 5000 });

            const trainButton = screen.getByRole('button', { name: /train models/i });
            await userEvent.click(trainButton);

            await waitFor(() => {
                expect(screen.getByText(/failed to start training/i)).toBeInTheDocument();
            });
        });

        it('should show data progress bar when no models exist', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'can_train',
                message: 'Ready',
                daysAvailable: 50,
                hasModels: false,
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/data collection progress/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });

    describe('Training Status', () => {
        it('should display training status with progress', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'training',
                message: 'Models are being trained',
                trainingProgress: { trained: 3, failed: 0, total: 10, currentDish: 'Chicken Rice' },
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            // Label + action text both contain "training in progress"
            const trainingTexts = screen.getAllByText(/training in progress/i);
            expect(trainingTexts.length).toBeGreaterThanOrEqual(1);
        });

        it('should display training progress details', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'training',
                message: 'Models are being trained',
                trainingProgress: { trained: 3, failed: 1, total: 10, currentDish: 'Nasi Lemak' },
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/nasi lemak/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });

    describe('Ready Status Actions', () => {
        it('should show refresh predictions button when ready', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'ready',
                message: 'Models are ready for prediction',
                hasModels: true,
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /refresh ai predictions/i })).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it('should show trained dishes count', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'ready',
                message: 'Models are ready',
                hasModels: true,
                dishes: [{ name: 'Dish A' }, { name: 'Dish B' }],
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/2 dishes/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it('should show min data warning when below threshold', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'ready',
                message: 'Ready',
                hasModels: true,
                daysAvailable: 50,
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/min. 100 needed/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });

    describe('Refresh Status', () => {
        it('should have refresh status button', async () => {
            vi.mocked(api.mlApi.getStatus).mockResolvedValue({
                status: 'ready',
                message: 'Ready',
                hasModels: true,
            } as any);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByTitle('Refresh status')).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });
});
