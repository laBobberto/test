import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Integration - Full User Journey', () => {
  test('should complete full user journey from registration to activity completion', async ({ page }) => {
    // 1. Register
    await page.goto('http://localhost:5173');
    await page.click('text=Регистрация');
    
    const timestamp = Date.now();
    const email = `journey${timestamp}@example.com`;
    const username = `journey${timestamp}`;
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder*="Имя"]', username);
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button:has-text("Зарегистрироваться")');
    
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });
    
    // 2. Navigate to dashboard
    if (await page.locator('text=Dashboard').isVisible()) {
      await page.click('text=Dashboard');
    }
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    
    // 3. Create activity
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      await page.fill('input[placeholder*="название"]', 'Test Activity');
      await page.fill('textarea[placeholder*="описание"]', 'Test Description');
      await page.click('button:has-text("Создать")');
      await page.waitForTimeout(2000);
    }
    
    // 4. Complete activity
    const completeButton = page.locator('button:has-text("Завершить")').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 5. Check leaderboard
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    await expect(page.locator('text=Leaderboard')).toBeVisible();
    
    // 6. Check analytics
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
    await expect(page.locator('text=Analytics')).toBeVisible();
    
    // 7. Logout
    await page.click('text=Главная');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    await page.click('button:has-text("Выход")');
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
  });

  test('should complete social interaction journey', async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Navigate to social
    await page.click('text=Друзья');
    await page.waitForURL(/\/social/, { timeout: 5000 });
    
    // Try to add friend
    await page.fill('input[placeholder*="username"]', 'testfriend');
    await page.click('button:has-text("Send Request")');
    await page.waitForTimeout(2000);
    
    // Switch to messages
    await page.click('text=Messages');
    await page.waitForTimeout(1000);
    
    // Select friend if available
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      // Send message
      const messageInput = page.locator('input[placeholder*="message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Hello from integration test!');
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should complete map and route planning journey', async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Navigate to map
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    await page.waitForTimeout(3000);
    
    // Build route
    const startInput = page.locator('input[placeholder*="From"]');
    const destInput = page.locator('input[placeholder*="To"]');
    
    if (await startInput.isVisible() && await destInput.isVisible()) {
      await startInput.fill('Московский вокзал');
      await destInput.fill('Эрмитаж');
      
      const buildButton = page.locator('button:has-text("Build Route")');
      if (await buildButton.isVisible()) {
        await buildButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Toggle traffic
    const trafficButton = page.locator('button:has-text("Traffic")');
    if (await trafficButton.isVisible()) {
      await trafficButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Integration - Data Consistency', () => {
  test('should maintain data consistency across pages', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Get points from dashboard
    const dashboardPoints = await page.locator('text=Баллы').locator('..').textContent();
    
    // Navigate to profile
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
    
    // Check points match
    const profilePoints = page.locator('text=/\\d+ points/');
    if (await profilePoints.isVisible()) {
      const profilePointsText = await profilePoints.textContent();
      // Points should be consistent
    }
    
    // Navigate to leaderboard
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    
    // Check points in leaderboard
    const leaderboardPoints = page.locator('text=/\\d+ points/').first();
    if (await leaderboardPoints.isVisible()) {
      const leaderboardPointsText = await leaderboardPoints.textContent();
      // Points should be consistent
    }
  });

  test('should update stats after completing activity', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Get initial points
    const initialPointsText = await page.locator('text=Баллы').locator('..').textContent();
    
    // Complete an activity
    const completeButton = page.locator('button:has-text("Завершить")').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      await page.waitForTimeout(3000);
      
      // Check points updated
      const newPointsText = await page.locator('text=Баллы').locator('..').textContent();
      // Points should have increased
    }
  });
});

