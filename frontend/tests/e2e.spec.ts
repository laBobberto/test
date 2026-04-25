import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('LifeBalance SPb');
    await expect(page.locator('text=Вход')).toBeVisible();
    await expect(page.locator('text=Регистрация')).toBeVisible();
  });

  test('should switch between login and registration', async ({ page }) => {
    await page.goto('/');
    
    // Click registration tab
    await page.click('text=Регистрация');
    await expect(page.locator('input[placeholder="username"]')).toBeVisible();
    
    // Click login tab
    await page.click('text=Вход');
    await expect(page.locator('input[placeholder="username"]')).not.toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });
});

test.describe('Registration and Onboarding Flow', () => {
  test('should complete full registration flow', async ({ page }) => {
    await page.goto('/');
    
    // Switch to registration
    await page.click('text=Регистрация');
    
    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[type="email"]', `test${timestamp}@example.com`);
    await page.fill('input[placeholder="username"]', `testuser${timestamp}`);
    await page.fill('input[type="password"]', 'TestPassword123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should navigate to onboarding
    await expect(page).toHaveURL(/.*onboarding/);
    await expect(page.locator('h1')).toContainText('Выберите свою роль');
  });

  test('should select roles in onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Select student role
    await page.click('text=Студент');
    
    // Button should be enabled
    const continueButton = page.locator('button:has-text("Продолжить")');
    await expect(continueButton).toBeEnabled();
    
    // Select multiple roles
    await page.click('text=Житель');
    
    // Continue to priorities
    await continueButton.click();
    
    // Should navigate to priorities page
    await expect(page).toHaveURL(/.*priorities/);
  });
});

test.describe('Priorities Configuration', () => {
  test('should display priorities page', async ({ page }) => {
    await page.goto('/priorities');
    
    await expect(page.locator('h1')).toContainText('Настройте приоритеты');
    await expect(page.locator('text=Образование')).toBeVisible();
    await expect(page.locator('text=Карьера')).toBeVisible();
    await expect(page.locator('text=Здоровье')).toBeVisible();
  });

  test('should adjust priority sliders', async ({ page }) => {
    await page.goto('/priorities');
    
    // Find first slider
    const slider = page.locator('input[type="range"]').first();
    
    // Change value
    await slider.fill('30');
    
    // Check if total is displayed
    await expect(page.locator('text=Общая сумма:')).toBeVisible();
  });

  test('should normalize priorities to 100%', async ({ page }) => {
    await page.goto('/priorities');
    
    // Set all sliders to 50 (total will be 300)
    const sliders = page.locator('input[type="range"]');
    const count = await sliders.count();
    
    for (let i = 0; i < count; i++) {
      await sliders.nth(i).fill('50');
    }
    
    // Click normalize button
    await page.click('text=Нормализовать до 100%');
    
    // Total should be 100
    await expect(page.locator('text=100%')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should display dashboard elements', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=LifeBalance SPb')).toBeVisible();
    await expect(page.locator('text=План дня')).toBeVisible();
    await expect(page.locator('text=Быстрые действия')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=Баллы')).toBeVisible();
    await expect(page.locator('text=Стрик')).toBeVisible();
    await expect(page.locator('text=Выполнено')).toBeVisible();
    await expect(page.locator('text=Баланс')).toBeVisible();
  });

  test('should navigate to chat page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=💬 Чат с AI');
    
    await expect(page).toHaveURL(/.*chat/);
    await expect(page.locator('text=AI Ассистент')).toBeVisible();
  });

  test('should navigate to map page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=🗺️ События на карте');
    
    await expect(page).toHaveURL(/.*map/);
    await expect(page.locator('text=Карта событий')).toBeVisible();
  });
});

test.describe('AI Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should display chat interface', async ({ page }) => {
    await page.goto('/chat');
    
    await expect(page.locator('text=AI Ассистент')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Напишите"]')).toBeVisible();
    await expect(page.locator('button:has-text("Отправить")')).toBeVisible();
  });

  test('should display initial greeting message', async ({ page }) => {
    await page.goto('/chat');
    
    await expect(page.locator('text=Привет! Я твой персональный ассистент')).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    await page.goto('/chat');
    
    await expect(page.locator('text=Создай план на сегодня')).toBeVisible();
    await expect(page.locator('text=Какие события сегодня?')).toBeVisible();
  });

  test('should enable send button when text is entered', async ({ page }) => {
    await page.goto('/chat');
    
    const textarea = page.locator('textarea[placeholder*="Напишите"]');
    const sendButton = page.locator('button:has-text("Отправить")');
    
    // Initially disabled
    await expect(sendButton).toBeDisabled();
    
    // Type message
    await textarea.fill('Привет');
    
    // Should be enabled
    await expect(sendButton).toBeEnabled();
  });
});

test.describe('Map Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should display map page', async ({ page }) => {
    await page.goto('/map');
    
    await expect(page.locator('text=Карта событий')).toBeVisible();
    await expect(page.locator('text=События')).toBeVisible();
  });

  test('should display category filters', async ({ page }) => {
    await page.goto('/map');
    
    await expect(page.locator('text=Все')).toBeVisible();
    await expect(page.locator('text=Культура')).toBeVisible();
    await expect(page.locator('text=Спорт')).toBeVisible();
  });

  test('should filter events by category', async ({ page }) => {
    await page.goto('/map');
    
    // Click culture filter
    await page.click('text=Культура');
    
    // Filter button should be highlighted
    const cultureButton = page.locator('button:has-text("Культура")');
    await expect(cultureButton).toHaveClass(/bg-primary-600/);
  });
});

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should display profile page', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('text=Профиль')).toBeVisible();
    await expect(page.locator('text=Приоритеты')).toBeVisible();
    await expect(page.locator('text=Достижения')).toBeVisible();
  });

  test('should display user stats', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('text=Баллов')).toBeVisible();
    await expect(page.locator('text=Дней подряд')).toBeVisible();
    await expect(page.locator('text=Выполнено')).toBeVisible();
  });

  test('should navigate to priorities page', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit priorities
    await page.click('text=Изменить');
    
    await expect(page).toHaveURL(/.*priorities/);
  });

  test('should logout user', async ({ page }) => {
    await page.goto('/profile');
    
    // Click logout
    await page.click('button:has-text("Выйти")');
    
    // Should redirect to login
    await expect(page).toHaveURL('/');
    
    // Token should be removed
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should navigate between pages using header', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to map
    await page.click('text=Карта');
    await expect(page).toHaveURL(/.*map/);
    
    // Navigate to chat
    await page.click('text=AI Чат');
    await expect(page).toHaveURL(/.*chat/);
    
    // Navigate to profile
    await page.click('text=Профиль');
    await expect(page).toHaveURL(/.*profile/);
    
    // Navigate back to dashboard
    await page.click('text=Главная');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should use back button navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Go to chat
    await page.click('text=💬 Чат с AI');
    await expect(page).toHaveURL(/.*chat/);
    
    // Click back button
    await page.click('text=← Назад');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('LifeBalance SPb');
    await expect(page.locator('text=Вход')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('LifeBalance SPb');
  });
});
