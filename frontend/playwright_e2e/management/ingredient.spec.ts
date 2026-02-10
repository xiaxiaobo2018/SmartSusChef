import { test, expect } from '@playwright/test';

// Helper: login and navigate to Ingredient Management
async function goToIngredientManagement(page) {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\//, { timeout: 10000 });
    await page.getByRole('button', { name: 'Manage Store' }).click();
    await page.getByText('Ingredient Management').click();
    await expect(page.getByRole('heading', { name: 'Ingredient Management' })).toBeVisible({ timeout: 10000 });
}

test('view ingredients list', async ({ page }) => {
    await goToIngredientManagement(page);
    await expect(page.getByRole('table')).toBeVisible();
    await page.waitForTimeout(2000);
});

test('add new ingredient', async ({ page }) => {
    await goToIngredientManagement(page);
    const uniqueName = `TestIng_${Date.now()}`;
    await page.getByRole('button', { name: 'Add Ingredient' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Ingredient Name').fill(uniqueName);
    await page.locator('#ingredient-unit').selectOption('kg');
    await page.getByLabel('Carbon Footprint').fill('2.5');
    await page.getByRole('button', { name: 'Add Ingredient' }).click();
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
});

test('edit ingredient', async ({ page }) => {
    await goToIngredientManagement(page);
    // Click edit button on first ingredient row
    await page.locator('table tbody tr').first().getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Ingredient' })).toBeVisible();
    // Modify carbon footprint
    await page.getByLabel('Carbon Footprint').fill('9.9');
    await page.getByRole('button', { name: 'Update Ingredient' }).click();
    await page.waitForTimeout(2000);
});

test('cancel add ingredient', async ({ page }) => {
    await goToIngredientManagement(page);
    await page.getByRole('button', { name: 'Add Ingredient' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Ingredient Name').fill('Will be cancelled');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.waitForTimeout(2000);
});

test('delete ingredient', async ({ page }) => {
    await goToIngredientManagement(page);
    const uniqueName = `Del_${Date.now()}`;
    // First add an ingredient to delete
    await page.getByRole('button', { name: 'Add Ingredient' }).click();
    await page.getByLabel('Ingredient Name').fill(uniqueName);
    await page.locator('#ingredient-unit').selectOption('g');
    await page.getByLabel('Carbon Footprint').fill('1.0');
    await page.getByRole('button', { name: 'Add Ingredient' }).click();
    // Wait for the row to appear in table
    const targetRow = page.locator('table tbody tr').filter({ hasText: uniqueName });
    await expect(targetRow).toBeVisible({ timeout: 5000 });
    // Click delete button on this row
    await targetRow.getByRole('button').last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Yes, Delete Ingredient' }).click();
    // Wait for dialog to close first
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    // Then verify the row is removed from table
    await expect(targetRow).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
});
