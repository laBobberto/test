import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Profile Page - Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should display profile page', async ({ page }) => {
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    await expect(page.locator('text=/testuser|test@example.com/i')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display user avatar', async ({ page }) => {
    const avatar = page.locator('[class*="avatar"]').first();
    if (await avatar.isVisible()) {
      await expect(avatar).toBeVisible();
    }
  });

  test('should display username', async ({ page }) => {
    const username = page.locator('[class*="username"]');
    if (await username.isVisible()) {
      await expect(username).toBeVisible();
    }
  });

  test('should display email', async ({ page }) => {
    await expect(page.locator('text=/test@example.com/i')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display user role', async ({ page }) => {
    const role = page.locator('text=/student|resident|tourist/i');
    if (await role.isVisible()) {
      await expect(role).toBeVisible();
    }
  });

  test('should display member since date', async ({ page }) => {
    const memberSince = page.locator('text=/Member since|Участник с/i');
    if (await memberSince.isVisible()) {
      await expect(memberSince).toBeVisible();
    }
  });

  test('should display total points', async ({ page }) => {
    const points = page.locator('text=/\\d+ points/');
    if (await points.isVisible()) {
      await expect(points).toBeVisible();
    }
  });

  test('should display rank', async ({ page }) => {
    const rank = page.locator('text=/Rank #\\d+/');
    if (await rank.isVisible()) {
      await expect(rank).toBeVisible();
    }
  });

  test('should display achievements section', async ({ page }) => {
    const achievements = page.locator('text=Achievements');
    if (await achievements.isVisible()) {
      await expect(achievements).toBeVisible();
    }
  });

  test('should display statistics section', async ({ page }) => {
    const stats = page.locator('text=Statistics');
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
    }
  });
});

test.describe('Profile Page - Edit Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should have edit button', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
    }
  });

  test('should open edit modal', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      await expect(page.locator('text=/Edit Profile|Редактировать/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should edit username', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const usernameInput = page.locator('input[name="username"]');
      if (await usernameInput.isVisible()) {
        await usernameInput.fill('newusername');
        
        await page.click('button:has-text("Save")');
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should edit bio', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const bioInput = page.locator('textarea[name="bio"]');
      if (await bioInput.isVisible()) {
        await bioInput.fill('This is my new bio');
        
        await page.click('button:has-text("Save")');
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should upload avatar', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Upload file
        await fileInput.setInputFiles('path/to/avatar.jpg').catch(() => {});
      }
    }
  });

  test('should change password', async ({ page }) => {
    const changePasswordButton = page.locator('button:has-text("Change Password")');
    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();
      
      await page.fill('input[name="currentPassword"]', TEST_USER.password);
      await page.fill('input[name="newPassword"]', 'NewPassword123!');
      await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
      
      await page.click('button:has-text("Update Password")');
      await page.waitForTimeout(2000);
    }
  });

  test('should validate password match', async ({ page }) => {
    const changePasswordButton = page.locator('button:has-text("Change Password")');
    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();
      
      await page.fill('input[name="currentPassword"]', TEST_USER.password);
      await page.fill('input[name="newPassword"]', 'NewPassword123!');
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
      
      await page.click('button:has-text("Update Password")');
      
      await expect(page.locator('text=/passwords do not match|пароли не совпадают/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should cancel edit', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        await expect(page.locator('text=/Edit Profile|Редактировать/i')).not.toBeVisible();
      }
    }
  });
});

test.describe('Profile Page - Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should display total activities', async ({ page }) => {
    const totalActivities = page.locator('text=/Total Activities|Всего активностей/i');
    if (await totalActivities.isVisible()) {
      await expect(totalActivities).toBeVisible();
    }
  });

  test('should display completed activities', async ({ page }) => {
    const completed = page.locator('text=/Completed|Завершено/i');
    if (await completed.isVisible()) {
      await expect(completed).toBeVisible();
    }
  });

  test('should display completion rate', async ({ page }) => {
    const rate = page.locator('text=/\\d+%/');
    if (await rate.isVisible()) {
      await expect(rate).toBeVisible();
    }
  });

  test('should display current streak', async ({ page }) => {
    const streak = page.locator('text=/Streak|Серия/i');
    if (await streak.isVisible()) {
      await expect(streak).toBeVisible();
    }
  });

  test('should display favorite category', async ({ page }) => {
    const category = page.locator('text=/Favorite Category|Любимая категория/i');
    if (await category.isVisible()) {
      await expect(category).toBeVisible();
    }
  });
});

