import { test, expect } from '@playwright/test';
import { getAuthToken } from './helpers';

test('Debug auth flow', async ({ page }) => {
  console.log('=== Starting auth debug test ===');
  
  // Get token
  const token = await getAuthToken();
  console.log('Token obtained:', token.substring(0, 20) + '...');
  
  // Go to home page
  await page.goto('/');
  console.log('Navigated to home page');
  
  // Set token in localStorage
  await page.evaluate((token) => {
    console.log('Setting token in localStorage');
    localStorage.setItem('token', token);
    console.log('Token set:', localStorage.getItem('token')?.substring(0, 20) + '...');
  }, token);
  
  // Check localStorage
  const storedToken = await page.evaluate(() => {
    return localStorage.getItem('token');
  });
  console.log('Stored token:', storedToken?.substring(0, 20) + '...');
  
  // Navigate to dashboard
  console.log('Navigating to dashboard...');
  await page.goto('/dashboard');
  await page.waitForTimeout(3000);
  
  // Check current URL
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  // Check if redirected to login
  if (currentUrl.includes('localhost:5173/') && !currentUrl.includes('dashboard')) {
    console.log('❌ Redirected away from dashboard');
  } else {
    console.log('✓ Still on dashboard');
  }
  
  // Get page content
  const bodyText = await page.locator('body').textContent();
  console.log('Page contains:', bodyText?.substring(0, 200));
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-auth.png', fullPage: true });
  
  // Check for any error messages
  const hasError = await page.locator('text=ошибка').isVisible().catch(() => false);
  const hasLogin = await page.locator('text=Вход').isVisible().catch(() => false);
  
  console.log('Has error:', hasError);
  console.log('Has login form:', hasLogin);
  
  expect(true).toBe(true); // Always pass to see logs
});
