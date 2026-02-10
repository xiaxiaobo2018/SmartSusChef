/**
 * Management E2E Tests - Shared Fixtures
 * ----------------------------------------
 * Provides login state mocking and navigation helpers
 * 
 * Note: Auth-related tests are handled by another team member.
 *       This file only provides login state mocking via API mocking.
 */
import { test as base, expect, Page } from '@playwright/test';

// Mock manager user data (returned by API)
const MOCK_MANAGER_USER = {
  id: 'user-001',
  username: 'testmanager',
  email: 'manager@test.com',
  role: 'manager',
  storeId: 'test-store-001',
};

// Mock store data
const MOCK_STORE = {
  id: 'test-store-001',
  name: 'E2E Test Restaurant',
  location: 'Test Location',
  address: '123 Test Street',
};

// Mock ingredients
const MOCK_INGREDIENTS = [
  { id: 'ing-001', name: 'Tomato', unit: 'kg', carbonFootprint: 0.5, storeId: 'test-store-001' },
  { id: 'ing-002', name: 'Chicken', unit: 'kg', carbonFootprint: 6.9, storeId: 'test-store-001' },
  { id: 'ing-003', name: 'Rice', unit: 'kg', carbonFootprint: 2.7, storeId: 'test-store-001' },
];

// Mock recipes
const MOCK_RECIPES = [
  { id: 'rec-001', name: 'Chicken Rice', isSubRecipe: false, storeId: 'test-store-001', ingredients: [{ ingredientId: 'ing-002', quantity: 0.2 }, { ingredientId: 'ing-003', quantity: 0.15 }] },
  { id: 'rec-002', name: 'Tomato Salad', isSubRecipe: false, storeId: 'test-store-001', ingredients: [{ ingredientId: 'ing-001', quantity: 0.3 }] },
];

// Mock sales data
const MOCK_SALES: Record<string, unknown>[] = [];

// Mock wastage data
const MOCK_WASTAGE: Record<string, unknown>[] = [];

/**
 * Setup API mocking for all backend endpoints
 */
async function setupApiMocking(page: Page) {
  const API_BASE = '**/api/**';
  
  // Mock auth - getCurrentUser
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_MANAGER_USER),
    });
  });

  // Mock store endpoints
  await page.route('**/api/stores/current', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_STORE),
    });
  });

  // Mock ingredients endpoints
  await page.route('**/api/ingredients', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_INGREDIENTS),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newIngredient = { id: `ing-${Date.now()}`, ...body, storeId: 'test-store-001' };
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

  await page.route('**/api/ingredients/*', async (route) => {
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
  await page.route('**/api/recipes', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RECIPES),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newRecipe = { id: `rec-${Date.now()}`, ...body, storeId: 'test-store-001' };
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

  await page.route('**/api/recipes/*', async (route) => {
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
  await page.route('**/api/sales**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SALES),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newSale = { id: `sale-${Date.now()}`, ...body, storeId: 'test-store-001' };
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
  await page.route('**/api/wastage**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_WASTAGE),
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newWastage = { id: `wastage-${Date.now()}`, ...body, storeId: 'test-store-001' };
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
  await page.route('**/api/global-ingredients**', async (route) => {
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

  // Fallback: allow other requests to continue
  await page.route(API_BASE, async (route) => {
    // For unhandled API calls, return empty success
    if (!route.request().url().includes('/api/')) {
      await route.continue();
      return;
    }
    console.log(`[Mock API] Unhandled: ${route.request().method()} ${route.request().url()}`);
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
    // Setup API mocking before navigation
    await setupApiMocking(page);
    
    // Set token in localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem('smartsus-token', 'mock-manager-token-for-e2e-testing');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

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
