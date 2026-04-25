import { test, expect } from '@playwright/test';
import { getAuthToken } from './helpers';

test('Debug network requests', async ({ page }) => {
  const failedRequests: any[] = [];
  const successRequests: any[] = [];
  
  // Capture all requests
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    if (status >= 400) {
      failedRequests.push({ url, status });
      console.log(`❌ [${status}] ${url}`);
    } else if (url.includes('localhost:8000')) {
      successRequests.push({ url, status });
      console.log(`✓ [${status}] ${url}`);
    }
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
  
  console.log('\n=== Failed Requests ===');
  failedRequests.forEach(req => {
    console.log(`${req.status}: ${req.url}`);
  });
  
  console.log('\n=== Successful API Requests ===');
  successRequests.forEach(req => {
    console.log(`${req.status}: ${req.url}`);
  });
  
  // Get detailed error for first failed request
  if (failedRequests.length > 0) {
    console.log('\n=== Checking first failed request ===');
    const firstFailed = failedRequests[0];
    
    // Try to make the same request manually
    const response = await page.request.get(firstFailed.url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status:', response.status());
    const body = await response.text();
    console.log('Response body:', body);
  }
  
  expect(true).toBe(true);
});
