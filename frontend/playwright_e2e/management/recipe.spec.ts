import { test, expect } from '@playwright/test';

// Helper: login and navigate to Recipe Management
async function goToRecipeManagement(page) {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\//, { timeout: 10000 });
    await page.getByRole('button', { name: 'Manage Store' }).click();
    await expect(page.getByRole('heading', { name: 'Recipe Management' })).toBeVisible({ timeout: 10000 });
}

test('view recipes list', async ({ page }) => {
    await goToRecipeManagement(page);
    await expect(page.getByRole('table')).toBeVisible();
    await page.waitForTimeout(2000);
});

test('add new recipe', async ({ page }) => {
    await goToRecipeManagement(page);
    const uniqueName = `TestRecipe_${Date.now()}`;
    await page.getByRole('button', { name: 'Add Recipe' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Fill recipe name
    await page.locator('#recipe-name').fill(uniqueName);
    // Select first ingredient from dropdown
    await page.getByRole('combobox').click();
    await page.getByRole('option').first().click();
    // Enter quantity
    await page.locator('input[type="number"]').fill('100');
    // Submit
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    // Verify recipe appears in table
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
});

test('edit recipe', async ({ page }) => {
    await goToRecipeManagement(page);
    // Click edit button on first recipe row
    await page.locator('table tbody tr').first().getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Recipe' })).toBeVisible();
    // Modify quantity of first component
    await page.locator('input[type="number"]').first().fill('999');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForTimeout(2000);
});

test('cancel add recipe', async ({ page }) => {
    await goToRecipeManagement(page);
    await page.getByRole('button', { name: 'Add Recipe' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#recipe-name').fill('Will be cancelled');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.waitForTimeout(2000);
});

test('delete recipe', async ({ page }) => {
    await goToRecipeManagement(page);
    const uniqueName = `DelRecipe_${Date.now()}`;
    // First add a recipe to delete
    await page.getByRole('button', { name: 'Add Recipe' }).click();
    await page.locator('#recipe-name').fill(uniqueName);
    await page.getByRole('combobox').click();
    await page.getByRole('option').first().click();
    await page.locator('input[type="number"]').fill('50');
    await page.getByRole('button', { name: 'Create Recipe' }).click();
    // Wait for the row to appear in table
    const targetRow = page.locator('table tbody tr').filter({ hasText: uniqueName });
    await expect(targetRow).toBeVisible({ timeout: 5000 });
    // Click delete button on this row (last button in the row)
    await targetRow.getByRole('button').last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Yes, Delete Recipe' }).click();
    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    // Verify the row is removed
    await expect(targetRow).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
});
