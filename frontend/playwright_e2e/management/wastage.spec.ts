import { test, expect } from '@playwright/test';

// Helper: login and navigate to Wastage Data Management
async function goToWastageManagement(page) {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\//, { timeout: 10000 });
    await page.getByRole('button', { name: 'Manage Store' }).click();
    await page.getByText('Wastage Data Management').click();
    await expect(page.getByRole('heading', { name: 'Wastage Data Management' })).toBeVisible({ timeout: 10000 });
}

test('view wastage data', async ({ page }) => {
    await goToWastageManagement(page);
    await expect(page.getByText('Wastage Records')).toBeVisible();
    await expect(page.getByText('Total Records')).toBeVisible();
    await expect(page.getByText('Carbon Footprint')).toBeVisible();
    await page.waitForTimeout(2000);
});

test('add new wastage record', async ({ page }) => {
    await goToWastageManagement(page);
    await page.getByRole('button', { name: 'Add New Record' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Item Type is already "Raw Ingredient" by default
    // Select ingredient from the Ingredient dropdown (second combobox)
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option').first().click();
    // Enter unique quantity
    const uniqueQty = (Math.random() * 10 + 1).toFixed(1);
    await page.locator('input[type="number"]').fill(uniqueQty);
    // Submit
    await page.getByRole('button', { name: 'Save Record' }).click();
    // Wait for operation to complete
    await page.waitForTimeout(3000);
});

test('edit wastage record', async ({ page }) => {
    await goToWastageManagement(page);
    // Click edit button on first available record
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Wastage Data' })).toBeVisible();
    // Change quantity
    await page.locator('input[type="number"]').fill('88.88');
    await page.getByRole('button', { name: 'Update Record' }).click();
    await page.waitForTimeout(2000);
});

test('cancel add wastage record', async ({ page }) => {
    await goToWastageManagement(page);
    await page.getByRole('button', { name: 'Add New Record' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.waitForTimeout(2000);
});

test('filter wastage by item type', async ({ page }) => {
    await goToWastageManagement(page);
    // Click filter dropdown (the one with "All Items" text)
    await page.getByRole('combobox').click();
    // Select "Main Dishes"
    await page.getByRole('option', { name: 'Main Dishes' }).click();
    await page.waitForTimeout(1000);
    // Select "Raw Ingredients"
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Raw Ingredients' }).click();
    await page.waitForTimeout(2000);
});
