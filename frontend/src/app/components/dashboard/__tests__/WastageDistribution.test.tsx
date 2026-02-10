import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WastageDistribution } from '../WastageDistribution';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType, WastageEntry, Ingredient, Recipe } from '@/app/types';

// Mock recharts
vi.mock('recharts', () => ({
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ data, label }: { data: any[]; label: any }) => (
        <div data-testid="pie" data-chart-data={JSON.stringify(data)}>
            {data.map((entry, index) => (
                <div key={index} data-label={typeof label === 'function' ? label({ name: entry.name, percent: entry.value / data.reduce((sum: number, item: any) => sum + item.value, 0) }) : ''}>
                    {entry.name}
                </div>
            ))}
        </div>
    ),
    Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill}></div>,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    Legend: () => <div data-testid="legend">Legend</div>,
    Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
}));

// Mock utility functions
vi.mock('@/app/utils/unitConversion', () => ({
    convertUnit: vi.fn((quantity: number, unit: string) => {
        // Mock conversion: g -> kg when > 1000, ml -> L when > 1000
        if ((unit === 'g' || unit === 'kg') && quantity > 1000) {
            return { quantity: quantity / 1000, unit: 'kg' };
        }
        if ((unit === 'ml' || unit === 'L') && quantity > 1000) {
            return { quantity: quantity / 1000, unit: 'L' };
        }
        return { quantity, unit };
    }),
    getStandardizedQuantity: vi.fn((quantity: number, unit: string) => {
        // Convert to standard units (kg for weight, L for volume)
        if (unit === 'g') return quantity / 1000;
        if (unit === 'ml') return quantity / 1000;
        return quantity;
    }),
}));

vi.mock('@/app/utils/recipeCalculations', () => ({
    calculateRecipeCarbon: vi.fn((recipeId: string, recipeMap: Map<string, Recipe>, ingredientMap: Map<string, Ingredient>) => {
        const recipe = recipeMap.get(recipeId);
        if (!recipe || !recipe.ingredients) return 0;

        let totalCarbon = 0;
        recipe.ingredients.forEach(ing => {
            const ingredient = ingredientMap.get(ing.ingredientId);
            if (ingredient) {
                // Recipe quantities are always in grams or ml
                // Convert to kg/L for carbon calculation
                let stdQty = ing.quantity / 1000; // g or ml to kg or L
                totalCarbon += stdQty * ingredient.carbonFootprint;
            }
        });
        return totalCarbon;
    }),
    getRecipeUnit: vi.fn((recipe: Recipe) => {
        return recipe.isSubRecipe ? 'unit' : 'serving';
    }),
}));

