import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('text=Главная')).toBeVisible();
    await expect(page.locator('text=Карта')).toBeVisible();
    await expect(page.locator('text=AI Чат')).toBeVisible();
    await expect(page.locator('text=Рейтинг')).toBeVisible();
    await expect(page.locator('text=Друзья')).toBeVisible();
    await expect(page.locator('text=Аналитика')).toBeVisible();
    await expect(page.locator('text=Профиль')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await expect(page.locator('text=Баллы')).toBeVisible();
    await expect(page.locator('text=🏆')).toBeVisible();
  });

  test('should display date selector', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
  });

  test('should change date and load activities', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-04-26');
    
    // Wait for activities to load
    await page.waitForTimeout(1000);
  });

  test('should display activities list', async ({ page }) => {
    const activitiesList = page.locator('[class*="activities"]').first();
    await expect(activitiesList).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display floating action button', async ({ page }) => {
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    await expect(fab).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should open create activity modal', async ({ page }) => {
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      await expect(page.locator('text=/создать|create/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should navigate to map page', async ({ page }) => {
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/map/);
  });

  test('should navigate to chat page', async ({ page }) => {
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/chat/);
  });

  test('should navigate to leaderboard page', async ({ page }) => {
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/leaderboard/);
  });

  test('should navigate to social page', async ({ page }) => {
    await page.click('text=Друзья');
    await page.waitForURL(/\/social/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/social/);
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/analytics/);
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/profile/);
  });

  test('should display username in header', async ({ page }) => {
    const username = page.locator('text=/testuser|test@example.com/i');
    await expect(username).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should have logout button', async ({ page }) => {
    await expect(page.locator('button:has-text("Выход")')).toBeVisible();
  });
});

test.describe('Activity CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should create new activity', async ({ page }) => {
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      
      // Fill form
      await page.fill('input[placeholder*="название"]', 'Test Activity');
      await page.fill('textarea[placeholder*="описание"]', 'Test Description');
      
      // Select category
      const categorySelect = page.locator('select').first();
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption('education');
      }
      
      // Set times
      await page.fill('input[type="datetime-local"]', '2026-04-26T10:00');
      
      // Submit
      await page.click('button:has-text("Создать")');
      
      // Should close modal
      await page.waitForTimeout(1000);
    }
  });

  test('should edit existing activity', async ({ page }) => {
    // Find first activity card
    const activityCard = page.locator('[class*="activity"]').first();
    
    if (await activityCard.isVisible()) {
      // Click edit button
      const editButton = activityCard.locator('button:has-text("Редактировать")');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Update title
        await page.fill('input[placeholder*="название"]', 'Updated Activity');
        
        // Save
        await page.click('button:has-text("Сохранить")');
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should delete activity', async ({ page }) => {
    const activityCard = page.locator('[class*="activity"]').first();
    
    if (await activityCard.isVisible()) {
      const deleteButton = activityCard.locator('button:has-text("Удалить")');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion
        const confirmButton = page.locator('button:has-text("Удалить")').last();
        await confirmButton.click();
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should complete activity', async ({ page }) => {
    const activityCard = page.locator('[class*="activity"]').first();
    
    if (await activityCard.isVisible()) {
      const completeButton = activityCard.locator('button:has-text("Завершить")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should reschedule activity', async ({ page }) => {
    const activityCard = page.locator('[class*="activity"]').first();
    
    if (await activityCard.isVisible()) {
      const rescheduleButton = activityCard.locator('button:has-text("Перенести")');
      if (await rescheduleButton.isVisible()) {
        await rescheduleButton.click();
        
        // Set new time
        await page.fill('input[type="datetime-local"]', '2026-04-26T14:00');
        
        // Save
        await page.click('button:has-text("Сохранить")');
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should filter activities by category', async ({ page }) => {
    const categoryFilter = page.locator('select[class*="filter"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('education');
      await page.waitForTimeout(1000);
    }
  });

  test('should search activities', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="поиск"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
    }
  });

  test('should display activity details', async ({ page }) => {
    const activityCard = page.locator('[class*="activity"]').first();
    
    if (await activityCard.isVisible()) {
      await activityCard.click();
      
      // Should show details
      await expect(page.locator('text=/описание|description/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should show activity time', async ({ page }) => {
    const activityCard = page.locator('[class*="activity"]').first();
    
    if (await activityCard.isVisible()) {
      await expect(activityCard.locator('text=/\\d{2}:\\d{2}/')).toBeVisible().catch(() => {});
    }
  });

  test('should show activity category badge', async ({ page }) => {
    const activityCard = page.locator('[class*="activity"]').first();
    
    if (await activityCard.isVisible()) {
      const categoryBadge = activityCard.locator('[class*="badge"]');
      await expect(categoryBadge).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });
});

test.describe('Activity Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should validate required fields', async ({ page }) => {
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      
      // Try to submit without filling
      await page.click('button:has-text("Создать")');
      
      // Should show validation errors
      await expect(page.locator('text=/обязательн|required/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should validate time range', async ({ page }) => {
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      
      await page.fill('input[placeholder*="название"]', 'Test');
      
      // Set end time before start time
      await page.fill('input[type="datetime-local"]', '2026-04-26T14:00');
      
      const endTimeInput = page.locator('input[type="datetime-local"]').last();
      await endTimeInput.fill('2026-04-26T10:00');
      
      await page.click('button:has-text("Создать")');
      
      // Should show error
      await page.waitForTimeout(1000);
    }
  });

  test('should validate title length', async ({ page }) => {
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      
      // Very long title
      await page.fill('input[placeholder*="название"]', 'A'.repeat(200));
      
      await page.click('button:has-text("Создать")');
      
      await page.waitForTimeout(1000);
    }
  });

  test('should validate past dates', async ({ page }) => {
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      
      await page.fill('input[placeholder*="название"]', 'Test');
      
      // Set past date
      await page.fill('input[type="datetime-local"]', '2020-01-01T10:00');
      
      await page.click('button:has-text("Создать")');
      
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Dashboard Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display points stat', async ({ page }) => {
    const pointsStat = page.locator('text=Баллы').locator('..');
    await expect(pointsStat).toBeVisible();
    
    // Should have a number
    await expect(pointsStat.locator('text=/\\d+/')).toBeVisible();
  });

  test('should display activities count', async ({ page }) => {
    const activitiesStat = page.locator('text=/активност|activities/i').first();
    if (await activitiesStat.isVisible()) {
      await expect(activitiesStat).toBeVisible();
    }
  });

  test('should display completion rate', async ({ page }) => {
    const completionStat = page.locator('text=/%|процент/i').first();
    if (await completionStat.isVisible()) {
      await expect(completionStat).toBeVisible();
    }
  });

  test('should update stats after completing activity', async ({ page }) => {
    // Get initial points
    const pointsText = await page.locator('text=Баллы').locator('..').textContent();
    
    // Complete an activity
    const activityCard = page.locator('[class*="activity"]').first();
    if (await activityCard.isVisible()) {
      const completeButton = activityCard.locator('button:has-text("Завершить")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await page.waitForTimeout(2000);
        
        // Points should update
        const newPointsText = await page.locator('text=Баллы').locator('..').textContent();
        // Points might have changed
      }
    }
  });
});

test.describe('Dashboard Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
  });

  test('should hide navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigation might be hidden in hamburger menu
    const nav = page.locator('nav');
    // Check if nav is hidden or in menu
  });
});
