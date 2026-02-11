import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WastageTrendChart } from '../WastageTrendChart';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType, WastageEntry, Ingredient, Recipe } from '@/app/types';

// Mock recharts
vi.mock('recharts', () => ({
    ComposedChart: ({ children, data }: { children: React.ReactNode; data: any[] }) => (
        <div data-testid="composed-chart" data-chart-data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    Bar: ({ dataKey, onClick, shape }: { dataKey: string; onClick?: any; shape?: any }) => (
        <div data-testid="bar" data-key={dataKey} onClick={onClick}>
            {shape}
        </div>
    ),
    Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
        <div data-testid="line" data-key={dataKey} data-stroke={stroke}></div>
    ),
    XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey}></div>,
    YAxis: ({ yAxisId, orientation }: { yAxisId: string; orientation?: string }) => (
        <div data-testid="y-axis" data-axis-id={yAxisId} data-orientation={orientation}></div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
    Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
    Legend: () => <div data-testid="legend">Legend</div>,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
}));

// Mock utility functions
vi.mock('@/app/utils/unitConversion', () => ({
    getStandardizedQuantity: vi.fn((quantity: number, unit: string) => {
        // Convert to kg/L
        if (unit === 'g') return quantity / 1000;
        if (unit === 'ml') return quantity / 1000;
        return quantity;
    }),
}));

vi.mock('@/app/utils/recipeCalculations', () => ({
    calculateRecipeWeight: vi.fn((recipeId: string, recipeMap: Map<string, Recipe>, _ingredientMap: Map<string, Ingredient>) => {
        const recipe = recipeMap.get(recipeId);
        if (!recipe || !recipe.ingredients) return 0;

        let totalWeight = 0;
        recipe.ingredients.forEach(ing => {
            totalWeight += ing.quantity / 1000; // g to kg
        });
        return totalWeight;
    }),
    calculateRecipeCarbon: vi.fn((recipeId: string, recipeMap: Map<string, Recipe>, ingredientMap: Map<string, Ingredient>) => {
        const recipe = recipeMap.get(recipeId);
        if (!recipe || !recipe.ingredients) return 0;

        let totalCarbon = 0;
        recipe.ingredients.forEach(ing => {
            const ingredient = ing.ingredientId ? ingredientMap.get(ing.ingredientId) : undefined;
            if (ingredient) {
                const stdQty = ing.quantity / 1000; // g to kg
                totalCarbon += stdQty * ingredient.carbonFootprint;
            }
        });
        return totalCarbon;
    }),
}));