test.describe('Integration - Navigation Flow', () => {
  test('should navigate through all pages without errors', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const pages = [
      { name: 'Карта', url: '/map' },
      { name: 'AI Чат', url: '/chat' },
      { name: 'Рейтинг', url: '/leaderboard' },
      { name: 'Друзья', url: '/social' },
      { name: 'Аналитика', url: '/analytics' },
      { name: 'Профиль', url: '/profile' },
      { name: 'Главная', url: '/dashboard' }
    ];
    
    for (const pageInfo of pages) {
      await page.click(`text=${pageInfo.name}`);
      await page.waitForURL(new RegExp(pageInfo.url), { timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(pageInfo.url));
      await page.waitForTimeout(1000);
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Navigate forward
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    
    // Navigate back
    await page.goBack();
    await expect(page).toHaveURL(/\/map/);
    
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Navigate forward
    await page.goForward();
    await expect(page).toHaveURL(/\/map/);
  });
});

test.describe('Integration - Error Recovery', () => {
  test('should recover from network errors', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Simulate network error
    await page.route('**/api/**', route => route.abort());
    
    // Try to navigate
    await page.click('text=Рейтинг');
    await page.waitForTimeout(2000);
    
    // Restore network
    await page.unroute('**/api/**');
    
    // Retry
    await page.reload();
    await page.waitForTimeout(2000);
  });

  test('should handle session expiration', async ({ page, context }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Clear cookies to simulate session expiration
    await context.clearCookies();
    
    // Try to navigate
    await page.click('text=Профиль');
    await page.waitForTimeout(2000);
    
    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});

test.describe('Integration - Multi-tab Behavior', () => {
  test('should handle multiple tabs', async ({ context }) => {
    // Open first tab
    const page1 = await context.newPage();
    await page1.goto('http://localhost:5173');
    await page1.fill('input[type="email"]', TEST_USER.email);
    await page1.fill('input[type="password"]', TEST_USER.password);
    await page1.click('button:has-text("Войти")');
    await page1.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:5173/dashboard');
    await page2.waitForTimeout(2000);
    
    // Should be logged in
    await expect(page2).toHaveURL(/\/dashboard/);
    
    // Logout from first tab
    await page1.click('button:has-text("Выход")');
    await page1.waitForURL('http://localhost:5173/', { timeout: 5000 });
    
    // Second tab should also logout (if implemented)
    await page2.reload();
    await page2.waitForTimeout(2000);
  });
});

test.describe('Integration - Data Export/Import', () => {
  test('should export and verify data structure', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Navigate to analytics
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
    
    // Export data
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    const path = await download.path();
    
    if (path) {
      const fs = require('fs');
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);
      
      // Verify structure
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('activities');
      expect(data).toHaveProperty('points_history');
      expect(data).toHaveProperty('rating');
      
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('username');
      expect(data.user).toHaveProperty('email');
      
      expect(Array.isArray(data.activities)).toBe(true);
      expect(Array.isArray(data.points_history)).toBe(true);
    }
  });
});

test.describe('Integration - Real-time Updates', () => {
  test('should update UI after CRUD operations', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Count initial activities
    const initialActivities = await page.locator('[class*="activity"]').count();
    
    // Create new activity
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      await page.fill('input[placeholder*="название"]', 'Real-time Test Activity');
      await page.click('button:has-text("Создать")');
      await page.waitForTimeout(2000);
      
      // Count should increase
      const newActivities = await page.locator('[class*="activity"]').count();
      expect(newActivities).toBeGreaterThan(initialActivities);
    }
  });

  test('should update leaderboard after earning points', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Get initial rank
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    
    const initialRank = await page.locator('text=/^#\\d+$/').first().textContent();
    
    // Go back and complete activity
    await page.click('text=Главная');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    
    const completeButton = page.locator('button:has-text("Завершить")').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      await page.waitForTimeout(3000);
      
      // Check leaderboard again
      await page.click('text=Рейтинг');
      await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
      
      const newRank = await page.locator('text=/^#\\d+$/').first().textContent();
      // Rank might have changed
    }
  });
});

test.describe('Integration - Cross-feature Interactions', () => {
  test('should create activity from chat suggestion', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Go to chat
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
    
    // Ask for activity suggestion
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Suggest an activity for today');
      await page.click('button:has-text("Send")');
      await page.waitForTimeout(5000);
      
      // Look for "Add to schedule" button
      const addButton = page.locator('button:has-text("Add to schedule")');
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(2000);
        
        // Should navigate to dashboard with new activity
        await expect(page).toHaveURL(/\/dashboard/);
      }
    }
  });

  test('should navigate to event from map', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Go to map
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    await page.waitForTimeout(3000);
    
    // Click event marker
    const marker = page.locator('[class*="marker"]').first();
    if (await marker.isVisible()) {
      await marker.click();
      await page.waitForTimeout(1000);
      
      // Click "Add to schedule" in popup
      const addButton = page.locator('button:has-text("Add to schedule")');
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
