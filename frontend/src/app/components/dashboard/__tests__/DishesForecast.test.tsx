import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DishesForecast } from '../DishesForecast';
import * as AppContext from '@/app/context/AppContext';
import { format, addDays } from 'date-fns';

// Mock Recharts components
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
    Bar: ({ dataKey, stackId, fill }: any) => <div data-testid={`bar-${dataKey}`} data-stack-id={stackId} data-fill={fill} />,
    XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: ({ content }: any) => <div data-testid="tooltip" data-content={content?.name || 'custom'} />,
    Legend: () => <div data-testid="legend" />,
}));

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
    {
        id: 'recipe-3',
        name: 'Sub Recipe Item',
        isSubRecipe: true,
        isSellable: false,
        ingredients: [],
    },
];

const createMockForecastData = () => {
    const today = new Date('2026-02-09');
    const forecastData = [];

    for (let i = 1; i <= 7; i++) {
        const date = addDays(today, i);
        const dateKey = format(date, 'yyyy-MM-dd');

        forecastData.push({
            id: `forecast-1-${i}`,
            date: dateKey,
            recipeId: 'recipe-1',
            recipeName: 'Chicken Rice',
            quantity: 10 + i,
            predictedQuantity: 10 + i,
        });

        forecastData.push({
            id: `forecast-2-${i}`,
            date: dateKey,
            recipeId: 'recipe-2',
            recipeName: 'Nasi Lemak',
            quantity: 5 + i,
            predictedQuantity: 5 + i,
        });
    }

    return forecastData;
};