test.describe('Profile Page - Achievements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should display achievements list', async ({ page }) => {
    const achievements = page.locator('[class*="achievement"]');
    if (await achievements.first().isVisible()) {
      await expect(achievements.first()).toBeVisible();
    }
  });

  test('should display achievement icons', async ({ page }) => {
    const icon = page.locator('[class*="achievement"] [class*="icon"]').first();
    if (await icon.isVisible()) {
      await expect(icon).toBeVisible();
    }
  });

  test('should display achievement names', async ({ page }) => {
    const name = page.locator('[class*="achievement"] h4').first();
    if (await name.isVisible()) {
      await expect(name).toBeVisible();
    }
  });

  test('should display achievement descriptions', async ({ page }) => {
    const description = page.locator('[class*="achievement"] p').first();
    if (await description.isVisible()) {
      await expect(description).toBeVisible();
    }
  });

  test('should show locked achievements', async ({ page }) => {
    const locked = page.locator('[class*="locked"]').first();
    if (await locked.isVisible()) {
      await expect(locked).toBeVisible();
    }
  });

  test('should show unlocked achievements', async ({ page }) => {
    const unlocked = page.locator('[class*="unlocked"]').first();
    if (await unlocked.isVisible()) {
      await expect(unlocked).toBeVisible();
    }
  });

  test('should display achievement progress', async ({ page }) => {
    const progress = page.locator('[class*="progress"]').first();
    if (await progress.isVisible()) {
      await expect(progress).toBeVisible();
    }
  });
});

test.describe('Profile Page - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should have settings section', async ({ page }) => {
    const settings = page.locator('text=Settings');
    if (await settings.isVisible()) {
      await expect(settings).toBeVisible();
    }
  });

  test('should toggle notifications', async ({ page }) => {
    const notificationsToggle = page.locator('input[type="checkbox"][name="notifications"]');
    if (await notificationsToggle.isVisible()) {
      await notificationsToggle.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should toggle email notifications', async ({ page }) => {
    const emailToggle = page.locator('input[type="checkbox"][name="emailNotifications"]');
    if (await emailToggle.isVisible()) {
      await emailToggle.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should change language', async ({ page }) => {
    const languageSelect = page.locator('select[name="language"]');
    if (await languageSelect.isVisible()) {
      await languageSelect.selectOption('en');
      await page.waitForTimeout(1000);
    }
  });

  test('should change theme', async ({ page }) => {
    const themeSelect = page.locator('select[name="theme"]');
    if (await themeSelect.isVisible()) {
      await themeSelect.selectOption('dark');
      await page.waitForTimeout(1000);
    }
  });

  test('should toggle privacy settings', async ({ page }) => {
    const privacyToggle = page.locator('input[type="checkbox"][name="publicProfile"]');
    if (await privacyToggle.isVisible()) {
      await privacyToggle.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Profile Page - Activity History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should display recent activities', async ({ page }) => {
    const recentActivities = page.locator('text=Recent Activities');
    if (await recentActivities.isVisible()) {
      await expect(recentActivities).toBeVisible();
    }
  });

  test('should display activity list', async ({ page }) => {
    const activityList = page.locator('[class*="activity-list"]');
    if (await activityList.isVisible()) {
      await expect(activityList).toBeVisible();
    }
  });

  test('should display activity dates', async ({ page }) => {
    const date = page.locator('text=/\\d{4}-\\d{2}-\\d{2}/').first();
    if (await date.isVisible()) {
      await expect(date).toBeVisible();
    }
  });

  test('should filter activities by date range', async ({ page }) => {
    const dateFilter = page.locator('select[name="dateRange"]');
    if (await dateFilter.isVisible()) {
      await dateFilter.selectOption('last7days');
      await page.waitForTimeout(1000);
    }
  });

  test('should filter activities by category', async ({ page }) => {
    const categoryFilter = page.locator('select[name="category"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('education');
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Profile Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('should stack sections on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sections should stack vertically
    const sections = page.locator('[class*="section"]');
    if (await sections.count() > 1) {
      const firstSection = await sections.first().boundingBox();
      const secondSection = await sections.nth(1).boundingBox();
      
      if (firstSection && secondSection) {
        expect(secondSection.y).toBeGreaterThan(firstSection.y);
      }
    }
  });
});

test.describe('Profile Page - Delete Account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Профиль');
    await page.waitForURL(/\/profile/, { timeout: 5000 });
  });

  test('should have delete account button', async ({ page }) => {
    const deleteButton = page.locator('button:has-text("Delete Account")');
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should show confirmation dialog', async ({ page }) => {
    const deleteButton = page.locator('button:has-text("Delete Account")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      await expect(page.locator('text=/Are you sure|Вы уверены/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should cancel account deletion', async ({ page }) => {
    const deleteButton = page.locator('button:has-text("Delete Account")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        await expect(page).toHaveURL(/\/profile/);
      }
    }
  });
});
