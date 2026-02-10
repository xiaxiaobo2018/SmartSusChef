import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    ingredientsApi,
    recipesApi,
    salesApi,
    wastageApi,
    forecastApi,
    mlApi,
    exportApi,
    setAuthToken,
    globalIngredientsApi,
} from '../api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

describe('api service extended', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch;
        setAuthToken('test-token');
        mockFetch.mockClear();
    });

    // ==========================================
    // INGREDIENTS API TESTS
    // ==========================================
    describe('ingredientsApi', () => {
        describe('getAll', () => {
            it('should fetch all ingredients', async () => {
                const mockIngredients = [
                    { id: '1', name: 'Tomato', unit: 'kg', carbonFootprint: 0.5, globalIngredientId: null },
                    { id: '2', name: 'Lettuce', unit: 'kg', carbonFootprint: 0.3, globalIngredientId: null },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockIngredients,
                });

                const result = await ingredientsApi.getAll();

                expect(result).toEqual(mockIngredients);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ingredients`,
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            'Authorization': 'Bearer test-token',
                        }),
                    })
                );
            });
        });

        describe('getById', () => {
            it('should fetch a single ingredient', async () => {
                const ingredientId = '1';
                const mockIngredient = { id: ingredientId, name: 'Tomato', unit: 'kg', carbonFootprint: 0.5 };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockIngredient,
                });

                const result = await ingredientsApi.getById(ingredientId);

                expect(result).toEqual(mockIngredient);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ingredients/${ingredientId}`,
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            'Authorization': 'Bearer test-token',
                        }),
                    })
                );
            });
        });

        describe('create', () => {
            it('should create a new ingredient', async () => {
                const newIngredient = {
                    name: 'Carrot',
                    unit: 'kg',
                    carbonFootprint: 0.4,
                    globalIngredientId: null,
                };
                const createdIngredient = { id: '3', ...newIngredient };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => createdIngredient,
                });

                const result = await ingredientsApi.create(newIngredient);

                expect(result).toEqual(createdIngredient);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ingredients`,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(newIngredient),
                    })
                );
            });
        });

        describe('update', () => {
            it('should update an ingredient', async () => {
                const ingredientId = '1';
                const updates = { name: 'Cherry Tomato', carbonFootprint: 0.6 };
                const updatedIngredient = { id: ingredientId, ...updates, unit: 'kg' };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => updatedIngredient,
                });

                const result = await ingredientsApi.update(ingredientId, updates);

                expect(result).toEqual(updatedIngredient);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ingredients/${ingredientId}`,
                    expect.objectContaining({
                        method: 'PUT',
                        body: JSON.stringify(updates),
                    })
                );
            });
        });

        describe('delete', () => {
            it('should delete an ingredient', async () => {
                const ingredientId = '1';

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 204,
                });

                await ingredientsApi.delete(ingredientId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ingredients/${ingredientId}`,
                    expect.objectContaining({ method: 'DELETE' })
                );
            });
        });
    });

    // ==========================================
    // GLOBAL INGREDIENTS API TESTS
    // ==========================================
    describe('globalIngredientsApi', () => {
        describe('getAll', () => {
            it('should fetch all global ingredients', async () => {
                const mockGlobalIngredients = [
                    { id: 1, name: 'Tomato', carbonFootprint: 0.5 },
                    { id: 2, name: 'Lettuce', carbonFootprint: 0.3 },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockGlobalIngredients,
                });

                const result = await globalIngredientsApi.getAll();

                expect(result).toEqual(mockGlobalIngredients);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/globalingredients`,
                    expect.anything()
                );
            });
        });

        describe('getById', () => {
            it('should fetch a single global ingredient', async () => {
                const ingredientId = '1';
                const mockIngredient = { id: 1, name: 'Tomato', carbonFootprint: 0.5 };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockIngredient,
                });

                const result = await globalIngredientsApi.getById(ingredientId);

                expect(result).toEqual(mockIngredient);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/globalingredients/${ingredientId}`,
                    expect.anything()
                );
            });
        });
    });

    // ==========================================
    // RECIPES API TESTS
    // ==========================================
    describe('recipesApi', () => {
        describe('getAll', () => {
            it('should fetch all recipes', async () => {
                const mockRecipes = [
                    { id: '1', name: 'Salad', isSellable: true, isSubRecipe: false, ingredients: [] },
                    { id: '2', name: 'Soup', isSellable: true, isSubRecipe: false, ingredients: [] },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockRecipes,
                });

                const result = await recipesApi.getAll();

                expect(result).toEqual(mockRecipes);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/recipes`,
                    expect.anything()
                );
            });
        });

        describe('getById', () => {
            it('should fetch a single recipe', async () => {
                const recipeId = '1';
                const mockRecipe = {
                    id: recipeId,
                    name: 'Salad',
                    isSellable: true,
                    isSubRecipe: false,
                    ingredients: [{ ingredientId: '1', quantity: 2 }],
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockRecipe,
                });

                const result = await recipesApi.getById(recipeId);

                expect(result).toEqual(mockRecipe);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/recipes/${recipeId}`,
                    expect.anything()
                );
            });
        });

        describe('create', () => {
            it('should create a new recipe', async () => {
                const newRecipe = {
                    name: 'Pasta',
                    isSellable: true,
                    isSubRecipe: false,
                    ingredients: [{ ingredientId: '1', quantity: 3 }],
                };
                const createdRecipe = { id: '3', ...newRecipe };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => createdRecipe,
                });

                const result = await recipesApi.create(newRecipe);

                expect(result).toEqual(createdRecipe);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/recipes`,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(newRecipe),
                    })
                );
            });
        });

        describe('update', () => {
            it('should update a recipe', async () => {
                const recipeId = '1';
                const updates = { name: 'Garden Salad', isSellable: false };
                const updatedRecipe = { id: recipeId, ...updates, isSubRecipe: false, ingredients: [] };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => updatedRecipe,
                });

                const result = await recipesApi.update(recipeId, updates);

                expect(result).toEqual(updatedRecipe);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/recipes/${recipeId}`,
                    expect.objectContaining({
                        method: 'PUT',
                        body: JSON.stringify(updates),
                    })
                );
            });
        });

        describe('delete', () => {
            it('should delete a recipe', async () => {
                const recipeId = '1';

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 204,
                });

                await recipesApi.delete(recipeId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/recipes/${recipeId}`,
                    expect.objectContaining({ method: 'DELETE' })
                );
            });
        });
    });

    // ==========================================
    // SALES API TESTS
    // ==========================================
    describe('salesApi', () => {
        describe('getAll', () => {
            it('should fetch all sales data', async () => {
                const mockSales = [
                    { id: '1', date: '2024-01-01', recipeId: '1', recipeName: 'Salad', quantity: 10 },
                    { id: '2', date: '2024-01-02', recipeId: '2', recipeName: 'Soup', quantity: 15 },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockSales,
                });

                const result = await salesApi.getAll();

                expect(result).toEqual(mockSales);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/sales`,
                    expect.anything()
                );
            });
        });

        describe('create', () => {
            it('should create new sales data', async () => {
                const newSale = { date: '2024-01-03', recipeId: '1', quantity: 20 };
                const createdSale = { id: '3', ...newSale, recipeName: 'Salad' };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => createdSale,
                });

                const result = await salesApi.create(newSale);

                expect(result).toEqual(createdSale);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/sales`,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(newSale),
                    })
                );
            });
        });

        describe('import', () => {
            it('should import bulk sales data', async () => {
                const bulkData = {
                    salesData: [
                        { date: '2024-01-04', recipeId: '1', quantity: 5 },
                        { date: '2024-01-05', recipeId: '2', quantity: 8 },
                    ],
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => ({ message: 'Import successful', count: 2 }),
                });

                const result = await salesApi.import(bulkData);

                expect(result).toEqual({ message: 'Import successful', count: 2 });
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/sales/import`,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(bulkData),
                    })
                );
            });
        });

        describe('update', () => {
            it('should update sales data', async () => {
                const salesId = '1';
                const updates = { quantity: 25 };
                const updatedSale = { id: salesId, date: '2024-01-01', recipeId: '1', recipeName: 'Salad', quantity: 25 };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => updatedSale,
                });

                const result = await salesApi.update(salesId, updates);

                expect(result).toEqual(updatedSale);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/sales/${salesId}`,
                    expect.objectContaining({
                        method: 'PUT',
                        body: JSON.stringify(updates),
                    })
                );
            });
        });

        describe('delete', () => {
            it('should delete sales data', async () => {
                const salesId = '1';

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 204,
                });

                await salesApi.delete(salesId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/sales/${salesId}`,
                    expect.objectContaining({ method: 'DELETE' })
                );
            });
        });

        describe('getTrend', () => {
            it('should fetch sales trend data', async () => {
                const mockTrend = [
                    { date: '2024-01-01', totalQuantity: 50, changePercentage: 10 },
                    { date: '2024-01-02', totalQuantity: 55, changePercentage: 5 },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockTrend,
                });

                const result = await salesApi.getTrend('2024-01-01', '2024-01-07');

                expect(result).toEqual(mockTrend);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/sales/trend?startDate=2024-01-01&endDate=2024-01-07`,
                    expect.anything()
                );
            });
        });
    });

    // ==========================================
    // WASTAGE API TESTS
    // ==========================================
    describe('wastageApi', () => {
        describe('getAll', () => {
            it('should fetch all wastage data', async () => {
                const mockWastage = [
                    { id: '1', date: '2024-01-01', ingredientId: '1', ingredientName: 'Tomato', quantity: 2 },
                    { id: '2', date: '2024-01-02', recipeId: '1', recipeName: 'Salad', quantity: 1 },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockWastage,
                });

                const result = await wastageApi.getAll();

                expect(result).toEqual(mockWastage);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/wastage`,
                    expect.anything()
                );
            });
        });

        describe('create', () => {
            it('should create wastage data', async () => {
                const newWastage = { date: '2024-01-03', ingredientId: '1', quantity: 1.5 };
                const createdWastage = { id: '3', ...newWastage, ingredientName: 'Tomato' };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => createdWastage,
                });

                const result = await wastageApi.create(newWastage);

                expect(result).toEqual(createdWastage);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/wastage`,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(newWastage),
                    })
                );
            });
        });

        describe('update', () => {
            it('should update wastage data', async () => {
                const wastageId = '1';
                const updates = { quantity: 3 };
                const updatedWastage = {
                    id: wastageId,
                    date: '2024-01-01',
                    ingredientId: '1',
                    ingredientName: 'Tomato',
                    quantity: 3,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => updatedWastage,
                });

                const result = await wastageApi.update(wastageId, updates);

                expect(result).toEqual(updatedWastage);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/wastage/${wastageId}`,
                    expect.objectContaining({
                        method: 'PUT',
                        body: JSON.stringify(updates),
                    })
                );
            });
        });

        describe('delete', () => {
            it('should delete wastage data', async () => {
                const wastageId = '1';

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 204,
                });

                await wastageApi.delete(wastageId);

                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/wastage/${wastageId}`,
                    expect.objectContaining({ method: 'DELETE' })
                );
            });
        });
    });

    // ==========================================
    // FORECAST API TESTS
    // ==========================================
    describe('forecastApi', () => {
        describe('get', () => {
            it('should fetch forecast data', async () => {
                const mockForecast = [
                    {
                        date: '2024-01-10',
                        recipeId: '1',
                        recipeName: 'Salad',
                        quantity: 25,
                        ingredients: [],
                        confidence: 'High',
                    },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockForecast,
                });

                const result = await forecastApi.get(7, 0);

                expect(result).toEqual(mockForecast);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/forecast?days=7&includePastDays=0`,
                    expect.anything()
                );
            });
        });

        describe('getSummary', () => {
            it('should fetch forecast summary', async () => {
                const mockSummary = [
                    { date: '2024-01-10', totalQuantity: 100, changePercentage: 5 },
                    { date: '2024-01-11', totalQuantity: 105, changePercentage: 2 },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockSummary,
                });

                const result = await forecastApi.getSummary(7, 0);

                expect(result).toEqual(mockSummary);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/forecast/summary?days=7&includePastDays=0`,
                    expect.anything()
                );
            });
        });

        describe('getWeather', () => {
            it('should fetch weather data', async () => {
                const mockWeather = {
                    temperature: 22,
                    condition: 'Sunny',
                    humidity: 60,
                    description: 'Clear sky',
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockWeather,
                });

                const result = await forecastApi.getWeather();

                expect(result).toEqual(mockWeather);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/forecast/weather`,
                    expect.anything()
                );
            });

            it('should return null on error', async () => {
                mockFetch.mockRejectedValueOnce(new Error('Network error'));

                const result = await forecastApi.getWeather();

                expect(result).toBeNull();
            });
        });

        describe('getHolidays', () => {
            it('should fetch holidays for a year', async () => {
                const mockHolidays = [
                    { date: '2024-01-01', name: 'New Year\'s Day' },
                    { date: '2024-12-25', name: 'Christmas' },
                ];

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockHolidays,
                });

                const result = await forecastApi.getHolidays(2024);

                expect(result).toEqual(mockHolidays);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/forecast/holidays/2024`,
                    expect.anything()
                );
            });

            it('should return empty array on error', async () => {
                mockFetch.mockRejectedValueOnce(new Error('Network error'));

                const result = await forecastApi.getHolidays(2024);

                expect(result).toEqual([]);
            });
        });
    });

    // ==========================================
    // ML API TESTS
    // ==========================================
    describe('mlApi', () => {
        describe('getStatus', () => {
            it('should fetch ML model status', async () => {
                const mockStatus = {
                    storeId: 1,
                    hasModels: true,
                    isTraining: false,
                    dishes: ['Salad', 'Soup'],
                    daysAvailable: 30,
                    status: 'ready' as const,
                    message: 'Models ready',
                    trainingProgress: null,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockStatus,
                });

                const result = await mlApi.getStatus();

                expect(result).toEqual(mockStatus);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ml/status`,
                    expect.anything()
                );
            });
        });

        describe('train', () => {
            it('should trigger model training', async () => {
                const mockResponse = {
                    status: 'training',
                    storeId: 1,
                    message: 'Training started',
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                });

                const result = await mlApi.train();

                expect(result).toEqual(mockResponse);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ml/train`,
                    expect.objectContaining({ method: 'POST' })
                );
            });
        });

        describe('predict', () => {
            it('should trigger prediction', async () => {
                const mockResponse = {
                    storeId: 1,
                    status: 'success',
                    message: 'Predictions generated',
                    daysAvailable: 7,
                    predictions: { '2024-01-10': { 'Salad': 25 } },
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                });

                const result = await mlApi.predict(7);

                expect(result).toEqual(mockResponse);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/ml/predict?days=7`,
                    expect.objectContaining({ method: 'POST' })
                );
            });
        });
    });

    // ==========================================
    // EXPORT API TESTS
    // ==========================================
    describe('exportApi', () => {
        describe('getSalesCsv', () => {
            it('should export sales data as CSV', async () => {
                const mockBlob = new Blob(['sales,data'], { type: 'text/csv' });

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    blob: async () => mockBlob,
                });

                const result = await exportApi.getSalesCsv();

                expect(result).toEqual(mockBlob);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/export/sales/csv`,
                    expect.any(Object)
                );
            });

            it('should include date range in query params', async () => {
                const mockBlob = new Blob(['sales,data'], { type: 'text/csv' });

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    blob: async () => mockBlob,
                });

                await exportApi.getSalesCsv('2024-01-01', '2024-01-31');

                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/export/sales/csv?startDate=2024-01-01&endDate=2024-01-31`,
                    expect.any(Object)
                );
            });
        });

        describe('getWastageCsv', () => {
            it('should export wastage data as CSV', async () => {
                const mockBlob = new Blob(['wastage,data'], { type: 'text/csv' });

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    blob: async () => mockBlob,
                });

                const result = await exportApi.getWastageCsv();

                expect(result).toEqual(mockBlob);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/export/wastage/csv`,
                    expect.any(Object)
                );
            });
        });

        describe('getForecastCsv', () => {
            it('should export forecast data as CSV', async () => {
                const mockBlob = new Blob(['forecast,data'], { type: 'text/csv' });

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    blob: async () => mockBlob,
                });

                const result = await exportApi.getForecastCsv(7);

                expect(result).toEqual(mockBlob);
                expect(mockFetch).toHaveBeenCalledWith(
                    `${API_BASE_URL}/export/forecast/csv?days=7`,
                    expect.any(Object)
                );
            });
        });
    });
});