describe('DishesForecast', () => {
    const renderComponent = (recipes = mockRecipes, forecastData: any[] = []) => {
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            recipes,
            forecastData,
            ingredients: [],
            salesData: [],
            wastageData: [],
            forecast: [],
            holidays: [],
            weather: null,
            users: [],
            addRecipe: vi.fn(),
            addIngredient: vi.fn(),
            addSalesData: vi.fn(),
            addWastageData: vi.fn(),
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

        return render(<DishesForecast />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock current date to 2026-02-09
        vi.setSystemTime(new Date('2026-02-09T00:00:00.000Z'));
    });

    describe('Rendering', () => {
        it('should render the card with title and description', () => {
            renderComponent();

            expect(screen.getByText(/dishes forecast/i)).toBeInTheDocument();
            expect(screen.getByText(/ai-predicted main dishes breakdown/i)).toBeInTheDocument();
        });

        it('should display average dishes per day in description', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            // Calculate expected average
            // Each day has: Chicken Rice (10+i) + Nasi Lemak (5+i) for i=1 to 7
            // Total per day: (11+6) + (12+7) + (13+8) + (14+9) + (15+10) + (16+11) + (17+12)
            // = 17 + 19 + 21 + 23 + 25 + 27 + 29 = 161
            // Average = 161 / 7 = 23
            expect(screen.getByText(/avg: 23 dishes\/day/i)).toBeInTheDocument();
        });

        it('should render chart icon', () => {
            renderComponent();

            const icon = screen.getByText(/dishes forecast/i).parentElement?.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state message when no forecast data', () => {
            renderComponent(mockRecipes, []);

            expect(screen.getByText(/no dish forecast data available yet/i)).toBeInTheDocument();
            expect(screen.getByText(/train ml models first/i)).toBeInTheDocument();
        });

        it('should display empty state icon', () => {
            renderComponent(mockRecipes, []);

            const emptyStateContainer = screen.getByText(/no dish forecast data available yet/i).parentElement;
            const icon = emptyStateContainer?.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should not render chart when no data', () => {
            renderComponent(mockRecipes, []);

            expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        });
    });

    describe('Chart Display', () => {
        it('should render chart components when forecast data exists', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('x-axis')).toBeInTheDocument();
            expect(screen.getByTestId('y-axis')).toBeInTheDocument();
            expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
            expect(screen.getByTestId('legend')).toBeInTheDocument();
        });

        it('should render bar for each main recipe', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            expect(screen.getByTestId('bar-Chicken Rice')).toBeInTheDocument();
            expect(screen.getByTestId('bar-Nasi Lemak')).toBeInTheDocument();
        });

        it('should not render bar for sub-recipes', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            expect(screen.queryByTestId('bar-Sub Recipe Item')).not.toBeInTheDocument();
        });

        it('should use stacked bar chart layout', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            const chickenBar = screen.getByTestId('bar-Chicken Rice');
            const nasiBar = screen.getByTestId('bar-Nasi Lemak');

            expect(chickenBar).toHaveAttribute('data-stack-id', 'dishes');
            expect(nasiBar).toHaveAttribute('data-stack-id', 'dishes');
        });

        it('should assign colors to bars from color palette', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            const chickenBar = screen.getByTestId('bar-Chicken Rice');
            const nasiBar = screen.getByTestId('bar-Nasi Lemak');

            expect(chickenBar).toHaveAttribute('data-fill', '#4F6F52'); // First color
            expect(nasiBar).toHaveAttribute('data-fill', '#E67E22'); // Second color
        });

        it('should display dates on x-axis', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            const xAxis = screen.getByTestId('x-axis');
            expect(xAxis).toHaveAttribute('data-key', 'displayDate');
        });
    });

    describe('Data Filtering', () => {
        it('should filter out sub-recipes from main recipes', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            // Should render bars for main recipes only
            expect(screen.getByTestId('bar-Chicken Rice')).toBeInTheDocument();
            expect(screen.getByTestId('bar-Nasi Lemak')).toBeInTheDocument();
            expect(screen.queryByTestId('bar-Sub Recipe Item')).not.toBeInTheDocument();
        });

        it('should only include main recipes in forecast calculation', () => {
            const today = new Date('2026-02-09');
            const subRecipeForecast = {
                id: 'forecast-sub',
                date: format(addDays(today, 1), 'yyyy-MM-dd'),
                recipeId: 'recipe-3',
                recipeName: 'Sub Recipe Item',
                quantity: 100,
                predictedQuantity: 100,
            };

            const forecastData = [...createMockForecastData(), subRecipeForecast];
            renderComponent(mockRecipes, forecastData);

            // Average should not include sub-recipe quantity
            // Still should be 23 dishes/day (not affected by sub-recipe)
            expect(screen.getByText(/avg: 23 dishes\/day/i)).toBeInTheDocument();
        });
    });

    describe('Date Range', () => {
        it('should display forecast for next 7 days starting from tomorrow', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            const chartElement = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');

            expect(chartData).toHaveLength(7);

            const today = new Date('2026-02-09');
            for (let i = 0; i < 7; i++) {
                const expectedDate = format(addDays(today, i + 1), 'yyyy-MM-dd');
                expect(chartData[i].date).toBe(expectedDate);
            }
        });

        it('should format display dates correctly', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            const chartElement = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');

            // First day should be Feb 10 (tomorrow from Feb 9, 2026)
            expect(chartData[0].displayDate).toBe('10 Feb');
            // Check day of week - Feb 10, 2026 is Tuesday
            expect(chartData[0].day).toBe('Tue');
        });

        it('should handle data for all 7 days', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            const chartElement = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');

            chartData.forEach((day: any, index: number) => {
                // Each day should have quantities for both main recipes
                expect(day['Chicken Rice']).toBe(11 + index);
                expect(day['Nasi Lemak']).toBe(6 + index);
            });
        });
    });

    describe('Calculations', () => {
        it('should calculate total for week correctly', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            // Total = sum of (Chicken Rice + Nasi Lemak) for 7 days
            // = (11+6) + (12+7) + (13+8) + (14+9) + (15+10) + (16+11) + (17+12)
            // = 17 + 19 + 21 + 23 + 25 + 27 + 29 = 161
            // Average = 161 / 7 = 23
            expect(screen.getByText(/avg: 23 dishes\/day/i)).toBeInTheDocument();
        });

        it('should calculate average per day correctly', () => {
            const today = new Date('2026-02-09');
            const customForecast = [];

            // Create forecast with specific quantities
            for (let i = 1; i <= 7; i++) {
                const date = format(addDays(today, i), 'yyyy-MM-dd');
                customForecast.push({
                    id: `forecast-${i}`,
                    date,
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 10,
                    predictedQuantity: 10,
                });
            }

            renderComponent(mockRecipes, customForecast);

            // Total = 10 * 7 = 70
            // Average = 70 / 7 = 10
            expect(screen.getByText(/avg: 10 dishes\/day/i)).toBeInTheDocument();
        });

        it('should handle zero quantities', () => {
            const today = new Date('2026-02-09');
            const forecastData = [{
                id: 'forecast-1',
                date: format(addDays(today, 1), 'yyyy-MM-dd'),
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                quantity: 0,
                predictedQuantity: 0,
            }];

            renderComponent(mockRecipes, forecastData);

            // Chart should still render but with zero average
            expect(screen.getByText(/avg: 0 dishes\/day/i)).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('should aggregate multiple forecasts for same recipe on same day', () => {
            const today = new Date('2026-02-09');
            const date = format(addDays(today, 1), 'yyyy-MM-dd');

            const forecastData = [
                {
                    id: 'forecast-1',
                    date,
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 10,
                    predictedQuantity: 10,
                },
                {
                    id: 'forecast-2',
                    date,
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 5,
                    predictedQuantity: 5,
                },
            ];

            renderComponent(mockRecipes, forecastData);

            const chartElement = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');

            // First day should have aggregated quantity (10 + 5 = 15)
            expect(chartData[0]['Chicken Rice']).toBe(15);
        });

        it('should handle forecast with predictedQuantity instead of quantity', () => {
            const today = new Date('2026-02-09');
            const forecastData = [{
                id: 'forecast-1',
                date: format(addDays(today, 1), 'yyyy-MM-dd'),
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                predictedQuantity: 20,
            }];

            renderComponent(mockRecipes, forecastData);

            const chartElement = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');

            expect(chartData[0]['Chicken Rice']).toBe(20);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty recipes array', () => {
            renderComponent([], []);

            expect(screen.getByText(/dishes forecast/i)).toBeInTheDocument();
            expect(screen.getByText(/no dish forecast data available yet/i)).toBeInTheDocument();
        });

        it('should handle recipes with only sub-recipes', () => {
            const subRecipesOnly = [
                {
                    id: 'sub-1',
                    name: 'Sub Recipe 1',
                    isSubRecipe: true,
                    isSellable: false,
                    ingredients: [],
                },
            ];

            renderComponent(subRecipesOnly, []);

            expect(screen.getByText(/no dish forecast data available yet/i)).toBeInTheDocument();
        });

        it('should handle forecast data for non-existent recipes', () => {
            const today = new Date('2026-02-09');
            const forecastData = [{
                id: 'forecast-1',
                date: format(addDays(today, 1), 'yyyy-MM-dd'),
                recipeId: 'non-existent-recipe',
                recipeName: 'Ghost Recipe',
                quantity: 100,
                predictedQuantity: 100,
            }];

            renderComponent(mockRecipes, forecastData);

            // Should show chart but with zero average (ghost recipe not counted)
            expect(screen.getByText(/avg: 0 dishes\/day/i)).toBeInTheDocument();
        });

        it('should handle forecast data for past dates', () => {
            const today = new Date('2026-02-09');
            const pastDate = format(addDays(today, -5), 'yyyy-MM-dd');

            const forecastData = [{
                id: 'forecast-past',
                date: pastDate,
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                quantity: 50,
                predictedQuantity: 50,
            }];

            renderComponent(mockRecipes, forecastData);

            // Past data should not be included in chart
            expect(screen.getByText(/avg: 0 dishes\/day/i)).toBeInTheDocument();
        });

        it('should handle forecast data for far future dates', () => {
            const today = new Date('2026-02-09');
            const farFutureDate = format(addDays(today, 30), 'yyyy-MM-dd');

            const forecastData = [{
                id: 'forecast-future',
                date: farFutureDate,
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                quantity: 100,
                predictedQuantity: 100,
            }];

            renderComponent(mockRecipes, forecastData);

            // Only next 7 days should be shown, so far future data ignored
            expect(screen.getByText(/avg: 0 dishes\/day/i)).toBeInTheDocument();
        });

        it('should handle partial week data', () => {
            const today = new Date('2026-02-09');
            const forecastData = [
                {
                    id: 'forecast-1',
                    date: format(addDays(today, 1), 'yyyy-MM-dd'),
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 10,
                    predictedQuantity: 10,
                },
                {
                    id: 'forecast-2',
                    date: format(addDays(today, 3), 'yyyy-MM-dd'),
                    recipeId: 'recipe-1',
                    recipeName: 'Chicken Rice',
                    quantity: 15,
                    predictedQuantity: 15,
                },
            ];

            renderComponent(mockRecipes, forecastData);

            const chartElement = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');

            // Should still show all 7 days, with some having zero
            expect(chartData).toHaveLength(7);
            expect(chartData[0]['Chicken Rice']).toBe(10); // Day 1
            expect(chartData[1]['Chicken Rice']).toBe(0);  // Day 2
            expect(chartData[2]['Chicken Rice']).toBe(15); // Day 3
        });

        it('should handle missing quantity fields gracefully', () => {
            const today = new Date('2026-02-09');
            const forecastData = [{
                id: 'forecast-1',
                date: format(addDays(today, 1), 'yyyy-MM-dd'),
                recipeId: 'recipe-1',
                recipeName: 'Chicken Rice',
                // No quantity or predictedQuantity field
            }];

            renderComponent(mockRecipes, forecastData as any);

            // Should handle missing quantity as 0
            expect(screen.getByText(/avg: 0 dishes\/day/i)).toBeInTheDocument();
        });
    });

    describe('Color Palette', () => {
        it('should use correct colors from palette for first recipes', () => {
            const forecastData = createMockForecastData();
            renderComponent(mockRecipes, forecastData);

            const chickenBar = screen.getByTestId('bar-Chicken Rice');
            const nasiBar = screen.getByTestId('bar-Nasi Lemak');

            // Colors from CHART_COLORS array
            expect(chickenBar).toHaveAttribute('data-fill', '#4F6F52');
            expect(nasiBar).toHaveAttribute('data-fill', '#E67E22');
        });

        it('should cycle through colors when recipes exceed palette size', () => {
            const manyRecipes = [];
            for (let i = 0; i < 12; i++) {
                manyRecipes.push({
                    id: `recipe-${i}`,
                    name: `Recipe ${i}`,
                    isSubRecipe: false,
                    isSellable: true,
                    ingredients: [],
                });
            }

            const today = new Date('2026-02-09');
            const forecastData = [{
                id: 'forecast-1',
                date: format(addDays(today, 1), 'yyyy-MM-dd'),
                recipeId: 'recipe-0',
                recipeName: 'Recipe 0',
                quantity: 10,
                predictedQuantity: 10,
            }];

            renderComponent(manyRecipes, forecastData);

            // First recipe should use first color
            const firstBar = screen.getByTestId('bar-Recipe 0');
            expect(firstBar).toHaveAttribute('data-fill', '#4F6F52');

            // 11th recipe should cycle back to second color (index 10 % 10 = 0, but 0-indexed so it's actually index 11 % 10 = 1)
            const eleventhBar = screen.getByTestId('bar-Recipe 10');
            expect(eleventhBar).toHaveAttribute('data-fill', '#4F6F52'); // Cycles back
        });
    });

    describe('Integration', () => {
        it('should render without crashing', () => {
            const { container } = renderComponent();
            expect(container).toBeInTheDocument();
        });

        it('should update when forecast data changes', () => {
            const { rerender } = renderComponent(mockRecipes, []);

            expect(screen.getByText(/no dish forecast data available yet/i)).toBeInTheDocument();

            // Update with new forecast data
            const forecastData = createMockForecastData();
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                forecastData,
                ingredients: [],
                salesData: [],
                wastageData: [],
                forecast: [],
                holidays: [],
                weather: null,
                users: [],
            } as any);

            rerender(<DishesForecast />);

            expect(screen.queryByText(/no dish forecast data available yet/i)).not.toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('should display correct card styling', () => {
            const { container } = renderComponent();

            const card = container.querySelector('[class*="rounded"]');
            expect(card).toBeInTheDocument();
        });
    });
});
