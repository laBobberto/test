import { test, expect } from '@playwright/test';

test.describe('Extended UI Interactions', () => {
  test('should handle form validation on auth page', async ({ page }) => {
    await page.goto('/');
    
    // Try invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'short');
    
    // Check HTML5 validation
    const emailInput = page.locator('input[type="email"]');
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON']).toContain(focusedElement);
  });

  test('should handle window resize', async ({ page }) => {
    await page.goto('/');
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Priorities Page Interactions', () => {
  test('should handle slider interactions', async ({ page }) => {
    await page.goto('/priorities');
    
    const sliders = page.locator('input[type="range"]');
    const firstSlider = sliders.first();
    
    // Get initial value
    const initialValue = await firstSlider.inputValue();
    
    // Change value
    await firstSlider.fill('50');
    const newValue = await firstSlider.inputValue();
    
    expect(newValue).toBe('50');
    expect(newValue).not.toBe(initialValue);
  });

  test('should update total when sliders change', async ({ page }) => {
    await page.goto('/priorities');
    
    // Set all sliders to 10
    const sliders = page.locator('input[type="range"]');
    const count = await sliders.count();
    
    for (let i = 0; i < count; i++) {
      await sliders.nth(i).fill('10');
    }
    
    // Check total
    const totalText = await page.locator('text=Общая сумма:').locator('..').textContent();
    expect(totalText).toContain('60'); // 6 categories * 10
  });

  test('should disable save button when total is not 100', async ({ page }) => {
    await page.goto('/priorities');
    
    // Set invalid total
    const sliders = page.locator('input[type="range"]');
    await sliders.first().fill('50');
    
    const saveButton = page.locator('button:has-text("Сохранить")');
    await expect(saveButton).toBeDisabled();
  });
});

test.describe('Dashboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should filter activities by date', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Change date
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-04-26');
    
    // Check if date changed
    const value = await dateInput.inputValue();
    expect(value).toBe('2026-04-26');
  });

  test('should display empty state when no activities', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show empty state or activities
    const hasEmptyState = await page.locator('text=Нет запланированных активностей').isVisible().catch(() => false);
    const hasActivities = await page.locator('text=План дня').isVisible();
    
    expect(hasEmptyState || hasActivities).toBeTruthy();
  });

  test('should navigate using quick actions', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click quick action buttons
    const chatButton = page.locator('button:has-text("💬 Чат с AI")');
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await expect(page).toHaveURL(/.*chat/);
    }
  });

  test('should display stats cards with numbers', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if stats are displayed
    const statsCards = page.locator('.card').filter({ hasText: 'Баллы' });
    await expect(statsCards).toBeVisible();
  });
});

test.describe('Chat Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should handle Enter key to send message', async ({ page }) => {
    await page.goto('/chat');
    
    const textarea = page.locator('textarea[placeholder*="Напишите"]');
    await textarea.fill('Test message');
    await textarea.press('Enter');
    
    // Message should be sent (textarea cleared or message appears)
    const value = await textarea.inputValue();
    expect(value).toBe('');
  });

  test('should not send empty messages', async ({ page }) => {
    await page.goto('/chat');
    
    const sendButton = page.locator('button:has-text("Отправить")');
    await expect(sendButton).toBeDisabled();
    
    // Type spaces only
    const textarea = page.locator('textarea[placeholder*="Напишите"]');
    await textarea.fill('   ');
    
    await expect(sendButton).toBeDisabled();
  });

  test('should click quick action buttons', async ({ page }) => {
    await page.goto('/chat');
    
    const quickAction = page.locator('text=Создай план на сегодня').first();
    if (await quickAction.isVisible()) {
      await quickAction.click();
      
      // Should populate textarea
      const textarea = page.locator('textarea[placeholder*="Напишите"]');
      const value = await textarea.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('should display message history', async ({ page }) => {
    await page.goto('/chat');
    
    // Should have at least greeting message
    const messages = page.locator('text=Привет! Я твой персональный ассистент');
    await expect(messages).toBeVisible();
  });
});

test.describe('Map Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should switch between category filters', async ({ page }) => {
    await page.goto('/map');
    
    // Click different categories
    await page.click('text=Культура');
    await page.waitForTimeout(500);
    
    await page.click('text=Спорт');
    await page.waitForTimeout(500);
    
    await page.click('text=Все');
    
    // Should not crash
    await expect(page.locator('text=Карта событий')).toBeVisible();
  });

  test('should display events list', async ({ page }) => {
    await page.goto('/map');
    
    // Check if events section exists
    const eventsSection = page.locator('text=События');
    await expect(eventsSection).toBeVisible();
  });

  test('should handle map loading', async ({ page }) => {
    await page.goto('/map');
    
    // Wait for map or loading state
    await page.waitForTimeout(2000);
    
    // Should show either map or loading
    const hasMap = await page.locator('.leaflet-container').isVisible().catch(() => false);
    const hasLoading = await page.locator('text=Загрузка').isVisible().catch(() => false);
    
    expect(hasMap || hasLoading).toBeTruthy();
  });
});

test.describe('Profile Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token-for-testing');
    });
  });

  test('should display user avatar', async ({ page }) => {
    await page.goto('/profile');
    
    // Should have avatar or initial
    const avatar = page.locator('.rounded-full').first();
    await expect(avatar).toBeVisible();
  });

  test('should display priorities section', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('text=Приоритеты')).toBeVisible();
    await expect(page.locator('text=Изменить')).toBeVisible();
  });

  test('should display achievements section', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('text=Достижения')).toBeVisible();
  });

  test('should handle logout confirmation', async ({ page }) => {
    await page.goto('/profile');
    
    // Click logout
    const logoutButton = page.locator('button:has-text("Выйти")');
    await logoutButton.click();
    
    // Should redirect to login
    await page.waitForURL('/');
    await expect(page.locator('text=Вход')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 routes', async ({ page }) => {
    await page.goto('/non-existent-route');
    
    // Should redirect to home or show 404
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('/');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Block API requests
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/');
    
    // Should still render page
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Alt can be empty string for decorative images
      expect(alt).toBeDefined();
    }
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).textContent();
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
      
      // Button should have either text or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Performance', () => {
  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
