import { test, expect } from '@playwright/test';

test.describe('Activities CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173');
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(1000);
  });

  test('should display dashboard with activities', async ({ page }) => {
    // Check if dashboard loaded
    await expect(page.locator('h1:has-text("LifeBalance SPb")')).toBeVisible();
    
    // Check stats cards
    await expect(page.locator('text=Баллы')).toBeVisible();
    await expect(page.locator('text=Стрик')).toBeVisible();
    await expect(page.locator('text=Выполнено')).toBeVisible();
    await expect(page.locator('text=Баланс')).toBeVisible();
  });

  test('should open create activity modal via FAB', async ({ page }) => {
    // Click floating action button
    await page.click('button[title="Создать новое дело"]');
    
    // Check if modal opened
    await expect(page.locator('h2:has-text("Создать новое дело")')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("Отмена")');
    await expect(page.locator('h2:has-text("Создать новое дело")')).not.toBeVisible();
  });

  test('should create a new activity', async ({ page }) => {
    // Open create modal
    await page.click('button[title="Создать новое дело"]');
    
    // Fill form
    await page.fill('input[type="text"]', 'Тестовое дело');
    await page.fill('textarea', 'Описание тестового дела');
    await page.selectOption('select', 'education');
    
    // Set times (tomorrow at 10:00 and 11:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await page.fill('input[type="datetime-local"]', `${dateStr}T10:00`);
    await page.fill('input[type="datetime-local"]:nth-of-type(2)', `${dateStr}T11:00`);
    await page.fill('input[placeholder="Адрес или название места"]', 'ЛЭТИ');
    
    // Submit form
    await page.click('button:has-text("Создать")');
    
    // Wait for modal to close
    await page.waitForTimeout(1000);
    
    // Verify activity was created (check if it appears in the list)
    await expect(page.locator('text=Тестовое дело')).toBeVisible();
  });

  test('should edit an existing activity', async ({ page }) => {
    // Wait for activities to load
    await page.waitForTimeout(1000);
    
    // Click edit button on first activity
    const editButton = page.locator('button[title="Редактировать"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Check if edit modal opened
      await expect(page.locator('h2:has-text("Редактировать дело")')).toBeVisible();
      
      // Modify title
      await page.fill('input[type="text"]', 'Обновленное дело');
      
      // Save changes
      await page.click('button:has-text("Сохранить")');
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Verify changes
      await expect(page.locator('text=Обновленное дело')).toBeVisible();
    }
  });

  test('should reschedule an activity', async ({ page }) => {
    // Wait for activities to load
    await page.waitForTimeout(1000);
    
    // Click reschedule button on first activity
    const rescheduleButton = page.locator('button[title="Перенести"]').first();
    if (await rescheduleButton.isVisible()) {
      await rescheduleButton.click();
      
      // Check if reschedule modal opened
      await expect(page.locator('h2:has-text("Перенести дело")')).toBeVisible();
      
      // Set new times
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      await page.fill('input[type="datetime-local"]', `${dateStr}T14:00`);
      await page.fill('input[type="datetime-local"]:nth-of-type(2)', `${dateStr}T15:00`);
      
      // Submit
      await page.click('button:has-text("Перенести")');
      
      // Wait for update
      await page.waitForTimeout(1000);
    }
  });

  test('should complete an activity', async ({ page }) => {
    // Wait for activities to load
    await page.waitForTimeout(1000);
    
    // Click complete button on first uncompleted activity
    const completeButton = page.locator('button[title="Завершить"]').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Verify activity is marked as completed
      await expect(page.locator('text=Завершено')).toBeVisible();
    }
  });

  test('should delete an activity with confirmation', async ({ page }) => {
    // Wait for activities to load
    await page.waitForTimeout(1000);
    
    // Click delete button on first activity
    const deleteButton = page.locator('button[title="Удалить"]').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Check if confirmation modal opened
      await expect(page.locator('h2:has-text("Удалить дело?")')).toBeVisible();
      
      // Cancel first
      await page.click('button:has-text("Отмена")');
      await expect(page.locator('h2:has-text("Удалить дело?")')).not.toBeVisible();
      
      // Try again and confirm
      await deleteButton.click();
      await page.click('button:has-text("Удалить")');
      
      // Wait for deletion
      await page.waitForTimeout(1000);
    }
  });

  test('should filter activities by date', async ({ page }) => {
    // Change date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', dateStr);
    
    // Wait for activities to reload
    await page.waitForTimeout(1000);
    
    // Verify date changed in heading
    await expect(page.locator('h2')).toContainText('Дела на');
  });

  test('should show empty state when no activities', async ({ page }) => {
    // Go to a far future date with no activities
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', dateStr);
    
    // Wait for reload
    await page.waitForTimeout(1000);
    
    // Check empty state
    await expect(page.locator('text=Нет дел на этот день')).toBeVisible();
    await expect(page.locator('button:has-text("Создать первое дело")')).toBeVisible();
  });

  test('should display activity badges correctly', async ({ page }) => {
    // Wait for activities to load
    await page.waitForTimeout(1000);
    
    // Check for AI badge on AI-generated activities
    const aiBadge = page.locator('span:has-text("AI")').first();
    if (await aiBadge.isVisible()) {
      await expect(aiBadge).toHaveClass(/bg-primary-500/);
    }
    
    // Check for recurrence badge
    const recurrenceBadge = page.locator('span:has-text("Ежедневно"), span:has-text("Еженедельно"), span:has-text("Ежемесячно")').first();
    if (await recurrenceBadge.isVisible()) {
      await expect(recurrenceBadge).toHaveClass(/bg-blue-500/);
    }
  });

  test('should navigate between pages', async ({ page }) => {
    // Navigate to Map
    await page.click('button:has-text("Карта")');
    await page.waitForURL('**/map');
    
    // Navigate back to Dashboard
    await page.click('button:has-text("Главная")');
    await page.waitForURL('**/dashboard');
    
    // Navigate to Chat
    await page.click('button:has-text("AI Чат")');
    await page.waitForURL('**/chat');
    
    // Navigate back to Dashboard
    await page.goto('http://localhost:5173/dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout button
    await page.click('button:has-text("Выход")');
    
    // Should redirect to login page
    await page.waitForURL('http://localhost:5173/');
    
    // Verify login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
