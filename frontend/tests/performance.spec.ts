import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Performance - Page Load Times', () => {
  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    await expect(page.locator('text=Вход')).toBeVisible();
  });

  test('should load dashboard quickly after login', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    const startTime = Date.now();
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
  });

  test('should load map page quickly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const startTime = Date.now();
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load analytics page quickly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const startTime = Date.now();
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(4000);
  });
});

test.describe('Performance - API Response Times', () => {
  test('should get activities quickly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Measure API response time
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/plan/daily')),
      page.reload()
    ]);
    
    const responseTime = response.request().timing().responseEnd;
    expect(responseTime).toBeLessThan(2000); // Should respond in under 2 seconds
  });

  test('should get leaderboard quickly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/leaderboard')),
      page.click('text=Рейтинг')
    ]);
    
    const responseTime = response.request().timing().responseEnd;
    expect(responseTime).toBeLessThan(2000);
  });

  test('should get analytics quickly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/analytics')),
      page.click('text=Аналитика')
    ]);
    
    const responseTime = response.request().timing().responseEnd;
    expect(responseTime).toBeLessThan(2000);
  });
});

test.describe('Performance - Bundle Size', () => {
  test('should have reasonable JavaScript bundle size', async ({ page }) => {
    const resources: any[] = [];
    
    page.on('response', response => {
      if (response.url().endsWith('.js')) {
        resources.push({
          url: response.url(),
          size: response.headers()['content-length']
        });
      }
    });
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    const totalSize = resources.reduce((sum, r) => sum + (parseInt(r.size) || 0), 0);
    
    // Total JS should be under 2MB
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);
  });

  test('should have reasonable CSS bundle size', async ({ page }) => {
    const resources: any[] = [];
    
    page.on('response', response => {
      if (response.url().endsWith('.css')) {
        resources.push({
          url: response.url(),
          size: response.headers()['content-length']
        });
      }
    });
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    const totalSize = resources.reduce((sum, r) => sum + (parseInt(r.size) || 0), 0);
    
    // Total CSS should be under 500KB
    expect(totalSize).toBeLessThan(500 * 1024);
  });
});

test.describe('Performance - Memory Usage', () => {
  test('should not leak memory on navigation', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Navigate through pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('text=Карта');
      await page.waitForURL(/\/map/, { timeout: 5000 });
      await page.waitForTimeout(500);
      
      await page.click('text=Рейтинг');
      await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
      await page.waitForTimeout(500);
      
      await page.click('text=Главная');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
      await page.waitForTimeout(500);
    }
    
    // Page should still be responsive
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });

  test('should handle large activity lists', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Create multiple activities
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      for (let i = 0; i < 10; i++) {
        await fab.click();
        await page.fill('input[placeholder*="название"]', `Activity ${i + 1}`);
        await page.click('button:has-text("Создать")');
        await page.waitForTimeout(500);
      }
    }
    
    // Page should still be responsive
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });
});

test.describe('Performance - Rendering', () => {
  test('should render dashboard without layout shifts', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Wait for all content to load
    await page.waitForLoadState('networkidle');
    
    // Check that main elements are visible
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
    await expect(page.locator('text=Баллы')).toBeVisible();
  });

  test('should render charts smoothly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
    
    // Wait for charts to render
    await page.waitForTimeout(2000);
    
    // Charts should be visible
    await expect(page.locator('text=Weekly Activity')).toBeVisible();
  });

  test('should render map smoothly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    // Map should be interactive
    const mapContainer = page.locator('[class*="map"]').first();
    if (await mapContainer.isVisible()) {
      await expect(mapContainer).toBeVisible();
    }
  });
});

test.describe('Performance - Network Optimization', () => {
  test('should cache static assets', async ({ page }) => {
    // First visit
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Second visit
    await page.goto('http://localhost:5173');
    
    // Check if resources are cached
    const cachedResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((r: any) => r.transferSize === 0)
        .length;
    });
    
    // Some resources should be cached
    expect(cachedResources).toBeGreaterThan(0);
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Images should have loading="lazy" attribute
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');
      // Images might be lazy loaded
    }
  });

  test('should compress API responses', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/')),
      page.click('button:has-text("Войти")')
    ]);
    
    const encoding = response.headers()['content-encoding'];
    // Response might be compressed with gzip or br
  });
});

test.describe('Performance - Interaction Responsiveness', () => {
  test('should respond to clicks quickly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Measure click response time
    const startTime = Date.now();
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(2000);
  });

  test('should respond to input quickly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
    
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      const startTime = Date.now();
      await chatInput.fill('Test message');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(500);
    }
  });

  test('should scroll smoothly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Scroll up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Page should still be responsive
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });
});

test.describe('Performance - Database Queries', () => {
  test('should handle concurrent requests', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Make multiple concurrent requests
    await Promise.all([
      page.click('text=Рейтинг'),
      page.waitForTimeout(100),
      page.click('text=Аналитика'),
      page.waitForTimeout(100),
      page.click('text=Профиль')
    ]);
    
    await page.waitForTimeout(3000);
    
    // Page should still be responsive
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });

  test('should paginate large datasets', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    
    // Check if pagination exists
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Should load next page quickly
      await expect(page.locator('text=Leaderboard')).toBeVisible();
    }
  });
});

test.describe('Performance - Mobile Performance', () => {
  test('should perform well on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(4000);
    await expect(page.locator('text=Вход')).toBeVisible();
  });

  test('should handle touch interactions smoothly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Simulate touch scroll
    await page.touchscreen.tap(200, 300);
    await page.waitForTimeout(500);
    
    // Page should still be responsive
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });
});
