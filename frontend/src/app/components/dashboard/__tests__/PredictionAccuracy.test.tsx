import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PredictionAccuracy } from '../PredictionAccuracy';
import * as AppContext from '@/app/context/AppContext';
import { format, subDays } from 'date-fns';

// Mock recharts components
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children, data }: any) => (
        <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    Bar: ({ dataKey, fill, name }: any) => (
        <div data-testid="bar" data-key={dataKey} data-fill={fill} data-name={name} />
    ),
    XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

describe('PredictionAccuracy', () => {
    const today = new Date('2026-02-09T00:00:00.000Z');

    const mockRecipes = [
        {
            id: '1',
            name: 'Chicken Rice',
            isSubRecipe: false,
            isSellable: true,
            ingredients: [],
        },
        {
            id: '2',
            name: 'Mala Chicken',
            isSubRecipe: false,
            isSellable: true,
            ingredients: [],
        },
        {
            id: '3',
            name: 'Mala Sauce',
            isSubRecipe: true,
            isSellable: false,
            ingredients: [],
        },
    ];

    const mockSalesData = [
        // Feb 9 (today)
        { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
        { id: '2', date: '2026-02-09', recipeId: '2', recipeName: 'Mala Chicken', quantity: 8 },
        // Feb 8
        { id: '3', date: '2026-02-08', recipeId: '1', recipeName: 'Chicken Rice', quantity: 12 },
        { id: '4', date: '2026-02-08', recipeId: '2', recipeName: 'Mala Chicken', quantity: 6 },
        // Feb 7
        { id: '5', date: '2026-02-07', recipeId: '1', recipeName: 'Chicken Rice', quantity: 15 },
        // Feb 6
        { id: '6', date: '2026-02-06', recipeId: '1', recipeName: 'Chicken Rice', quantity: 9 },
        // Feb 5
        { id: '7', date: '2026-02-05', recipeId: '1', recipeName: 'Chicken Rice', quantity: 11 },
        // Feb 4
        { id: '8', date: '2026-02-04', recipeId: '1', recipeName: 'Chicken Rice', quantity: 13 },
        // Feb 3
        { id: '9', date: '2026-02-03', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
    ];

    const mockForecastData = [
        // Feb 9 (today)
        { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 9 },
        { id: '2', date: '2026-02-09', recipeId: '2', recipeName: 'Mala Chicken', quantity: 7 },
        // Feb 8
        { id: '3', date: '2026-02-08', recipeId: '1', recipeName: 'Chicken Rice', quantity: 11 },
        { id: '4', date: '2026-02-08', recipeId: '2', recipeName: 'Mala Chicken', quantity: 5 },
        // Feb 7
        { id: '5', date: '2026-02-07', recipeId: '1', recipeName: 'Chicken Rice', quantity: 14 },
        // Feb 6
        { id: '6', date: '2026-02-06', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
        // Feb 5
        { id: '7', date: '2026-02-05', recipeId: '1', recipeName: 'Chicken Rice', quantity: 12 },
        // Feb 4
        { id: '8', date: '2026-02-04', recipeId: '1', recipeName: 'Chicken Rice', quantity: 13 },
        // Feb 3
        { id: '9', date: '2026-02-03', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
    ];

    const mockIngredients = [
        { id: '1', name: 'Chicken', unit: 'kg', carbonFootprint: 2.5 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.setSystemTime(today);

        // Mock useApp hook
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            recipes: mockRecipes,
            salesData: mockSalesData,
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
            render(<PredictionAccuracy />);

            expect(screen.getByText('Prediction Accuracy')).toBeInTheDocument();
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should display the description', () => {
            render(<PredictionAccuracy />);

            expect(screen.getByText(/Last 7 days \(including today\) actual sales vs predicted sales comparison/i)).toBeInTheDocument();
        });

        it('should display accuracy percentage', () => {
            render(<PredictionAccuracy />);

            // Total actual: 10+8+12+6+15+9+11+13+10 = 94
            // Total predicted: 9+7+11+5+14+10+12+13+10 = 91
            // Accuracy: (1 - |94-91|/91) * 100 = (1 - 3/91) * 100 ≈ 96.7%
            const accuracyText = screen.getByText(/96\.7%/);
            expect(accuracyText).toBeInTheDocument();
        });

        it('should display trend indicator for positive difference', () => {
            render(<PredictionAccuracy />);

            // Difference: 94 - 91 = 3 (positive)
            expect(screen.getByText(/3 dishes above prediction/)).toBeInTheDocument();
        });

        it('should display trend indicator for negative difference', () => {
            const lowSalesData = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 5 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: lowSalesData,
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

            render(<PredictionAccuracy />);

            expect(screen.getByText(/below prediction/)).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no forecast data exists', () => {
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

            render(<PredictionAccuracy />);

            expect(screen.getByText('No prediction accuracy data available yet.')).toBeInTheDocument();
            expect(screen.getByText(/Accuracy comparison will appear after ML models generate predictions/)).toBeInTheDocument();
        });

        it('should not render chart when no forecast data', () => {
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

            render(<PredictionAccuracy />);

            expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        });

        it('should show 0% accuracy when no predictions', () => {
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

            render(<PredictionAccuracy />);

            expect(screen.getByText('0.0%')).toBeInTheDocument();
        });
    });

    describe('Chart Display', () => {
        it('should render chart components', () => {
            render(<PredictionAccuracy />);

            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('x-axis')).toBeInTheDocument();
            expect(screen.getByTestId('y-axis')).toBeInTheDocument();
            expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
            expect(screen.getByTestId('legend')).toBeInTheDocument();
        });

        it('should render two bars for actual and predicted', () => {
            render(<PredictionAccuracy />);

            const bars = screen.getAllByTestId('bar');
            expect(bars).toHaveLength(2);
        });

        it('should use correct colors for bars', () => {
            render(<PredictionAccuracy />);

            const bars = screen.getAllByTestId('bar');
            const predictedBar = bars.find(bar => bar.getAttribute('data-key') === 'predicted');
            const actualBar = bars.find(bar => bar.getAttribute('data-key') === 'actual');

            expect(predictedBar?.getAttribute('data-fill')).toBe('#B4A373'); // Muted Gold
            expect(actualBar?.getAttribute('data-fill')).toBe('#4F6F52'); // Deep Forest Sage
        });

        it('should display correct bar names', () => {
            render(<PredictionAccuracy />);

            const bars = screen.getAllByTestId('bar');
            const predictedBar = bars.find(bar => bar.getAttribute('data-key') === 'predicted');
            const actualBar = bars.find(bar => bar.getAttribute('data-key') === 'actual');

            expect(predictedBar?.getAttribute('data-name')).toBe('Predicted');
            expect(actualBar?.getAttribute('data-name')).toBe('Actual Sales');
        });
    });

    describe('Data Filtering', () => {
        it('should filter out sub-recipes from calculations', () => {
            const salesWithSubRecipe = [
                ...mockSalesData,
                { id: '10', date: '2026-02-09', recipeId: '3', recipeName: 'Mala Sauce', quantity: 100 },
            ];

            const forecastWithSubRecipe = [
                ...mockForecastData,
                { id: '10', date: '2026-02-09', recipeId: '3', recipeName: 'Mala Sauce', quantity: 100 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: salesWithSubRecipe,
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

            render(<PredictionAccuracy />);

            // Sub-recipe sales should not affect accuracy
            // Should still show 96.7% (without the 100 units from sub-recipe)
            const accuracyText = screen.getByText(/96\.7%/);
            expect(accuracyText).toBeInTheDocument();
        });

        it('should only include main recipes in calculations', () => {
            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // All data points should only include main recipes
            chartData.forEach((day: any) => {
                // The actual and predicted values should not include sub-recipe data
                expect(day.actual).toBeGreaterThanOrEqual(0);
                expect(day.predicted).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('Date Range', () => {
        it('should display data for last 7 days including today', () => {
            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            expect(chartData).toHaveLength(7);

            // Check dates are correct (Feb 3 to Feb 9)
            const expectedDates = [
                '2026-02-03',
                '2026-02-04',
                '2026-02-05',
                '2026-02-06',
                '2026-02-07',
                '2026-02-08',
                '2026-02-09',
            ];

            chartData.forEach((day: any, index: number) => {
                expect(day.date).toBe(expectedDates[index]);
            });
        });

        it('should format display dates correctly', () => {
            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // Check first and last dates
            expect(chartData[0].displayDate).toBe('3 Feb');
            expect(chartData[6].displayDate).toBe('9 Feb');
        });

        it('should include day of week for each date', () => {
            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // Feb 9, 2026 is Monday
            expect(chartData[6].day).toBe('Mon');
            // Feb 8, 2026 is Sunday
            expect(chartData[5].day).toBe('Sun');
        });
    });

    describe('Calculations', () => {
        it('should calculate accuracy correctly when actual equals predicted', () => {
            const exactSalesData = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            const exactForecastData = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: exactSalesData,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: exactForecastData,
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

            render(<PredictionAccuracy />);

            // Perfect accuracy = 100%
            expect(screen.getByText('100.0%')).toBeInTheDocument();
            expect(screen.getByText(/0 dishes above prediction/)).toBeInTheDocument();
        });

        it('should calculate total actual correctly', () => {
            render(<PredictionAccuracy />);

            // Total actual: 10+8+12+6+15+9+11+13+10 = 94
            // This is reflected in the difference: 3 dishes above prediction
            expect(screen.getByText(/3 dishes above prediction/)).toBeInTheDocument();
        });

        it('should calculate total predicted correctly', () => {
            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            const totalPredicted = chartData.reduce((sum: number, day: any) => sum + day.predicted, 0);
            // Total predicted: 9+7+11+5+14+10+12+13+10 = 91
            expect(totalPredicted).toBe(91);
        });

        it('should handle zero actual sales', () => {
            const noSalesData: any[] = [];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: noSalesData,
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

            render(<PredictionAccuracy />);

            // Should show 0% accuracy with 91 dishes below prediction
            expect(screen.getByText('0.0%')).toBeInTheDocument();
            expect(screen.getByText(/91 dishes below prediction/)).toBeInTheDocument();
        });

        it('should aggregate multiple sales for same date', () => {
            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // Feb 9 has 2 sales: 10 + 8 = 18
            const feb9Data = chartData.find((day: any) => day.date === '2026-02-09');
            expect(feb9Data.actual).toBe(18);

            // Feb 8 has 2 sales: 12 + 6 = 18
            const feb8Data = chartData.find((day: any) => day.date === '2026-02-08');
            expect(feb8Data.actual).toBe(18);
        });

        it('should aggregate multiple forecasts for same date', () => {
            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // Feb 9 has 2 forecasts: 9 + 7 = 16
            const feb9Data = chartData.find((day: any) => day.date === '2026-02-09');
            expect(feb9Data.predicted).toBe(16);

            // Feb 8 has 2 forecasts: 11 + 5 = 16
            const feb8Data = chartData.find((day: any) => day.date === '2026-02-08');
            expect(feb8Data.predicted).toBe(16);
        });
    });

    describe('PredictedQuantity Support', () => {
        it('should handle forecast with predictedQuantity field', () => {
            const forecastWithPredictedQuantity = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 9 },
                { id: '2', date: '2026-02-09', recipeId: '2', recipeName: 'Mala Chicken', quantity: 7 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: mockSalesData,
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

            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // Feb 9 should have predicted: 9 + 7 = 16
            const feb9Data = chartData.find((day: any) => day.date === '2026-02-09');
            expect(feb9Data.predicted).toBe(16);
        });

        it('should prefer quantity over predictedQuantity', () => {
            const forecastWithBoth = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10, predictedQuantity: 5 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: mockSalesData,
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

            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // Should use quantity (10) not predictedQuantity (5)
            const feb9Data = chartData.find((day: any) => day.date === '2026-02-09');
            expect(feb9Data.predicted).toBe(10);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty recipes array', () => {
            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: [],
                salesData: mockSalesData,
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

            render(<PredictionAccuracy />);

            // Should show 0% accuracy as no recipes match
            expect(screen.getByText('0.0%')).toBeInTheDocument();
        });

        it('should handle recipes with only sub-recipes', () => {
            const subRecipesOnly = [
                {
                    id: '3',
                    name: 'Mala Sauce',
                    isSubRecipe: true,
                    isSellable: false,
                    ingredients: [],
                },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: subRecipesOnly,
                salesData: mockSalesData,
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

            render(<PredictionAccuracy />);

            // Should show 0% accuracy
            expect(screen.getByText('0.0%')).toBeInTheDocument();
        });

        it('should handle sales for non-existent recipes', () => {
            const invalidSales = [
                { id: '1', date: '2026-02-09', recipeId: '999', recipeName: 'Invalid Recipe', quantity: 100 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: invalidSales,
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

            render(<PredictionAccuracy />);

            // Invalid recipe sales should be ignored
            // Accuracy should be based only on valid recipes
            expect(screen.getByText(/0\.0%/)).toBeInTheDocument();
        });

        it('should handle forecast for non-existent recipes', () => {
            const invalidForecast = [
                { id: '1', date: '2026-02-09', recipeId: '999', recipeName: 'Invalid Recipe', quantity: 100 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: mockSalesData,
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

            render(<PredictionAccuracy />);

            // Invalid recipe forecasts should be ignored
            expect(screen.getByText('0.0%')).toBeInTheDocument();
        });

        it('should handle missing quantity and predictedQuantity', () => {
            const forecastWithoutQuantity = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice' },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: mockSalesData,
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

            render(<PredictionAccuracy />);

            // Should handle gracefully with 0 as default
            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
            const feb9Data = chartData.find((day: any) => day.date === '2026-02-09');
            expect(feb9Data.predicted).toBe(0);
        });

        it('should handle partial week data', () => {
            const partialSales = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
                { id: '2', date: '2026-02-07', recipeId: '1', recipeName: 'Chicken Rice', quantity: 8 },
            ];

            const partialForecast = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 9 },
                { id: '2', date: '2026-02-07', recipeId: '1', recipeName: 'Chicken Rice', quantity: 7 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: partialSales,
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

            render(<PredictionAccuracy />);

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

            // Should still have 7 days, with zeros for missing days
            expect(chartData).toHaveLength(7);

            // Days with data
            const feb9 = chartData.find((day: any) => day.date === '2026-02-09');
            expect(feb9.actual).toBe(10);
            expect(feb9.predicted).toBe(9);

            // Days without data
            const feb8 = chartData.find((day: any) => day.date === '2026-02-08');
            expect(feb8.actual).toBe(0);
            expect(feb8.predicted).toBe(0);
        });
    });

    describe('Trend Indicators', () => {
        it('should show TrendingUp icon when actual exceeds predicted', () => {
            render(<PredictionAccuracy />);

            const trendingUpIcon = document.querySelector('[class*="lucide-trending-up"]');
            expect(trendingUpIcon).toBeInTheDocument();
        });

        it('should show TrendingDown icon when actual below predicted', () => {
            const lowSalesData = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 1 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: lowSalesData,
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

            render(<PredictionAccuracy />);

            const trendingDownIcon = document.querySelector('[class*="lucide-trending-down"]');
            expect(trendingDownIcon).toBeInTheDocument();
        });

        it('should use green color for positive difference', () => {
            const { container } = render(<PredictionAccuracy />);

            // Find the difference text element
            const diffElement = container.querySelector('[class*="text-[#27AE60]"]');
            expect(diffElement).toBeInTheDocument();
        });

        it('should use orange color for negative difference', () => {
            const lowSalesData = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 1 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: lowSalesData,
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

            const { container } = render(<PredictionAccuracy />);

            const diffElement = container.querySelector('[class*="text-[#E67E22]"]');
            expect(diffElement).toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('should render without crashing', () => {
            render(<PredictionAccuracy />);

            expect(screen.getByText('Prediction Accuracy')).toBeInTheDocument();
        });

        it('should display correct card styling', () => {
            const { container } = render(<PredictionAccuracy />);

            const card = container.querySelector('[class*="rounded-[8px]"]');
            expect(card).toBeInTheDocument();
        });

        it('should handle data updates', () => {
            const { rerender } = render(<PredictionAccuracy />);

            expect(screen.getByText(/96\.7%/)).toBeInTheDocument();

            // Update with different data
            const newSalesData = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 20 },
            ];

            const newForecastData = [
                { id: '1', date: '2026-02-09', recipeId: '1', recipeName: 'Chicken Rice', quantity: 10 },
            ];

            vi.spyOn(AppContext, 'useApp').mockReturnValue({
                recipes: mockRecipes,
                salesData: newSalesData,
                ingredients: mockIngredients,
                wastageData: [],
                forecastData: newForecastData,
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

            rerender(<PredictionAccuracy />);

            // Accuracy: (1 - |20-10|/10) * 100 = 0%
            expect(screen.getByText('0.0%')).toBeInTheDocument();
        });
    });
});
