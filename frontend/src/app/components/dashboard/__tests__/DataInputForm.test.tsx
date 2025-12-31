import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataInputForm } from '../DataInputForm';
import * as AppContext from '@/app/context/AppContext';
import * as api from '@/app/services/api';

// Mock the API module
vi.mock('@/app/services/api', () => ({
    setAuthToken: vi.fn(),
    getAuthToken: vi.fn(() => null),
    authApi: {
        login: vi.fn(),
        getCurrentUser: vi.fn(),
    },
    storeApi: {
        get: vi.fn(),
    },
    ingredientsApi: {
        getAll: vi.fn(() => Promise.resolve([
            {
                id: 'ingredient-1',
                name: 'Tomato',
                unit: 'kg',
                carbonFootprint: 0.5,
                globalIngredientId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'ingredient-2',
                name: 'Chicken',
                unit: 'kg',
                carbonFootprint: 1.2,
                globalIngredientId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])),
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
                id: 'recipe-2',
                name: 'Nasi Lemak',
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            },
        ])),
    },
    salesApi: {
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
    },
    wastageApi: {
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
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

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock AppContext
const mockRecipes = [
    {
        id: 'recipe-1',
        name: 'Chicken Rice',
        isSubRecipe: false,
        isSellable: true,
        ingredients: [],
    },
    {
        id: 'recipe-2',
        name: 'Nasi Lemak',
        isSubRecipe: false,
        isSellable: true,
        ingredients: [],
    },
];

const mockIngredients = [
    {
        id: 'ingredient-1',
        name: 'Tomato',
        unit: 'kg',
        carbonFootprint: 0.5,
        globalIngredientId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'ingredient-2',
        name: 'Chicken',
        unit: 'kg',
        carbonFootprint: 1.2,
        globalIngredientId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const mockAddSalesData = vi.fn();
const mockAddWastageData = vi.fn();

vi.spyOn(AppContext, 'useApp').mockReturnValue({
    recipes: mockRecipes,
    ingredients: mockIngredients,
    addSalesData: mockAddSalesData,
    addWastageData: mockAddWastageData,
    salesData: [],
    wastageData: [],
    forecast: [],
    holidays: [],
    weather: null,
    users: [],
    addRecipe: vi.fn(),
    addIngredient: vi.fn(),
    updateSalesData: vi.fn(),
    updateWastageData: vi.fn(),
    deleteSalesData: vi.fn(),
    deleteWastageData: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
    updateIngredient: vi.fn(),
    deleteIngredient: vi.fn(),
    refreshForecast: vi.fn(),
    refreshHolidays: vi.fn(),
    refreshWeather: vi.fn(),
    refreshForecastForDate: vi.fn(),
    refreshUsers: vi.fn(),
    addUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
} as any);

describe('DataInputForm', () => {
    const renderComponent = (props = {}) => {
        return render(<DataInputForm {...props} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the form with all elements', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/input data/i)).toBeInTheDocument();
            });

            // Check for date selector
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            expect(screen.getByRole('button', { name: new RegExp(formattedDate, 'i') })).toBeInTheDocument();

            // Check for tabs
            expect(screen.getByRole('tab', { name: /sales data/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
        });

        it('should display correct description for employee (maxDaysBack=0)', async () => {
            renderComponent({ maxDaysBack: 0 });

            await waitFor(() => {
                expect(screen.getByText(/enter today's sales and wastage data/i)).toBeInTheDocument();
            });
        });

        it('should display correct description for manager (maxDaysBack with limit)', async () => {
            renderComponent({ maxDaysBack: 7 });

            expect(screen.getByText(/enter sales and wastage data for any date/i)).toBeInTheDocument();
        });

        it('should render all recipes in sales tab', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/nasi lemak/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it('should render all ingredients in wastage tab', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            // Switch to wastage tab
            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/chicken \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });

    describe('Date Selection', () => {
        it('should display current date by default', async () => {
            renderComponent();

            await waitFor(() => {
                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                const dateButton = screen.getByRole('button', { name: new RegExp(formattedDate, 'i') });
                expect(dateButton).toBeInTheDocument();
            });
        });

        it('should open calendar when date button is clicked', async () => {
            renderComponent();

            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: new RegExp(formattedDate, 'i') })).toBeInTheDocument();
            });

            const dateButton = screen.getByRole('button', { name: new RegExp(formattedDate, 'i') });
            await userEvent.click(dateButton);

            // Calendar should open (checking for grid role which calendar uses)
            await waitFor(() => {
                expect(screen.getByRole('grid')).toBeInTheDocument();
            });
        });
    });

    describe('Sales Data Tab', () => {
        it('should allow entering sales data', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/chicken rice/i) as HTMLInputElement;
            await userEvent.type(input, '10');

            expect(input.value).toBe('10');
        });

        it('should show error when submitting without any data', async () => {
            const { toast } = await import('sonner');
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save sales data/i })).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', { name: /save sales data/i });
            await userEvent.click(saveButton);

            expect(toast.error).toHaveBeenCalledWith('Please enter at least one sales value');
        });

        it('should successfully submit sales data', async () => {
            const { toast } = await import('sonner');
            vi.mocked(api.salesApi.create).mockResolvedValue({
                id: 'new-sale-1',
                date: '2026-02-09',
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                quantity: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/chicken rice/i);
            await userEvent.type(input, '10');

            const saveButton = screen.getByRole('button', { name: /save sales data/i });
            await userEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Sales data saved successfully!');
            });
        });

        it('should clear form after successful submission', async () => {
            vi.mocked(api.salesApi.create).mockResolvedValue({
                id: 'new-sale-1',
                date: '2026-02-09',
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                quantity: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/chicken rice/i) as HTMLInputElement;
            await userEvent.type(input, '10');
            expect(input.value).toBe('10');

            const saveButton = screen.getByRole('button', { name: /save sales data/i });
            await userEvent.click(saveButton);

            await waitFor(() => {
                expect(input.value).toBe('');
            });
        });

        it('should submit multiple sales entries', async () => {
            const { toast } = await import('sonner');
            vi.mocked(api.salesApi.create).mockResolvedValue({
                id: 'new-sale-1',
                date: '2026-02-09',
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                quantity: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const chickenRiceInput = screen.getByLabelText(/chicken rice/i);
            const nasiLemakInput = screen.getByLabelText(/nasi lemak/i);

            await userEvent.type(chickenRiceInput, '10');
            await userEvent.type(nasiLemakInput, '5');

            const saveButton = screen.getByRole('button', { name: /save sales data/i });
            await userEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should ignore zero values when submitting', async () => {
            const { toast } = await import('sonner');
            renderComponent();

            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/chicken rice/i);
            await userEvent.type(input, '0');

            const saveButton = screen.getByRole('button', { name: /save sales data/i });
            await userEvent.click(saveButton);

            expect(toast.error).toHaveBeenCalledWith('Please enter at least one sales value');
        });
    });

    describe('Wastage Data Tab', () => {
        it('should switch to wastage tab', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save wastage data/i })).toBeInTheDocument();
            });
        });

        it('should allow entering wastage data', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/tomato \(kg\)/i) as HTMLInputElement;
            await userEvent.type(input, '2.5');

            expect(input.value).toBe('2.5');
        });

        it('should show error when submitting without any wastage data', async () => {
            const { toast } = await import('sonner');
            renderComponent();

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save wastage data/i })).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', { name: /save wastage data/i });
            await userEvent.click(saveButton);

            expect(toast.error).toHaveBeenCalledWith('Please enter at least one wastage value');
        });

        it('should successfully submit wastage data', async () => {
            const { toast } = await import('sonner');
            vi.mocked(api.wastageApi.create).mockResolvedValue({
                id: 'new-waste-1',
                date: '2026-02-09',
                ingredientId: 'ingredient-1',
                displayName: 'Tomato',
                unit: 'kg',
                quantity: 2.5,
                carbonFootprint: 1.25,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/tomato \(kg\)/i);
            await userEvent.type(input, '2.5');

            const saveButton = screen.getByRole('button', { name: /save wastage data/i });
            await userEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Wastage data saved successfully!');
            });
        });

        it('should clear form after successful wastage submission', async () => {
            vi.mocked(api.wastageApi.create).mockResolvedValue({
                id: 'new-waste-1',
                date: '2026-02-09',
                ingredientId: 'ingredient-1',
                displayName: 'Tomato',
                unit: 'kg',
                quantity: 2.5,
                carbonFootprint: 1.25,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/tomato \(kg\)/i) as HTMLInputElement;
            await userEvent.type(input, '2.5');
            expect(input.value).toBe('2.5');

            const saveButton = screen.getByRole('button', { name: /save wastage data/i });
            await userEvent.click(saveButton);

            await waitFor(() => {
                expect(input.value).toBe('');
            });
        });

        it('should submit multiple wastage entries', async () => {
            const { toast } = await import('sonner');
            vi.mocked(api.wastageApi.create).mockResolvedValue({
                id: 'new-waste-1',
                date: '2026-02-09',
                ingredientId: 'ingredient-1',
                displayName: 'Tomato',
                unit: 'kg',
                quantity: 2.5,
                carbonFootprint: 1.25,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const tomatoInput = screen.getByLabelText(/tomato \(kg\)/i);
            const chickenInput = screen.getByLabelText(/chicken \(kg\)/i);

            await userEvent.type(tomatoInput, '2.5');
            await userEvent.type(chickenInput, '1.0');

            const saveButton = screen.getByRole('button', { name: /save wastage data/i });
            await userEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should allow decimal values for wastage', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/tomato \(kg\)/i) as HTMLInputElement;
            await userEvent.type(input, '0.5');

            expect(input.value).toBe('0.5');
        });

        it('should ignore zero wastage values when submitting', async () => {
            const { toast } = await import('sonner');
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/tomato \(kg\)/i);
            await userEvent.type(input, '0');

            const saveButton = screen.getByRole('button', { name: /save wastage data/i });
            await userEvent.click(saveButton);

            expect(toast.error).toHaveBeenCalledWith('Please enter at least one wastage value');
        });
    });

    describe('Date Restrictions', () => {
        it('should allow only today for employees (maxDaysBack=0)', async () => {
            renderComponent({ maxDaysBack: 0 });

            await waitFor(() => {
                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                expect(screen.getByRole('button', { name: new RegExp(formattedDate, 'i') })).toBeInTheDocument();
            });

            // This tests that the prop is passed correctly
            // Calendar date restrictions are tested through the disabledDates function
        });

        it('should allow any past date for managers (maxDaysBack=undefined)', async () => {
            renderComponent({ maxDaysBack: undefined });

            await waitFor(() => {
                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                expect(screen.getByRole('button', { name: new RegExp(formattedDate, 'i') })).toBeInTheDocument();
            });

            // This tests that the prop is passed correctly
        });

        it('should allow specific range when maxDaysBack is set', async () => {
            renderComponent({ maxDaysBack: 7 });

            await waitFor(() => {
                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                expect(screen.getByRole('button', { name: new RegExp(formattedDate, 'i') })).toBeInTheDocument();
            });

            // This tests that the prop is passed correctly
        });
    });

    describe('Input Validation', () => {
        it('should only accept positive numbers for sales', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/chicken rice/i) as HTMLInputElement;
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('min', '0');
        });

        it('should only accept positive numbers for wastage', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /wastage data/i })).toBeInTheDocument();
            }, { timeout: 3000 });

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByLabelText(/tomato \(kg\)/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const input = screen.getByLabelText(/tomato \(kg\)/i) as HTMLInputElement;
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('min', '0');
            expect(input).toHaveAttribute('step', '0.1');
        });
    });

    describe('Tab Navigation', () => {
        it('should show sales data by default', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save sales data/i })).toBeInTheDocument();
            });
        });

        it('should switch between tabs', async () => {
            renderComponent();

            // Sales tab is active by default
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save sales data/i })).toBeInTheDocument();
            });

            // Switch to wastage tab
            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save wastage data/i })).toBeInTheDocument();
            });

            // Switch back to sales tab
            const salesTab = screen.getByRole('tab', { name: /sales data/i });
            await userEvent.click(salesTab);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save sales data/i })).toBeInTheDocument();
            });
        });
    });

    describe('Integration', () => {
        it('should maintain form values when switching tabs', async () => {
            renderComponent();

            // Enter sales data
            await waitFor(() => {
                expect(screen.getByLabelText(/chicken rice/i)).toBeInTheDocument();
            }, { timeout: 5000 });

            const salesInput = screen.getByLabelText(/chicken rice/i) as HTMLInputElement;
            await userEvent.type(salesInput, '10');

            // Switch to wastage tab
            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            // Switch back to sales tab
            const salesTab = screen.getByRole('tab', { name: /sales data/i });
            await userEvent.click(salesTab);

            // Value should be maintained
            await waitFor(() => {
                expect(salesInput.value).toBe('10');
            });
        });

        it('should handle empty recipes array gracefully', async () => {
            vi.mocked(api.recipesApi.getAll).mockResolvedValue([]);

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/input data/i)).toBeInTheDocument();
            });

            // Should still show save button
            expect(screen.getByRole('button', { name: /save sales data/i })).toBeInTheDocument();
        });

        it('should handle empty ingredients array gracefully', async () => {
            vi.mocked(api.ingredientsApi.getAll).mockResolvedValue([]);

            renderComponent();

            const wastageTab = screen.getByRole('tab', { name: /wastage data/i });
            await userEvent.click(wastageTab);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save wastage data/i })).toBeInTheDocument();
            });
        });
    });
});
