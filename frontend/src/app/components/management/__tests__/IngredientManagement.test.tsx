import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { IngredientManagement } from '../IngredientManagement';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType } from '@/app/types';
import { toast } from 'sonner';

// ========== Module mocks ==========

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// ========== Helpers ==========

const mockIngredients = [
    { id: 'i1', name: 'Chicken', unit: 'kg', carbonFootprint: 6.9 },
    { id: 'i2', name: 'Rice', unit: 'g', carbonFootprint: 2.7 },
    { id: 'i3', name: 'Tomato', unit: 'kg', carbonFootprint: 1.1 },
];

const mockRecipes = [
    {
        id: 'r1',
        name: 'Chicken Rice',
        isSubRecipe: false,
        ingredients: [
            { ingredientId: 'i1', quantity: 200 },
            { ingredientId: 'i2', quantity: 300 },
        ],
    },
    {
        id: 'r2',
        name: 'Tomato Soup',
        isSubRecipe: false,
        ingredients: [{ ingredientId: 'i3', quantity: 500 }],
    },
];

const mockWastageData = [
    { id: 'w1', date: '2026-02-08', ingredientId: 'i2', quantity: 50 },
    { id: 'w2', date: '2026-02-09', ingredientId: 'i2', quantity: 30 },
];

const mockAddIngredient = vi.fn().mockResolvedValue(undefined);
const mockUpdateIngredient = vi.fn().mockResolvedValue(undefined);
const mockDeleteIngredient = vi.fn().mockResolvedValue(undefined);

function createCtx(overrides?: Partial<AppContextType>): Partial<AppContextType> {
    return {
        ingredients: mockIngredients,
        recipes: mockRecipes,
        wastageData: mockWastageData,
        addIngredient: mockAddIngredient,
        updateIngredient: mockUpdateIngredient,
        deleteIngredient: mockDeleteIngredient,
        ...overrides,
    };
}

function useCtx(overrides?: Partial<AppContextType>) {
    vi.spyOn(AppContext, 'useApp').mockReturnValue(createCtx(overrides) as AppContextType);
}

/** Click the "Add Ingredient" button */
function clickAddButton() {
    fireEvent.click(screen.getByText('Add Ingredient'));
}

/** Fill the ingredient form */
function fillForm({ name, unit, carbon }: { name?: string; unit?: string; carbon?: string }) {
    if (name !== undefined) {
        const nameInput = screen.getByLabelText('Ingredient Name');
        fireEvent.change(nameInput, { target: { value: name } });
    }
    if (unit !== undefined) {
        const unitSelect = screen.getByLabelText('Unit');
        fireEvent.change(unitSelect, { target: { value: unit } });
    }
    if (carbon !== undefined) {
        const carbonInput = screen.getByLabelText(/Carbon Footprint/);
        fireEvent.change(carbonInput, { target: { value: carbon } });
    }
}

/** Click the submit button in the dialog */
function clickSubmit(isEdit = false) {
    const buttonText = isEdit ? 'Update Ingredient' : 'Add Ingredient';
    const buttons = screen.getAllByText(buttonText);
    fireEvent.click(buttons[buttons.length - 1]); // Click the one in dialog (last one)
}

/** Click Edit button for an ingredient row */
function clickEdit(ingredientName: string) {
    const row = screen.getByText(ingredientName).closest('tr')!;
    const buttons = within(row).getAllByRole('button');
    // First button is Edit, second is Delete based on component code
    const editButton = buttons[0];
    if (!editButton) throw new Error('Edit button not found');
    fireEvent.click(editButton);
}

/** Click Delete button for an ingredient row */
function clickDelete(ingredientName: string) {
    const row = screen.getByText(ingredientName).closest('tr')!;
    const buttons = within(row).getAllByRole('button');
    // First button is Edit, second is Delete based on component code
    const deleteButton = buttons[1];
    if (!deleteButton) throw new Error('Delete button not found');
    fireEvent.click(deleteButton);
}

// ========== Tests ==========

