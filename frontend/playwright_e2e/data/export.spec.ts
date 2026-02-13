import { test, expect } from '@playwright/test';

test('Export Data Test', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Manage Store' }).click();
    await page.getByRole('button', { name: 'Export Data' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export as CSV' }).first().click();
    const download = await downloadPromise;
    expect(await download.failure()).toBeNull();
    await download.saveAs('./downloads/exported_data.csv');
    console.log(`Download successful, filename: ${download.suggestedFilename()}`);
});