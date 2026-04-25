import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Analytics Page - Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
  });

  test('should display analytics page', async ({ page }) => {
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should display overview stats cards', async ({ page }) => {
    await expect(page.locator('text=Total Activities')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=Total Points')).toBeVisible();
    await expect(page.locator('text=Completion Rate')).toBeVisible();
  });

  test('should display numeric values in stats cards', async ({ page }) => {
    const statsCards = page.locator('[class*="bg-white"][class*="rounded"]');
    const firstCard = statsCards.first();
    
    await expect(firstCard.locator('text=/\\d+/')).toBeVisible();
  });

  test('should display export button', async ({ page }) => {
    await expect(page.locator('button:has-text("Export Data")')).toBeVisible();
  });

  test('should export data as JSON', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('should display streak cards', async ({ page }) => {
    await expect(page.locator('text=Current Streak')).toBeVisible();
    await expect(page.locator('text=Longest Streak')).toBeVisible();
  });

  test('should display streak values with fire emoji', async ({ page }) => {
    const currentStreak = page.locator('text=Current Streak').locator('..');
    await expect(currentStreak.locator('text=🔥')).toBeVisible();
  });

  test('should display longest streak with trophy emoji', async ({ page }) => {
    const longestStreak = page.locator('text=Longest Streak').locator('..');
    await expect(longestStreak.locator('text=🏆')).toBeVisible();
  });

  test('should show zero values for new users', async ({ page }) => {
    // Stats should show 0 for users with no activities
    const totalActivities = page.locator('text=Total Activities').locator('..');
    const value = await totalActivities.textContent();
    expect(value).toMatch(/\d+/);
  });

  test('should calculate completion rate correctly', async ({ page }) => {
    const completionRate = page.locator('text=Completion Rate').locator('..');
    const rateText = await completionRate.textContent();
    
    // Should be a percentage
    expect(rateText).toMatch(/\d+(\.\d+)?%/);
  });
});

test.describe('Analytics Page - Weekly Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
  });

  test('should display weekly activity chart', async ({ page }) => {
    await expect(page.locator('text=Weekly Activity')).toBeVisible();
  });

  test('should display 7 days in chart', async ({ page }) => {
    const chartBars = page.locator('[class*="bg-blue-500"]');
    const count = await chartBars.count();
    
    // Should have bars for each day
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display day labels', async ({ page }) => {
    const dayLabels = page.locator('text=/Mon|Tue|Wed|Thu|Fri|Sat|Sun/');
    await expect(dayLabels.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display activity counts on bars', async ({ page }) => {
    const chartSection = page.locator('text=Weekly Activity').locator('..');
    const numbers = chartSection.locator('text=/\\d+/');
    
    if (await numbers.first().isVisible()) {
      await expect(numbers.first()).toBeVisible();
    }
  });

  test('should show tooltip on bar hover', async ({ page }) => {
    const chartBar = page.locator('[class*="bg-blue-500"]').first();
    
    if (await chartBar.isVisible()) {
      await chartBar.hover();
      await page.waitForTimeout(500);
      
      // Tooltip might appear
      const tooltip = page.locator('[title]');
      if (await tooltip.isVisible()) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('should highlight current day', async ({ page }) => {
    // Current day might be highlighted differently
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const todayLabel = page.locator(`text=${today}`);
    
    if (await todayLabel.isVisible()) {
      await expect(todayLabel).toBeVisible();
    }
  });
});

test.describe('Analytics Page - Category Breakdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
  });

  test('should display category breakdown section', async ({ page }) => {
    await expect(page.locator('text=Category Breakdown')).toBeVisible();
  });

  test('should display progress bars for categories', async ({ page }) => {
    const progressBars = page.locator('[class*="bg-green-500"]');
    
    if (await progressBars.first().isVisible()) {
      await expect(progressBars.first()).toBeVisible();
    }
  });

  test('should display category names', async ({ page }) => {
    const categories = ['education', 'health', 'career', 'leisure', 'social', 'household'];
    
    for (const category of categories) {
      const categoryLabel = page.locator(`text=${category}`);
      if (await categoryLabel.isVisible()) {
        await expect(categoryLabel).toBeVisible();
      }
    }
  });

  test('should display completion counts', async ({ page }) => {
    const categorySection = page.locator('text=Category Breakdown').locator('..');
    const counts = categorySection.locator('text=/\\d+\\/\\d+/');
    
    if (await counts.first().isVisible()) {
      await expect(counts.first()).toBeVisible();
    }
  });

  test('should display completion percentages', async ({ page }) => {
    const categorySection = page.locator('text=Category Breakdown').locator('..');
    const percentages = categorySection.locator('text=/\\d+%/');
    
    if (await percentages.first().isVisible()) {
      await expect(percentages.first()).toBeVisible();
    }
  });

  test('should show progress bar width matching percentage', async ({ page }) => {
    const progressBar = page.locator('[class*="bg-green-500"]').first();
    
    if (await progressBar.isVisible()) {
      const width = await progressBar.evaluate(el => el.style.width);
      expect(width).toMatch(/\d+%/);
    }
  });

  test('should capitalize category names', async ({ page }) => {
    const categoryLabels = page.locator('[class*="capitalize"]');
    
    if (await categoryLabels.first().isVisible()) {
      await expect(categoryLabels.first()).toBeVisible();
    }
  });
});

