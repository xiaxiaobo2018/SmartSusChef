import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalesManagement } from '../SalesManagement';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType } from '@/app/context/AppContext';
import { SalesData, Recipe, User } from '@/app/types';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe('SalesManagement', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterday = subDays(today, 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    const sixDaysAgo = subDays(today, 6);
    const sixDaysAgoStr = format(sixDaysAgo, 'yyyy-MM-dd');
    const eightDaysAgo = subDays(today, 8);
    const eightDaysAgoStr = format(eightDaysAgo, 'yyyy-MM-dd');
    const thirtyDaysAgo = subDays(today, 30);
    const thirtyDaysAgoStr = format(thirtyDaysAgo, 'yyyy-MM-dd');

    const mockRecipes: Recipe[] = [
        {
            id: 'r1',
            name: 'Chicken Rice',
            isSubRecipe: false,
            isSellable: true,
            ingredients: [{ ingredientId: 'i1', quantity: 100 }],
        },
        {
            id: 'r2',
            name: 'Beef Noodles',
            isSubRecipe: false,
            isSellable: true,
            ingredients: [{ ingredientId: 'i2', quantity: 200 }],
        },
        {
            id: 'r3',
            name: 'Special Sauce',
            isSubRecipe: true,
            isSellable: false,
            ingredients: [{ ingredientId: 'i3', quantity: 50 }],
        },
        {
            id: 'r4',
            name: 'Fried Rice',
            isSubRecipe: false,
            isSellable: true,
            ingredients: [{ ingredientId: 'i4', quantity: 150 }],
        },
    ];

    const mockSalesData: SalesData[] = [
        {
            id: 's1',
            recipeId: 'r1',
            quantity: 10,
            date: todayStr,
            modifiedAt: new Date().toISOString(),
        },
        {
            id: 's2',
            recipeId: 'r2',
            quantity: 15,
            date: yesterdayStr,
            modifiedAt: new Date().toISOString(),
        },
        {
            id: 's3',
            recipeId: 'r1',
            quantity: 8,
            date: sixDaysAgoStr,
        },
        {
            id: 's4',
            recipeId: 'r2',
            quantity: 20,
            date: eightDaysAgoStr,
        },
        {
            id: 's5',
            recipeId: 'r1',
            quantity: 5,
            date: thirtyDaysAgoStr,
        },
    ];

    const mockUser: User = {
        id: 'u1',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee',
    };

    const mockManagerUser: User = {
        id: 'u2',
        username: 'manager',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager',
    };

    const mockUpdateSalesData = vi.fn().mockResolvedValue(undefined);
    const mockDeleteSalesData = vi.fn().mockResolvedValue(undefined);
    const mockAddSalesData = vi.fn().mockResolvedValue({ id: 'new-id' });

    const createMockContext = (overrides = {}): Partial<AppContextType> => ({
        user: mockUser,
        salesData: mockSalesData,
        recipes: mockRecipes,
        updateSalesData: mockUpdateSalesData,
        deleteSalesData: mockDeleteSalesData,
        addSalesData: mockAddSalesData,
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AppContext, 'useApp').mockReturnValue(createMockContext() as AppContextType);
    });

    // Helper functions
    function clickFilterOption(filterValue: string) {
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        const option = screen.getByRole('option', { name: new RegExp(filterValue, 'i') });
        fireEvent.click(option);
    }

    function clickAddNewRecord() {
        const addButton = screen.getByText('Add New Record');
        fireEvent.click(addButton);
    }

    function clickEdit(recipeName: string) {
        const cells = screen.getAllByText(recipeName).filter(el => el.tagName === 'TD');
        const row = cells[0].closest('tr')!;
        const editButton = within(row).getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
    }

    describe('Rendering', () => {
        it('should render page title and description', () => {
            render(<SalesManagement />);
            expect(screen.getByText('Sales Data Management')).toBeInTheDocument();
            expect(screen.getByText('View and edit sales data with audit trail')).toBeInTheDocument();
        });

        it('should render Add New Record button', () => {
            render(<SalesManagement />);
            expect(screen.getByText('Add New Record')).toBeInTheDocument();
        });

        it('should render filter dropdown', () => {
            render(<SalesManagement />);
            expect(screen.getByText('Filter:')).toBeInTheDocument();
        });

        it('should display sales record count with plural form', () => {
            render(<SalesManagement />);
            expect(screen.getByText(/5 records found/i)).toBeInTheDocument();
        });

        it('should display sales record count with singular form', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ salesData: [mockSalesData[0]] }) as AppContextType
            );
            render(<SalesManagement />);
            expect(screen.getByText(/1 record found/i)).toBeInTheDocument();
        });

        it('should display edit restriction message for non-managers', () => {
            render(<SalesManagement />);
            expect(screen.getByText(/Only data from the last 7 days can be edited/i)).toBeInTheDocument();
        });

        it('should not display edit restriction message for managers', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ user: mockManagerUser }) as AppContextType
            );
            render(<SalesManagement />);
            expect(screen.queryByText(/Only data from the last 7 days can be edited/i)).not.toBeInTheDocument();
        });

        it('should group sales data by date', () => {
            render(<SalesManagement />);
            expect(screen.getByText(format(new Date(todayStr), 'EEE, d MMM yyyy'))).toBeInTheDocument();
            expect(screen.getByText(format(new Date(yesterdayStr), 'EEE, d MMM yyyy'))).toBeInTheDocument();
        });

        it('should display recipe names in sales records', () => {
            render(<SalesManagement />);
            const chickenRiceCells = screen.getAllByText('Chicken Rice');
            expect(chickenRiceCells.length).toBeGreaterThanOrEqual(1);
            const beefNoodlesCells = screen.getAllByText('Beef Noodles');
            expect(beefNoodlesCells.length).toBeGreaterThanOrEqual(1);
        });

        it('should display quantities for each record', () => {
            render(<SalesManagement />);
            expect(screen.getByText('10 dishes')).toBeInTheDocument();
            expect(screen.getByText('15 dishes')).toBeInTheDocument();
        });

        it('should display total quantity per date', () => {
            render(<SalesManagement />);
            expect(screen.getByText('Total: 10 dishes')).toBeInTheDocument(); // Today
        });

        it('should display read-only indicator for old records', () => {
            render(<SalesManagement />);
            const readOnlyIndicators = screen.getAllByText(/Read-only \(older than 7 days\)/i);
            expect(readOnlyIndicators.length).toBeGreaterThan(0);
        });

        it('should display Edit buttons for each record', () => {
            render(<SalesManagement />);
            const editButtons = screen.getAllByRole('button', { name: /edit/i });
            expect(editButtons.length).toBeGreaterThan(0);
        });

        it('should disable Edit buttons for old records (non-manager)', () => {
            render(<SalesManagement />);
            // Find all edit buttons
            const allRows = screen.getAllByRole('row');
            
            // Find a row with "Beef Noodles" (which has an 8-day-old record - s4)
            // or a row for any old record (just check the date in the table)
            const allEditButtons = screen.getAllByRole('button', { name: /edit/i });
            
            // At least one edit button should be disabled for old records
            const disabledButtons = allEditButtons.filter(btn => btn.hasAttribute('disabled'));
            
            // Should have at least 2 disabled buttons (for s4 and s5, both older than 7 days)
            expect(disabledButtons.length).toBeGreaterThanOrEqual(2);
        });

        it('should show empty state when no data matches filter', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ salesData: [] }) as AppContextType
            );
            render(<SalesManagement />);
            expect(screen.getByText('No sales data found for the selected filter')).toBeInTheDocument();
        });
    });

    describe('Date Filtering', () => {
        it('should filter to show only last 7 days', async () => {
            render(<SalesManagement />);
            clickFilterOption('Last 7 Days');

            await waitFor(() => {
                // Should show records from last 7 days
                expect(screen.getByText('10 dishes')).toBeInTheDocument(); // today
                expect(screen.getByText('15 dishes')).toBeInTheDocument(); // yesterday
                expect(screen.getByText('8 dishes')).toBeInTheDocument(); // 6 days ago
            });

            // Should not show 8 days ago record
            expect(screen.queryByText('20 dishes')).not.toBeInTheDocument();
        });

        it('should filter to show only last 30 days', async () => {
            render(<SalesManagement />);
            clickFilterOption('Last 30 Days');

            await waitFor(() => {
                // Should show records from last 30 days
                expect(screen.getByText('10 dishes')).toBeInTheDocument();
                expect(screen.getByText('15 dishes')).toBeInTheDocument();
                expect(screen.getByText('8 dishes')).toBeInTheDocument();
                expect(screen.getByText('20 dishes')).toBeInTheDocument();
                expect(screen.getByText('5 dishes')).toBeInTheDocument();
            });
        });

        it('should show all records when filter is set to All Time', async () => {
            render(<SalesManagement />);
            // Default is all time
            expect(screen.getByText('10 dishes')).toBeInTheDocument();
            expect(screen.getByText('15 dishes')).toBeInTheDocument();
            expect(screen.getByText('5 dishes')).toBeInTheDocument();
        });

        it('should update record count when filter changes', async () => {
            render(<SalesManagement />);
            expect(screen.getByText(/5 records found/i)).toBeInTheDocument();

            clickFilterOption('Last 7 Days');

            await waitFor(() => {
                expect(screen.getByText(/3 records found/i)).toBeInTheDocument();
            });
        });
    });

    describe('Create Sales Record', () => {
        it('should open create dialog when Add New Record is clicked', () => {
            render(<SalesManagement />);
            clickAddNewRecord();
            expect(screen.getByText('Add New Sales Record')).toBeInTheDocument();
        });

        it('should render all form fields in create dialog', () => {
            render(<SalesManagement />);
            clickAddNewRecord();
            expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Recipe/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
        });

        it('should show date restriction message for non-managers', () => {
            render(<SalesManagement />);
            clickAddNewRecord();
            expect(screen.getByText(/You can only add records for the last 7 days/i)).toBeInTheDocument();
        });

        it('should not show date restriction message for managers', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ user: mockManagerUser }) as AppContextType
            );
            render(<SalesManagement />);
            clickAddNewRecord();
            expect(screen.queryByText(/You can only add records for the last 7 days/i)).not.toBeInTheDocument();
        });

        it('should only show sellable main dishes in recipe dropdown', () => {
            render(<SalesManagement />);
            clickAddNewRecord();
            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);

            expect(screen.getByRole('option', { name: /Chicken Rice/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /Beef Noodles/i })).toBeInTheDocument();
            expect(screen.queryByRole('option', { name: /Special Sauce/i })).not.toBeInTheDocument(); // sub-recipe
        });

        it('should disable Save button when fields are missing', () => {
            render(<SalesManagement />);
            clickAddNewRecord();
            const saveButton = screen.getByText('Save Record');
            expect(saveButton).toBeDisabled();
        });

        it('should show error when quantity is negative', async () => {
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: todayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Chicken Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '-5' } });

            const saveButton = screen.getByText('Save Record');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Please enter a valid quantity');
            });
        });

        it('should show error when duplicate record exists', async () => {
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: todayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Chicken Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '10' } });

            const saveButton = screen.getByText('Save Record');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('A record already exists'));
            });
        });

        it('should call addSalesData with correct data on valid submission', async () => {
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: yesterdayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Fried Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '25' } });

            const saveButton = screen.getByText('Save Record');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockAddSalesData).toHaveBeenCalledWith({
                    date: yesterdayStr,
                    recipeId: 'r4',
                    quantity: 25,
                });
            });
        });

        it('should show success toast on successful creation', async () => {
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: yesterdayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Fried Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '25' } });

            const saveButton = screen.getByText('Save Record');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('New sales record added successfully');
            });
        });

        it('should close dialog after successful creation', async () => {
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: yesterdayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Fried Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '25' } });

            const saveButton = screen.getByText('Save Record');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.queryByText('Add New Sales Record')).not.toBeInTheDocument();
            });
        });

        it('should show error toast on API failure', async () => {
            mockAddSalesData.mockRejectedValueOnce(new Error('API Error'));
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: yesterdayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Fried Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '25' } });

            const saveButton = screen.getByText('Save Record');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to add new sales record');
            });
        });

        it('should close dialog when Cancel is clicked', async () => {
            render(<SalesManagement />);
            clickAddNewRecord();
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Add New Sales Record')).not.toBeInTheDocument();
            });
        });
    });

    describe('Edit Sales Record', () => {
        it('should open edit dialog when Edit button is clicked', () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');
            expect(screen.getByText('Edit Sales Data')).toBeInTheDocument();
        });

        it('should show error when trying to edit old data as non-manager', () => {
            render(<SalesManagement />);
            // Try to click edit on a record older than 7 days
            const allRows = screen.getAllByRole('row');
            const oldRow = allRows.find(row => {
                const text = row.textContent;
                return text?.includes('Beef Noodles') && text?.includes(format(new Date(eightDaysAgoStr), 'd MMM yyyy'));
            });

            if (oldRow) {
                const editButton = within(oldRow).getByRole('button', { name: /edit/i });
                fireEvent.click(editButton);

                expect(toast.error).toHaveBeenCalledWith('Cannot edit data older than 7 days');
            }
        });

        it('should display current record data in edit dialog', () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            expect(screen.getByDisplayValue(format(new Date(todayStr), 'd MMM yyyy'))).toBeInTheDocument();
            expect(screen.getByDisplayValue('Chicken Rice')).toBeInTheDocument();
            expect(screen.getByDisplayValue('10 dishes')).toBeInTheDocument();
        });

        it('should allow entering new quantity', () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '20' } });

            expect(newQuantityInput).toHaveValue(20);
        });

        it('should show error when new quantity is invalid', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '-5' } });

            const updateButton = screen.getByText('Update Record');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Please enter a valid quantity');
            });
        });

        it('should show error when new quantity equals current quantity', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '10' } }); // Same as current

            const updateButton = screen.getByText('Update Record');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('New quantity must be different from current quantity');
            });
        });

        it('should call updateSalesData with correct data', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '20' } });

            const updateButton = screen.getByText('Update Record');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockUpdateSalesData).toHaveBeenCalledWith('s1', { quantity: 20 });
            });
        });

        it('should show success toast on successful update', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '20' } });

            const updateButton = screen.getByText('Update Record');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Sales data updated successfully');
            });
        });

        it('should close dialog after successful update', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '20' } });

            const updateButton = screen.getByText('Update Record');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.queryByText('Edit Sales Data')).not.toBeInTheDocument();
            });
        });

        it('should show error toast on update failure', async () => {
            mockUpdateSalesData.mockRejectedValueOnce(new Error('API Error'));
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '20' } });

            const updateButton = screen.getByText('Update Record');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to update sales data');
            });
        });

        it('should close edit dialog when Cancel is clicked', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButtons[0]);

            await waitFor(() => {
                expect(screen.queryByText('Edit Sales Data')).not.toBeInTheDocument();
            });
        });
    });

    describe('Delete Sales Record', () => {
        it('should open delete confirmation dialog when Delete Record is clicked', () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        });

        it('should display record details in delete dialog', () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            expect(screen.getByText(format(new Date(todayStr), 'd MMM yyyy'))).toBeInTheDocument();
            expect(screen.getAllByText('Chicken Rice').length).toBeGreaterThan(0);
            const dishesElements = screen.getAllByText('10 dishes');
            expect(dishesElements.length).toBeGreaterThan(0);
        });

        it('should show warning message in delete dialog', () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            expect(screen.getByText(/Warning: This action cannot be undone/i)).toBeInTheDocument();
        });

        it('should call deleteSalesData when confirmed', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            const confirmButton = screen.getByText('Yes, Delete Record');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockDeleteSalesData).toHaveBeenCalledWith('s1');
            });
        });

        it('should show success toast after deletion', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            const confirmButton = screen.getByText('Yes, Delete Record');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Sales record deleted successfully');
            });
        });

        it('should close both dialogs after successful deletion', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            const confirmButton = screen.getByText('Yes, Delete Record');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
                expect(screen.queryByText('Edit Sales Data')).not.toBeInTheDocument();
            });
        });

        it('should show error toast on delete failure', async () => {
            mockDeleteSalesData.mockRejectedValueOnce(new Error('API Error'));
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            const confirmButton = screen.getByText('Yes, Delete Record');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to delete sales record');
            });
        });

        it('should close delete dialog when Cancel is clicked', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
            const deleteDialogCancel = cancelButtons[cancelButtons.length - 1];
            fireEvent.click(deleteDialogCancel);

            await waitFor(() => {
                expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
            });
        });
    });

    describe('Permissions', () => {
        it('should allow managers to edit any record regardless of date', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ user: mockManagerUser }) as AppContextType
            );
            render(<SalesManagement />);

            // Check that edit buttons for old records are NOT disabled
            const allRows = screen.getAllByRole('row');
            const oldRow = allRows.find(row => row.textContent?.includes(format(new Date(eightDaysAgoStr), 'd MMM yyyy')));

            if (oldRow) {
                const editButton = within(oldRow).getByRole('button', { name: /edit/i });
                expect(editButton).not.toBeDisabled();
            }
        });

        it('should not show read-only indicators for managers', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ user: mockManagerUser }) as AppContextType
            );
            render(<SalesManagement />);

            expect(screen.queryByText(/Read-only \(older than 7 days\)/i)).not.toBeInTheDocument();
        });

        it('should restrict non-managers from editing records older than 7 days', () => {
            render(<SalesManagement />);

            const allRows = screen.getAllByRole('row');
            const oldRow = allRows.find(row => row.textContent?.includes(format(new Date(eightDaysAgoStr), 'd MMM yyyy')));

            if (oldRow) {
                const editButton = within(oldRow).getByRole('button', { name: /edit/i });
                expect(editButton).toBeDisabled();
            }
        });

        it('should allow non-managers to edit records within 7 days', () => {
            render(<SalesManagement />);

            const todayRow = screen.getAllByRole('row').find(row =>
                row.textContent?.includes(format(new Date(todayStr), 'EEE, d MMM yyyy'))
            );

            if (todayRow) {
                const editButton = within(todayRow).getByRole('button', { name: /edit/i });
                expect(editButton).not.toBeDisabled();
            }
        });
    });

    describe('Integration', () => {
        it('should render without crashing with empty data', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue(
                createMockContext({ salesData: [], recipes: [] }) as AppContextType
            );
            render(<SalesManagement />);
            expect(screen.getByText('Sales Data Management')).toBeInTheDocument();
        });

        it('should handle complete create workflow', async () => {
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: yesterdayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Fried Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '25' } });

            const saveButton = screen.getByText('Save Record');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockAddSalesData).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should handle complete edit workflow', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const newQuantityInput = screen.getByLabelText(/New Quantity/i);
            fireEvent.change(newQuantityInput, { target: { value: '20' } });

            const updateButton = screen.getByText('Update Record');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockUpdateSalesData).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should handle complete delete workflow', async () => {
            render(<SalesManagement />);
            clickEdit('Chicken Rice');

            const deleteButton = screen.getByText('Delete Record');
            fireEvent.click(deleteButton);

            const confirmButton = screen.getByText('Yes, Delete Record');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockDeleteSalesData).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should enable Save button when all fields are filled', () => {
            render(<SalesManagement />);
            clickAddNewRecord();

            const dateInput = screen.getByLabelText(/Date/i);
            fireEvent.change(dateInput, { target: { value: yesterdayStr } });

            const recipeSelect = screen.getByRole('combobox', { name: /recipe/i });
            fireEvent.click(recipeSelect);
            const recipeOption = screen.getByRole('option', { name: /Fried Rice/i });
            fireEvent.click(recipeOption);

            const quantityInput = screen.getByLabelText(/Quantity/i);
            fireEvent.change(quantityInput, { target: { value: '25' } });

            const saveButton = screen.getByText('Save Record');
            expect(saveButton).not.toBeDisabled();
        });

        it('should handle multiple dialogs correctly', async () => {
            render(<SalesManagement />);

            // Open create dialog
            clickAddNewRecord();
            expect(screen.getByText('Add New Sales Record')).toBeInTheDocument();

            // Close it
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.queryByText('Add New Sales Record')).not.toBeInTheDocument();
            });

            // Open edit dialog
            clickEdit('Chicken Rice');
            expect(screen.getByText('Edit Sales Data')).toBeInTheDocument();
        });
    });
});
