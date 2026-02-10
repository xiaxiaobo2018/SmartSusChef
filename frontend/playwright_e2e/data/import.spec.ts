import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Data Management Tests', () => {

  test('Import Sales Data Test', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.getByRole('button', { name: 'Manage Store' }).click();
    await page.getByRole('button', { name: 'Import Sales Data' }).click();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Browse Files' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, '../../test_data.csv'));

    await page.getByRole('button', { name: 'Import Data' }).click();
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('http://localhost:5173/login');
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