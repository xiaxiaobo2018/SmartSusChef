import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('/register');
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

test('password visibility toggle', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Register as Manager' }).click();

    const passwordInput = page.getByRole('textbox', { name: 'Password', exact: true });
    const confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password' });
    const showPasswordButton = page.getByRole('button', { name: 'Show password' });
    const showConfirmButton = page.getByRole('button', { name: 'Show confirm password' });

    // Initial state: both password fields are hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    await expect(showPasswordButton).toBeVisible();
    await expect(showConfirmButton).toBeVisible();

    // Fill in passwords
    await passwordInput.fill('123456789Test.');
    await confirmPasswordInput.fill('123456789Test.');

    // Toggle password visibility
    await showPasswordButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    // Confirm password should still be hidden
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle confirm password visibility
    await showConfirmButton.click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Re-toggle both back to hidden
    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Hide confirm password' }).click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
});
