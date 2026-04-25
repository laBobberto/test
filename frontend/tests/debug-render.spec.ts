import { test, expect } from '@playwright/test';
import { getAuthToken } from './helpers';

test('Debug dashboard rendering', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  // Capture console messages
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(text);
  });
  
  // Capture errors
  page.on('pageerror', error => {
    const text = `[ERROR] ${error.message}`;
    errors.push(text);
    console.log(text);
  });
  
  // Get token and set it
  const token = await getAuthToken();
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, token);
  
  // Navigate to dashboard
  console.log('\n=== Navigating to dashboard ===');
  await page.goto('/dashboard');
  await page.waitForTimeout(5000);
  
  // Check what's rendered
  const html = await page.content();
  console.log('\n=== Page HTML (first 500 chars) ===');
  console.log(html.substring(0, 500));
  
  // Check for React root
  const hasRoot = await page.locator('#root').count();
  console.log('\n#root elements:', hasRoot);
  
  const rootContent = await page.locator('#root').textContent();
  console.log('Root content:', rootContent?.substring(0, 200));
  
  // Check network requests
  console.log('\n=== Console Messages ===');
  consoleMessages.forEach(msg => console.log(msg));
  
  console.log('\n=== Errors ===');
  errors.forEach(err => console.log(err));
  
  // Screenshot
  await page.screenshot({ path: 'test-results/debug-dashboard.png', fullPage: true });
  
  expect(true).toBe(true);
});
