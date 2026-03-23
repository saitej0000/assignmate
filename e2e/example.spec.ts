import { test, expect } from '@playwright/test';

test('landing page has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AssignMate/);
    await expect(page.getByText("India's #1 Student Marketplace")).toBeVisible();
});

test('navigation to auth', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Hiring Now' }).click();
    // Should navigate to auth or show auth modal
    // Assuming URL changes or content changes
    // For now just check if "Sign In" is visible
    await expect(page.getByText('Welcome Back')).toBeVisible();
});
