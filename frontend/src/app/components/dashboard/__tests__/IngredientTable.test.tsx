import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IngredientTable } from '../IngredientTable';
import * as AppContext from '@/app/context/AppContext';
import * as UnitConversion from '@/app/utils/unitConversion';

// Mock the convertUnit utility
vi.mock('@/app/utils/unitConversion', () => ({
    convertUnit: vi.fn((quantity: number, unit: string) => ({
        quantity,
        unit,
        displayText: `${quantity.toFixed(2)} ${unit}`,
    })),
}));

describe('IngredientTable', () => {
    const mockIngredients = [
        { id: '1', name: 'Chicken', unit: 'kg', carbonFootprint: 2.5 },
        { id: '2', name: 'Rice', unit: 'kg', carbonFootprint: 0.8 },
        { id: '3', name: 'Chili Paste', unit: 'g', carbonFootprint: 0.3 },
        { id: '4', name: 'Garlic', unit: 'g', carbonFootprint: 0.2 },
    ];

    const mockRecipes = [
        {
            id: '1',
            name: 'Chicken Rice',
            isSubRecipe: false,
            isSellable: true,
            ingredients: [
                { ingredientId: '1', quantity: 0.2, displayName: 'Chicken', unit: 'kg' },
                { ingredientId: '2', quantity: 0.15, displayName: 'Rice', unit: 'kg' },
            ],
        },
        {
            id: '2',
            name: 'Mala Chicken',
            isSubRecipe: false,
            isSellable: true,
            ingredients: [
                { ingredientId: '1', quantity: 0.25, displayName: 'Chicken', unit: 'kg' },
                { childRecipeId: '3', quantity: 50, displayName: 'Mala Sauce', unit: 'g' },
            ],
        },
        {
            id: '3',
            name: 'Mala Sauce',
            isSubRecipe: true,
            isSellable: false,
            ingredients: [
                { ingredientId: '3', quantity: 30, displayName: 'Chili Paste', unit: 'g' },
                { ingredientId: '4', quantity: 20, displayName: 'Garlic', unit: 'g' },
            ],
        },
    ];

    const mockSalesData = [
        { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
        { id: '2', date: '2026-02-09', recipeId: '2', recipeName: 'Mala Chicken', quantity: 5 },
        { id: '3', date: '2026-02-08', recipeId: '1', recipeName: 'Chicken Rice', quantity: 8 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset the mock implementation
        (UnitConversion.convertUnit as any).mockImplementation((quantity: number, unit: string) => ({
            quantity,
            unit,
            displayText: `${quantity.toFixed(2)} ${unit}`,
        }));

        // Mock useApp hook
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            recipes: mockRecipes,
            salesData: mockSalesData,
            ingredients: mockIngredients,
            wastageData: [],
            forecastData: [],
            addRecipe: vi.fn(),
            updateRecipe: vi.fn(),
            deleteRecipe: vi.fn(),
            addIngredient: vi.fn(),
            updateIngredient: vi.fn(),
            deleteIngredient: vi.fn(),
            addSalesData: vi.fn(),
            updateSalesData: vi.fn(),
            deleteSalesData: vi.fn(),
            addWastageData: vi.fn(),
            updateWastageData: vi.fn(),
            deleteWastageData: vi.fn(),
            refreshForecast: vi.fn(),
            isLoading: false,
            error: null,
        });
    });

    describe('Rendering', () => {
        it('should render the card with title and icon', () => {
            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('Ingredient Breakdown')).toBeInTheDocument();
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should display the date in the description', () => {
            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText(/Required ingredients for 9 Feb 2026/i)).toBeInTheDocument();
        });

        it('should render table headers', () => {
            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('Ingredient')).toBeInTheDocument();
            expect(screen.getByText('Unit')).toBeInTheDocument();
            expect(screen.getByText('Quantity')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no sales data exists', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should show empty state for non-existent date', () => {
            render(<IngredientTable date="2026-01-01" />);

            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should not render table when no data', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            const { container } = render(<IngredientTable date="2026-02-09" />);

            const table = container.querySelector('table');
            expect(table).not.toBeInTheDocument();
        });
    });

    describe('Table Display', () => {
        it('should display ingredient names', () => {
            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('Chicken')).toBeInTheDocument();
            expect(screen.getByText('Rice')).toBeInTheDocument();
        });

        it('should display ingredient units', () => {
            render(<IngredientTable date="2026-02-09" />);

            const cells = screen.getAllByRole('cell');
            const unitCells = cells.filter(cell => cell.textContent === 'kg' || cell.textContent === 'g');

            expect(unitCells.length).toBeGreaterThan(0);
        });

        it('should display ingredient quantities', () => {
            render(<IngredientTable date="2026-02-09" />);

            const cells = screen.getAllByRole('cell');
            const quantityCells = cells.filter(cell => /^\d+\.\d{2}$/.test(cell.textContent || ''));

            expect(quantityCells.length).toBeGreaterThan(0);
        });

        it('should format quantities to 2 decimal places', () => {
            render(<IngredientTable date="2026-02-09" />);

            const cells = screen.getAllByRole('cell');
            const quantityCells = cells.filter(cell => /^\d+\.\d{2}$/.test(cell.textContent || ''));

            quantityCells.forEach(cell => {
                const value = cell.textContent || '';
                const decimalPart = value.split('.')[1];
                expect(decimalPart).toHaveLength(2);
            });
        });
    });

    describe('Data Filtering', () => {
        it('should only include sales for the specified date', () => {
            render(<IngredientTable date="2026-02-09" />);

            // Chicken: (10 * 0.2) + (5 * 0.25) = 2 + 1.25 = 3.25 kg
            expect(screen.getByText('3.25')).toBeInTheDocument();
        });

        it('should not include sales from other dates', () => {
            render(<IngredientTable date="2026-02-09" />);

            // Sales on 2026-02-08 should not be included
            // If they were included: (10 + 8) * 0.2 = 3.6 kg of chicken
            // But we should only have: 10 * 0.2 + 5 * 0.25 = 3.25 kg
            const chickenCell = screen.getByText('3.25');
            expect(chickenCell).toBeInTheDocument();
        });
    });

    describe('Ingredient Aggregation', () => {
        it('should aggregate quantities from multiple recipes', () => {
            render(<IngredientTable date="2026-02-09" />);

            // Chicken used in both Chicken Rice (10 * 0.2 = 2) and Mala Chicken (5 * 0.25 = 1.25)
            // Total: 3.25 kg
            expect(screen.getByText('3.25')).toBeInTheDocument();
        });

        it('should handle single recipe correctly', () => {
            const singleSale = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: singleSale,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            // Chicken: 10 * 0.2 = 2.00 kg
            expect(screen.getByText('2.00')).toBeInTheDocument();
            // Rice: 10 * 0.15 = 1.50 kg
            expect(screen.getByText('1.50')).toBeInTheDocument();
        });
    });

    describe('Sub-Recipe Expansion', () => {
        it('should expand sub-recipe ingredients', () => {
            render(<IngredientTable date="2026-02-09" />);

            // Mala Chicken (5 qty) uses Mala Sauce (50g per dish)
            // Mala Sauce has: Chili Paste (30g) + Garlic (20g) = 50g total
            // Chili Paste ratio: 30/50 = 0.6
            // Garlic ratio: 20/50 = 0.4
            // Chili Paste: 0.6 * 50 * 5 = 150g
            // Garlic: 0.4 * 50 * 5 = 100g

            expect(screen.getByText('Chili Paste')).toBeInTheDocument();
            expect(screen.getByText('Garlic')).toBeInTheDocument();
        });

        it('should calculate sub-recipe quantities correctly', () => {
            render(<IngredientTable date="2026-02-09" />);

            // Chili Paste: (30/50) * 50 * 5 = 150.00 g
            expect(screen.getByText('150.00')).toBeInTheDocument();
            // Garlic: (20/50) * 50 * 5 = 100.00 g
            expect(screen.getByText('100.00')).toBeInTheDocument();
        });

        it('should handle recipes with both direct and sub-recipe ingredients', () => {
            render(<IngredientTable date="2026-02-09" />);

            // Mala Chicken has:
            // - Direct: Chicken (0.25 kg * 5 = 1.25 kg)
            // - Sub-recipe: Mala Sauce ingredients

            expect(screen.getByText('Chicken')).toBeInTheDocument();
            expect(screen.getByText('Chili Paste')).toBeInTheDocument();
            expect(screen.getByText('Garlic')).toBeInTheDocument();
        });

        it('should not display sub-recipe itself as an ingredient', () => {
            render(<IngredientTable date="2026-02-09" />);

            // "Mala Sauce" should not appear as an ingredient
            expect(screen.queryByText('Mala Sauce')).not.toBeInTheDocument();
        });
    });

    describe('Sorting', () => {
        it('should sort ingredients alphabetically', () => {
            render(<IngredientTable date="2026-02-09" />);

            const ingredientCells = screen.getAllByRole('cell').filter(cell =>
                ['Chicken', 'Rice', 'Chili Paste', 'Garlic'].includes(cell.textContent || '')
            );

            const names = ingredientCells.map(cell => cell.textContent);
            // Should be: Chicken, Chili Paste, Garlic, Rice (alphabetical)
            expect(names).toEqual(['Chicken', 'Chili Paste', 'Garlic', 'Rice']);
        });
    });

    describe('Unit Conversion', () => {
        it('should call convertUnit for each ingredient', () => {
            render(<IngredientTable date="2026-02-09" />);

            // Should be called for each unique ingredient
            expect(UnitConversion.convertUnit).toHaveBeenCalled();
        });

        it('should use converted values from convertUnit', () => {
            (UnitConversion.convertUnit as any).mockImplementation((quantity: number, _unit: string) => ({
                quantity: quantity * 1000, // Simulate kg to g conversion
                unit: 'g',
                displayText: `${(quantity * 1000).toFixed(2)} g`,
            }));

            render(<IngredientTable date="2026-02-09" />);

            // Verify that converted values are displayed
            const cells = screen.getAllByRole('cell');
            expect(cells.some(cell => cell.textContent === 'g')).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty ingredients array', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: mockSalesData,
                ingredients: [],
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should handle empty recipes array', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: [],
                salesData: mockSalesData,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should handle sales for non-existent recipes', () => {
            const invalidSales = [
                { id: '1', date: '2026-02-09', recipeId: '999', recipeName: 'Invalid Recipe', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: invalidSales,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should handle recipe with non-existent ingredient IDs', () => {
            const recipeWithInvalidIngredient = [
                {
                    id: '1',
                    name: 'Test Recipe',
                    isSubRecipe: false,
                    isSellable: true,
                    ingredients: [
                        { ingredientId: '999', quantity: 1, displayName: 'Invalid Ingredient', unit: 'kg' },
                    ],
                },
            ];

            const sales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Test Recipe', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: recipeWithInvalidIngredient,
                salesData: sales,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            // Should not crash, just show empty state
            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should handle sub-recipe with non-existent child recipe ID', () => {
            const recipeWithInvalidSubRecipe = [
                {
                    id: '1',
                    name: 'Test Recipe',
                    isSubRecipe: false,
                    isSellable: true,
                    ingredients: [
                        { childRecipeId: '999', quantity: 50, displayName: 'Invalid Sub-Recipe', unit: 'g' },
                    ],
                },
            ];

            const sales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Test Recipe', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: recipeWithInvalidSubRecipe,
                salesData: sales,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            // Should not crash, just show empty state
            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should filter out zero quantity ingredients', () => {
            const recipeWithZeroQty = [
                {
                    id: '1',
                    name: 'Test Recipe',
                    isSubRecipe: false,
                    isSellable: true,
                    ingredients: [
                        { ingredientId: '1', quantity: 0, displayName: 'Chicken', unit: 'kg' },
                    ],
                },
            ];

            const sales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Test Recipe', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: recipeWithZeroQty,
                salesData: sales,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });

        it('should handle sub-recipe with zero total weight', () => {
            const zeroWeightSubRecipe = [
                {
                    id: '1',
                    name: 'Main Dish',
                    isSubRecipe: false,
                    isSellable: true,
                    ingredients: [
                        { childRecipeId: '2', quantity: 50, displayName: 'Empty Sauce', unit: 'g' },
                    ],
                },
                {
                    id: '2',
                    name: 'Empty Sauce',
                    isSubRecipe: true,
                    isSellable: false,
                    ingredients: [
                        { ingredientId: '3', quantity: 0, displayName: 'Chili Paste', unit: 'g' },
                    ],
                },
            ];

            const sales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Main Dish', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: zeroWeightSubRecipe,
                salesData: sales,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            // Should handle gracefully
            expect(screen.getByText('No ingredient data available for this date')).toBeInTheDocument();
        });
    });

    describe('Calculations', () => {
        it('should calculate ingredient totals correctly for direct ingredients', () => {
            const singleRecipe = [
                {
                    id: '1',
                    name: 'Chicken Rice',
                    isSubRecipe: false,
                    isSellable: true,
                    ingredients: [
                        { ingredientId: '1', quantity: 0.2, displayName: 'Chicken', unit: 'kg' },
                    ],
                },
            ];

            const sales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: singleRecipe,
                salesData: sales,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            // 10 dishes * 0.2 kg = 2.00 kg
            expect(screen.getByText('2.00')).toBeInTheDocument();
        });

        it('should calculate sub-recipe ratios correctly', () => {
            const subRecipeTest = [
                {
                    id: '1',
                    name: 'Main Dish',
                    isSubRecipe: false,
                    isSellable: true,
                    ingredients: [
                        { childRecipeId: '2', quantity: 100, displayName: 'Sauce', unit: 'g' },
                    ],
                },
                {
                    id: '2',
                    name: 'Sauce',
                    isSubRecipe: true,
                    isSellable: false,
                    ingredients: [
                        { ingredientId: '3', quantity: 60, displayName: 'Chili Paste', unit: 'g' },
                        { ingredientId: '4', quantity: 40, displayName: 'Garlic', unit: 'g' },
                    ],
                },
            ];

            const sales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Main Dish', quantity: 1 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: subRecipeTest,
                salesData: sales,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: [],
                addRecipe: vi.fn(),
                updateRecipe: vi.fn(),
                deleteRecipe: vi.fn(),
                addIngredient: vi.fn(),
                updateIngredient: vi.fn(),
                deleteIngredient: vi.fn(),
                addSalesData: vi.fn(),
                updateSalesData: vi.fn(),
                deleteSalesData: vi.fn(),
                addWastageData: vi.fn(),
                updateWastageData: vi.fn(),
                deleteWastageData: vi.fn(),
                refreshForecast: vi.fn(),
                isLoading: false,
                error: null,
            });

            render(<IngredientTable date="2026-02-09" />);

            // Total sub-recipe weight: 60 + 40 = 100g
            // Chili Paste ratio: 60/100 = 0.6
            // Garlic ratio: 40/100 = 0.4
            // Amount used: 100g
            // Chili Paste: 0.6 * 100 * 1 = 60.00g
            // Garlic: 0.4 * 100 * 1 = 40.00g
            expect(screen.getByText('60.00')).toBeInTheDocument();
            expect(screen.getByText('40.00')).toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('should render without crashing', () => {
            render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText('Ingredient Breakdown')).toBeInTheDocument();
        });

        it('should update when date changes', () => {
            const { rerender } = render(<IngredientTable date="2026-02-09" />);

            expect(screen.getByText(/Required ingredients for 9 Feb 2026/i)).toBeInTheDocument();
            expect(screen.getByText('Chicken')).toBeInTheDocument();

            rerender(<IngredientTable date="2026-02-08" />);

            expect(screen.getByText(/Required ingredients for 8 Feb 2026/i)).toBeInTheDocument();
        });

        it('should display correct card styling', () => {
            const { container } = render(<IngredientTable date="2026-02-09" />);

            const card = container.querySelector('[class*="rounded"]');
            expect(card).toBeInTheDocument();
        });

        it('should have proper table structure', () => {
            const { container } = render(<IngredientTable date="2026-02-09" />);

            const table = container.querySelector('table');
            expect(table).toBeInTheDocument();

            const thead = container.querySelector('thead');
            expect(thead).toBeInTheDocument();

            const tbody = container.querySelector('tbody');
            expect(tbody).toBeInTheDocument();
        });
    });
});
