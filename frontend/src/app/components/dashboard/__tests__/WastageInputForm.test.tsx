import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WastageInputForm } from '../WastageInputForm';
import { AppProvider } from '@/app/context/AppContext';
import * as AppContext from '@/app/context/AppContext';
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
        getAll: vi.fn(() => Promise.resolve([
            {
                id: 'ing-1',
                name: 'Chicken',
                unit: 'kg',
            },
            {
                id: 'ing-2',
                name: 'Rice',
                unit: 'kg',
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
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('WastageInputForm', () => {
    const renderWithProviders = () => {
        return render(
            <AppProvider>
                <WastageInputForm />
            </AppProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render form with all elements', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/input data/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/step 1: select category/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/step 2: select item/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/quantity wasted/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
            });
        });

        it('should display today\'s date', async () => {
            renderWithProviders();

            await waitFor(() => {
                const today = new Date().toLocaleDateString('en-SG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                // Date should be displayed somewhere in the component
                expect(screen.getByText(new RegExp(today.split(' ')[1]))).toBeInTheDocument();
            });
        });

        it('should disable item select until category is selected', async () => {
            renderWithProviders();

            await waitFor(() => {
                const itemSelect = screen.getAllByRole('combobox')[1]; // Second combobox is the item select
                expect(itemSelect).toBeDisabled();
            });
        });
    });

    describe('Form Validation', () => {
        it('should show error when submitting without selecting item', async () => {
            const { toast } = await import('sonner');
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
            });

            const submitButton = screen.getByRole('button', { name: /save entry/i });
            await userEvent.click(submitButton);

            expect(toast.error).toHaveBeenCalledWith('Please select an item');
        });

        it('should show error for invalid quantity', async () => {
            const { toast } = await import('sonner');
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByLabelText(/quantity wasted/i)).toBeInTheDocument();
            });

            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            await userEvent.type(quantityInput, '0');

            const submitButton = screen.getByRole('button', { name: /save entry/i });
            await userEvent.click(submitButton);

            expect(toast.error).toHaveBeenCalled();
        });

        it('should show error for negative quantity', async () => {
            const { toast } = await import('sonner');
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByLabelText(/quantity wasted/i)).toBeInTheDocument();
            });

            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            await userEvent.type(quantityInput, '-5');

            const submitButton = screen.getByRole('button', { name: /save entry/i });
            await userEvent.click(submitButton);

            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe('Category Selection', () => {
        it('should have three category options', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByLabelText(/step 1: select category/i)).toBeInTheDocument();
            });

            // Verify the select component is rendered
            const categorySelect = screen.getAllByRole('combobox')[0];
            expect(categorySelect).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should not show recent entries table when no data', async () => {
            vi.mocked(api.wastageApi.getAll).mockResolvedValue([]);

            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/input data/i)).toBeInTheDocument();
            });

            // Should not show "Recent Entries" heading when no data
            expect(screen.queryByText(/recent entries/i)).not.toBeInTheDocument();
        });
    });

    describe('Category and Item Selection', () => {
        it('should enable item select when category is selected', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByLabelText(/step 1: select category/i)).toBeInTheDocument();
            });

            const categorySelect = screen.getAllByRole('combobox')[0];
            await userEvent.click(categorySelect);

            await waitFor(() => {
                expect(screen.getByText('Main Dish')).toBeInTheDocument();
            });

            await userEvent.click(screen.getByText('Main Dish'));

            await waitFor(() => {
                const itemSelect = screen.getAllByRole('combobox')[1];
                expect(itemSelect).not.toBeDisabled();
            });
        });

        it('should display items when category is selected', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByLabelText(/step 1: select category/i)).toBeInTheDocument();
            });

            const categorySelect = screen.getAllByRole('combobox')[0];
            await userEvent.click(categorySelect);

            await waitFor(() => {
                expect(screen.getByText('Raw Ingredient')).toBeInTheDocument();
            });

            await userEvent.click(screen.getByText('Raw Ingredient'));

            await waitFor(() => {
                const itemSelect = screen.getAllByRole('combobox')[1];
                expect(itemSelect).not.toBeDisabled();
            });
        });
    });

    describe('Successful Submission', () => {
        it('should accept quantity input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByLabelText(/quantity wasted/i)).toBeInTheDocument();
            });

            // Enter quantity
            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            await userEvent.type(quantityInput, '5.5');

            // The form should now have the quantity
            expect(quantityInput).toHaveValue(5.5);
        });
    });

    describe('Recent Entries Table', () => {
        beforeEach(() => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            vi.mocked(api.wastageApi.getAll).mockResolvedValue([
                {
                    id: 'waste-1',
                    date: todayStr,
                    ingredientId: 'ing-1',
                    displayName: 'Chicken',
                    unit: 'kg',
                    quantity: 2.5,
                    carbonFootprint: 3.2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ]);
        });

        it.skip('should display recent wastage entries from today (requires AppContext data preload)', async () => {
            // Skipped: AppContext doesn't reload data after component mount
            // The mock in beforeEach doesn't affect already-mounted AppProvider
        });

        it.skip('should show edit and delete buttons for entries (requires AppContext data preload)', async () => {
            // Skipped: Requires wastage data to be pre-loaded in AppContext
        });

        it.skip('should display wastage items with category badges (requires AppContext data preload)', async () => {
            // Skipped: Requires wastage data to be pre-loaded in AppContext
        });
    });

    describe('Edit and Delete Functionality', () => {
        beforeEach(() => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            vi.mocked(api.wastageApi.getAll).mockResolvedValue([
                {
                    id: 'waste-1',
                    date: todayStr,
                    ingredientId: 'ing-1',
                    displayName: 'Chicken',
                    unit: 'kg',
                    quantity: 2.5,
                    carbonFootprint: 3.2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ]);
        });

        it.skip('should show cancel button when in edit mode (requires AppContext data preload)', async () => {
            // Skipped: Requires wastage data to be pre-loaded in AppContext
        });

        it.skip('should open delete confirmation dialog (requires AppContext data preload)', async () => {
            // Skipped: Requires wastage data to be pre-loaded in AppContext
        });

        it.skip('should cancel deletion from dialog (requires AppContext data preload)', async () => {
            // Skipped: Requires wastage data to be pre-loaded in AppContext
        });
    });

    describe('Unit Display', () => {
        it('should show correct unit for raw ingredients', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/input data/i)).toBeInTheDocument();
            });

            // Unit suffix should initially show '-' when no item is selected
            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            const inputContainer = quantityInput.parentElement;
            expect(inputContainer?.textContent).toContain('-');
        });
    });

    describe('Integration', () => {
        it('should render without crashing with empty data', () => {
            renderWithProviders();

            expect(screen.getByText(/input data/i)).toBeInTheDocument();
        });

        it('should have submit button enabled', async () => {
            renderWithProviders();

            await waitFor(() => {
                const submitButton = screen.getByRole('button', { name: /save entry/i });
                expect(submitButton).toBeInTheDocument();
                expect(submitButton).not.toBeDisabled();
            });
        });
    });

    describe('Coverage - Direct useApp Mock', () => {
        const todayStr = new Date().toISOString().split('T')[0];

        const mockAddWastageData = vi.fn().mockResolvedValue(undefined);
        const mockUpdateWastageData = vi.fn().mockResolvedValue(undefined);
        const mockDeleteWastageData = vi.fn().mockResolvedValue(undefined);

        const mockRecipes = [
            { id: 'recipe-1', name: 'Chicken Rice', isSubRecipe: false, isSellable: true, ingredients: [] },
            { id: 'sub-recipe-1', name: 'Sauce', isSubRecipe: true, isSellable: false, ingredients: [] },
        ];

        const mockIngredients = [
            { id: 'ing-1', name: 'Chicken', unit: 'kg' },
            { id: 'ing-2', name: 'Rice', unit: 'kg' },
        ];

        const mockWastageWithRecipe = [
            {
                id: 'waste-1',
                date: todayStr,
                recipeId: 'recipe-1',
                ingredientId: undefined,
                quantity: 2.5,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
            },
        ];

        const mockWastageWithIngredient = [
            {
                id: 'waste-2',
                date: todayStr,
                recipeId: undefined,
                ingredientId: 'ing-1',
                quantity: 1.5,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
            },
        ];

        let useAppSpy: ReturnType<typeof vi.spyOn>;

        const setupMock = (overrides: any = {}) => {
            useAppSpy = vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                ingredients: mockIngredients,
                wastageData: mockWastageWithRecipe,
                addWastageData: mockAddWastageData,
                updateWastageData: mockUpdateWastageData,
                deleteWastageData: mockDeleteWastageData,
                ...overrides,
            } as any);
        };

        beforeEach(() => {
            vi.clearAllMocks();
            mockAddWastageData.mockResolvedValue(undefined);
            mockUpdateWastageData.mockResolvedValue(undefined);
            mockDeleteWastageData.mockResolvedValue(undefined);
            setupMock();
        });

        afterEach(() => {
            useAppSpy?.mockRestore();
        });

        it('should render recent entries table with wastage data for recipe', () => {
            render(<WastageInputForm />);
            expect(screen.getByText('Recent Entries')).toBeInTheDocument();
            expect(screen.getByText('Chicken Rice')).toBeInTheDocument();
            expect(screen.getByText('2.5')).toBeInTheDocument();
        });

        it('should display category badge for recipe entries', () => {
            render(<WastageInputForm />);
            expect(screen.getByText('Main Dish')).toBeInTheDocument();
        });

        it('should render recent entries for ingredient wastage', () => {
            setupMock({ wastageData: mockWastageWithIngredient });
            render(<WastageInputForm />);
            expect(screen.getByText('Recent Entries')).toBeInTheDocument();
            expect(screen.getByText('Chicken')).toBeInTheDocument();
            expect(screen.getByText('1.5')).toBeInTheDocument();
            expect(screen.getByText('Raw Ingredient')).toBeInTheDocument();
        });

        it('should show Unknown Item for unresolved entries', () => {
            setupMock({
                wastageData: [{
                    id: 'waste-x',
                    date: todayStr,
                    recipeId: undefined,
                    ingredientId: 'unknown-id',
                    quantity: 1,
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                }],
            });
            render(<WastageInputForm />);
            expect(screen.getByText('Unknown Item')).toBeInTheDocument();
        });

        it('should not show recent entries table when no wastage data', () => {
            setupMock({ wastageData: [] });
            render(<WastageInputForm />);
            expect(screen.queryByText('Recent Entries')).not.toBeInTheDocument();
        });

        it('should have edit and delete buttons for each entry', () => {
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            expect(buttons.length).toBe(2);
        });

        it('should enter edit mode when edit button is clicked', async () => {
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[0]);

            await waitFor(() => {
                expect(screen.getByText('Edit Entry')).toBeInTheDocument();
            });
            expect(screen.getByText(/update entry/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('should populate quantity when editing', async () => {
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[0]);

            await waitFor(() => {
                const quantityInput = screen.getByLabelText(/quantity wasted/i) as HTMLInputElement;
                expect(quantityInput.value).toBe('2.5');
            });
        });

        it('should edit ingredient-based entry and set correct category', async () => {
            setupMock({ wastageData: mockWastageWithIngredient });
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[0]);

            await waitFor(() => {
                expect(screen.getByText('Edit Entry')).toBeInTheDocument();
            });
        });

        it('should cancel editing and reset form', async () => {
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[0]);

            await waitFor(() => {
                expect(screen.getByText('Edit Entry')).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await userEvent.click(cancelButton);

            expect(screen.getByText('Input Data')).toBeInTheDocument();
            const quantityInput = screen.getByLabelText(/quantity wasted/i) as HTMLInputElement;
            expect(quantityInput.value).toBe('');
        });

        it('should open delete confirmation dialog', async () => {
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[1]);

            expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
            expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
        });

        it('should display item info in delete dialog', async () => {
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[1]);

            const dialog = screen.getByRole('dialog');
            expect(within(dialog).getByText('Chicken Rice')).toBeInTheDocument();
        });

        it('should call deleteWastageData when confirming delete', async () => {
            const { toast } = await import('sonner');
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[1]);

            const dialog = screen.getByRole('dialog');
            const deleteBtn = within(dialog).getByRole('button', { name: /^delete$/i });
            await userEvent.click(deleteBtn);

            await waitFor(() => {
                expect(mockDeleteWastageData).toHaveBeenCalledWith('waste-1');
            });
            expect(toast.success).toHaveBeenCalledWith('Entry deleted successfully');
        });

        it('should show error toast on delete failure', async () => {
            const { toast } = await import('sonner');
            mockDeleteWastageData.mockRejectedValueOnce(new Error('Delete failed'));
            render(<WastageInputForm />);

            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[1]);

            const dialog = screen.getByRole('dialog');
            const deleteBtn = within(dialog).getByRole('button', { name: /^delete$/i });
            await userEvent.click(deleteBtn);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to delete entry');
            });
        });

        it('should cancel delete dialog', async () => {
            render(<WastageInputForm />);
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[1]);

            const dialog = screen.getByRole('dialog');
            const cancelBtn = within(dialog).getByRole('button', { name: /cancel/i });
            await userEvent.click(cancelBtn);

            expect(mockDeleteWastageData).not.toHaveBeenCalled();
        });

        it('should submit new wastage data (Main Dish)', async () => {
            const { toast } = await import('sonner');
            setupMock({ wastageData: [] });
            render(<WastageInputForm />);

            // Select category
            const categorySelect = screen.getAllByRole('combobox')[0];
            await userEvent.click(categorySelect);
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Main Dish' })).toBeInTheDocument();
            });
            await userEvent.click(screen.getByRole('option', { name: 'Main Dish' }));

            // Select item
            await waitFor(() => {
                const itemSelect = screen.getAllByRole('combobox')[1];
                expect(itemSelect).not.toBeDisabled();
            });
            const itemSelect = screen.getAllByRole('combobox')[1];
            await userEvent.click(itemSelect);
            await waitFor(() => {
                expect(screen.getByRole('option', { name: /chicken rice/i })).toBeInTheDocument();
            });
            await userEvent.click(screen.getByRole('option', { name: /chicken rice/i }));

            // Enter quantity
            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            await userEvent.type(quantityInput, '3');

            // Submit
            const submitButton = screen.getByRole('button', { name: /save entry/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockAddWastageData).toHaveBeenCalledWith(expect.objectContaining({
                    date: todayStr,
                    quantity: 3,
                    recipeId: 'recipe-1',
                }));
            });
            expect(toast.success).toHaveBeenCalledWith('Wastage data saved successfully!');
        });

        it('should submit new wastage data (Raw Ingredient)', async () => {
            const { toast } = await import('sonner');
            setupMock({ wastageData: [] });
            render(<WastageInputForm />);

            // Select category
            const categorySelect = screen.getAllByRole('combobox')[0];
            await userEvent.click(categorySelect);
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Raw Ingredient' })).toBeInTheDocument();
            });
            await userEvent.click(screen.getByRole('option', { name: 'Raw Ingredient' }));

            // Select item
            await waitFor(() => {
                const itemSelect = screen.getAllByRole('combobox')[1];
                expect(itemSelect).not.toBeDisabled();
            });
            const itemSelect = screen.getAllByRole('combobox')[1];
            await userEvent.click(itemSelect);
            await waitFor(() => {
                expect(screen.getByRole('option', { name: /chicken/i })).toBeInTheDocument();
            });
            await userEvent.click(screen.getByRole('option', { name: /chicken/i }));

            // Enter quantity
            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            await userEvent.type(quantityInput, '0.5');

            // Submit
            const submitButton = screen.getByRole('button', { name: /save entry/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockAddWastageData).toHaveBeenCalledWith(expect.objectContaining({
                    date: todayStr,
                    quantity: 0.5,
                    ingredientId: 'ing-1',
                }));
            });
            expect(toast.success).toHaveBeenCalledWith('Wastage data saved successfully!');
        });

        it('should show error toast on submit failure', async () => {
            const { toast } = await import('sonner');
            mockAddWastageData.mockRejectedValueOnce(new Error('API Error'));
            setupMock({ wastageData: [] });
            render(<WastageInputForm />);

            // Select category
            const categorySelect = screen.getAllByRole('combobox')[0];
            await userEvent.click(categorySelect);
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Main Dish' })).toBeInTheDocument();
            });
            await userEvent.click(screen.getByRole('option', { name: 'Main Dish' }));

            // Select item
            await waitFor(() => {
                const itemSelect = screen.getAllByRole('combobox')[1];
                expect(itemSelect).not.toBeDisabled();
            });
            const itemSelect = screen.getAllByRole('combobox')[1];
            await userEvent.click(itemSelect);
            await waitFor(() => {
                expect(screen.getByRole('option', { name: /chicken rice/i })).toBeInTheDocument();
            });
            await userEvent.click(screen.getByRole('option', { name: /chicken rice/i }));

            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            await userEvent.type(quantityInput, '3');

            const submitButton = screen.getByRole('button', { name: /save entry/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to save wastage data');
            });
        });

        it('should update existing wastage entry', async () => {
            const { toast } = await import('sonner');
            render(<WastageInputForm />);

            // Click edit
            const row = screen.getByText('Chicken Rice').closest('tr')!;
            const buttons = within(row).getAllByRole('button');
            await userEvent.click(buttons[0]);

            await waitFor(() => {
                expect(screen.getByText('Edit Entry')).toBeInTheDocument();
            });

            // Change quantity
            const quantityInput = screen.getByLabelText(/quantity wasted/i);
            await userEvent.clear(quantityInput);
            await userEvent.type(quantityInput, '5');

            // Submit update
            const updateButton = screen.getByRole('button', { name: /update entry/i });
            await userEvent.click(updateButton);

            await waitFor(() => {
                expect(mockUpdateWastageData).toHaveBeenCalledWith('waste-1', expect.objectContaining({
                    quantity: 5,
                }));
            });
            expect(toast.success).toHaveBeenCalledWith('Wastage data updated successfully!');
        });

        it('should display sub-recipe entry with correct badge', () => {
            setupMock({
                wastageData: [{
                    id: 'waste-sub',
                    date: todayStr,
                    recipeId: 'sub-recipe-1',
                    ingredientId: undefined,
                    quantity: 0.5,
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                }],
            });
            render(<WastageInputForm />);
            expect(screen.getByText('Sauce')).toBeInTheDocument();
            expect(screen.getByText('Sub-Recipe')).toBeInTheDocument();
        });

        it('should display unit suffix for selected item', async () => {
            setupMock({ wastageData: [] });
            render(<WastageInputForm />);

            // Initially shows '-'
            const inputContainer = screen.getByLabelText(/quantity wasted/i).parentElement;
            expect(inputContainer?.textContent).toContain('-');
        });
    });
});
