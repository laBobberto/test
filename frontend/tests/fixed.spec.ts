import { test, expect } from '@playwright/test';
import { setAuthToken, gotoWithAuth } from './helpers';

test.describe('Dashboard - Fixed', () => {
  test('should display dashboard with real auth', async ({ page }) => {
    await gotoWithAuth(page, '/dashboard');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if we're on dashboard
    const url = page.url();
    console.log('Current URL:', url);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/dashboard-test.png' });
    
    // Check for dashboard elements
    const hasHeader = await page.locator('text=LifeBalance SPb').isVisible().catch(() => false);
    const hasPlan = await page.locator('text=План дня').isVisible().catch(() => false);
    const hasActions = await page.locator('text=Быстрые действия').isVisible().catch(() => false);
    
    console.log('Has header:', hasHeader);
    console.log('Has plan:', hasPlan);
    console.log('Has actions:', hasActions);
    
    expect(hasHeader || hasPlan || hasActions).toBeTruthy();
  });

  test('should display profile with real auth', async ({ page }) => {
    await gotoWithAuth(page, '/profile');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/profile-test.png' });
    
    // Check for profile elements
    const hasProfile = await page.locator('text=Профиль').isVisible().catch(() => false);
    const hasUsername = await page.locator('text=testuser').isVisible().catch(() => false);
    const hasEmail = await page.locator('text=test@example.com').isVisible().catch(() => false);
    
    console.log('Has profile:', hasProfile);
    console.log('Has username:', hasUsername);
    console.log('Has email:', hasEmail);
    
    expect(hasProfile || hasUsername || hasEmail).toBeTruthy();
  });
});
