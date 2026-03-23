import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a user to register', async ({ page }) => {
    // 1. Go to Auth Page
    await page.goto('http://localhost:5173/auth');

    // 2. Switch to Register
    await page.click('text=Create Account');

    // 3. Fill Form
    const uniqueHandle = `testuser_${Date.now()}`;
    const uniqueEmail = `${uniqueHandle}@example.com`;

    await page.fill('input[placeholder="username"]', uniqueHandle);
    await page.fill('input[placeholder="Select your college"]', 'IIT Bombay');
    // Select first option from autocomplete
    await page.click('.college-option:first-child'); 
    
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'password123');

    // 4. Submit
    await page.click('button[type="submit"]');

    // 5. Verify Success
    // Expect redirection or success toast
    await expect(page.locator('text=Account created')).toBeVisible({ timeout: 10000 });
  });

  test('should rate limit excessive attempts', async ({ page }) => {
    await page.goto('http://localhost:5173/auth');
    
    // Attempt login 6 times
    for (let i = 0; i < 6; i++) {
        await page.fill('input[type="email"]', 'bad@actor.com');
        await page.fill('input[type="password"]', 'wrongpass');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500); // Wait a bit
    }

    // Expect rate limit message
    await expect(page.locator('text=Too many attempts')).toBeVisible();
  });
});
