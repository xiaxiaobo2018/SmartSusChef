import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('Simon');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('Leinuozhen2003.');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
});

test('password visibility toggle', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const toggleButton = page.getByRole('button', { name: 'Show password' });

    // Initial state: password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(toggleButton).toBeVisible();

    // Fill in a password to verify visibility toggle works with content
    await passwordInput.fill('TestPassword123');

    // Click toggle: password should become visible
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // The button label should now say "Hide password"
    const hideButton = page.getByRole('button', { name: 'Hide password' });
    await expect(hideButton).toBeVisible();

    // Click again: password should be hidden
    await hideButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle button should revert to "Show password"
    await expect(page.getByRole('button', { name: 'Show password' })).toBeVisible();
});