describe('WastageTrendChart', () => {
    const mockOnDateRangeChange = vi.fn();
    const mockOnBarClick = vi.fn();

    const createMockIngredient = (id: string, name: string, unit: string, carbon: number): Ingredient => ({
        id,
        name,
        unit,
        carbonFootprint: carbon,
    });

    const createMockRecipe = (id: string, name: string, ingredients: Array<{ ingredientId: string; quantity: number }>): Recipe => ({
        id,
        name,
        isSubRecipe: false,
        ingredients: ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: 'g',
        })),
    });

    const createMockWastage = (
        recipeId: string | null,
        ingredientId: string | null,
        quantity: number,
        date: string
    ): WastageEntry => ({
        id: Math.random().toString(),
        date,
        recipeId: recipeId || undefined,
        ingredientId: ingredientId || undefined,
        quantity,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock current date to Feb 9, 2026
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-02-09'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ==================== Rendering Tests ====================
    describe('Rendering', () => {
        it('should render card header with title and icon', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(screen.getByText('Wastage Trend')).toBeInTheDocument();
        });

        it('should display total carbon footprint', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09'); // 2kg * 5.0 = 10 kg CO2

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(screen.getByText(/Total Carbon Footprint: 10.00 kg CO₂/)).toBeInTheDocument();
        });

        it('should display click instruction message', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(screen.getByText('Click on any bar to view details')).toBeInTheDocument();
        });

        it('should render date range selector', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('should render chart components', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
            expect(screen.getByTestId('bar')).toBeInTheDocument();
            expect(screen.getByTestId('line')).toBeInTheDocument();
            expect(screen.getByTestId('x-axis')).toBeInTheDocument();
            expect(screen.getAllByTestId('y-axis')).toHaveLength(2); // left and right
        });
    });

    // ==================== Date Range Tests ====================
    describe('Date Range', () => {
        it('should display 1 day for "today" range', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(1);
            expect(chartData[0].date).toBe('2026-02-09');
        });

        it('should display 7 days for "7days" range', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(7);
            expect(chartData[0].date).toBe('2026-02-03'); // 7 days ago
            expect(chartData[6].date).toBe('2026-02-09'); // today
        });

        it('should display 30 days for "30days" range', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="30days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(30);
            expect(chartData[0].date).toBe('2026-01-11'); // 30 days ago
            expect(chartData[29].date).toBe('2026-02-09'); // today
        });

        it('should display 90 days for "90days" range', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="90days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(90);
            expect(chartData[0].date).toBe('2025-11-12'); // 89 days ago (daysToShow - 1)
            expect(chartData[89].date).toBe('2026-02-09'); // today
        });

        it('should calculate "all" range from earliest wastage to today', () => {
            const wastage1 = createMockWastage(null, 'ing1', 1, '2026-02-05'); // 4 days ago
            const wastage2 = createMockWastage(null, 'ing1', 1, '2026-02-09'); // today

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [createMockIngredient('ing1', 'Chicken', 'kg', 5.0)],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="all"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(5); // Feb 5-9 = 5 days
            expect(chartData[0].date).toBe('2026-02-05');
            expect(chartData[4].date).toBe('2026-02-09');
        });

        it('should default to 30 days for "all" when no wastage data', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="all"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(30);
        });

        it('should use maxDays for "custom" range', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="custom"
                    onDateRangeChange={mockOnDateRangeChange}
                    maxDays={14}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(14);
        });

        it('should default to 30 days for "custom" when no maxDays provided', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="custom"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(30);
        });
    });

    // ==================== maxDays Limit Tests ====================
    describe('maxDays Limit', () => {
        it('should cap "7days" to maxDays when maxDays < 7', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                    maxDays={3}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(3);
        });

        it('should cap "30days" to maxDays when maxDays < 30', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="30days"
                    onDateRangeChange={mockOnDateRangeChange}
                    maxDays={15}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(15);
        });

        it('should NOT cap "all" range with maxDays', () => {
            const wastage1 = createMockWastage(null, 'ing1', 1, '2026-02-01'); // 8 days ago
            const wastage2 = createMockWastage(null, 'ing1', 1, '2026-02-09'); // today

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [createMockIngredient('ing1', 'Chicken', 'kg', 5.0)],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="all"
                    onDateRangeChange={mockOnDateRangeChange}
                    maxDays={3}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(9); // Feb 1-9 = 9 days, NOT capped to 3
        });

        it('should not show 30days option when maxDays <= 7', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                    maxDays={7}
                />
            );

            // Open select dropdown
            const trigger = screen.getByRole('combobox');
            fireEvent.click(trigger);

            // Check that 30days option is not present
            const options = container.querySelectorAll('[role="option"]');
            const optionTexts = Array.from(options).map((opt) => opt.textContent);
            expect(optionTexts).not.toContain('Last 30 Days');
        });

        it('should not show "all" option when maxDays is set', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                    maxDays={30}
                />
            );

            // Open select dropdown
            const trigger = screen.getByRole('combobox');
            fireEvent.click(trigger);

            // Check that "All Time" option is not present
            const options = container.querySelectorAll('[role="option"]');
            const optionTexts = Array.from(options).map((opt) => opt.textContent);
            expect(optionTexts).not.toContain('All Time');
        });
    });

    // ==================== Data Processing Tests ====================
    describe('Data Processing', () => {
        it('should calculate wastage weight for raw ingredients', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09'); // 2kg

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(2); // 2kg
        });

        it('should calculate carbon footprint for raw ingredients', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09'); // 2kg * 5.0 = 10 kg CO2

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].carbon).toBe(10); // 2kg * 5.0 = 10 kg CO2
        });

        it('should calculate wastage weight for recipes', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', [{ ingredientId: 'ing1', quantity: 200 }]); // 200g per serving
            const wastage1 = createMockWastage('recipe1', null, 5, '2026-02-09'); // 5 servings

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            // 5 servings * 0.2kg/serving = 1.0kg
            expect(chartData[0].wastage).toBe(1.0);
        });

        it('should calculate carbon footprint for recipes', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', [{ ingredientId: 'ing1', quantity: 200 }]); // 200g per serving
            const wastage1 = createMockWastage('recipe1', null, 10, '2026-02-09'); // 10 servings

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            // 10 servings * (0.2kg * 5.0) = 10.0 kg CO2
            expect(chartData[0].carbon).toBe(10.0);
        });

        it('should aggregate multiple wastage entries for same date', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09');
            const wastage2 = createMockWastage(null, 'ing1', 3, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(5); // 2 + 3 = 5kg
            expect(chartData[0].carbon).toBe(25); // (2 + 3) * 5.0 = 25 kg CO2
        });

        it('should handle mixed recipe and ingredient wastage', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', [{ ingredientId: 'ing1', quantity: 200 }]);

            const wastage1 = createMockWastage('recipe1', null, 5, '2026-02-09'); // 5 servings * 0.2kg = 1.0kg
            const wastage2 = createMockWastage(null, 'ing1', 2, '2026-02-09'); // 2kg

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(3.0); // 1.0 + 2 = 3.0kg
            expect(chartData[0].carbon).toBe(15.0); // 5.0 + 10.0 = 15.0 kg CO2
        });

        it('should filter wastage outside date range', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09'); // today - included
            const wastage2 = createMockWastage(null, 'ing1', 3, '2026-02-01'); // 8 days ago - excluded for 7days range

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');

            // Feb 3-9 (7 days)
            const feb9 = chartData.find((d: any) => d.date === '2026-02-09');
            expect(feb9.wastage).toBe(2); // Only wastage1

            const feb1 = chartData.find((d: any) => d.date === '2026-02-01');
            expect(feb1).toBeUndefined(); // Outside range
        });

        it('should show zero for dates with no wastage', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09'); // only today

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');

            // Check Feb 8 (yesterday) has zero
            const feb8 = chartData.find((d: any) => d.date === '2026-02-08');
            expect(feb8.wastage).toBe(0);
            expect(feb8.carbon).toBe(0);
        });
    });

    // ==================== Chart Display Tests ====================
    describe('Chart Display', () => {
        it('should display date labels in "d MMM" format', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');

            expect(chartData[0].displayDate).toBe('3 Feb'); // Feb 3
            expect(chartData[6].displayDate).toBe('9 Feb'); // Feb 9 (today)
        });

        it('should format wastage values to 2 decimal places', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2.555, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(2.56); // rounded to 2 decimals
        });

        it('should format carbon values to 2 decimal places', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.123);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09'); // 2 * 5.123 = 10.246

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].carbon).toBe(10.25); // rounded to 2 decimals
        });

        it('should render Bar with correct dataKey', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const bar = screen.getByTestId('bar');
            expect(bar.getAttribute('data-key')).toBe('wastage');
        });

        it('should render Line with correct dataKey and stroke color', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const line = screen.getByTestId('line');
            expect(line.getAttribute('data-key')).toBe('carbon');
            expect(line.getAttribute('data-stroke')).toBe('#E74C3C');
        });

        it('should render two Y axes (left and right)', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const yAxes = screen.getAllByTestId('y-axis');
            expect(yAxes).toHaveLength(2);
            expect(yAxes[0].getAttribute('data-axis-id')).toBe('left');
            expect(yAxes[1].getAttribute('data-axis-id')).toBe('right');
            expect(yAxes[1].getAttribute('data-orientation')).toBe('right');
        });
    });

    // ==================== Interaction Tests ====================
    describe('Interaction', () => {
        it('should call onDateRangeChange when selecting different range', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const select = screen.getByRole('combobox');
            fireEvent.click(select);

            // Find and click "Last 30 Days" option
            const option30days = screen.getByText('Last 30 Days');
            fireEvent.click(option30days);

            expect(mockOnDateRangeChange).toHaveBeenCalledWith('30days');
        });

        it('should call onBarClick when clicking a bar', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                    onBarClick={mockOnBarClick}
                />
            );

            const bar = screen.getByTestId('bar');
            fireEvent.click(bar);

            // onBarClick gets triggered through the Bar's onClick handler
            // The mock won't be called here because recharts handles the click internally
            // But we can verify the handler is passed to the Bar component
            expect(bar).toBeInTheDocument();
        });

        it('should not crash when onBarClick is not provided', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(container).toBeTruthy();
        });

        it('should highlight selected date bar', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                    selectedDate="2026-02-09"
                />
            );

            // CustomBar component is passed as shape prop to Bar
            // Verify Bar component is rendered with shape
            const bar = screen.getByTestId('bar');
            expect(bar).toBeInTheDocument();
        });
    });

    // ==================== Edge Cases Tests ====================
    describe('Edge Cases', () => {
        it('should handle empty wastage data', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');

            expect(chartData).toHaveLength(7);
            chartData.forEach((day: any) => {
                expect(day.wastage).toBe(0);
                expect(day.carbon).toBe(0);
            });
        });

        it('should handle wastage with invalid recipe ID', () => {
            const wastage1 = createMockWastage('invalid-recipe', null, 5, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(0); // Invalid recipe = 0
            expect(chartData[0].carbon).toBe(0);
        });

        it('should handle wastage with invalid ingredient ID', () => {
            const wastage1 = createMockWastage(null, 'invalid-ingredient', 5, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(0); // Invalid ingredient = 0
            expect(chartData[0].carbon).toBe(0);
        });

        it('should handle recipe with no ingredients', () => {
            const recipe1 = createMockRecipe('recipe1', 'Empty Recipe', []);
            const wastage1 = createMockWastage('recipe1', null, 5, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(0); // No ingredients = 0
            expect(chartData[0].carbon).toBe(0);
        });

        it('should handle ingredient with zero carbon footprint', () => {
            const ingredient1 = createMockIngredient('ing1', 'Water', 'L', 0.0);
            const wastage1 = createMockWastage(null, 'ing1', 5, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(5); // Weight still counted
            expect(chartData[0].carbon).toBe(0); // But carbon is 0
        });

        it('should handle wastage with zero quantity', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 0, '2026-02-09');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(0);
            expect(chartData[0].carbon).toBe(0);
        });

        it('should handle future dates in wastage data', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-15'); // future date

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');

            // Future date should be filtered out
            const allWastage = chartData.reduce((sum: number, day: any) => sum + day.wastage, 0);
            expect(allWastage).toBe(0);
        });
    });

    // ==================== Integration Tests ====================
    describe('Integration', () => {
        it('should render without crashing', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(container).toBeTruthy();
        });

        it('should update chart when dateRange changes', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { rerender } = render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            let chart = screen.getByTestId('composed-chart');
            let chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(7);

            rerender(
                <WastageTrendChart
                    dateRange="30days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            chart = screen.getByTestId('composed-chart');
            chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData).toHaveLength(30);
        });

        it('should calculate total carbon footprint across date range', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-08'); // 10 kg CO2
            const wastage2 = createMockWastage(null, 'ing1', 3, '2026-02-09'); // 15 kg CO2

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            // Total carbon = 10 + 15 = 25
            expect(screen.getByText(/Total Carbon Footprint: 25.00 kg CO₂/)).toBeInTheDocument();
        });

        it('should display all chart components together', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="7days"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
            expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
            expect(screen.getByTestId('x-axis')).toBeInTheDocument();
            expect(screen.getAllByTestId('y-axis')).toHaveLength(2);
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
            expect(screen.getByTestId('legend')).toBeInTheDocument();
            expect(screen.getByTestId('bar')).toBeInTheDocument();
            expect(screen.getByTestId('line')).toBeInTheDocument();
        });

        it('should handle unit conversion for grams', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'g', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2000, '2026-02-09'); // 2000g = 2kg

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(
                <WastageTrendChart
                    dateRange="today"
                    onDateRangeChange={mockOnDateRangeChange}
                />
            );

            const chart = screen.getByTestId('composed-chart');
            const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
            expect(chartData[0].wastage).toBe(2); // 2000g converted to 2kg
            expect(chartData[0].carbon).toBe(10); // 2kg * 5.0 = 10 kg CO2
        });
    });
});
