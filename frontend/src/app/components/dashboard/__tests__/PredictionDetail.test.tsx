import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PredictionDetail } from '../PredictionDetail';
import * as AppContext from '@/app/context/AppContext';
import * as UnitConversion from '@/app/utils/unitConversion';
import { format, addDays } from 'date-fns';

// Mock the convertUnit utility
vi.mock('@/app/utils/unitConversion', () => ({
    convertUnit: vi.fn((quantity: number, unit: string) => {
        // Simulate g -> kg conversion when > 1000
        if (unit === 'g' && quantity > 1000) {
            return {
                quantity: quantity / 1000,
                unit: 'kg',
                displayText: `${(quantity / 1000).toFixed(2)} kg`,
            };
        }
        // Simulate ml -> L conversion when > 1000
        if (unit === 'ml' && quantity > 1000) {
            return {
                quantity: quantity / 1000,
                unit: 'L',
                displayText: `${(quantity / 1000).toFixed(2)} L`,
            };
        }
        return {
            quantity,
            unit,
            displayText: `${quantity.toFixed(2)} ${unit}`,
        };
    }),
}));

describe('PredictionDetail', () => {
    const today = new Date('2026-02-09T00:00:00.000Z');

    const mockIngredients = [
        { id: '1', name: 'Chicken', unit: 'kg', carbonFootprint: 2.5 },
        { id: '2', name: 'Rice', unit: 'kg', carbonFootprint: 0.8 },
        { id: '3', name: 'Chili Paste', unit: 'g', carbonFootprint: 0.3 },
        { id: '4', name: 'Garlic', unit: 'g', carbonFootprint: 0.2 },
        { id: '5', name: 'Soy Sauce', unit: 'ml', carbonFootprint: 0.5 },
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

    // Generate forecast for next 7 days
    const generateForecastData = (daysCount: number = 7) => {
        const forecast = [];
        for (let i = 1; i <= daysCount; i++) {
            const date = format(addDays(today, i), 'yyyy-MM-dd');
            forecast.push(
                { id: `${i}-1`, date, recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
                { id: `${i}-2`, date, recipeId: '2', recipeName: 'Mala Chicken', quantity: 5 }
            );
        }
        return forecast;
    };

    const mockForecastData = generateForecastData(7);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.setSystemTime(today);

        // Reset the mock implementation
        (UnitConversion.convertUnit as any).mockImplementation((quantity: number, unit: string) => {
            if (unit === 'g' && quantity > 1000) {
                return {
                    quantity: quantity / 1000,
                    unit: 'kg',
                    displayText: `${(quantity / 1000).toFixed(2)} kg`,
                };
            }
            if (unit === 'ml' && quantity > 1000) {
                return {
                    quantity: quantity / 1000,
                    unit: 'L',
                    displayText: `${(quantity / 1000).toFixed(2)} L`,
                };
            }
            return {
                quantity,
                unit,
                displayText: `${quantity.toFixed(2)} ${unit}`,
            };
        });

        // Mock useApp hook
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            recipes: mockRecipes,
            salesData: [],
            ingredients: mockIngredients,
            wastageData: [],
            forecastData: mockForecastData,
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
            render(<PredictionDetail />);

            expect(screen.getByText('Ingredient Forecast Details')).toBeInTheDocument();
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should display the description', () => {
            render(<PredictionDetail />);

            expect(screen.getByText(/Raw ingredient requirements for next 7 days/i)).toBeInTheDocument();
        });

        it('should render table headers', () => {
            render(<PredictionDetail />);

            expect(screen.getByText('Ingredient')).toBeInTheDocument();
            expect(screen.getByText('Unit')).toBeInTheDocument();
        });

        it('should render 7 date columns for next 7 days', () => {
            render(<PredictionDetail />);

            // Check that we have 7 date headers (from tomorrow onwards)
            const dateHeaders = screen.getAllByRole('columnheader');
            // 2 fixed columns (Ingredient, Unit) + 7 date columns = 9 total
            expect(dateHeaders.length).toBe(9);
        });

        it('should display dates starting from tomorrow', () => {
            render(<PredictionDetail />);

            // Feb 10, 2026 (tomorrow)
            expect(screen.getByText('10 Feb')).toBeInTheDocument();
            // Feb 16, 2026 (7 days from today)
            expect(screen.getByText('16 Feb')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no forecast data exists', () => {
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

            render(<PredictionDetail />);

            expect(screen.getByText('No ingredient forecast data available.')).toBeInTheDocument();
        });

        it('should show empty state when recipes array is empty', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: [],
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: mockForecastData,
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

            render(<PredictionDetail />);

            expect(screen.getByText('No ingredient forecast data available.')).toBeInTheDocument();
        });

        it('should show empty state when ingredients array is empty', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: [],
                wastageData: [],
                forecastData: mockForecastData,
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

            render(<PredictionDetail />);

            expect(screen.getByText('No ingredient forecast data available.')).toBeInTheDocument();
        });
    });

    describe('Table Display', () => {
        it('should display ingredient names', () => {
            render(<PredictionDetail />);

            expect(screen.getByText('Chicken')).toBeInTheDocument();
            expect(screen.getByText('Rice')).toBeInTheDocument();
        });

        it('should display ingredient units', () => {
            render(<PredictionDetail />);

            const cells = screen.getAllByRole('cell');
            const unitCells = cells.filter(cell => cell.textContent === 'kg' || cell.textContent === 'g');

            expect(unitCells.length).toBeGreaterThan(0);
        });

        it('should display quantities with 2 decimal places', () => {
            render(<PredictionDetail />);

            const cells = screen.getAllByRole('cell');
            const quantityCells = cells.filter(cell => /^\d+\.\d{2}$/.test(cell.textContent || ''));

            expect(quantityCells.length).toBeGreaterThan(0);
        });

        it('should display dash for zero quantities', () => {
            const partialForecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: partialForecast,
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

            render(<PredictionDetail />);

            // Days with no forecast should show dash
            const cells = screen.getAllByRole('cell');
            const dashCells = cells.filter(cell => cell.textContent === '-');

            expect(dashCells.length).toBeGreaterThan(0);
        });

        it('should sort ingredients alphabetically', () => {
            render(<PredictionDetail />);

            const cells = screen.getAllByRole('cell');
            const ingredientCells = cells.filter(cell =>
                ['Chicken', 'Rice', 'Chili Paste', 'Garlic'].includes(cell.textContent || '')
            );

            const names = ingredientCells.map(cell => cell.textContent);
            // Should be: Chicken, Chili Paste, Garlic, Rice (alphabetical)
            expect(names).toEqual(['Chicken', 'Chili Paste', 'Garlic', 'Rice']);
        });
    });

    describe('Direct Ingredient Processing', () => {
        it('should calculate direct ingredient quantities correctly', () => {
            const simpleForecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: simpleForecast,
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

            render(<PredictionDetail />);

            // Chicken: 10 * 0.2 = 2.00 kg
            expect(screen.getByText('2.00')).toBeInTheDocument();
            // Rice: 10 * 0.15 = 1.50 kg
            expect(screen.getByText('1.50')).toBeInTheDocument();
        });

        it('should aggregate quantities across multiple forecasts', () => {
            const multiForecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
                { id: '2', date: '2026-02-10', recipeId: '2', recipeName: 'Mala Chicken', quantity: 5 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: multiForecast,
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

            render(<PredictionDetail />);

            // Chicken: (10 * 0.2) + (5 * 0.25) = 2 + 1.25 = 3.25 kg
            expect(screen.getByText('3.25')).toBeInTheDocument();
        });
    });

    describe('Sub-Recipe Expansion', () => {
        it('should expand sub-recipe ingredients', () => {
            render(<PredictionDetail />);

            // Sub-recipe ingredients should appear in the table
            expect(screen.getByText('Chili Paste')).toBeInTheDocument();
            expect(screen.getByText('Garlic')).toBeInTheDocument();
        });

        it('should calculate sub-recipe quantities correctly', () => {
            const forecastWithSubRecipe = [
                { id: '1', date: '2026-02-10', recipeId: '2', recipeName: 'Mala Chicken', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: forecastWithSubRecipe,
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

            render(<PredictionDetail />);

            // Mala Sauce total: 30g + 20g = 50g
            // Chili Paste ratio: 30/50 = 0.6
            // Chili Paste qty: 0.6 * 50 * 10 = 300g
            expect(screen.getByText('300.00')).toBeInTheDocument();

            // Garlic ratio: 20/50 = 0.4
            // Garlic qty: 0.4 * 50 * 10 = 200g
            expect(screen.getByText('200.00')).toBeInTheDocument();
        });

        it('should handle recipes with both direct and sub-recipe ingredients', () => {
            render(<PredictionDetail />);

            // Both direct ingredient and sub-recipe ingredients should appear
            expect(screen.getByText('Chicken')).toBeInTheDocument(); // Direct
            expect(screen.getByText('Chili Paste')).toBeInTheDocument(); // From sub-recipe
            expect(screen.getByText('Garlic')).toBeInTheDocument(); // From sub-recipe
        });

        it('should not display sub-recipe itself as an ingredient', () => {
            render(<PredictionDetail />);

            // "Mala Sauce" should not appear in the ingredient list
            const cells = screen.getAllByRole('cell');
            const malaSauceCells = cells.filter(cell => cell.textContent === 'Mala Sauce');

            expect(malaSauceCells).toHaveLength(0);
        });
    });

    describe('Unit Conversion', () => {
        it('should call convertUnit for unit conversion', () => {
            render(<PredictionDetail />);

            // convertUnit should be called for each ingredient
            expect(UnitConversion.convertUnit).toHaveBeenCalled();
        });

        it('should convert grams to kilograms when quantity > 1000', () => {
            const largeForecast = [
                { id: '1', date: '2026-02-10', recipeId: '2', recipeName: 'Mala Chicken', quantity: 100 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: largeForecast,
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

            render(<PredictionDetail />);

            // Chili Paste: 0.6 * 50 * 100 = 3000g = 3kg
            expect(screen.getByText('3.00')).toBeInTheDocument();
        });

        it('should use consistent units across all days for same ingredient', () => {
            render(<PredictionDetail />);

            // Get all rows
            const rows = screen.getAllByRole('row');

            // Find Chicken row
            const chickenRow = rows.find(row => row.textContent?.includes('Chicken'));
            expect(chickenRow).toBeDefined();

            // The unit should be 'kg' for all Chicken entries
            if (chickenRow) {
                expect(chickenRow.textContent).toContain('kg');
                // Should not have mixed units
                expect(chickenRow.textContent).not.toContain('g kg');
            }
        });
    });

    describe('Date Range', () => {
        it('should display data for next 7 days from tomorrow', () => {
            render(<PredictionDetail />);

            // Feb 10 to Feb 16, 2026
            expect(screen.getByText('10 Feb')).toBeInTheDocument();
            expect(screen.getByText('11 Feb')).toBeInTheDocument();
            expect(screen.getByText('12 Feb')).toBeInTheDocument();
            expect(screen.getByText('13 Feb')).toBeInTheDocument();
            expect(screen.getByText('14 Feb')).toBeInTheDocument();
            expect(screen.getByText('15 Feb')).toBeInTheDocument();
            expect(screen.getByText('16 Feb')).toBeInTheDocument();
        });

        it('should not display today in the date range', () => {
            render(<PredictionDetail />);

            // Today is Feb 9, should not be shown
            expect(screen.queryByText('9 Feb')).not.toBeInTheDocument();
        });

        it('should handle forecast data across different dates', () => {
            const multiDayForecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
                { id: '2', date: '2026-02-11', recipeId: '1', recipeName: 'Chicken Rice', quantity: 8 },
                { id: '3', date: '2026-02-12', recipeId: '1', recipeName: 'Chicken Rice', quantity: 12 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: multiDayForecast,
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

            render(<PredictionDetail />);

            // Should show different quantities for different dates
            // Feb 10: 10 * 0.2 = 2.00
            // Feb 11: 8 * 0.2 = 1.60
            // Feb 12: 12 * 0.2 = 2.40
            expect(screen.getByText('2.00')).toBeInTheDocument();
            expect(screen.getByText('1.60')).toBeInTheDocument();
            expect(screen.getByText('2.40')).toBeInTheDocument();
        });
    });

    describe('PredictedQuantity Support', () => {
        it('should handle forecast with predictedQuantity field', () => {
            const forecastWithPredictedQuantity = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', predictedQuantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: forecastWithPredictedQuantity as any,
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

            render(<PredictionDetail />);

            // Chicken: 10 * 0.2 = 2.00 kg
            expect(screen.getByText('2.00')).toBeInTheDocument();
        });

        it('should prefer quantity over predictedQuantity', () => {
            const forecastWithBoth = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10, predictedQuantity: 5 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: forecastWithBoth as any,
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

            render(<PredictionDetail />);

            // Should use quantity (10) not predictedQuantity (5)
            // Chicken: 10 * 0.2 = 2.00
            expect(screen.getByText('2.00')).toBeInTheDocument();
            // Should not have 1.00 (which would be 5 * 0.2)
            expect(screen.queryByText('1.00')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle forecast for non-existent recipes', () => {
            const invalidForecast = [
                { id: '1', date: '2026-02-10', recipeId: '999', recipeName: 'Invalid Recipe', quantity: 100 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: invalidForecast,
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

            render(<PredictionDetail />);

            // Should show empty state
            expect(screen.getByText('No ingredient forecast data available.')).toBeInTheDocument();
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

            const forecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Test Recipe', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: recipeWithInvalidIngredient,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: forecast,
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

            render(<PredictionDetail />);

            // Should show empty state as ingredient doesn't exist
            expect(screen.getByText('No ingredient forecast data available.')).toBeInTheDocument();
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

            const forecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Test Recipe', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: recipeWithInvalidSubRecipe,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: forecast,
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

            render(<PredictionDetail />);

            // Should show empty state
            expect(screen.getByText('No ingredient forecast data available.')).toBeInTheDocument();
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

            const forecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Main Dish', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: zeroWeightSubRecipe,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: forecast,
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

            render(<PredictionDetail />);

            // Should handle gracefully (no crash)
            expect(screen.getByText('Ingredient Forecast Details')).toBeInTheDocument();
        });

        it('should handle missing quantity and predictedQuantity', () => {
            const forecastWithoutQuantity = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice' },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: forecastWithoutQuantity as any,
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

            render(<PredictionDetail />);

            // Should show empty state or all dashes as quantity defaults to 0
            expect(screen.getByText('Ingredient Forecast Details')).toBeInTheDocument();
        });

        it('should handle partial week forecast data', () => {
            const partialForecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
                { id: '2', date: '2026-02-12', recipeId: '1', recipeName: 'Chicken Rice', quantity: 8 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: partialForecast,
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

            render(<PredictionDetail />);

            // Should still show 7 columns with dashes for missing dates
            const cells = screen.getAllByRole('cell');
            const dashCells = cells.filter(cell => cell.textContent === '-');

            expect(dashCells.length).toBeGreaterThan(0);
        });
    });

    describe('Calculations', () => {
        it('should calculate ingredient totals correctly for direct ingredients', () => {
            const simpleForecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: simpleForecast,
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

            render(<PredictionDetail />);

            // Chicken: 0.2 * 10 = 2.00 kg
            expect(screen.getByText('2.00')).toBeInTheDocument();
            // Rice: 0.15 * 10 = 1.50 kg
            expect(screen.getByText('1.50')).toBeInTheDocument();
        });

        it('should calculate sub-recipe ratios correctly', () => {
            const subRecipeForecast = [
                { id: '1', date: '2026-02-10', recipeId: '2', recipeName: 'Mala Chicken', quantity: 1 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: subRecipeForecast,
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

            render(<PredictionDetail />);

            // Total sub-recipe weight: 30 + 20 = 50g
            // Chili Paste ratio: 30/50 = 0.6
            // Chili Paste: 0.6 * 50 * 1 = 30.00g
            expect(screen.getByText('30.00')).toBeInTheDocument();

            // Garlic ratio: 20/50 = 0.4
            // Garlic: 0.4 * 50 * 1 = 20.00g
            expect(screen.getByText('20.00')).toBeInTheDocument();
        });

        it('should handle multiple forecasts for same recipe on same date', () => {
            const duplicateForecast = [
                { id: '1', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
                { id: '2', date: '2026-02-10', recipeId: '1', recipeName: 'Chicken Rice', quantity: 5 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: duplicateForecast,
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

            render(<PredictionDetail />);

            // Should aggregate: (10 + 5) * 0.2 = 3.00 kg
            expect(screen.getByText('3.00')).toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('should render without crashing', () => {
            render(<PredictionDetail />);

            expect(screen.getByText('Ingredient Forecast Details')).toBeInTheDocument();
        });

        it('should display correct card styling', () => {
            const { container } = render(<PredictionDetail />);

            const card = container.querySelector('[class*="rounded-[8px]"]');
            expect(card).toBeInTheDocument();
        });

        it('should have proper table structure', () => {
            const { container } = render(<PredictionDetail />);

            const table = container.querySelector('table');
            expect(table).toBeInTheDocument();

            const thead = container.querySelector('thead');
            expect(thead).toBeInTheDocument();

            const tbody = container.querySelector('tbody');
            expect(tbody).toBeInTheDocument();
        });

        it('should handle table scrolling with sticky columns', () => {
            const { container } = render(<PredictionDetail />);

            // Check for sticky positioning on ingredient and unit columns
            const stickyCells = container.querySelectorAll('[class*="sticky"]');
            expect(stickyCells.length).toBeGreaterThan(0);
        });
    });
});
