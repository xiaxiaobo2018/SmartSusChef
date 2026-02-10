import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecipeManagement } from '../RecipeManagement';
import * as AppContext from '@/app/context/AppContext';
import { AppContextType, Recipe, Ingredient, SalesData, WastageData } from '@/app/types';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('RecipeManagement', () => {
    // Mock data
    const mockIngredients: Ingredient[] = [
        { id: 'ing1', name: 'Chicken', unit: 'g', carbonFootprint: 6.9, storeId: 's1', globalIngredientId: 1 },
        { id: 'ing2', name: 'Rice', unit: 'g', carbonFootprint: 2.7, storeId: 's1', globalIngredientId: 2 },
        { id: 'ing3', name: 'Soy Sauce', unit: 'ml', carbonFootprint: 1.5, storeId: 's1', globalIngredientId: 3 },
    ];

    const mockRecipes: Recipe[] = [
        {
            id: 'r1',
            name: 'Chicken Rice',
            isSubRecipe: false,
            storeId: 's1',
            ingredients: [
                { ingredientId: 'ing1', quantity: 200 },
                { ingredientId: 'ing2', quantity: 150 },
                { childRecipeId: 'r3', quantity: 50 },
            ],
        },
        {
            id: 'r2',
            name: 'Fried Rice',
            isSubRecipe: false,
            storeId: 's1',
            ingredients: [
                { ingredientId: 'ing2', quantity: 200 },
            ],
        },
        {
            id: 'r3',
            name: 'Special Sauce',
            isSubRecipe: true,
            storeId: 's1',
            ingredients: [
                { ingredientId: 'ing3', quantity: 30 },
            ],
        },
    ];

    const mockSalesData: SalesData[] = [
        { id: 's1', recipeId: 'r2', quantity: 5, date: '2024-01-01', storeId: 's1' },
        { id: 's2', recipeId: 'r2', quantity: 3, date: '2024-01-02', storeId: 's1' },
    ];

    const mockWastageData: WastageData[] = [
        { id: 'w1', recipeId: 'r2', ingredientId: 'ing2', quantity: 10, date: '2024-01-01', reason: 'expired', storeId: 's1' },
    ];

    const mockAddRecipe = vi.fn().mockResolvedValue(undefined);
    const mockUpdateRecipe = vi.fn().mockResolvedValue(undefined);
    const mockDeleteRecipe = vi.fn().mockResolvedValue(undefined);

    const createMockContext = (overrides = {}): Partial<AppContextType> => ({
        recipes: mockRecipes,
        ingredients: mockIngredients,
        salesData: mockSalesData,
        wastageData: mockWastageData,
        addRecipe: mockAddRecipe,
        updateRecipe: mockUpdateRecipe,
        deleteRecipe: mockDeleteRecipe,
        storeSettings: { id: 's1', name: 'Test Store', address: '', phone: '', email: '' },
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AppContext, 'useApp').mockReturnValue(createMockContext() as AppContextType);
    });

    // Helper functions
    function clickAddButton() {
        const addButton = screen.getByText('Add Recipe');
        fireEvent.click(addButton);
    }

    function fillRecipeName(name: string) {
        const nameInput = screen.getByLabelText(/Recipe Name/i);
        fireEvent.change(nameInput, { target: { value: name } });
    }

    function toggleSubRecipe() {
        const checkbox = screen.getByLabelText(/Set as Sub-Recipe/i);
        fireEvent.click(checkbox);
    }

    function fillComponentRow(index: number, itemValue: string, quantity: string) {
        const rows = screen.getAllByRole('combobox');
        const selectTrigger = rows[index];
        fireEvent.click(selectTrigger);

        // Wait for dropdown to open and select item
        const option = screen.getByRole('option', { name: new RegExp(itemValue, 'i') });
        fireEvent.click(option);

        // Fill quantity
        const quantityInputs = screen.getAllByPlaceholderText('0.00');
        fireEvent.change(quantityInputs[index], { target: { value: quantity } });
    }

    function clickAddComponent() {
        const addComponentButton = screen.getByText(/Add Component/i);
        fireEvent.click(addComponentButton);
    }

    function clickSubmit(isEdit = false) {
        const buttonText = isEdit ? 'Save Changes' : 'Create Recipe';
        const submitButton = screen.getByText(buttonText);
        fireEvent.click(submitButton);
    }

    function clickEdit(recipeName: string) {
        // Find the row by getting all matching text and finding the one in a table cell
        const cells = screen.getAllByText(recipeName).filter(el => el.tagName === 'TD');
        const row = cells[0].closest('tr')!;
        const buttons = within(row).getAllByRole('button');
        const editButton = buttons[0]; // First button is Edit
        fireEvent.click(editButton);
    }

    function clickDelete(recipeName: string) {
        // Find the row by getting all matching text and finding the one in a table cell
        const cells = screen.getAllByText(recipeName).filter(el => el.tagName === 'TD');
        const row = cells[0].closest('tr')!;
        const buttons = within(row).getAllByRole('button');
        const deleteButton = buttons[1]; // Second button is Delete
        fireEvent.click(deleteButton);
    }

    describe('Rendering', () => {
        it('should render page title with icon', () => {
            render(<RecipeManagement />);
            expect(screen.getByText('Recipe Management')).toBeInTheDocument();
            const title = screen.getByText('Recipe Management').closest('h1');
            expect(title).toBeInTheDocument();
        });

        it('should render page description', () => {
            render(<RecipeManagement />);
            expect(screen.getByText('Manage main dishes and sub-recipes')).toBeInTheDocument();
        });

        it('should render Add Recipe button', () => {
            render(<RecipeManagement />);
            expect(screen.getByText('Add Recipe')).toBeInTheDocument();
        });

        it('should render recipe count with plural form', () => {
            render(<RecipeManagement />);
            expect(screen.getByText('3 recipes in the system')).toBeInTheDocument();
        });

        it('should render recipe count with singular form', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: [mockRecipes[0]] }) as AppContextType
            );
            render(<RecipeManagement />);
            expect(screen.getByText('1 recipe in the system')).toBeInTheDocument();
        });

        it('should render table headers', () => {
            render(<RecipeManagement />);
            expect(screen.getByText('Recipe Name')).toBeInTheDocument();
            expect(screen.getByText('Type')).toBeInTheDocument();
            expect(screen.getByText('Components')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });

        it('should render all recipes in table', () => {
            render(<RecipeManagement />);
            expect(screen.getAllByText('Chicken Rice').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Fried Rice').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Special Sauce').length).toBeGreaterThanOrEqual(1);
        });

        it('should display Main Dish badge for main recipes', () => {
            render(<RecipeManagement />);
            const badges = screen.getAllByText('Main Dish');
            expect(badges.length).toBe(2); // Chicken Rice and Fried Rice
        });

        it('should display Sub-Recipe badge for sub-recipes', () => {
            render(<RecipeManagement />);
            expect(screen.getByText('Sub-Recipe')).toBeInTheDocument();
        });

        it('should display recipe components with names and quantities', () => {
            render(<RecipeManagement />);
            expect(screen.getAllByText('Chicken').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Rice').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Special Sauce').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(/200/).length).toBeGreaterThanOrEqual(1); // Chicken quantity
        });
    });

    describe('Add Recipe Dialog', () => {
        it('should open add recipe dialog when Add Recipe button is clicked', () => {
            render(<RecipeManagement />);
            clickAddButton();
            expect(screen.getByText('Add New Recipe')).toBeInTheDocument();
        });

        it('should display dialog description', () => {
            render(<RecipeManagement />);
            clickAddButton();
            expect(screen.getByText('Build your recipe by adding raw ingredients or existing sub-recipes.')).toBeInTheDocument();
        });

        it('should render recipe name input', () => {
            render(<RecipeManagement />);
            clickAddButton();
            expect(screen.getByLabelText(/Recipe Name/i)).toBeInTheDocument();
        });

        it('should render sub-recipe checkbox', () => {
            render(<RecipeManagement />);
            clickAddButton();
            expect(screen.getByLabelText(/Set as Sub-Recipe/i)).toBeInTheDocument();
        });

        it('should render initial empty component row', () => {
            render(<RecipeManagement />);
            clickAddButton();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
        });

        it('should render Add Component button', () => {
            render(<RecipeManagement />);
            clickAddButton();
            expect(screen.getByText(/Add Component/i)).toBeInTheDocument();
        });

        it('should render Cancel and Create Recipe buttons', () => {
            render(<RecipeManagement />);
            clickAddButton();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
            expect(screen.getByText('Create Recipe')).toBeInTheDocument();
        });

        it('should close dialog when Cancel button is clicked', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            const cancelButton = screen.getByText('Cancel');
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.queryByText('Add New Recipe')).not.toBeInTheDocument();
            });
        });
    });

    describe('Add Recipe - Component Management', () => {
        it('should add new component row when Add Component is clicked', () => {
            render(<RecipeManagement />);
            clickAddButton();
            clickAddComponent();
            const placeholders = screen.getAllByPlaceholderText('0.00');
            expect(placeholders.length).toBe(2);
        });

        it('should remove component row when delete button is clicked', () => {
            render(<RecipeManagement />);
            clickAddButton();
            clickAddComponent();
            const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(btn =>
                btn.querySelector('.lucide-trash-2')
            );
            fireEvent.click(deleteButtons[1]); // Click second row delete button
            const placeholders = screen.getAllByPlaceholderText('0.00');
            expect(placeholders.length).toBe(1);
        });

        it('should disable delete button when only one row exists', () => {
            render(<RecipeManagement />);
            clickAddButton();
            const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(btn =>
                btn.querySelector('.lucide-trash-2')
            );
            expect(deleteButtons[0]).toBeDisabled();
        });

        it('should display both sub-recipes and ingredients in dropdown for main dish', () => {
            render(<RecipeManagement />);
            clickAddButton();
            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            expect(screen.getByText('Sub-Recipes')).toBeInTheDocument();
            expect(screen.getByText('Raw Ingredients')).toBeInTheDocument();
        });

        it('should only display ingredients when isSubRecipe is checked', () => {
            render(<RecipeManagement />);
            clickAddButton();
            toggleSubRecipe();
            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            expect(screen.queryByText('Sub-Recipes')).not.toBeInTheDocument();
            expect(screen.getByText('Raw Ingredients')).toBeInTheDocument();
        });

        it('should update quantity when value is changed', () => {
            render(<RecipeManagement />);
            clickAddButton();
            const quantityInput = screen.getByPlaceholderText('0.00') as HTMLInputElement;
            fireEvent.change(quantityInput, { target: { value: '100' } });
            expect(quantityInput.value).toBe('100');
        });
    });

    describe('Add Recipe - Sub-Recipe Toggle', () => {
        it('should toggle sub-recipe checkbox', () => {
            render(<RecipeManagement />);
            clickAddButton();
            const checkbox = screen.getByRole('checkbox', { name: /Set as Sub-Recipe/i });
            expect(checkbox).not.toBeChecked();
            toggleSubRecipe();
            expect(checkbox).toBeChecked();
        });

        it('should convert recipe rows to ingredient rows when toggled on', async () => {
            render(<RecipeManagement />);
            clickAddButton();

            // First add a component
            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const subRecipeOption = screen.getByRole('option', { name: /Special Sauce/i });
            fireEvent.click(subRecipeOption);

            // Fill quantity
            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '50' } });

            // Toggle to sub-recipe (should clear recipe selection)
            toggleSubRecipe();

            // The combobox should still exist
            await waitFor(() => {
                expect(screen.getByRole('combobox')).toBeInTheDocument();
            });
        });

        it('should hide sub-recipes from dropdown when isSubRecipe is enabled', () => {
            render(<RecipeManagement />);
            clickAddButton();
            toggleSubRecipe();
            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            // Check that sub-recipes section is not in the dropdown
            expect(screen.queryByText('Sub-Recipes')).not.toBeInTheDocument();
            expect(screen.getByText('Raw Ingredients')).toBeInTheDocument();
        });
    });

    describe('Add Recipe - Form Validation', () => {
        it('should show error when recipe name is empty', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            clickSubmit();
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Please enter a recipe name');
            });
        });

        it('should show error when recipe name is only whitespace', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('   ');
            clickSubmit();
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Please enter a recipe name');
            });
        });

        it('should show error when no components are added', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('Test Recipe');
            clickSubmit();
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Please add at least one component with quantity > 0');
            });
        });

        it('should show error when quantity is 0', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('Test Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '0' } });

            clickSubmit();
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('QTY cannot be 0 or negative. Please enter a valid quantity.');
            });
        });

        it('should show error when quantity is negative', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('Test Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '-10' } });

            clickSubmit();
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('QTY cannot be 0 or negative. Please enter a valid quantity.');
            });
        });
    });

    describe('Add Recipe - Submission', () => {
        it('should call addRecipe with correct data', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('New Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '150' } });

            clickSubmit();

            await waitFor(() => {
                expect(mockAddRecipe).toHaveBeenCalledWith({
                    name: 'New Recipe',
                    isSubRecipe: false,
                    ingredients: [{ ingredientId: 'ing1', quantity: 150, childRecipeId: undefined }],
                });
            });
        });

        it('should show success toast after adding recipe', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('New Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '150' } });

            clickSubmit();

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Recipe added successfully');
            });
        });

        it('should close dialog after successful submission', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('New Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '150' } });

            clickSubmit();

            await waitFor(() => {
                expect(screen.queryByText('Add New Recipe')).not.toBeInTheDocument();
            });
        });

        it('should show error toast when API fails', async () => {
            mockAddRecipe.mockRejectedValueOnce(new Error('API Error'));
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('New Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '150' } });

            clickSubmit();

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to save recipe');
            });
        });

        it('should handle sub-recipe submission correctly', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('New Sauce');
            toggleSubRecipe();

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Soy Sauce/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '30' } });

            clickSubmit();

            await waitFor(() => {
                expect(mockAddRecipe).toHaveBeenCalledWith({
                    name: 'New Sauce',
                    isSubRecipe: true,
                    ingredients: [{ ingredientId: 'ing3', quantity: 30, childRecipeId: undefined }],
                });
            });
        });

        it('should handle multiple components correctly', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('Complex Recipe');

            // First component
            let selectTriggers = screen.getAllByRole('combobox');
            fireEvent.click(selectTriggers[0]);
            let option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);
            let quantityInputs = screen.getAllByPlaceholderText('0.00');
            fireEvent.change(quantityInputs[0], { target: { value: '100' } });

            // Add second component
            clickAddComponent();

            selectTriggers = screen.getAllByRole('combobox');
            fireEvent.click(selectTriggers[1]);
            option = screen.getByRole('option', { name: /Rice/i });
            fireEvent.click(option);
            quantityInputs = screen.getAllByPlaceholderText('0.00');
            fireEvent.change(quantityInputs[1], { target: { value: '200' } });

            clickSubmit();

            await waitFor(() => {
                expect(mockAddRecipe).toHaveBeenCalledWith({
                    name: 'Complex Recipe',
                    isSubRecipe: false,
                    ingredients: [
                        { ingredientId: 'ing1', quantity: 100, childRecipeId: undefined },
                        { ingredientId: 'ing2', quantity: 200, childRecipeId: undefined },
                    ],
                });
            });
        });

        it('should filter out empty rows when submitting', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('Recipe with Empty Row');

            // Add second row but don't fill it
            clickAddComponent();

            // Fill only first row
            const selectTriggers = screen.getAllByRole('combobox');
            fireEvent.click(selectTriggers[0]);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);
            const quantityInputs = screen.getAllByPlaceholderText('0.00');
            fireEvent.change(quantityInputs[0], { target: { value: '100' } });

            clickSubmit();

            await waitFor(() => {
                expect(mockAddRecipe).toHaveBeenCalledWith({
                    name: 'Recipe with Empty Row',
                    isSubRecipe: false,
                    ingredients: [
                        { ingredientId: 'ing1', quantity: 100, childRecipeId: undefined },
                    ],
                });
            });
        });
    });

    describe('Edit Recipe Dialog', () => {
        it('should open edit dialog when Edit button is clicked', () => {
            render(<RecipeManagement />);
            clickEdit('Chicken Rice');
            expect(screen.getByText('Edit Recipe')).toBeInTheDocument();
        });

        it('should pre-fill recipe name', () => {
            render(<RecipeManagement />);
            clickEdit('Chicken Rice');
            const nameInput = screen.getByLabelText(/Recipe Name/i) as HTMLInputElement;
            expect(nameInput.value).toBe('Chicken Rice');
        });

        it('should pre-fill isSubRecipe checkbox', () => {
            render(<RecipeManagement />);
            clickEdit('Special Sauce');
            const checkbox = screen.getByRole('checkbox', { name: /Set as Sub-Recipe/i });
            expect(checkbox).toBeChecked();
        });

        it('should disable isSubRecipe checkbox when editing', () => {
            render(<RecipeManagement />);
            clickEdit('Chicken Rice');
            const checkbox = screen.getByLabelText(/Set as Sub-Recipe/i);
            expect(checkbox).toBeDisabled();
        });

        it('should pre-fill component rows', () => {
            render(<RecipeManagement />);
            clickEdit('Fried Rice');
            const quantityInputs = screen.getAllByPlaceholderText('0.00') as HTMLInputElement[];
            expect(quantityInputs[0].value).toBe('200');
        });

        it('should display Save Changes button instead of Create Recipe', () => {
            render(<RecipeManagement />);
            clickEdit('Chicken Rice');
            expect(screen.getByText('Save Changes')).toBeInTheDocument();
            expect(screen.queryByText('Create Recipe')).not.toBeInTheDocument();
        });

        it('should call updateRecipe with correct data', async () => {
            render(<RecipeManagement />);
            clickEdit('Fried Rice');

            const nameInput = screen.getByLabelText(/Recipe Name/i);
            fireEvent.change(nameInput, { target: { value: 'Updated Fried Rice' } });

            clickSubmit(true);

            await waitFor(() => {
                expect(mockUpdateRecipe).toHaveBeenCalledWith('r2', {
                    name: 'Updated Fried Rice',
                    isSubRecipe: false,
                    ingredients: [{ ingredientId: 'ing2', quantity: 200, childRecipeId: undefined }],
                });
            });
        });

        it('should show success toast after updating recipe', async () => {
            render(<RecipeManagement />);
            clickEdit('Fried Rice');
            clickSubmit(true);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Recipe updated successfully');
            });
        });

        it('should show error toast when update fails', async () => {
            mockUpdateRecipe.mockRejectedValueOnce(new Error('API Error'));
            render(<RecipeManagement />);
            clickEdit('Fried Rice');
            clickSubmit(true);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to save recipe');
            });
        });
    });

    describe('Delete Recipe - Simple (No Related Data)', () => {
        it('should open delete dialog when Delete button is clicked', () => {
            // Create a recipe without sales/wastage data and not used in other recipes
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        });

        it('should show recipe name in delete dialog', () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            // Recipe name appears in both table and dialog
            expect(screen.getAllByText('Standalone Recipe').length).toBeGreaterThanOrEqual(1);
        });

        it('should show simple delete message when no related data', () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            expect(screen.getByText('Are you sure you want to delete this recipe?')).toBeInTheDocument();
        });

        it('should show warning message', () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            expect(screen.getByText(/Warning: This action cannot be undone/i)).toBeInTheDocument();
        });

        it('should call deleteRecipe with cascade=false when no related data', async () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockDeleteRecipe).toHaveBeenCalledWith('r4', false);
            });
        });

        it('should show success toast after deletion', async () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Recipe deleted successfully');
            });
        });

        it('should close dialog after successful deletion', async () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
            });
        });

        it('should allow canceling deletion', async () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            const cancelButton = screen.getByText('Cancel');
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
            });
            expect(mockDeleteRecipe).not.toHaveBeenCalled();
        });

        it('should show error toast on delete failure', async () => {
            mockDeleteRecipe.mockRejectedValueOnce(new Error('API Error'));
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to delete recipe');
            });
        });
    });

    describe('Delete Recipe - Cascade (With Related Data)', () => {
        it('should show cascade delete warning when recipe has sales data', () => {
            render(<RecipeManagement />);
            clickDelete('Fried Rice'); // Has 2 sales records and 1 wastage record
            expect(screen.getByText(/This recipe has related data records/i)).toBeInTheDocument();
        });

        it('should display sales data count', () => {
            render(<RecipeManagement />);
            clickDelete('Fried Rice');
            const salesCountElements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('2') && element?.textContent?.includes('Sales Data record') || false;
            });
            expect(salesCountElements.length).toBeGreaterThan(0);
        });

        it('should display wastage data count', () => {
            render(<RecipeManagement />);
            clickDelete('Fried Rice');
            const wastageCountElements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('1') && element?.textContent?.includes('Wastage Data record') || false;
            });
            expect(wastageCountElements.length).toBeGreaterThan(0);
        });

        it('should show total count in warning message', () => {
            render(<RecipeManagement />);
            clickDelete('Fried Rice');
            const warningElements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('3') && element?.textContent?.includes('related data records') || false;
            });
            expect(warningElements.length).toBeGreaterThan(0);
        });

        it('should call deleteRecipe with cascade=true when related data exists', async () => {
            render(<RecipeManagement />);
            clickDelete('Fried Rice');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockDeleteRecipe).toHaveBeenCalledWith('r2', true);
            });
        });

        it('should show success toast with count after cascade deletion', async () => {
            render(<RecipeManagement />);
            clickDelete('Fried Rice');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Recipe and 3 related records deleted successfully');
            });
        });

        it('should show error toast on cascade delete failure', async () => {
            mockDeleteRecipe.mockRejectedValueOnce(new Error('API Error'));
            render(<RecipeManagement />);
            clickDelete('Fried Rice');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to delete recipe and related data');
            });
        });
    });

    describe('Delete Recipe - Blocked (Sub-Recipe Used in Other Recipes)', () => {
        it('should show recipe usage warning instead of delete dialog', () => {
            render(<RecipeManagement />);
            clickDelete('Special Sauce'); // Used in Chicken Rice
            expect(screen.getByText('Cannot Delete Sub-Recipe')).toBeInTheDocument();
        });

        it('should list recipes using the sub-recipe', () => {
            render(<RecipeManagement />);
            clickDelete('Special Sauce');
            // Look for "Chicken Rice" within the dialog
            const chickenRiceElements = screen.getAllByText('Chicken Rice');
            // Should appear both in the table AND in the warning dialog
            expect(chickenRiceElements.length).toBeGreaterThanOrEqual(1);
        });

        it('should show sub-recipe name in message', () => {
            render(<RecipeManagement />);
            clickDelete('Special Sauce');
            const messageElements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('Special Sauce') && element?.textContent?.includes('currently used') || false;
            });
            expect(messageElements.length).toBeGreaterThan(0);
        });

        it('should show note about removing from recipes first', () => {
            render(<RecipeManagement />);
            clickDelete('Special Sauce');
            const noteElements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('You need to remove this sub-recipe') || false;
            });
            expect(noteElements.length).toBeGreaterThan(0);
        });

        it('should show singular text for single recipe', () => {
            render(<RecipeManagement />);
            clickDelete('Special Sauce');
            const singularElements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('main dish:') && !element?.textContent?.includes('dishes') || false;
            });
            expect(singularElements.length).toBeGreaterThan(0);
        });

        it('should show plural text for multiple recipes', () => {
            // Create a sub-recipe used in multiple recipes
            const modifiedRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Another Dish',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ childRecipeId: 'r3', quantity: 30 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: modifiedRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Special Sauce');
            const pluralElements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('main dishes:') || false;
            });
            expect(pluralElements.length).toBeGreaterThan(0);
        });

        it('should not call deleteRecipe when blocked', async () => {
            render(<RecipeManagement />);
            clickDelete('Special Sauce');
            const okButton = screen.getByText('OK, I Understand');
            fireEvent.click(okButton);

            await waitFor(() => {
                expect(screen.queryByText('Cannot Delete Sub-Recipe')).not.toBeInTheDocument();
            });
            expect(mockDeleteRecipe).not.toHaveBeenCalled();
        });

        it('should close dialog when OK button is clicked', async () => {
            render(<RecipeManagement />);
            clickDelete('Special Sauce');
            const okButton = screen.getByText('OK, I Understand');
            fireEvent.click(okButton);

            await waitFor(() => {
                expect(screen.queryByText('Cannot Delete Sub-Recipe')).not.toBeInTheDocument();
            });
        });
    });

    describe('Integration', () => {
        it('should render without crashing with empty data', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: [], ingredients: [] }) as AppContextType
            );
            render(<RecipeManagement />);
            expect(screen.getByText('Recipe Management')).toBeInTheDocument();
        });

        it('should handle complete add workflow', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('Integration Test Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '100' } });

            clickSubmit();

            await waitFor(() => {
                expect(mockAddRecipe).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should handle complete edit workflow', async () => {
            render(<RecipeManagement />);
            clickEdit('Fried Rice');

            const nameInput = screen.getByLabelText(/Recipe Name/i);
            fireEvent.change(nameInput, { target: { value: 'Modified Fried Rice' } });

            clickSubmit(true);

            await waitFor(() => {
                expect(mockUpdateRecipe).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should handle complete delete workflow', async () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);
            clickDelete('Standalone Recipe');
            const confirmButton = screen.getByText('Yes, Delete Recipe');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockDeleteRecipe).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should disable buttons during submission', async () => {
            render(<RecipeManagement />);
            clickAddButton();
            fillRecipeName('Test Recipe');

            const selectTrigger = screen.getByRole('combobox');
            fireEvent.click(selectTrigger);
            const option = screen.getByRole('option', { name: /Chicken/i });
            fireEvent.click(option);

            const quantityInput = screen.getByPlaceholderText('0.00');
            fireEvent.change(quantityInput, { target: { value: '100' } });

            const createButton = screen.getByText('Create Recipe');
            fireEvent.click(createButton);

            expect(createButton).toBeDisabled();
        });

        it('should handle multiple dialogs correctly', async () => {
            const testRecipes = [
                ...mockRecipes,
                {
                    id: 'r4',
                    name: 'Standalone Recipe',
                    isSubRecipe: false,
                    storeId: 's1',
                    ingredients: [{ ingredientId: 'ing1', quantity: 100 }],
                },
            ];
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ recipes: testRecipes }) as AppContextType
            );
            render(<RecipeManagement />);

            // Open add dialog
            clickAddButton();
            expect(screen.getByText('Add New Recipe')).toBeInTheDocument();

            // Close it
            const cancelButton = screen.getByText('Cancel');
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.queryByText('Add New Recipe')).not.toBeInTheDocument();
            });

            // Open delete dialog
            clickDelete('Standalone Recipe');
            expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        });
    });
});
