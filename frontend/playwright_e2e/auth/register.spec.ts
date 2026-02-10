import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await page.getByRole('button', { name: 'Register as Manager' }).click();
    await page.getByRole('textbox', { name: 'Full Name' }).click();
    await page.getByRole('textbox', { name: 'Full Name' }).fill('testtest');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('ttttest@admin.com');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('testtest');
    await page.getByRole('textbox', { name: 'Password', exact: true }).click();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('123456789Test.');
    await page.getByRole('textbox', { name: 'Confirm Password' }).click();
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456789Test.');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL(/.*register/, { timeout: 10000 });
});