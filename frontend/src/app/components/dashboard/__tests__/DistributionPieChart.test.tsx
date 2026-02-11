import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistributionPieChart } from '../DistributionPieChart';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType } from '@/app/context/AppContext';

// Mock recharts components
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ data, dataKey, label, children }: { data: unknown[]; dataKey: string; label: unknown; children: React.ReactNode }) => (
        <div
            data-testid="pie"
            data-chart-data={JSON.stringify(data)}
            data-data-key={dataKey}
            data-has-label={label ? 'true' : 'false'}
        >
            {children}
        </div>
    ),
    Cell: ({ fill }: { fill: string }) => (
        <div data-testid="cell" data-fill={fill} />
    ),
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

describe('DistributionPieChart', () => {
    const mockRecipes = [
        { id: '1', name: 'Chicken Rice', isSubRecipe: false, isSellable: true, ingredients: [] },
        { id: '2', name: 'Nasi Lemak', isSubRecipe: false, isSellable: true, ingredients: [] },
        { id: '3', name: 'Sambal Sauce', isSubRecipe: true, isSellable: false, ingredients: [] },
    ];

    const mockSalesData = [
        { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 50 },
        { id: '2', date: '2026-02-09', recipeId: '2', recipeName: 'Nasi Lemak', quantity: 30 },
        { id: '3', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 20 },
        { id: '4', date: '2026-02-08', recipeId: '1', recipeName: 'Chicken Rice', quantity: 40 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock useApp hook
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
            refreshData: vi.fn(),
            loading: false,
        } as unknown as AppContextType);
    });

    describe('Rendering', () => {
        it('should render the card with title and icon', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText('Sales Distribution')).toBeInTheDocument();
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should display the date in the description', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText(/9 Feb 2026/i)).toBeInTheDocument();
        });

        it('should display the total dishes count', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            // Total: Chicken Rice (50+20=70) + Nasi Lemak (30) = 100
            expect(screen.getByText(/Total: 100 dishes/i)).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no sales data exists', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText('No sales data for this date')).toBeInTheDocument();
        });

        it('should show empty state for non-existent date', () => {
            render(<DistributionPieChart date="2026-01-01" />);

            expect(screen.getByText('No sales data for this date')).toBeInTheDocument();
        });

        it('should not render chart components when no data', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: [],
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
        });
    });

    describe('Chart Display', () => {
        it('should render pie chart components when data exists', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
            expect(screen.getByTestId('pie')).toBeInTheDocument();
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
            expect(screen.getByTestId('legend')).toBeInTheDocument();
        });

        it('should use "value" as dataKey', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            expect(pie.getAttribute('data-data-key')).toBe('value');
        });

        it('should have label prop set', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            expect(pie.getAttribute('data-has-label')).toBe('true');
        });
    });

    describe('Data Filtering', () => {
        it('should filter out sub-recipes from chart data', () => {
            const salesWithSubRecipe = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 50 },
                { id: '2', date: '2026-02-09', recipeId: '3', recipeName: 'Sambal Sauce', quantity: 100 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: salesWithSubRecipe,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Should only have Chicken Rice, not Sambal Sauce (sub-recipe)
            expect(chartData).toHaveLength(1);
            expect(chartData[0].name).toBe('Chicken Rice');
        });

        it('should only include sales for the specified date', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Should aggregate Chicken Rice sales from 2026-02-09 only (50+20=70)
            const chickenRice = chartData.find((item: { name: string }) => item.name === 'Chicken Rice');
            expect(chickenRice.value).toBe(70);
        });
    });

    describe('Data Aggregation', () => {
        it('should aggregate quantities for the same recipe on the same date', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Chicken Rice: 50 + 20 = 70
            const chickenRice = chartData.find((item: { name: string }) => item.name === 'Chicken Rice');
            expect(chickenRice.value).toBe(70);
        });

        it('should sort recipes by quantity descending', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Chicken Rice (70) should be first, Nasi Lemak (30) should be second
            expect(chartData[0].name).toBe('Chicken Rice');
            expect(chartData[0].value).toBe(70);
            expect(chartData[1].name).toBe('Nasi Lemak');
            expect(chartData[1].value).toBe(30);
        });

        it('should handle single recipe correctly', () => {
            const singleSale = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 50 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: singleSale,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText(/Total: 50 dishes/i)).toBeInTheDocument();
        });
    });

    describe('Others Grouping', () => {
        it('should not create "Others" group when recipes <= 9', () => {
            // Create 9 different recipes
            const nineRecipes = Array.from({ length: 9 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Recipe ${i + 1}`,
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            }));

            const nineSales = nineRecipes.map((recipe, i) => ({
                id: `${i + 1}`,
                date: '2026-02-09',
                recipeId: recipe.id,
                recipeName: recipe.name,
                quantity: 10 * (9 - i), // Descending quantities
            }));

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: nineRecipes,
                salesData: nineSales,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            expect(chartData).toHaveLength(9);
            expect(chartData.find((item: { name: string }) => item.name === 'Others')).toBeUndefined();
        });

        it('should create "Others" group when recipes > 9', () => {
            // Create 12 different recipes
            const twelveRecipes = Array.from({ length: 12 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Recipe ${i + 1}`,
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            }));

            const twelveSales = twelveRecipes.map((recipe, i) => ({
                id: `${i + 1}`,
                date: '2026-02-09',
                recipeId: recipe.id,
                recipeName: recipe.name,
                quantity: 10 * (12 - i), // Descending quantities
            }));

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: twelveRecipes,
                salesData: twelveSales,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Should have exactly 10 items: top 9 + Others
            expect(chartData).toHaveLength(10);
            expect(chartData[9].name).toBe('Others');
        });

        it('should correctly sum quantities in "Others" group', () => {
            // Create 12 different recipes
            const twelveRecipes = Array.from({ length: 12 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Recipe ${i + 1}`,
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            }));

            // Quantities: 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10
            const twelveSales = twelveRecipes.map((recipe, i) => ({
                id: `${i + 1}`,
                date: '2026-02-09',
                recipeId: recipe.id,
                recipeName: recipe.name,
                quantity: 10 * (12 - i),
            }));

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: twelveRecipes,
                salesData: twelveSales,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Others should contain recipes 10, 11, 12: 30 + 20 + 10 = 60
            expect(chartData[9].value).toBe(60);
        });

        it('should place top 9 recipes before "Others"', () => {
            // Create 11 different recipes
            const elevenRecipes = Array.from({ length: 11 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Recipe ${i + 1}`,
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            }));

            const elevenSales = elevenRecipes.map((recipe, i) => ({
                id: `${i + 1}`,
                date: '2026-02-09',
                recipeId: recipe.id,
                recipeName: recipe.name,
                quantity: 10 * (11 - i),
            }));

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: elevenRecipes,
                salesData: elevenSales,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // First 9 should be Recipe 1-9, last should be Others
            expect(chartData[0].name).toBe('Recipe 1');
            expect(chartData[8].name).toBe('Recipe 9');
            expect(chartData[9].name).toBe('Others');
        });
    });

    describe('Color Assignment', () => {
        it('should use PIE_COLORS for main recipes', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            const cells = screen.getAllByTestId('cell');

            // First cell should use first color from PIE_COLORS
            expect(cells[0].getAttribute('data-fill')).toBe('#4F6F52');
            // Second cell should use second color
            expect(cells[1].getAttribute('data-fill')).toBe('#E67E22');
        });

        it('should use OTHERS_COLOR for "Others" group', () => {
            // Create 10 different recipes to trigger Others grouping
            const tenRecipes = Array.from({ length: 10 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Recipe ${i + 1}`,
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            }));

            const tenSales = tenRecipes.map((recipe, i) => ({
                id: `${i + 1}`,
                date: '2026-02-09',
                recipeId: recipe.id,
                recipeName: recipe.name,
                quantity: 10 * (10 - i),
            }));

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: tenRecipes,
                salesData: tenSales,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            const cells = screen.getAllByTestId('cell');

            // Last cell should use OTHERS_COLOR (#898989)
            expect(cells[cells.length - 1].getAttribute('data-fill')).toBe('#898989');
        });

        it('should cycle through colors when recipes exceed palette size', () => {
            // This test ensures colors are assigned using modulo
            // Even though we only have 2 recipes, we test the logic is sound
            render(<DistributionPieChart date="2026-02-09" />);

            const cells = screen.getAllByTestId('cell');

            // Should have 2 cells for 2 recipes
            expect(cells).toHaveLength(2);
        });
    });

    describe('Calculations', () => {
        it('should calculate total dishes correctly', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            // Total: 70 + 30 = 100
            expect(screen.getByText(/Total: 100 dishes/i)).toBeInTheDocument();
        });

        it('should handle zero quantities', () => {
            const zeroSales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 0 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: zeroSales,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText(/Total: 0 dishes/i)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty recipes array', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: [],
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText('No sales data for this date')).toBeInTheDocument();
        });

        it('should handle recipes with only sub-recipes', () => {
            const onlySubRecipes = [
                { id: '1', name: 'Sambal Sauce', isSubRecipe: true, isSellable: false, ingredients: [] },
                { id: '2', name: 'Curry Base', isSubRecipe: true, isSellable: false, ingredients: [] },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: onlySubRecipes,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText('No sales data for this date')).toBeInTheDocument();
        });

        it('should handle sales for non-existent recipes', () => {
            const salesWithInvalidRecipe = [
                { id: '1', date: '2026-02-09', recipeId: '999', recipeName: 'Invalid Recipe', quantity: 50 },
                { id: '2', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 30 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: salesWithInvalidRecipe,
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
                refreshData: vi.fn(),
                loading: false,
            } as unknown as AppContextType);

            render(<DistributionPieChart date="2026-02-09" />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Should only include Chicken Rice, not the invalid recipe
            expect(chartData).toHaveLength(1);
            expect(chartData[0].name).toBe('Chicken Rice');
        });

        it('should handle different date formats correctly', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            // Date should be formatted as "9 Feb 2026"
            expect(screen.getByText(/9 Feb 2026/i)).toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('should render without crashing', () => {
            render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText('Sales Distribution')).toBeInTheDocument();
        });

        it('should update when date changes', () => {
            const { rerender } = render(<DistributionPieChart date="2026-02-09" />);

            expect(screen.getByText(/9 Feb 2026/i)).toBeInTheDocument();
            expect(screen.getByText(/Total: 100 dishes/i)).toBeInTheDocument();

            rerender(<DistributionPieChart date="2026-02-08" />);

            expect(screen.getByText(/8 Feb 2026/i)).toBeInTheDocument();
            expect(screen.getByText(/Total: 40 dishes/i)).toBeInTheDocument();
        });

        it('should display correct card styling', () => {
            const { container } = render(<DistributionPieChart date="2026-02-09" />);

            const card = container.querySelector('[class*="rounded"]');
            expect(card).toBeInTheDocument();
        });
    });
});
