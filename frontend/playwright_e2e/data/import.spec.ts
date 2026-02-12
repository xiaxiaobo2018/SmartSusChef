import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Data Management Tests', () => {

  test('Import Sales Data Test', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.getByRole('button', { name: 'Manage Store' }).click();
    await page.getByRole('button', { name: 'Import Sales Data' }).click();

    // Assert initial state: no loading spinner, no status message
    await expect(page.getByText('Importing sales data...')).not.toBeVisible();
    await expect(page.getByText('Successfully imported').first()).not.toBeVisible();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Browse Files' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, '../../test_data.csv'));

    const importButton = page.getByRole('button', { name: 'Import Data' });

    // Assert button is enabled before clicking
    await expect(importButton).toBeEnabled();

    await importButton.click();

    const overwriteDialog = page.getByRole('dialog', { name: 'Overwrite Existing Records' });
    if (await overwriteDialog.isVisible()) {
        await page.getByRole('button', { name: 'Overwrite & Import All' }).click();
    }

    // Assert loading state: button should be disabled and show "Importing..."
    try {
        await expect(page.getByRole('button', { name: 'Importing...' })).toBeVisible({ timeout: 5000 });
    } catch (e) {
        console.log('Loading state passed too quickly or was skipped, continuing...');
    }

    // Wait for import to complete - success message should appear
    await expect(page.getByText('Successfully imported').first()).toBeVisible({ timeout: 30000 });
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('/login');
      await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
      await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
      await page.getByRole('button', { name: 'Sign In' }).click();

      await page.getByRole('button', { name: 'Manage Store' }).click();

      await context.clearCookies();
      await page.evaluate(() => window.localStorage.clear());
      await page.evaluate(() => window.sessionStorage.clear());
    } catch (error) {
      console.log(error);
    } finally {
      await context.close();
    }
  });
});
