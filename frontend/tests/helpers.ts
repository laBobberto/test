import { Page } from '@playwright/test';

// Real test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123',
  username: 'testuser'
};

// Get real auth token from environment or fetch new one
export async function getAuthToken(): Promise<string> {
  // Try to use token from global setup
  if (process.env.TEST_AUTH_TOKEN) {
    return process.env.TEST_AUTH_TOKEN;
  }
  
  // Fallback: fetch new token
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get auth token: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

// Login helper for tests
export async function loginAsTestUser(page: Page) {
  await page.goto('/');
  
  // Fill login form
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
}

// Set auth token in localStorage
export async function setAuthToken(page: Page, token?: string) {
  const authToken = token || await getAuthToken();
  
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, authToken);
}

// Navigate to page with auth
export async function gotoWithAuth(page: Page, url: string) {
  await setAuthToken(page);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}