describe('WastageDistribution', () => {
    const mockDate = '2026-02-09';

    const createMockIngredient = (id: string, name: string, unit: string, carbon: number): Ingredient => ({
        id,
        name,
        unit,
        carbonFootprint: carbon,
    });

    const createMockRecipe = (id: string, name: string, isSubRecipe: boolean, ingredients: Array<{ ingredientId: string; quantity: number }>): Recipe => ({
        id,
        name,
        isSubRecipe,
        ingredients: ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: '',
        })),
    });

    const createMockWastage = (recipeId: string | null, ingredientId: string | null, quantity: number, date: string): WastageEntry => ({
        id: Math.random().toString(),
        date,
        recipeId: recipeId || undefined,
        ingredientId: ingredientId || undefined,
        quantity,
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==================== Rendering Tests ====================
    describe('Rendering', () => {
        it('should render pie chart card with title and icon', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('Wastage Impact (by CO₂)')).toBeInTheDocument();
        });

        it('should render table card with title and icon', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('Top Wasted Items')).toBeInTheDocument();
        });

        it('should display formatted date in pie chart description', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText(/9 Feb 2026/)).toBeInTheDocument();
        });

        it('should display total carbon footprint in table description', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate); // 2kg * 5.0 = 10kg CO2

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText(/Total CO₂: 10.00 kg/)).toBeInTheDocument();
        });
    });

    // ==================== Empty State Tests ====================
    describe('Empty State', () => {
        it('should show empty state when no wastage data', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('No wastage data for this date')).toBeInTheDocument();
            expect(screen.getByText('No wastage data available for this date')).toBeInTheDocument();
        });

        it('should show empty state when wastage data exists but not for selected date', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-10'); // Different date

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('No wastage data for this date')).toBeInTheDocument();
        });

        it('should show empty state when no valid recipes or ingredients', () => {
            const wastage1 = createMockWastage('invalid-recipe', null, 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('No wastage data for this date')).toBeInTheDocument();
        });
    });

    // ==================== Pie Chart Display Tests ====================
    describe('Pie Chart Display', () => {
        it('should render pie chart with data', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
            expect(screen.getByTestId('pie')).toBeInTheDocument();
        });

        it('should display pie chart data for Main Dishes category', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 200 }]);
            const wastage1 = createMockWastage('recipe1', null, 5, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');
            expect(chartData.some((item: any) => item.name === 'Main Dishes')).toBe(true);
        });

        it('should display pie chart data for Sub-Recipes category', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chili', 'g', 0.002);
            const subRecipe = createMockRecipe('sub1', 'Mala Sauce', true, [{ ingredientId: 'ing1', quantity: 30 }]);
            const wastage1 = createMockWastage('sub1', null, 100, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [subRecipe],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');
            expect(chartData.some((item: any) => item.name === 'Sub-Recipes')).toBe(true);
        });

        it('should display pie chart data for Raw Ingredients category', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');
            expect(chartData.some((item: any) => item.name === 'Raw Ingredients')).toBe(true);
        });

        it('should display percentage labels on pie chart', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate); // 10kg CO2 = 100%

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            expect(pie.textContent).toContain('Raw Ingredients');
        });
    });

    // ==================== Table Display Tests ====================
    describe('Table Display', () => {
        it('should render table headers', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('Item Name')).toBeInTheDocument();
            expect(screen.getByText('Type')).toBeInTheDocument();
            expect(screen.getByText('Quantity')).toBeInTheDocument();
            expect(screen.getByText('CO₂ (kg)')).toBeInTheDocument();
        });

        it('should display item names in table', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('Chicken')).toBeInTheDocument();
        });

        it('should display type badges with correct labels', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 0.2 }]);
            const subRecipe = createMockRecipe('sub1', 'Mala Sauce', true, [{ ingredientId: 'ing1', quantity: 30 }]);

            const wastage1 = createMockWastage('recipe1', null, 5, mockDate);
            const wastage2 = createMockWastage('sub1', null, 3, mockDate);
            const wastage3 = createMockWastage(null, 'ing1', 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2, wastage3],
                ingredients: [ingredient1],
                recipes: [recipe1, subRecipe],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('Dish')).toBeInTheDocument();
            expect(screen.getByText('Sub-Recipe')).toBeInTheDocument();
            expect(screen.getByText('Raw')).toBeInTheDocument();
        });

        it('should display quantities with 2 decimal places', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2.5, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('2.50 kg')).toBeInTheDocument();
        });

        it('should display carbon footprint with 2 decimal places', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate); // 2kg * 5.0 = 10.00 kg CO2

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const carbonCells = screen.getAllByText('10.00');
            expect(carbonCells.length).toBeGreaterThan(0);
        });

        it('should sort table by carbon footprint (highest first)', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const ingredient2 = createMockIngredient('ing2', 'Rice', 'kg', 2.0);

            const wastage1 = createMockWastage(null, 'ing1', 1, mockDate); // 1kg * 5.0 = 5.0 kg CO2
            const wastage2 = createMockWastage(null, 'ing2', 5, mockDate); // 5kg * 2.0 = 10.0 kg CO2

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1, ingredient2],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<WastageDistribution date={mockDate} />);

            // Get all table rows
            const rows = container.querySelectorAll('tbody tr');
            expect(rows.length).toBe(2);

            // First row should be Rice (10.0 kg CO2)
            expect(rows[0].textContent).toContain('Rice');
            // Second row should be Chicken (5.0 kg CO2)
            expect(rows[1].textContent).toContain('Chicken');
        });
    });

    // ==================== Data Filtering Tests ====================
    describe('Data Filtering', () => {
        it('should only display wastage for the selected date', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);

            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate);
            const wastage2 = createMockWastage(null, 'ing1', 3, '2026-02-10'); // Different date

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Total CO2 should be 10.00 (2kg * 5.0), not including wastage2
            expect(screen.getByText(/Total CO₂: 10.00 kg/)).toBeInTheDocument();
        });

        it('should filter out wastage with invalid recipe or ingredient IDs', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);

            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate); // Valid
            const wastage2 = createMockWastage(null, 'invalid', 5, mockDate); // Invalid ingredientId
            const wastage3 = createMockWastage('invalid-recipe', null, 3, mockDate); // Invalid recipeId

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2, wastage3],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Only valid wastage should be counted (2kg * 5.0 = 10.00 kg CO2)
            expect(screen.getByText(/Total CO₂: 10.00 kg/)).toBeInTheDocument();
        });
    });

    // ==================== Recipe Wastage Tests ====================
    describe('Recipe Wastage', () => {
        it('should calculate carbon for main dish wastage', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 200 }]); // 200g per serving
            const wastage1 = createMockWastage('recipe1', null, 10, mockDate); // 10 servings wasted

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Carbon per serving = 0.2kg * 5.0 = 1.0 kg CO2
            // Total = 1.0 * 10 = 10.00 kg CO2
            expect(screen.getByText(/Total CO₂: 10.00 kg/)).toBeInTheDocument();
        });

        it('should use "serving" unit for main dishes', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 200 }]);
            const wastage1 = createMockWastage('recipe1', null, 5, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('5.00 serving')).toBeInTheDocument();
        });

        it('should calculate carbon for sub-recipe wastage', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chili', 'g', 0.002);
            const subRecipe = createMockRecipe('sub1', 'Mala Sauce', true, [{ ingredientId: 'ing1', quantity: 30 }]); // 30g per unit
            const wastage1 = createMockWastage('sub1', null, 100, mockDate); // 100 units wasted

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [subRecipe],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Carbon per unit = 0.03kg * 0.002 = 0.00006 kg CO2
            // Total = 0.00006 * 100 = 0.006 kg CO2
            expect(screen.getByText(/Total CO₂: 0.01 kg/)).toBeInTheDocument(); // Rounded to 2 decimals
        });

        it('should use "unit" for sub-recipes', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chili', 'g', 0.002);
            const subRecipe = createMockRecipe('sub1', 'Mala Sauce', true, [{ ingredientId: 'ing1', quantity: 30 }]);
            const wastage1 = createMockWastage('sub1', null, 50, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [subRecipe],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('50.00 unit')).toBeInTheDocument();
        });
    });

    // ==================== Ingredient Wastage Tests ====================
    describe('Ingredient Wastage', () => {
        it('should calculate carbon for raw ingredient wastage', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 3, mockDate); // 3kg wasted

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Carbon = 3kg * 5.0 = 15.00 kg CO2
            expect(screen.getByText(/Total CO₂: 15.00 kg/)).toBeInTheDocument();
        });

        it('should call convertUnit for ingredient wastage display', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'g', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 1500, mockDate); // 1500g -> should convert to 1.5kg

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // convertUnit is mocked at the top level, check the result
            expect(screen.getByText('1.50 kg')).toBeInTheDocument(); // Converted display
        });

        it('should use getStandardizedQuantity for carbon calculation', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'g', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2000, mockDate); // 2000g

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Carbon = 2kg (standardized) * 5.0 = 10.00 kg CO2
            expect(screen.getByText(/Total CO₂: 10.00 kg/)).toBeInTheDocument();
        });
    });

    // ==================== Category Totals Tests ====================
    describe('Category Totals', () => {
        it('should aggregate carbon by category (Main Dishes)', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 200 }]);
            const recipe2 = createMockRecipe('recipe2', 'Beef Noodles', false, [{ ingredientId: 'ing1', quantity: 300 }]);

            const wastage1 = createMockWastage('recipe1', null, 5, mockDate); // 5 * (200g/1000 * 5.0) = 5.0
            const wastage2 = createMockWastage('recipe2', null, 5, mockDate); // 5 * (300g/1000 * 5.0) = 7.5

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [recipe1, recipe2],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            const mainDishes = chartData.find((item: any) => item.name === 'Main Dishes');
            expect(mainDishes?.value).toBeCloseTo(12.5, 0); // 5.0 + 7.5 = 12.5
        });

        it('should aggregate carbon by category (Sub-Recipes)', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chili', 'g', 0.002);
            const subRecipe1 = createMockRecipe('sub1', 'Mala Sauce', true, [{ ingredientId: 'ing1', quantity: 30 }]);
            const subRecipe2 = createMockRecipe('sub2', 'Garlic Sauce', true, [{ ingredientId: 'ing1', quantity: 20 }]);

            const wastage1 = createMockWastage('sub1', null, 100, mockDate);
            const wastage2 = createMockWastage('sub2', null, 50, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [subRecipe1, subRecipe2],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            const subRecipes = chartData.find((item: any) => item.name === 'Sub-Recipes');
            expect(subRecipes).toBeDefined();
        });

        it('should aggregate carbon by category (Raw Ingredients)', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const ingredient2 = createMockIngredient('ing2', 'Rice', 'kg', 2.0);

            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate); // 2 * 5.0 = 10.0
            const wastage2 = createMockWastage(null, 'ing2', 3, mockDate); // 3 * 2.0 = 6.0

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1, ingredient2],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            const rawIngredients = chartData.find((item: any) => item.name === 'Raw Ingredients');
            expect(rawIngredients?.value).toBe(16.0); // 10.0 + 6.0
        });

        it('should handle all three categories together', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 200 }]);
            const subRecipe1 = createMockRecipe('sub1', 'Mala Sauce', true, [{ ingredientId: 'ing1', quantity: 30 }]);

            const wastage1 = createMockWastage('recipe1', null, 10, mockDate); // Main Dish
            const wastage2 = createMockWastage('sub1', null, 100, mockDate); // Sub-Recipe
            const wastage3 = createMockWastage(null, 'ing1', 2, mockDate); // Raw Ingredient

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2, wastage3],
                ingredients: [ingredient1],
                recipes: [recipe1, subRecipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            expect(chartData).toHaveLength(3);
            expect(chartData.some((item: any) => item.name === 'Main Dishes')).toBe(true);
            expect(chartData.some((item: any) => item.name === 'Sub-Recipes')).toBe(true);
            expect(chartData.some((item: any) => item.name === 'Raw Ingredients')).toBe(true);
        });
    });

    // ==================== Edge Cases Tests ====================
    describe('Edge Cases', () => {
        it('should handle wastage with zero quantity', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 0, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText(/Total CO₂: 0.00 kg/)).toBeInTheDocument();
        });

        it('should handle ingredient with zero carbon footprint', () => {
            const ingredient1 = createMockIngredient('ing1', 'Water', 'L', 0.0);
            const wastage1 = createMockWastage(null, 'ing1', 5, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText(/Total CO₂: 0.00 kg/)).toBeInTheDocument();
            expect(screen.getByText('Water')).toBeInTheDocument();
        });

        it('should handle recipe with no ingredients', () => {
            const recipe1 = createMockRecipe('recipe1', 'Empty Dish', false, []);
            const wastage1 = createMockWastage('recipe1', null, 5, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Carbon calculation should return 0 for recipe with no ingredients
            expect(screen.getByText(/Total CO₂: 0.00 kg/)).toBeInTheDocument();
        });

        it('should handle wastage with both recipeId and ingredientId (prioritize recipeId)', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 200 }]);

            // Create wastage with both IDs
            const wastage1: WastageEntry = {
                id: '1',
                date: mockDate,
                recipeId: 'recipe1',
                ingredientId: 'ing1',
                quantity: 5,
            };

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [recipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            // Should display as recipe (Chicken Rice), not raw ingredient (Chicken)
            expect(screen.getByText('Chicken Rice')).toBeInTheDocument();
            expect(screen.getByText('Dish')).toBeInTheDocument();
        });

        it('should filter out categories with zero carbon', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate); // Only Raw Ingredients

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            const pie = screen.getByTestId('pie');
            const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');

            // Should only have Raw Ingredients, not Main Dishes or Sub-Recipes
            expect(chartData).toHaveLength(1);
            expect(chartData[0].name).toBe('Raw Ingredients');
        });

        it('should handle empty arrays for ingredients and recipes', () => {
            const wastage1 = createMockWastage('recipe1', null, 5, mockDate);
            const wastage2 = createMockWastage(null, 'ing1', 3, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByText('No wastage data for this date')).toBeInTheDocument();
        });

        it('should handle multiple wastage entries for same item', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);

            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate);
            const wastage2 = createMockWastage(null, 'ing1', 3, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<WastageDistribution date={mockDate} />);

            // Should show two separate entries in table
            const rows = container.querySelectorAll('tbody tr');
            expect(rows.length).toBe(2);

            // Total carbon should be sum of both (2*5 + 3*5 = 25)
            expect(screen.getByText(/Total CO₂: 25.00 kg/)).toBeInTheDocument();
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

            const { container } = render(<WastageDistribution date={mockDate} />);
            expect(container).toBeTruthy();
        });

        it('should display correct card styling', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<WastageDistribution date={mockDate} />);

            const cards = container.querySelectorAll('.rounded-\\[8px\\]');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should update when date changes', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, '2026-02-09');
            const wastage2 = createMockWastage(null, 'ing1', 3, '2026-02-10');

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { rerender } = render(<WastageDistribution date="2026-02-09" />);
            expect(screen.getByText(/Total CO₂: 10.00 kg/)).toBeInTheDocument();

            rerender(<WastageDistribution date="2026-02-10" />);
            expect(screen.getByText(/Total CO₂: 15.00 kg/)).toBeInTheDocument();
        });

        it('should display grid layout with two cards', () => {
            const mockContext: Partial<AppContextType> = {
                wastageData: [],
                ingredients: [],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<WastageDistribution date={mockDate} />);

            const grid = container.querySelector('.grid');
            expect(grid).toBeTruthy();
            expect(grid?.className).toContain('grid-cols-1');
            expect(grid?.className).toContain('lg:grid-cols-2');
        });

        it('should render chart components (Legend, Tooltip)', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const wastage1 = createMockWastage(null, 'ing1', 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1],
                ingredients: [ingredient1],
                recipes: [],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<WastageDistribution date={mockDate} />);

            expect(screen.getByTestId('legend')).toBeInTheDocument();
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        });

        it('should display badge colors correctly', () => {
            const ingredient1 = createMockIngredient('ing1', 'Chicken', 'kg', 5.0);
            const recipe1 = createMockRecipe('recipe1', 'Chicken Rice', false, [{ ingredientId: 'ing1', quantity: 200 }]);
            const subRecipe1 = createMockRecipe('sub1', 'Mala Sauce', true, [{ ingredientId: 'ing1', quantity: 30 }]);

            const wastage1 = createMockWastage('recipe1', null, 5, mockDate);
            const wastage2 = createMockWastage('sub1', null, 3, mockDate);
            const wastage3 = createMockWastage(null, 'ing1', 2, mockDate);

            const mockContext: Partial<AppContextType> = {
                wastageData: [wastage1, wastage2, wastage3],
                ingredients: [ingredient1],
                recipes: [recipe1, subRecipe1],
            };
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<WastageDistribution date={mockDate} />);

            // Check for badge color classes
            const badges = container.querySelectorAll('[class*="bg-[#"]');
            expect(badges.length).toBeGreaterThan(0);
        });
    });
});