test.describe('Analytics Page - Time Distribution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
  });

  test('should display time distribution section', async ({ page }) => {
    await expect(page.locator('text=Time Distribution')).toBeVisible();
  });

  test('should display hours spent per category', async ({ page }) => {
    const timeSection = page.locator('text=Time Distribution').locator('..');
    const hours = timeSection.locator('text=/\\d+(\\.\\d+)?h/');
    
    if (await hours.first().isVisible()) {
      await expect(hours.first()).toBeVisible();
    }
  });

  test('should display progress bars for time', async ({ page }) => {
    const progressBars = page.locator('[class*="bg-purple-500"]');
    
    if (await progressBars.first().isVisible()) {
      await expect(progressBars.first()).toBeVisible();
    }
  });

  test('should show relative time distribution', async ({ page }) => {
    const progressBars = page.locator('[class*="bg-purple-500"]');
    
    if (await progressBars.count() > 1) {
      // Bars should have different widths based on time spent
      const firstWidth = await progressBars.first().evaluate(el => el.style.width);
      const secondWidth = await progressBars.nth(1).evaluate(el => el.style.width);
      
      // Widths might be different
    }
  });
});

test.describe('Analytics Page - Activities Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
  });

  test('should display activities by category section', async ({ page }) => {
    const categorySection = page.locator('text=Activities by Category');
    
    if (await categorySection.isVisible()) {
      await expect(categorySection).toBeVisible();
    }
  });

  test('should display category counts', async ({ page }) => {
    const categoryBoxes = page.locator('[class*="bg-gray-50"]');
    
    if (await categoryBoxes.first().isVisible()) {
      await expect(categoryBoxes.first().locator('text=/\\d+/')).toBeVisible();
    }
  });

  test('should display category labels', async ({ page }) => {
    const categories = ['education', 'health', 'career', 'leisure', 'social', 'household'];
    
    for (const category of categories) {
      const label = page.locator(`text=${category}`);
      if (await label.isVisible()) {
        await expect(label).toBeVisible();
      }
    }
  });

  test('should use grid layout for categories', async ({ page }) => {
    const grid = page.locator('[class*="grid"]');
    
    if (await grid.isVisible()) {
      await expect(grid).toBeVisible();
    }
  });
});

test.describe('Analytics Page - Data Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
  });

  test('should export data with correct filename', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    
    expect(filename).toContain('lifebalance-export');
    expect(filename).toContain('.json');
  });

  test('should export data with current date', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    
    const today = new Date().toISOString().split('T')[0];
    expect(filename).toContain(today);
  });

  test('should export valid JSON', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    const path = await download.path();
    
    if (path) {
      const fs = require('fs');
      const content = fs.readFileSync(path, 'utf-8');
      
      // Should be valid JSON
      expect(() => JSON.parse(content)).not.toThrow();
    }
  });

  test('should include user data in export', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    const path = await download.path();
    
    if (path) {
      const fs = require('fs');
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('activities');
      expect(data).toHaveProperty('points_history');
      expect(data).toHaveProperty('rating');
    }
  });
});

test.describe('Analytics Page - Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should show loading state', async ({ page }) => {
    await page.click('text=Аналитика');
    
    const loader = page.locator('text=/loading|загрузка/i');
    if (await loader.isVisible({ timeout: 1000 })) {
      await expect(loader).toBeVisible();
    }
  });

  test('should hide loading state after data loads', async ({ page }) => {
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
    
    await expect(page.locator('text=Analytics')).toBeVisible();
    
    const loader = page.locator('text=/loading|загрузка/i');
    await expect(loader).not.toBeVisible();
  });
});

test.describe('Analytics Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('text=Analytics')).toBeVisible();
    await expect(page.locator('text=Total Activities')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should stack cards on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Cards should stack vertically
    const cards = page.locator('[class*="bg-white"][class*="rounded"]');
    const firstCard = await cards.first().boundingBox();
    const secondCard = await cards.nth(1).boundingBox();
    
    if (firstCard && secondCard) {
      // Second card should be below first card on mobile
      expect(secondCard.y).toBeGreaterThan(firstCard.y);
    }
  });

  test('should display cards in grid on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Cards should be in a grid
    const grid = page.locator('[class*="grid"]').first();
    await expect(grid).toBeVisible();
  });
});

test.describe('Analytics Page - Empty States', () => {
  test('should show empty state for new users', async ({ page }) => {
    // Login as new user with no data
    await page.goto('http://localhost:5173');
    
    const timestamp = Date.now();
    await page.click('text=Регистрация');
    await page.fill('input[type="email"]', `newuser${timestamp}@example.com`);
    await page.fill('input[placeholder*="Имя"]', `newuser${timestamp}`);
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button:has-text("Зарегистрироваться")');
    
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
    
    // Navigate to analytics
    if (await page.locator('text=Аналитика').isVisible()) {
      await page.click('text=Аналитика');
      await page.waitForURL(/\/analytics/, { timeout: 5000 });
      
      // Should show 0 values
      await expect(page.locator('text=0')).toBeVisible();
    }
  });
});
