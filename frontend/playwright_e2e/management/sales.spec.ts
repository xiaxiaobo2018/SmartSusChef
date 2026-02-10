import { test, expect } from '@playwright/test';

// Helper: login and navigate to Sales Data Management
async function goToSalesManagement(page) {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\//, { timeout: 10000 });
    await page.getByRole('button', { name: 'Manage Store' }).click();
    await page.getByText('Sales Data Management').click();
    await expect(page.getByRole('heading', { name: 'Sales Data Management' })).toBeVisible({ timeout: 10000 });
}

test('view sales data', async ({ page }) => {
    await goToSalesManagement(page);
    await expect(page.getByText('Sales Records')).toBeVisible();
    await page.waitForTimeout(2000);
});

test('add new sales record', async ({ page }) => {
    await goToSalesManagement(page);
    await page.getByRole('button', { name: 'Add New Record' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Select recipe from dropdown
    await page.locator('#new-recipe').click();
    await page.getByRole('option').first().click();
    // Enter unique quantity to avoid duplicates
    const uniqueQty = Math.floor(Math.random() * 900) + 100;
    await page.locator('#new-quantity-create').fill(String(uniqueQty));
    // Submit
    await page.getByRole('button', { name: 'Save Record' }).click();
    // Wait for dialog to close (success) or handle duplicate error
    await page.waitForTimeout(3000);
});

test('edit sales record', async ({ page }) => {
    await goToSalesManagement(page);
    // Click edit button on first available record
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Sales Data' })).toBeVisible();
    // Change quantity
    await page.locator('#new-quantity').fill('999');
    await page.getByRole('button', { name: 'Update Record' }).click();
    await page.waitForTimeout(2000);
});

test('cancel add sales record', async ({ page }) => {
    await goToSalesManagement(page);
    await page.getByRole('button', { name: 'Add New Record' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.waitForTimeout(2000);
});

test('filter sales by date range', async ({ page }) => {
    await goToSalesManagement(page);
    // Click filter dropdown
    await page.getByRole('combobox').click();
    // Select "Last 7 Days"
    await page.getByRole('option', { name: 'Last 7 Days' }).click();
    await page.waitForTimeout(1000);
    // Select "Last 30 Days"
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Last 30 Days' }).click();
    await page.waitForTimeout(2000);
});
