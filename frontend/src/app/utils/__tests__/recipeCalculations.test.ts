import { describe, it, expect, beforeEach } from 'vitest';
import {
    calculateRecipeWeight,
    calculateRecipeCarbon,
    calculateRecipeCost,
    getRecipeUnit,
    getRecipeIngredientBreakdown,
} from '../recipeCalculations';
import { Recipe, Ingredient } from '@/app/types';

describe('recipeCalculations', () => {
    let ingredientMap: Map<string, Ingredient>;
    let recipeMap: Map<string, Recipe>;

    beforeEach(() => {
        // Setup test data
        ingredientMap = new Map([
            [
                'ing-1',
                {
                    id: 'ing-1',
                    ingredientId: 'ing-1',
                    name: 'Tomato',
                    unit: 'g',
                    carbonFootprint: 0.5, // kg CO2 per kg
                    supplierUnitCost: 10, // $10 per package
                    totalUnitsInPackage: 1000, // 1000g per package
                } as Ingredient,
            ],
            [
                'ing-2',
                {
                    id: 'ing-2',
                    ingredientId: 'ing-2',
                    name: 'Olive Oil',
                    unit: 'ml',
                    carbonFootprint: 2.5, // kg CO2 per L
                    supplierUnitCost: 15, // $15 per package
                    totalUnitsInPackage: 500, // 500ml per package
                } as Ingredient,
            ],
            [
                'ing-3',
                {
                    id: 'ing-3',
                    ingredientId: 'ing-3',
                    name: 'Cheese',
                    unit: 'kg',
                    carbonFootprint: 10.0, // kg CO2 per kg
                    supplierUnitCost: 20, // $20 per kg
                    totalUnitsInPackage: 1, // 1 kg per package
                } as Ingredient,
            ],
        ]);

        recipeMap = new Map();
    });

    describe('calculateRecipeWeight', () => {
        it('should calculate weight for recipe with single ingredient', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                recipeId: 'recipe-1',
                name: 'Simple Salad',
                recipeName: 'Simple Salad',
                ingredients: [
                    {
                        ingredientId: 'ing-1',
                        quantity: 500, // 500g tomato
                    },
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-1', recipe);

            const weight = calculateRecipeWeight('recipe-1', recipeMap, ingredientMap);
            expect(weight).toBe(0.5); // 500g = 0.5kg
        });

        it('should calculate weight for recipe with multiple ingredients', () => {
            const recipe: Recipe = {
                id: 'recipe-2',
                recipeId: 'recipe-2',
                name: 'Mixed Dish',
                recipeName: 'Mixed Dish',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 500 }, // 500g tomato
                    { ingredientId: 'ing-2', quantity: 100 }, // 100ml oil
                    { ingredientId: 'ing-3', quantity: 0.2 }, // 0.2kg cheese
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-2', recipe);

            const weight = calculateRecipeWeight('recipe-2', recipeMap, ingredientMap);
            expect(weight).toBe(0.8); // 0.5 + 0.1 + 0.2 = 0.8kg
        });

        it('should return 0 for non-existent recipe', () => {
            const weight = calculateRecipeWeight('non-existent', recipeMap, ingredientMap);
            expect(weight).toBe(0);
        });

        it('should handle recipe with sub-recipe (recursive)', () => {
            // Sub-recipe: Sauce
            const subRecipe: Recipe = {
                id: 'recipe-sauce',
                recipeId: 'recipe-sauce',
                name: 'Tomato Sauce',
                recipeName: 'Tomato Sauce',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 300 }, // 300g tomato
                    { ingredientId: 'ing-2', quantity: 50 }, // 50ml oil
                ],
                isSubRecipe: true,
            } as Recipe;
            recipeMap.set('recipe-sauce', subRecipe);

            // Main recipe using the sauce
            const mainRecipe: Recipe = {
                id: 'recipe-main',
                recipeId: 'recipe-main',
                name: 'Pasta with Sauce',
                recipeName: 'Pasta with Sauce',
                ingredients: [
                    { childRecipeId: 'recipe-sauce', quantity: 2 }, // 2x sauce
                    { ingredientId: 'ing-3', quantity: 0.1 }, // 100g cheese
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-main', mainRecipe);

            const weight = calculateRecipeWeight('recipe-main', recipeMap, ingredientMap);
            // Sauce: 300g + 50ml = 350g = 0.35kg
            // Main: (0.35kg * 2) + 0.1kg = 0.7 + 0.1 = 0.8kg
            expect(weight).toBeCloseTo(0.8, 10); // Use toBeCloseTo for floating point comparison
        });

        it('should handle empty recipe', () => {
            const recipe: Recipe = {
                id: 'recipe-empty',
                recipeId: 'recipe-empty',
                name: 'Empty Recipe',
                recipeName: 'Empty Recipe',
                ingredients: [],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-empty', recipe);

            const weight = calculateRecipeWeight('recipe-empty', recipeMap, ingredientMap);
            expect(weight).toBe(0);
        });

        it('should handle missing ingredient gracefully', () => {
            const recipe: Recipe = {
                id: 'recipe-missing',
                recipeId: 'recipe-missing',
                name: 'Missing Ingredient',
                recipeName: 'Missing Ingredient',
                ingredients: [
                    { ingredientId: 'non-existent', quantity: 500 },
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-missing', recipe);

            const weight = calculateRecipeWeight('recipe-missing', recipeMap, ingredientMap);
            expect(weight).toBe(0);
        });
    });

    describe('calculateRecipeCarbon', () => {
        it('should calculate carbon footprint for single ingredient recipe', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                recipeId: 'recipe-1',
                name: 'Tomato Dish',
                recipeName: 'Tomato Dish',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 1000 }, // 1kg tomato
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-1', recipe);

            const carbon = calculateRecipeCarbon('recipe-1', recipeMap, ingredientMap);
            // 1kg tomato * 0.5 kg CO2/kg = 0.5 kg CO2
            expect(carbon).toBe(0.5);
        });

        it('should calculate carbon footprint for multiple ingredients', () => {
            const recipe: Recipe = {
                id: 'recipe-2',
                recipeId: 'recipe-2',
                name: 'Mixed Dish',
                recipeName: 'Mixed Dish',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 500 }, // 0.5kg tomato
                    { ingredientId: 'ing-2', quantity: 200 }, // 0.2L oil
                    { ingredientId: 'ing-3', quantity: 0.1 }, // 0.1kg cheese
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-2', recipe);

            const carbon = calculateRecipeCarbon('recipe-2', recipeMap, ingredientMap);
            // Tomato: 0.5kg * 0.5 = 0.25
            // Oil: 0.2L * 2.5 = 0.5
            // Cheese: 0.1kg * 10.0 = 1.0
            // Total: 0.25 + 0.5 + 1.0 = 1.75
            expect(carbon).toBeCloseTo(1.75, 2);
        });

        it('should return 0 for non-existent recipe', () => {
            const carbon = calculateRecipeCarbon('non-existent', recipeMap, ingredientMap);
            expect(carbon).toBe(0);
        });

        it('should handle nested sub-recipes', () => {
            const subRecipe: Recipe = {
                id: 'recipe-sub',
                recipeId: 'recipe-sub',
                name: 'Sub Recipe',
                recipeName: 'Sub Recipe',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 500 }, // 0.5kg tomato
                ],
                isSubRecipe: true,
            } as Recipe;
            recipeMap.set('recipe-sub', subRecipe);

            const mainRecipe: Recipe = {
                id: 'recipe-main',
                recipeId: 'recipe-main',
                name: 'Main Recipe',
                recipeName: 'Main Recipe',
                ingredients: [
                    { childRecipeId: 'recipe-sub', quantity: 2 }, // 2x sub-recipe
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-main', mainRecipe);

            const carbon = calculateRecipeCarbon('recipe-main', recipeMap, ingredientMap);
            // Sub: 0.5kg * 0.5 = 0.25 kg CO2
            // Main: 0.25 * 2 = 0.5 kg CO2
            expect(carbon).toBeCloseTo(0.5, 2);
        });
    });

    describe('calculateRecipeCost', () => {
        it('should calculate cost for single ingredient recipe', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                recipeId: 'recipe-1',
                name: 'Simple Dish',
                recipeName: 'Simple Dish',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 500 }, // 500g tomato
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-1', recipe);

            const cost = calculateRecipeCost('recipe-1', recipeMap, ingredientMap);
            // Cost per g: $10 / 1000g = $0.01/g
            // Total: 500g * $0.01 = $5
            expect(cost).toBe(5);
        });

        it('should calculate cost for multiple ingredients', () => {
            const recipe: Recipe = {
                id: 'recipe-2',
                recipeId: 'recipe-2',
                name: 'Mixed Dish',
                recipeName: 'Mixed Dish',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 1000 }, // 1000g tomato
                    { ingredientId: 'ing-2', quantity: 100 }, // 100ml oil
                    { ingredientId: 'ing-3', quantity: 0.5 }, // 0.5kg cheese
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-2', recipe);

            const cost = calculateRecipeCost('recipe-2', recipeMap, ingredientMap);
            // Tomato: 1000g * ($10/1000g) = $10
            // Oil: 100ml * ($15/500ml) = $3
            // Cheese: 0.5kg * ($20/1kg) = $10
            // Total: $23
            expect(cost).toBe(23);
        });

        it('should return 0 for non-existent recipe', () => {
            const cost = calculateRecipeCost('non-existent', recipeMap, ingredientMap);
            expect(cost).toBe(0);
        });

        it('should handle nested sub-recipes', () => {
            const subRecipe: Recipe = {
                id: 'recipe-sub',
                recipeId: 'recipe-sub',
                name: 'Sauce',
                recipeName: 'Sauce',
                ingredients: [
                    { ingredientId: 'ing-2', quantity: 200 }, // 200ml oil
                ],
                isSubRecipe: true,
            } as Recipe;
            recipeMap.set('recipe-sub', subRecipe);

            const mainRecipe: Recipe = {
                id: 'recipe-main',
                recipeId: 'recipe-main',
                name: 'Dish with Sauce',
                recipeName: 'Dish with Sauce',
                ingredients: [
                    { childRecipeId: 'recipe-sub', quantity: 2 },
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-main', mainRecipe);

            const cost = calculateRecipeCost('recipe-main', recipeMap, ingredientMap);
            // Sub: 200ml * ($15/500ml) = $6
            // Main: $6 * 2 = $12
            expect(cost).toBe(12);
        });

        it('should handle missing cost data gracefully', () => {
            ingredientMap.set('ing-no-cost', {
                id: 'ing-no-cost',
                ingredientId: 'ing-no-cost',
                name: 'No Cost Item',
                unit: 'g',
                carbonFootprint: 0,
                // No supplierUnitCost or totalUnitsInPackage
            } as Ingredient);

            const recipe: Recipe = {
                id: 'recipe-no-cost',
                recipeId: 'recipe-no-cost',
                name: 'No Cost Recipe',
                recipeName: 'No Cost Recipe',
                ingredients: [
                    { ingredientId: 'ing-no-cost', quantity: 500 },
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-no-cost', recipe);

            const cost = calculateRecipeCost('recipe-no-cost', recipeMap, ingredientMap);
            expect(cost).toBe(0);
        });
    });

    describe('getRecipeUnit', () => {
        it('should return specified unit if available', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                recipeId: 'recipe-1',
                name: 'Test',
                recipeName: 'Test',
                unit: 'serving',
                ingredients: [],
                isSubRecipe: false,
            } as Recipe;

            const unit = getRecipeUnit(recipe);
            expect(unit).toBe('serving');
        });

        it('should return "L" for sub-recipes without unit', () => {
            const recipe: Recipe = {
                id: 'recipe-2',
                recipeId: 'recipe-2',
                name: 'Sub Recipe',
                recipeName: 'Sub Recipe',
                ingredients: [],
                isSubRecipe: true,
            } as Recipe;

            const unit = getRecipeUnit(recipe);
            expect(unit).toBe('L');
        });

        it('should return "plate" for regular recipes without unit', () => {
            const recipe: Recipe = {
                id: 'recipe-3',
                recipeId: 'recipe-3',
                name: 'Regular Recipe',
                recipeName: 'Regular Recipe',
                ingredients: [],
                isSubRecipe: false,
            } as Recipe;

            const unit = getRecipeUnit(recipe);
            expect(unit).toBe('plate');
        });
    });

    describe('getRecipeIngredientBreakdown', () => {
        it('should break down simple recipe with direct ingredients', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                recipeId: 'recipe-1',
                name: 'Simple Salad',
                recipeName: 'Simple Salad',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 500 },
                    { ingredientId: 'ing-2', quantity: 100 },
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-1', recipe);

            const breakdown = getRecipeIngredientBreakdown('recipe-1', 1, recipeMap, ingredientMap);

            expect(breakdown['ing-1']).toBe(500);
            expect(breakdown['ing-2']).toBe(100);
        });

        it('should multiply quantities by serving count', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                recipeId: 'recipe-1',
                name: 'Simple Salad',
                recipeName: 'Simple Salad',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 500 },
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-1', recipe);

            const breakdown = getRecipeIngredientBreakdown('recipe-1', 3, recipeMap, ingredientMap);

            expect(breakdown['ing-1']).toBe(1500); // 500 * 3
        });

        it('should accumulate same ingredient used multiple times', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                recipeId: 'recipe-1',
                name: 'Double Tomato',
                recipeName: 'Double Tomato',
                ingredients: [
                    { ingredientId: 'ing-1', quantity: 300 },
                    { ingredientId: 'ing-1', quantity: 200 },
                ],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-1', recipe);

            const breakdown = getRecipeIngredientBreakdown('recipe-1', 1, recipeMap, ingredientMap);

            expect(breakdown['ing-1']).toBe(500); // 300 + 200
        });

        it('should return empty object for non-existent recipe', () => {
            const breakdown = getRecipeIngredientBreakdown('non-existent', 1, recipeMap, ingredientMap);
            expect(breakdown).toEqual({});
        });

        it('should return empty object for empty recipe', () => {
            const recipe: Recipe = {
                id: 'recipe-empty',
                recipeId: 'recipe-empty',
                name: 'Empty',
                recipeName: 'Empty',
                ingredients: [],
                isSubRecipe: false,
            } as Recipe;
            recipeMap.set('recipe-empty', recipe);

            const breakdown = getRecipeIngredientBreakdown('recipe-empty', 1, recipeMap, ingredientMap);
            expect(breakdown).toEqual({});
        });
    });
});
