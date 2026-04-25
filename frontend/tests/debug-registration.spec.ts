import { test, expect } from '@playwright/test';

test('Debug registration flow', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  // Capture console and errors
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // Go to home page
  await page.goto('/');
  await page.waitForTimeout(2000);
  
  // Click registration tab
  await page.click('text=Регистрация');
  await page.waitForTimeout(500);
  
  // Fill registration form with unique email
  const timestamp = Date.now();
  await page.fill('input[type="email"]', `test${timestamp}@example.com`);
  await page.fill('input[placeholder="username"]', `testuser${timestamp}`);
  await page.fill('input[type="password"]', 'TestPassword123');
  
  console.log('\n=== Submitting registration form ===');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for response
  await page.waitForTimeout(3000);
  
  // Check current URL
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  // Check for error message
  const errorVisible = await page.locator('text=ошибка').isVisible().catch(() => false);
  const errorText = await page.locator('.bg-red-500').textContent().catch(() => null);
  
  console.log('Error visible:', errorVisible);
  console.log('Error text:', errorText);
  
  // Check if redirected to onboarding
  const onOnboarding = currentUrl.includes('onboarding');
  console.log('On onboarding page:', onOnboarding);
  
  // Print console messages
  console.log('\n=== Console Messages ===');
  consoleMessages.forEach(msg => console.log(msg));
  
  console.log('\n=== Errors ===');
  errors.forEach(err => console.log(err));
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/registration-debug.png', fullPage: true });
  
  expect(true).toBe(true);
});
