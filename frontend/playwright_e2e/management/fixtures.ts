/**
 * Management E2E Tests - Shared Fixtures
 * ----------------------------------------
 * Provides login state mocking and navigation helpers
 * 
 * Note: Auth-related tests are handled by another team member.
 *       This file only provides login state mocking via API mocking.
 */
import { test as base, expect, Page } from '@playwright/test';

// Mock manager user data (returned by API) - must match UserDto interface
const MOCK_MANAGER_USER = {
  id: 'user-001',
  username: 'testmanager',
  name: 'Test Manager',
  email: 'manager@test.com',
  role: 'manager',
  status: 'Active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock store data - must match StoreDto interface
const MOCK_STORE = {
  id: 1,
  companyName: 'Test Company',
  uen: 'TEST123',
  storeName: 'E2E Test Restaurant',
  outletLocation: 'Test Location',
  contactNumber: '12345678',
  openingDate: '2024-01-01',
  latitude: 1.3521,
  longitude: 103.8198,
  countryCode: 'SG',
  address: '123 Test Street',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock ingredients - must match IngredientDto interface
const MOCK_INGREDIENTS: { id: string; name: string; unit: string; carbonFootprint: number }[] = [
  { id: 'ing-001', name: 'Tomato', unit: 'kg', carbonFootprint: 0.5 },
  { id: 'ing-002', name: 'Chicken', unit: 'kg', carbonFootprint: 6.9 },
  { id: 'ing-003', name: 'Rice', unit: 'kg', carbonFootprint: 2.7 },
];

// Mock recipes - must match RecipeDto interface
const MOCK_RECIPES: { id: string; name: string; isSubRecipe: boolean; isSellable: boolean; ingredients: { ingredientId?: string; childRecipeId?: string; displayName: string; unit: string; quantity: number }[] }[] = [
  { id: 'rec-001', name: 'Chicken Rice', isSubRecipe: false, isSellable: true, ingredients: [{ ingredientId: 'ing-002', displayName: 'Chicken', unit: 'kg', quantity: 0.2 }, { ingredientId: 'ing-003', displayName: 'Rice', unit: 'kg', quantity: 0.15 }] },
  { id: 'rec-002', name: 'Tomato Salad', isSubRecipe: false, isSellable: true, ingredients: [{ ingredientId: 'ing-001', displayName: 'Tomato', unit: 'kg', quantity: 0.3 }] },
];

// Mock sales data - must match SalesDataDto interface
const MOCK_SALES: { id: string; date: string; recipeId: string; recipeName: string; quantity: number }[] = [];

// Mock wastage data - must match WastageDataDto interface
const MOCK_WASTAGE: { id: string; date: string; ingredientId?: string; recipeId?: string; displayName: string; unit: string; quantity: number; carbonFootprint: number; createdAt: string; updatedAt: string }[] = [];

/**
 * Setup API mocking for all backend endpoints
 */
async function setupApiMocking(page: Page) {
  // Mock auth - getCurrentUser (MUST be registered first - highest priority)
  await page.route(/.*\/api\/auth\/me.*/, async (route) => {
    console.log('[Mock API] Intercepted /api/auth/me');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_MANAGER_USER),
    });
  });

  // Mock store endpoint (single store)
  await page.route(/\/api\/store$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_STORE),
    });
  });

  // Mock store status
  await page.route(/\/api\/store\/status/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ isSetupComplete: true, storeSetupRequired: false }),
    });
  });

  // Mock users endpoint (for manager)
  await page.route(/\/api\/users$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([MOCK_MANAGER_USER]),
    });
  });

  // Mock forecast endpoint
  await page.route(/\/api\/forecast(\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock weather endpoint
  await page.route(/\/api\/forecast\/weather/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        temperature: 28,
        condition: 'Sunny',
        humidity: 75,
        description: 'Clear sky',
      }),
    });
  });

  // Mock holidays endpoint
  await page.route(/\/api\/forecast\/holidays/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock ingredients endpoints
  await page.route(/\/api\/ingredients$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_INGREDIENTS),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newIngredient = { 
        id: `ing-${Date.now()}`, 
        name: body.name,
        unit: body.unit,
        carbonFootprint: body.carbonFootprint,
      };
      MOCK_INGREDIENTS.push(newIngredient);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newIngredient),
      });
    } else {
      await route.continue();
    }
  });

  await page.route(/\/api\/ingredients\/[^/]+$/, async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    const id = url.split('/').pop();
    
    if (method === 'PUT') {
      const body = route.request().postDataJSON();
      const index = MOCK_INGREDIENTS.findIndex(i => i.id === id);
      if (index >= 0) {
        MOCK_INGREDIENTS[index] = { ...MOCK_INGREDIENTS[index], ...body };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_INGREDIENTS[index]),
        });
      } else {
        await route.fulfill({ status: 404 });
      }
    } else if (method === 'DELETE') {
      const index = MOCK_INGREDIENTS.findIndex(i => i.id === id);
      if (index >= 0) {
        MOCK_INGREDIENTS.splice(index, 1);
        await route.fulfill({ status: 204 });
      } else {
        await route.fulfill({ status: 404 });
      }
    } else {
      await route.continue();
    }
  });

  // Mock recipes endpoints
  await page.route(/\/api\/recipes$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RECIPES),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newRecipe = { 
        id: `rec-${Date.now()}`, 
        name: body.name,
        isSubRecipe: body.isSubRecipe || false,
        isSellable: body.isSellable ?? true,
        ingredients: (body.ingredients || []).map((ing: { ingredientId?: string; childRecipeId?: string; quantity: number }) => ({
          ingredientId: ing.ingredientId,
          childRecipeId: ing.childRecipeId,
          displayName: 'Ingredient',
          unit: 'kg',
          quantity: ing.quantity,
        })),
      };
      MOCK_RECIPES.push(newRecipe);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newRecipe),
      });
    } else {
      await route.continue();
    }
  });

  await page.route(/\/api\/recipes\/[^/]+$/, async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    const id = url.split('/').pop();
    
    if (method === 'PUT') {
      const body = route.request().postDataJSON();
      const index = MOCK_RECIPES.findIndex(r => r.id === id);
      if (index >= 0) {
        MOCK_RECIPES[index] = { ...MOCK_RECIPES[index], ...body };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_RECIPES[index]),
        });
      } else {
        await route.fulfill({ status: 404 });
      }
    } else if (method === 'DELETE') {
      const index = MOCK_RECIPES.findIndex(r => r.id === id);
      if (index >= 0) {
        MOCK_RECIPES.splice(index, 1);
        await route.fulfill({ status: 204 });
      } else {
        await route.fulfill({ status: 404 });
      }
    } else {
      await route.continue();
    }
  });

  // Mock sales endpoints
  await page.route(/\/api\/sales/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SALES),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const recipeId = body.recipeId || 'rec-001';
      const recipe = MOCK_RECIPES.find(r => r.id === recipeId);
      const newSale = { 
        id: `sale-${Date.now()}`, 
        date: body.date,
        recipeId: recipeId,
        recipeName: recipe?.name || 'Unknown Recipe',
        quantity: body.quantity,
      };
      MOCK_SALES.push(newSale);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newSale),
      });
    } else {
      await route.continue();
    }
  });

  // Mock wastage endpoints
  await page.route(/\/api\/wastage/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_WASTAGE),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const ingredient = MOCK_INGREDIENTS.find(i => i.id === body.ingredientId);
      const recipe = MOCK_RECIPES.find(r => r.id === body.recipeId);
      const now = new Date().toISOString();
      const newWastage = { 
        id: `wastage-${Date.now()}`, 
        date: body.date,
        ingredientId: body.ingredientId,
        recipeId: body.recipeId,
        displayName: ingredient?.name || recipe?.name || 'Unknown',
        unit: ingredient?.unit || 'kg',
        quantity: body.quantity,
        carbonFootprint: (ingredient?.carbonFootprint || 0) * body.quantity,
        createdAt: now,
        updatedAt: now,
      };
      MOCK_WASTAGE.push(newWastage);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newWastage),
      });
    } else {
      await route.continue();
    }
  });

  // Mock global ingredients (for carbon footprint lookup)
  await page.route(/\/api\/global-ingredients/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'global-1', name: 'Tomato', carbonFootprint: 0.5, unit: 'kg' },
        { id: 'global-2', name: 'Chicken', carbonFootprint: 6.9, unit: 'kg' },
        { id: 'global-3', name: 'Rice', carbonFootprint: 2.7, unit: 'kg' },
      ]),
    });
  });

  // Mock store setup required check
  await page.route(/\/api\/auth\/store-setup-required/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ storeSetupRequired: false }),
    });
  });

  // Mock predictions endpoint
  await page.route(/\/api\/predictions/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

// Extend test object with custom fixtures
export const test = base.extend<{
  loggedInPage: Page;
  managementPage: Page;
}>({
  /**
   * Page with logged-in state via API mocking
   */
  loggedInPage: async ({ page }, use) => {
    // Setup API mocking before navigation
    await setupApiMocking(page);
    
    // Set token in localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem('smartsus-token', 'mock-manager-token-for-e2e-testing');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await use(page);
  },

  /**
   * Page navigated to Management section
   */
  managementPage: async ({ page }, use) => {
    // Debug: Log all requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[Request] ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[Response] ${response.status()} ${response.url()}`);
      }
    });
    
    // Setup API mocking before navigation
    await setupApiMocking(page);
    
    // Set token in localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem('smartsus-token', 'mock-manager-token-for-e2e-testing');
    });
    
    await page.goto('/');
    
    // Wait a bit for the app to initialize
    await page.waitForTimeout(2000);

    // Wait for page to load and click Manage Store button
    await page.waitForSelector('button:has-text("Manage Store")', { timeout: 15000 });
    await page.click('button:has-text("Manage Store")');

    // Wait for Management page to load (check for management UI elements)
    await page.waitForSelector('text=Ingredient Management', { timeout: 10000 });

    await use(page);
  },
});

export { expect };

/**
 * Helper: Navigate to a specific Management section
 */
export async function navigateToSection(page: Page, sectionName: 'Recipe Management' | 'Ingredient Management' | 'Import Sales Data' | 'Sales Data Management' | 'Wastage Data Management' | 'Export Data') {
  const menuButton = page.locator(`button:has-text("${sectionName}")`);
  await menuButton.click();
  // Wait for content area to update
  await page.waitForTimeout(300);
}

/**
 * Helper: Wait for a Toast message to appear
 */
export async function waitForToast(page: Page, messagePattern: string | RegExp) {
  const toastLocator = page.locator('[data-sonner-toast]').filter({ hasText: messagePattern });
  await expect(toastLocator).toBeVisible({ timeout: 5000 });
}

/**
 * Helper: Close dialog
 */
export async function closeDialog(page: Page) {
  const closeButton = page.locator('[data-dialog-close], button:has-text("Cancel"), button:has-text("Close")').first();
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
}

/**
 * Helper: Confirm delete in dialog
 */
export async function confirmDelete(page: Page) {
  const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")').last();
  await confirmButton.click();
}
