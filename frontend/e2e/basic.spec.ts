import { test, expect } from '@playwright/test';

test.describe('SmartSusChef E2E Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SmartSus\s*Chef/i);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test('health endpoint returns OK', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
  });

  test('navigation elements are present', async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully render
    await page.waitForLoadState('networkidle');
    // Basic check that the app rendered
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