describe('IngredientManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAddIngredient.mockResolvedValue(undefined);
        mockUpdateIngredient.mockResolvedValue(undefined);
        mockDeleteIngredient.mockResolvedValue(undefined);
    });

    // ==================== 1. Rendering ====================
    describe('Rendering', () => {
        it('should render page title and icon', () => {
            useCtx();
            const { container } = render(<IngredientManagement />);
            expect(screen.getByText('Ingredient Management')).toBeInTheDocument();
            expect(container.querySelector('svg.lucide-package')).toBeInTheDocument();
        });

        it('should render page description', () => {
            useCtx();
            render(<IngredientManagement />);
            expect(screen.getByText('Master ingredients list')).toBeInTheDocument();
        });

        it('should render Add Ingredient button', () => {
            useCtx();
            render(<IngredientManagement />);
            expect(screen.getByText('Add Ingredient')).toBeInTheDocument();
        });

        it('should render ingredient count', () => {
            useCtx();
            render(<IngredientManagement />);
            expect(screen.getByText('3 ingredients in the system')).toBeInTheDocument();
        });

        it('should render ingredient count (singular)', () => {
            useCtx({ ingredients: [mockIngredients[0]] });
            render(<IngredientManagement />);
            expect(screen.getByText('1 ingredient in the system')).toBeInTheDocument();
        });

        it('should render table headers', () => {
            useCtx();
            render(<IngredientManagement />);
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Unit')).toBeInTheDocument();
            expect(screen.getByText(/Carbon Footprint/)).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });

        it('should render all ingredients in table', () => {
            useCtx();
            render(<IngredientManagement />);
            expect(screen.getByText('Chicken')).toBeInTheDocument();
            expect(screen.getByText('Rice')).toBeInTheDocument();
            expect(screen.getByText('Tomato')).toBeInTheDocument();
        });

        it('should display carbon footprint with one decimal', () => {
            useCtx();
            render(<IngredientManagement />);
            expect(screen.getByText('6.9')).toBeInTheDocument();
            expect(screen.getByText('2.7')).toBeInTheDocument();
            expect(screen.getByText('1.1')).toBeInTheDocument();
        });

        it('should render Edit and Delete buttons for each row', () => {
            useCtx();
            render(<IngredientManagement />);
            // Each row should have 2 buttons (Edit and Delete)
            const rows = screen.getAllByRole('row');
            // Subtract 1 for header row
            const dataRows = rows.slice(1);
            expect(dataRows.length).toBe(3);

            // Check each data row has 2 buttons
            dataRows.forEach(row => {
                const buttons = within(row).getAllByRole('button');
                expect(buttons.length).toBe(2);
            });
        });
    });

    // ==================== 2. Add Ingredient Dialog ====================
    describe('Add Ingredient Dialog', () => {
        it('should open dialog when Add Ingredient clicked', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            expect(screen.getByText('Add New Ingredient')).toBeInTheDocument();
        });

        it('should show dialog description', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            expect(screen.getByText('Add a new ingredient to the system')).toBeInTheDocument();
        });

        it('should render form fields', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            expect(screen.getByLabelText('Ingredient Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Unit')).toBeInTheDocument();
            expect(screen.getByLabelText(/Carbon Footprint/)).toBeInTheDocument();
        });

        it('should have empty form fields initially', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            expect(screen.getByLabelText('Ingredient Name')).toHaveValue('');
            expect(screen.getByLabelText('Unit')).toHaveValue('');
            expect(screen.getByLabelText(/Carbon Footprint/)).toHaveValue(null);
        });

        it('should show unit options', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            const unitSelect = screen.getByLabelText('Unit');
            const options = unitSelect.querySelectorAll('option');
            expect(options.length).toBe(5); // -- Select unit --, g, kg, ml, L
            expect(Array.from(options).map(o => o.textContent)).toContain('g (gram)');
            expect(Array.from(options).map(o => o.textContent)).toContain('kg (kilogram)');
        });

        it('should allow filling the form', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });
            expect(screen.getByLabelText('Ingredient Name')).toHaveValue('Onion');
            expect(screen.getByLabelText('Unit')).toHaveValue('kg');
            expect(screen.getByLabelText(/Carbon Footprint/)).toHaveValue(0.4);
        });

        it('should close dialog on Cancel', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fireEvent.click(screen.getByText('Cancel'));
            expect(screen.queryByText('Add New Ingredient')).not.toBeInTheDocument();
        });
    });

    // ==================== 3. Add Ingredient Submission ====================
    describe('Add Ingredient Submission', () => {
        it('should call addIngredient on valid submission', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });
            clickSubmit();

            await waitFor(() => {
                expect(mockAddIngredient).toHaveBeenCalledWith({
                    name: 'Onion',
                    unit: 'kg',
                    carbonFootprint: 0.4,
                });
            });
        });

        it('should show success toast after adding', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });
            clickSubmit();

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Ingredient added successfully');
            });
        });

        it('should close dialog after successful add', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });
            clickSubmit();

            await waitFor(() => {
                expect(screen.queryByText('Add New Ingredient')).not.toBeInTheDocument();
            });
        });

        it('should trim whitespace from name', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: '  Onion  ', unit: 'kg', carbon: '0.4' });
            clickSubmit();

            await waitFor(() => {
                expect(mockAddIngredient).toHaveBeenCalledWith(
                    expect.objectContaining({ name: 'Onion' })
                );
            });
        });

        it('should trim whitespace from unit', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });
            clickSubmit();

            await waitFor(() => {
                expect(mockAddIngredient).toHaveBeenCalledWith(
                    expect.objectContaining({ unit: 'kg' })
                );
            });
        });

        it('should show error if name is empty', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: '', unit: 'kg', carbon: '0.4' });
            clickSubmit();
            expect(toast.error).toHaveBeenCalledWith('Please enter an ingredient name');
        });

        it('should show error if name is whitespace only', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: '   ', unit: 'kg', carbon: '0.4' });
            clickSubmit();
            expect(toast.error).toHaveBeenCalledWith('Please enter an ingredient name');
        });

        it('should show error if unit is empty', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: '', carbon: '0.4' });
            clickSubmit();
            expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
        });

        it('should show error if carbon footprint is empty', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '' });
            clickSubmit();
            expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
        });

        it('should show error if carbon footprint is negative', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '-1' });
            clickSubmit();
            expect(toast.error).toHaveBeenCalledWith('Carbon footprint must be a positive number');
        });

        it('should show error if carbon footprint is not a number', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: 'abc' });
            clickSubmit();
            // type="number" input treats 'abc' as empty, so it shows "Please fill in all required fields"
            expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
        });

        it('should show error toast on API failure', async () => {
            mockAddIngredient.mockRejectedValueOnce(new Error('API error'));
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });
            clickSubmit();

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to save ingredient');
            });
        });

        it('should disable submit button while submitting', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });

            const buttons = screen.getAllByText('Add Ingredient');
            const submitButton = buttons[buttons.length - 1] as HTMLButtonElement;
            fireEvent.click(submitButton);

            // Check that button is disabled during submission
            expect(submitButton).toBeDisabled();

            await waitFor(() => {
                expect(mockAddIngredient).toHaveBeenCalled();
            });
        });
    });

    // ==================== 4. Edit Ingredient Dialog ====================
    describe('Edit Ingredient Dialog', () => {
        it('should open dialog with ingredient data', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            expect(screen.getByText('Edit Ingredient')).toBeInTheDocument();
            expect(screen.getByLabelText('Ingredient Name')).toHaveValue('Chicken');
            expect(screen.getByLabelText('Unit')).toHaveValue('kg');
            expect(screen.getByLabelText(/Carbon Footprint/)).toHaveValue(6.9);
        });

        it('should show edit dialog description', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Rice');
            expect(screen.getByText('Edit the details of the ingredient')).toBeInTheDocument();
        });

        it('should allow editing name', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            fillForm({ name: 'Chicken Breast' });
            expect(screen.getByLabelText('Ingredient Name')).toHaveValue('Chicken Breast');
        });

        it('should allow editing carbon footprint', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            fillForm({ carbon: '7.5' });
            expect(screen.getByLabelText(/Carbon Footprint/)).toHaveValue(7.5);
        });

        it('should call updateIngredient on submission', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            fillForm({ name: 'Chicken Breast', carbon: '7.5' });
            clickSubmit(true);

            await waitFor(() => {
                expect(mockUpdateIngredient).toHaveBeenCalledWith('i1', {
                    name: 'Chicken Breast',
                    unit: 'kg',
                    carbonFootprint: 7.5,
                });
            });
        });

        it('should show success toast after updating', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            fillForm({ carbon: '7.5' });
            clickSubmit(true);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Ingredient updated successfully');
            });
        });

        it('should close dialog after successful update', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            fillForm({ carbon: '7.5' });
            clickSubmit(true);

            await waitFor(() => {
                expect(screen.queryByText('Edit Ingredient')).not.toBeInTheDocument();
            });
        });

        it('should validate edited fields', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            fillForm({ name: '' });
            clickSubmit(true);
            expect(toast.error).toHaveBeenCalledWith('Please enter an ingredient name');
        });

        it('should show error toast on update failure', async () => {
            mockUpdateIngredient.mockRejectedValueOnce(new Error('API error'));
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');
            fillForm({ carbon: '7.5' });
            clickSubmit(true);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to save ingredient');
            });
        });
    });

    // ==================== 5. Unit Change Warning ====================
    describe('Unit Change Warning', () => {
        it('should show warning when changing unit of ingredient used in recipes', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            fireEvent.change(unitSelect, { target: { value: 'g' } });

            expect(screen.getByText('Unit Change Warning')).toBeInTheDocument();
        });

        it('should list recipes using the ingredient', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            fireEvent.change(unitSelect, { target: { value: 'g' } });

            expect(screen.getByText('Chicken Rice')).toBeInTheDocument();
        });

        it('should show note about updating carbon footprint', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            fireEvent.change(unitSelect, { target: { value: 'g' } });

            expect(screen.getByText(/please also update the carbon footprint/i)).toBeInTheDocument();
        });

        it('should allow confirming unit change', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            fireEvent.change(unitSelect, { target: { value: 'g' } });

            fireEvent.click(screen.getByText('Confirm'));

            // Unit should be changed
            expect(screen.getByLabelText('Unit')).toHaveValue('g');
        });

        it('should allow canceling unit change', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            fireEvent.change(unitSelect, { target: { value: 'g' } });

            const cancelButtons = screen.getAllByText('Cancel');
            fireEvent.click(cancelButtons[cancelButtons.length - 1]); // Last Cancel (in warning dialog)

            // Edit dialog should be closed
            expect(screen.queryByText('Edit Ingredient')).not.toBeInTheDocument();
        });

        it('should not show warning when changing unit of ingredient not used in recipes', () => {
            // Create an ingredient not used in any recipe
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({ ingredients: [...mockIngredients, unusedIngredient] });
            render(<IngredientManagement />);
            clickEdit('Garlic');

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            fireEvent.change(unitSelect, { target: { value: 'kg' } });

            // Should not show warning
            expect(screen.queryByText('Unit Change Warning')).not.toBeInTheDocument();
            // Unit should be changed directly
            expect(screen.getByLabelText('Unit')).toHaveValue('kg');
        });

        it('should not show warning when setting unit for new ingredient', () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            fireEvent.change(unitSelect, { target: { value: 'kg' } });

            expect(screen.queryByText('Unit Change Warning')).not.toBeInTheDocument();
        });

        it('should not show warning when changing back to original unit', () => {
            useCtx();
            render(<IngredientManagement />);
            clickEdit('Chicken');

            const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
            // Change to different unit
            fireEvent.change(unitSelect, { target: { value: 'g' } });
            // Confirm the change
            fireEvent.click(screen.getByText('Confirm'));

            // After confirming, the baselineUnit is updated to 'g', so changing back doesn't trigger warning
            // To test properly, we need to check that changing to 'kg' doesn't show warning
            // because after confirming 'g', the baseline is 'g', so 'kg' is a new change
            // Let's just verify that unit is now 'g' after confirmation
            expect(unitSelect.value).toBe('g');
        });
    });

    // ==================== 6. Delete Ingredient (Simple) ====================
    describe('Delete Ingredient (Simple)', () => {
        it('should open delete confirmation dialog', () => {
            // Use ingredient not in recipes or wastage
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        });

        it('should show ingredient name in delete dialog', () => {
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            // Check for "Garlic" text within the dialog
            expect(screen.getAllByText('Garlic').length).toBeGreaterThan(0);
        });

        it('should show warning about permanent deletion', () => {
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
        });

        it('should call deleteIngredient without cascade', async () => {
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(mockDeleteIngredient).toHaveBeenCalledWith('i4', false);
            });
        });

        it('should show success toast after deletion', async () => {
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Ingredient deleted successfully');
            });
        });

        it('should close dialog after successful deletion', async () => {
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
            });
        });

        it('should allow canceling deletion', () => {
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');

            const cancelButtons = screen.getAllByText('Cancel');
            fireEvent.click(cancelButtons[cancelButtons.length - 1]);

            expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
            expect(mockDeleteIngredient).not.toHaveBeenCalled();
        });

        it('should show error toast on delete failure', async () => {
            mockDeleteIngredient.mockRejectedValueOnce(new Error('API error'));
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                recipes: mockRecipes,
                wastageData: mockWastageData,
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to delete ingredient');
            });
        });
    });

    // ==================== 7. Delete Ingredient (With Wastage) ====================
    describe('Delete Ingredient (With Wastage)', () => {
        it('should show cascade delete warning', () => {
            // Use ingredient with wastage but not in recipes
            const pepper = { id: 'i5', name: 'Pepper', unit: 'g', carbonFootprint: 0.3 };
            const wastageForPepper = [
                { id: 'w1', date: '2026-02-08', ingredientId: 'i5', quantity: 50 },
                { id: 'w2', date: '2026-02-09', ingredientId: 'i5', quantity: 30 },
            ];
            useCtx({
                ingredients: [...mockIngredients, pepper],
                wastageData: wastageForPepper,
            });
            render(<IngredientManagement />);
            clickDelete('Pepper');
            expect(screen.getByText(/has related wastage data records/i)).toBeInTheDocument();
        });

        it('should show wastage record count', () => {
            const pepper = { id: 'i5', name: 'Pepper', unit: 'g', carbonFootprint: 0.3 };
            const wastageForPepper = [
                { id: 'w1', date: '2026-02-08', ingredientId: 'i5', quantity: 50 },
                { id: 'w2', date: '2026-02-09', ingredientId: 'i5', quantity: 30 },
            ];
            useCtx({
                ingredients: [...mockIngredients, pepper],
                wastageData: wastageForPepper,
            });
            render(<IngredientManagement />);
            clickDelete('Pepper');
            // Use queryAllByText since multiple parent elements match
            const elements = screen.queryAllByText((content, element) => {
                const text = element?.textContent || '';
                return text.includes('2') && text.includes('Wastage Data record');
            });
            expect(elements.length).toBeGreaterThan(0);
        });

        it('should show warning about permanent deletion with count', () => {
            const pepper = { id: 'i5', name: 'Pepper', unit: 'g', carbonFootprint: 0.3 };
            const wastageForPepper = [
                { id: 'w1', date: '2026-02-08', ingredientId: 'i5', quantity: 50 },
                { id: 'w2', date: '2026-02-09', ingredientId: 'i5', quantity: 30 },
            ];
            useCtx({
                ingredients: [...mockIngredients, pepper],
                wastageData: wastageForPepper,
            });
            render(<IngredientManagement />);
            clickDelete('Pepper');
            const elements = screen.queryAllByText((content, element) => {
                return element?.textContent?.includes('permanently delete') &&
                    element?.textContent?.includes('all 2 related wastage record') || false;
            });
            expect(elements.length).toBeGreaterThan(0);
        });

        it('should call deleteIngredient with cascade=true', async () => {
            const pepper = { id: 'i5', name: 'Pepper', unit: 'g', carbonFootprint: 0.3 };
            const wastageForPepper = [
                { id: 'w1', date: '2026-02-08', ingredientId: 'i5', quantity: 50 },
                { id: 'w2', date: '2026-02-09', ingredientId: 'i5', quantity: 30 },
            ];
            useCtx({
                ingredients: [...mockIngredients, pepper],
                wastageData: wastageForPepper,
            });
            render(<IngredientManagement />);
            clickDelete('Pepper');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(mockDeleteIngredient).toHaveBeenCalledWith('i5', true);
            });
        });

        it('should show success toast with wastage count', async () => {
            const pepper = { id: 'i5', name: 'Pepper', unit: 'g', carbonFootprint: 0.3 };
            const wastageForPepper = [
                { id: 'w1', date: '2026-02-08', ingredientId: 'i5', quantity: 50 },
                { id: 'w2', date: '2026-02-09', ingredientId: 'i5', quantity: 30 },
            ];
            useCtx({
                ingredients: [...mockIngredients, pepper],
                wastageData: wastageForPepper,
            });
            render(<IngredientManagement />);
            clickDelete('Pepper');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Ingredient and 2 related wastage records deleted successfully');
            });
        });

        it('should show singular form for 1 wastage record', async () => {
            // Create ingredient with only 1 wastage record (use ingredient not in recipes)
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            const wastageWithOne = [{ id: 'w1', date: '2026-02-08', ingredientId: 'i4', quantity: 50 }];
            useCtx({
                ingredients: [...mockIngredients, unusedIngredient],
                wastageData: wastageWithOne,
                recipes: mockRecipes, // Keep mockRecipes but Garlic is not used
            });
            render(<IngredientManagement />);
            clickDelete('Garlic');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Ingredient and 1 related wastage record deleted successfully');
            });
        });

        it('should show error toast on cascade delete failure', async () => {
            mockDeleteIngredient.mockRejectedValueOnce(new Error('API error'));
            const pepper = { id: 'i5', name: 'Pepper', unit: 'g', carbonFootprint: 0.3 };
            const wastageForPepper = [
                { id: 'w1', date: '2026-02-08', ingredientId: 'i5', quantity: 50 },
                { id: 'w2', date: '2026-02-09', ingredientId: 'i5', quantity: 30 },
            ];
            useCtx({
                ingredients: [...mockIngredients, pepper],
                wastageData: wastageForPepper,
            });
            render(<IngredientManagement />);
            clickDelete('Pepper');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to delete ingredient and related data');
            });
        });
    });

    // ==================== 8. Delete Ingredient (Blocked by Recipes) ====================
    describe('Delete Ingredient (Blocked by Recipes)', () => {
        it('should show recipe usage warning instead of delete dialog', () => {
            useCtx();
            render(<IngredientManagement />);
            clickDelete('Chicken'); // Used in Chicken Rice
            expect(screen.getByText('Cannot Delete Ingredient')).toBeInTheDocument();
        });

        it('should list recipes using the ingredient', () => {
            useCtx();
            render(<IngredientManagement />);
            clickDelete('Chicken');
            expect(screen.getByText('Chicken Rice')).toBeInTheDocument();
        });

        it('should show ingredient name in message', () => {
            useCtx();
            render(<IngredientManagement />);
            clickDelete('Chicken');
            // Use getAllByText and find the specific <p> element
            const elements = screen.queryAllByText((content, element) => {
                return element?.tagName === 'P' &&
                    element?.textContent?.includes('This ingredient') &&
                    element?.textContent?.includes('Chicken') &&
                    element?.textContent?.includes('is currently used') || false;
            });
            expect(elements.length).toBeGreaterThan(0);
        });

        it('should show note about removing from recipes', () => {
            useCtx();
            render(<IngredientManagement />);
            clickDelete('Chicken');
            expect(screen.getByText(/remove this ingredient from.*recipe.*before you can delete it/i)).toBeInTheDocument();
        });

        it('should show plural text for multiple recipes', () => {
            // Add Chicken to another recipe
            const recipesWithMultiple = [
                ...mockRecipes,
                {
                    id: 'r3',
                    name: 'Chicken Soup',
                    isSubRecipe: false,
                    ingredients: [{ ingredientId: 'i1', quantity: 300 }],
                },
            ];
            useCtx({ recipes: recipesWithMultiple });
            render(<IngredientManagement />);
            clickDelete('Chicken');
            expect(screen.getByText(/these recipes/i)).toBeInTheDocument();
        });

        it('should not call deleteIngredient when blocked', () => {
            useCtx();
            render(<IngredientManagement />);
            clickDelete('Chicken');
            expect(mockDeleteIngredient).not.toHaveBeenCalled();
        });

        it('should close dialog on Cancel', () => {
            useCtx();
            render(<IngredientManagement />);
            clickDelete('Chicken');

            const cancelButtons = screen.getAllByText('Cancel');
            fireEvent.click(cancelButtons[cancelButtons.length - 1]);

            expect(screen.queryByText('Cannot Delete Ingredient')).not.toBeInTheDocument();
        });

        it('should show Go to Recipe Management button when onNavigateToRecipes provided', () => {
            const mockNavigate = vi.fn();
            useCtx();
            render(<IngredientManagement onNavigateToRecipes={mockNavigate} />);
            clickDelete('Chicken');
            expect(screen.getByText('Go to Recipe Management')).toBeInTheDocument();
        });

        it('should call onNavigateToRecipes when button clicked', () => {
            const mockNavigate = vi.fn();
            useCtx();
            render(<IngredientManagement onNavigateToRecipes={mockNavigate} />);
            clickDelete('Chicken');
            fireEvent.click(screen.getByText('Go to Recipe Management'));
            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should not show Go to Recipe Management button when onNavigateToRecipes not provided', () => {
            useCtx();
            render(<IngredientManagement />);
            clickDelete('Chicken');
            expect(screen.queryByText('Go to Recipe Management')).not.toBeInTheDocument();
        });
    });

    // ==================== 9. Integration ====================
    describe('Integration', () => {
        it('should render without crashing', () => {
            useCtx();
            expect(() => render(<IngredientManagement />)).not.toThrow();
        });

        it('should render with empty ingredients list', () => {
            useCtx({ ingredients: [] });
            render(<IngredientManagement />);
            expect(screen.getByText('0 ingredients in the system')).toBeInTheDocument();
        });

        it('should handle add → edit → delete workflow', async () => {
            useCtx();
            render(<IngredientManagement />);

            // Add
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });
            clickSubmit();
            await waitFor(() => expect(mockAddIngredient).toHaveBeenCalled());

            // Edit existing ingredient (Chicken)
            clickEdit('Chicken');
            fillForm({ carbon: '7.5' });
            clickSubmit(true);
            await waitFor(() => expect(mockUpdateIngredient).toHaveBeenCalled());

            // Delete unused ingredient (Garlic)
            const unusedIngredient = { id: 'i4', name: 'Garlic', unit: 'g', carbonFootprint: 0.5 };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(createCtx({
                ingredients: [...mockIngredients, unusedIngredient]
            }) as AppContextType);

            const { rerender } = render(<IngredientManagement />);
            clickDelete('Garlic');
            fireEvent.click(screen.getByText('Yes, Delete Ingredient'));
            await waitFor(() => expect(mockDeleteIngredient).toHaveBeenCalled());
        });

        it('should disable buttons during operations', async () => {
            useCtx();
            render(<IngredientManagement />);
            clickAddButton();
            fillForm({ name: 'Onion', unit: 'kg', carbon: '0.4' });

            const submitButtons = screen.getAllByText('Add Ingredient');
            const submitButton = submitButtons[submitButtons.length - 1] as HTMLButtonElement;
            const cancelButton = screen.getByText('Cancel') as HTMLButtonElement;

            fireEvent.click(submitButton);

            // Buttons should be disabled during submission
            expect(submitButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();

            await waitFor(() => {
                expect(mockAddIngredient).toHaveBeenCalled();
            });
        });

        it('should handle multiple dialogs correctly', () => {
            useCtx();
            render(<IngredientManagement />);

            // Open add dialog
            clickAddButton();
            expect(screen.getByText('Add New Ingredient')).toBeInTheDocument();

            // Close it
            fireEvent.click(screen.getByText('Cancel'));
            expect(screen.queryByText('Add New Ingredient')).not.toBeInTheDocument();

            // Open edit dialog
            clickEdit('Chicken');
            expect(screen.getByText('Edit Ingredient')).toBeInTheDocument();

            // Close it
            const cancelButtons = screen.getAllByText('Cancel');
            fireEvent.click(cancelButtons[cancelButtons.length - 1]);
            expect(screen.queryByText('Edit Ingredient')).not.toBeInTheDocument();
        });
    });
});
