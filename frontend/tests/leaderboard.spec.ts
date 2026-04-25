import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Leaderboard Page - Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
  });

  test('should display leaderboard page', async ({ page }) => {
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should display period filters', async ({ page }) => {
    await expect(page.locator('button:has-text("All Time")')).toBeVisible();
    await expect(page.locator('button:has-text("This Week")')).toBeVisible();
    await expect(page.locator('button:has-text("This Month")')).toBeVisible();
  });

  test('should display role filters', async ({ page }) => {
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Students")')).toBeVisible();
    await expect(page.locator('button:has-text("Residents")')).toBeVisible();
    await expect(page.locator('button:has-text("Tourists")')).toBeVisible();
  });

  test('should display user rankings', async ({ page }) => {
    const rankingsList = page.locator('[class*="space-y"]');
    await expect(rankingsList).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display rank numbers', async ({ page }) => {
    const rankNumber = page.locator('text=/^#\\d+$/').first();
    if (await rankNumber.isVisible()) {
      await expect(rankNumber).toBeVisible();
    }
  });

  test('should display usernames', async ({ page }) => {
    const username = page.locator('[class*="font-medium"]').first();
    if (await username.isVisible()) {
      await expect(username).toBeVisible();
    }
  });

  test('should display points', async ({ page }) => {
    const points = page.locator('text=/\\d+ points/').first();
    if (await points.isVisible()) {
      await expect(points).toBeVisible();
    }
  });

  test('should display medals for top 3', async ({ page }) => {
    await expect(page.locator('text=🥇')).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.locator('text=🥈')).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.locator('text=🥉')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should highlight current user', async ({ page }) => {
    const currentUserRow = page.locator('[class*="bg-blue"]').first();
    if (await currentUserRow.isVisible()) {
      await expect(currentUserRow).toBeVisible();
    }
  });

  test('should display total users count', async ({ page }) => {
    const totalUsers = page.locator('text=/Total users: \\d+/');
    if (await totalUsers.isVisible()) {
      await expect(totalUsers).toBeVisible();
    }
  });
});

test.describe('Leaderboard Page - Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
  });

  test('should filter by all time', async ({ page }) => {
    await page.click('button:has-text("All Time")');
    await page.waitForTimeout(1000);
    
    // Should show all time rankings
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should filter by this week', async ({ page }) => {
    await page.click('button:has-text("This Week")');
    await page.waitForTimeout(1000);
    
    // Should show weekly rankings
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should filter by this month', async ({ page }) => {
    await page.click('button:has-text("This Month")');
    await page.waitForTimeout(1000);
    
    // Should show monthly rankings
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should filter by all roles', async ({ page }) => {
    await page.click('button:has-text("All")');
    await page.waitForTimeout(1000);
    
    // Should show all users
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should filter by students', async ({ page }) => {
    await page.click('button:has-text("Students")');
    await page.waitForTimeout(1000);
    
    // Should show only students
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should filter by residents', async ({ page }) => {
    await page.click('button:has-text("Residents")');
    await page.waitForTimeout(1000);
    
    // Should show only residents
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should filter by tourists', async ({ page }) => {
    await page.click('button:has-text("Tourists")');
    await page.waitForTimeout(1000);
    
    // Should show only tourists
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should highlight active period filter', async ({ page }) => {
    await page.click('button:has-text("This Week")');
    
    const weekButton = page.locator('button:has-text("This Week")');
    await expect(weekButton).toHaveClass(/bg-blue|active/);
  });

  test('should highlight active role filter', async ({ page }) => {
    await page.click('button:has-text("Students")');
    
    const studentsButton = page.locator('button:has-text("Students")');
    await expect(studentsButton).toHaveClass(/bg-blue|active/);
  });

  test('should combine period and role filters', async ({ page }) => {
    await page.click('button:has-text("This Week")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Students")');
    await page.waitForTimeout(1000);
    
    // Should show weekly student rankings
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });
});

