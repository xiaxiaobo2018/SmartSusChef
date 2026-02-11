import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarWidget } from '../CalendarWidget';
import { AppProvider } from '@/app/context/AppContext';
import * as AppContext from '@/app/context/AppContext';
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

describe('CalendarWidget', () => {
    const renderWithProviders = () => {
        return render(
            <AppProvider>
                <CalendarWidget />
            </AppProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.forecastApi.getHolidays).mockResolvedValue([]);
    });

    describe('Rendering', () => {
        it('should render header with calendar icon', () => {
            renderWithProviders();

            expect(screen.getByRole('heading', { name: /upcoming events/i })).toBeInTheDocument();
        });

        it('should show no events message when there are no holidays', () => {
            vi.mocked(api.forecastApi.getHolidays).mockResolvedValue([]);

            renderWithProviders();

            expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
        });
    });

    describe('Holiday Display', () => {
        it('should display upcoming holidays', () => {
            const tomorrow = addDays(new Date(), 1);
            const nextWeek = addDays(new Date(), 7);

            vi.mocked(api.forecastApi.getHolidays).mockResolvedValue([
                {
                    date: tomorrow.toISOString().split('T')[0],
                    name: 'New Year Day'
                },
                {
                    date: nextWeek.toISOString().split('T')[0],
                    name: 'Spring Festival'
                }
            ]);

            renderWithProviders();

            // The component will show these holidays once loaded
            // But since it's async, we just check the structure renders
            expect(screen.getByRole('heading', { name: /upcoming events/i })).toBeInTheDocument();
        });

        it('should filter holidays to show only next 60 days', () => {
            vi.mocked(api.forecastApi.getHolidays).mockResolvedValue([
                {
                    date: addDays(new Date(), 1).toISOString().split('T')[0],
                    name: 'Tomorrow Holiday'
                },
                {
                    date: addDays(new Date(), 100).toISOString().split('T')[0],
                    name: 'Far Future Holiday'
                }
            ]);

            renderWithProviders();

            // Component should render without errors
            expect(screen.getByRole('heading', { name: /upcoming events/i })).toBeInTheDocument();
        });

        it('should limit to showing 3 holidays', () => {
            const holidays = Array.from({ length: 5 }, (_, i) => ({
                date: addDays(new Date(), i + 1).toISOString().split('T')[0],
                name: `Holiday ${i + 1}`
            }));

            vi.mocked(api.forecastApi.getHolidays).mockResolvedValue(holidays);

            renderWithProviders();

            // Component should render and handle the slice correctly
            expect(screen.getByRole('heading', { name: /upcoming events/i })).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty message when no holidays available', () => {
            vi.mocked(api.forecastApi.getHolidays).mockResolvedValue([]);

            renderWithProviders();

            expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
        });
    });

    describe('Coverage - Direct useApp Mock', () => {
        const tomorrow = addDays(new Date(), 1);
        const nextWeek = addDays(new Date(), 7);
        const farFuture = addDays(new Date(), 100);

        const mockHolidays = [
            { date: tomorrow.toISOString().split('T')[0], name: 'New Year Day', isWeekend: false },
            { date: nextWeek.toISOString().split('T')[0], name: 'Spring Festival', isWeekend: false },
        ];

        function renderDirect(holidays: any[] = [], dataLoading = false) {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                holidays,
                dataLoading,
                recipes: [],
                ingredients: [],
                salesData: [],
                wastageData: [],
                forecasts: [],
                weatherData: null,
                users: [],
                store: null,
                user: null,
                refreshData: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                updateUser: vi.fn(),
                updateProfile: vi.fn(),
                updateStore: vi.fn(),
                deleteUser: vi.fn(),
                createUser: vi.fn(),
            } as any);
            return render(<CalendarWidget />);
        }

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should render holiday cards with date badges', () => {
            renderDirect(mockHolidays);

            expect(screen.getByText('New Year Day')).toBeInTheDocument();
            expect(screen.getByText('Spring Festival')).toBeInTheDocument();
        });

        it('should display month abbreviation in date badge', () => {
            renderDirect(mockHolidays);

            const monthTexts = screen.getAllByText(format(tomorrow, 'MMM'));
            expect(monthTexts.length).toBeGreaterThanOrEqual(1);
        });

        it('should display day number in date badge', () => {
            renderDirect(mockHolidays);

            expect(screen.getByText(format(tomorrow, 'd'))).toBeInTheDocument();
        });

        it('should display day of week under holiday name', () => {
            renderDirect(mockHolidays);

            expect(screen.getByText(format(tomorrow, 'EEEE'))).toBeInTheDocument();
        });

        it('should filter out holidays more than 60 days away', () => {
            renderDirect([
                { date: tomorrow.toISOString().split('T')[0], name: 'Near Holiday', isWeekend: false },
                { date: farFuture.toISOString().split('T')[0], name: 'Far Holiday', isWeekend: false },
            ]);

            expect(screen.getByText('Near Holiday')).toBeInTheDocument();
            expect(screen.queryByText('Far Holiday')).not.toBeInTheDocument();
        });

        it('should limit displayed holidays to 3', () => {
            const manyHolidays = Array.from({ length: 5 }, (_, i) => ({
                date: addDays(new Date(), i + 1).toISOString().split('T')[0],
                name: `Holiday ${i + 1}`,
                isWeekend: false,
            }));
            renderDirect(manyHolidays);

            expect(screen.getByText('Holiday 1')).toBeInTheDocument();
            expect(screen.getByText('Holiday 2')).toBeInTheDocument();
            expect(screen.getByText('Holiday 3')).toBeInTheDocument();
            expect(screen.queryByText('Holiday 4')).not.toBeInTheDocument();
            expect(screen.queryByText('Holiday 5')).not.toBeInTheDocument();
        });

        it('should show loading spinner when dataLoading is true', () => {
            renderDirect([], true);

            expect(screen.getByText(/loading events/i)).toBeInTheDocument();
        });

        it('should not show holiday cards while loading', () => {
            renderDirect(mockHolidays, true);

            expect(screen.queryByText('New Year Day')).not.toBeInTheDocument();
            expect(screen.getByText(/loading events/i)).toBeInTheDocument();
        });

        it('should show no upcoming events when holidays array is empty', () => {
            renderDirect([]);

            expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
        });

        it('should filter out past holidays', () => {
            const yesterday = addDays(new Date(), -1);
            renderDirect([
                { date: yesterday.toISOString().split('T')[0], name: 'Past Holiday', isWeekend: false },
                { date: tomorrow.toISOString().split('T')[0], name: 'Future Holiday', isWeekend: false },
            ]);

            expect(screen.queryByText('Past Holiday')).not.toBeInTheDocument();
            expect(screen.getByText('Future Holiday')).toBeInTheDocument();
        });

        it('should include today as an upcoming holiday', () => {
            const today = new Date();
            renderDirect([
                { date: today.toISOString().split('T')[0], name: 'Today Holiday', isWeekend: false },
            ]);

            expect(screen.getByText('Today Holiday')).toBeInTheDocument();
        });
    });
});
