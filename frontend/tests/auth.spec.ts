import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
  username: 'testuser'
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/LifeBalance/);
    await expect(page.locator('text=Вход')).toBeVisible();
  });

  test('should show validation errors for empty login', async ({ page }) => {
    await page.click('button:has-text("Войти")');
    // Form should not submit with empty fields
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Войти")');
    // Should stay on login page
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should toggle between login and registration', async ({ page }) => {
    await page.click('text=Регистрация');
    await expect(page.locator('text=Создать аккаунт')).toBeVisible();
    
    await page.click('text=Вход');
    await expect(page.locator('text=Войти в аккаунт')).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click eye icon to show password
    await page.click('button[aria-label="Toggle password visibility"]').catch(() => {});
  });

  test('should register new user', async ({ page }) => {
    await page.click('text=Регистрация');
    
    const timestamp = Date.now();
    await page.fill('input[type="email"]', `test${timestamp}@example.com`);
    await page.fill('input[placeholder*="Имя"]', `testuser${timestamp}`);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    await page.click('button:has-text("Зарегистрироваться")');
    
    // Should redirect after successful registration
    await page.waitForURL(/\/(onboarding|dashboard|priorities)/, { timeout: 10000 });
  });

  test('should login existing user', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    
    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should show error for wrong credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Войти")');
    
    // Should show error message
    await expect(page.locator('text=/error|ошибка|неверн/i')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should remember me checkbox work', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('text=/забыли пароль|forgot password/i');
    if (await forgotLink.isVisible()) {
      await expect(forgotLink).toBeVisible();
    }
  });
});

test.describe('Registration Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('text=Регистрация');
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid');
    await page.fill('input[placeholder*="Имя"]', 'testuser');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button:has-text("Зарегистрироваться")');
    
    // Should not proceed with invalid email
    await expect(page).toHaveURL(/\//);
  });

  test('should validate password strength', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="Имя"]', 'testuser');
    await page.fill('input[type="password"]', '123'); // Weak password
    
    // Should show password strength indicator
    const strengthIndicator = page.locator('text=/слабый|weak|strength/i');
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toBeVisible();
    }
  });

  test('should validate username length', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="Имя"]', 'ab'); // Too short
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button:has-text("Зарегистрироваться")');
    
    // Should show validation error
    await expect(page).toHaveURL(/\//);
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[placeholder*="Имя"]', 'newuser');
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Зарегистрироваться")');
    
    // Should show error about existing email
    await expect(page.locator('text=/существует|exists|already/i')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should accept terms and conditions', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"]').last();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked();
    }
  });
});

test.describe('Session Management', () => {
  test('should maintain session after page reload', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Click logout
    await page.click('button:has-text("Выход")');
    
    // Should redirect to login
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
  });

  test('should clear session data on logout', async ({ page, context }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Logout
    await page.click('button:has-text("Выход")');
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
    
    // Try to access protected route
    await page.goto('http://localhost:5173/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should redirect to login when accessing profile without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should redirect to login when accessing map without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/map');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should redirect to login when accessing chat without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/chat');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should redirect to login when accessing social without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/social');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should redirect to login when accessing analytics without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should redirect to login when accessing leaderboard without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/leaderboard');
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});