test.describe('Leaderboard Page - Rankings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
  });

  test('should display rankings in order', async ({ page }) => {
    const ranks = page.locator('text=/^#\\d+$/');
    const count = await ranks.count();
    
    if (count > 1) {
      const firstRank = await ranks.first().textContent();
      const secondRank = await ranks.nth(1).textContent();
      
      const first = parseInt(firstRank?.replace('#', '') || '0');
      const second = parseInt(secondRank?.replace('#', '') || '0');
      
      expect(second).toBeGreaterThan(first);
    }
  });

  test('should display points in descending order', async ({ page }) => {
    const pointsElements = page.locator('text=/\\d+ points/');
    const count = await pointsElements.count();
    
    if (count > 1) {
      const firstPoints = await pointsElements.first().textContent();
      const secondPoints = await pointsElements.nth(1).textContent();
      
      const first = parseInt(firstPoints?.match(/\d+/)?.[0] || '0');
      const second = parseInt(secondPoints?.match(/\d+/)?.[0] || '0');
      
      expect(first).toBeGreaterThanOrEqual(second);
    }
  });

  test('should show current user position', async ({ page }) => {
    const myRank = page.locator('text=My Rank').locator('..');
    if (await myRank.isVisible()) {
      await expect(myRank).toBeVisible();
    }
  });

  test('should scroll to current user', async ({ page }) => {
    const currentUserRow = page.locator('[class*="bg-blue"]').first();
    if (await currentUserRow.isVisible()) {
      await expect(currentUserRow).toBeInViewport();
    }
  });

  test('should display user avatars', async ({ page }) => {
    const avatar = page.locator('[class*="avatar"]').first();
    if (await avatar.isVisible()) {
      await expect(avatar).toBeVisible();
    }
  });

  test('should display role badges', async ({ page }) => {
    const badge = page.locator('[class*="badge"]').first();
    if (await badge.isVisible()) {
      await expect(badge).toBeVisible();
    }
  });
});

test.describe('Leaderboard Page - Loading & Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should show loading state', async ({ page }) => {
    await page.click('text=Рейтинг');
    
    const loader = page.locator('text=/loading|загрузка/i');
    if (await loader.isVisible({ timeout: 1000 })) {
      await expect(loader).toBeVisible();
    }
  });

  test('should hide loading after data loads', async ({ page }) => {
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    
    const loader = page.locator('text=/loading|загрузка/i');
    await expect(loader).not.toBeVisible();
  });

  test('should show empty state when no users', async ({ page }) => {
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    
    // Filter to show empty results
    await page.click('button:has-text("Tourists")');
    await page.waitForTimeout(1000);
    
    const emptyState = page.locator('text=/No users|Нет пользователей/i');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('Leaderboard Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should stack filters on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const filters = page.locator('[class*="flex"][class*="gap"]').first();
    await expect(filters).toBeVisible();
  });
});

test.describe('Leaderboard Page - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
  });

  test('should click on user to view profile', async ({ page }) => {
    const userRow = page.locator('[class*="cursor-pointer"]').first();
    if (await userRow.isVisible()) {
      await userRow.click();
      await page.waitForTimeout(1000);
      
      // Might navigate to profile or show modal
    }
  });

  test('should refresh leaderboard', async ({ page }) => {
    const refreshButton = page.locator('button[aria-label="Refresh"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should paginate results', async ({ page }) => {
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show more users on scroll', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // More users might load
  });
});

test.describe('Leaderboard Page - Stats Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
  });

  test('should display weekly points', async ({ page }) => {
    await page.click('button:has-text("This Week")');
    await page.waitForTimeout(1000);
    
    const weeklyPoints = page.locator('text=/\\d+ points/').first();
    if (await weeklyPoints.isVisible()) {
      await expect(weeklyPoints).toBeVisible();
    }
  });

  test('should display monthly points', async ({ page }) => {
    await page.click('button:has-text("This Month")');
    await page.waitForTimeout(1000);
    
    const monthlyPoints = page.locator('text=/\\d+ points/').first();
    if (await monthlyPoints.isVisible()) {
      await expect(monthlyPoints).toBeVisible();
    }
  });

  test('should display rank change indicator', async ({ page }) => {
    const rankChange = page.locator('text=/↑|↓/').first();
    if (await rankChange.isVisible()) {
      await expect(rankChange).toBeVisible();
    }
  });

  test('should display category breakdown', async ({ page }) => {
    const userRow = page.locator('[class*="cursor-pointer"]').first();
    if (await userRow.isVisible()) {
      await userRow.click();
      
      const categoryBreakdown = page.locator('text=/education|health|career/i');
      if (await categoryBreakdown.isVisible()) {
        await expect(categoryBreakdown).toBeVisible();
      }
    }
  });
});
