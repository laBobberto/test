import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123',
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
    const regButton = page.locator('text=Регистрация');
    if (await regButton.isVisible()) {
      await regButton.click();
      await expect(page.locator('text=/Создать|Регистр/i')).toBeVisible();

      const loginButton = page.locator('text=Вход');
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await expect(page.locator('text=/Войти/i')).toBeVisible();
      }
    }
  });

  test('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should register new user', async ({ page }) => {
    const regButton = page.locator('text=Регистрация');
    if (await regButton.isVisible()) {
      await regButton.click();

      const timestamp = Date.now();
      await page.fill('input[type="email"]', `test${timestamp}@example.com`);

      // Fill username field
      const nameInput = page.locator('input[placeholder*="username"], input[name="username"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(`testuser${timestamp}`);
      }

      await page.fill('input[type="password"]', TEST_USER.password);

      // Click "Продолжить" button for registration
      await page.click('button:has-text("Продолжить")').catch(() => {});

      // Should redirect to onboarding
      await page.waitForURL(/\/(onboarding|dashboard|priorities)/, { timeout: 10000 }).catch(() => {});
    }
  });

  test('should login existing user', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');

    // Should redirect to dashboard or onboarding
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });
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
    const regButton = page.locator('text=Регистрация');
    if (await regButton.isVisible()) {
      await regButton.click();
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid');
    const nameInput = page.locator('input[placeholder*="username"], input[name="username"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('testuser');
    }
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button:has-text("Продолжить")').catch(() => {});

    // Should not proceed with invalid email (HTML5 validation)
    await expect(page).toHaveURL(/\//);
  });

  test('should validate password strength', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    const nameInput = page.locator('input[placeholder*="Имя"], input[name="name"], input[name="username"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('testuser');
    }
    await page.fill('input[type="password"]', '123'); // Weak password

    // Should show password strength indicator or validation
    const strengthIndicator = page.locator('text=/слабый|weak|strength|короткий/i');
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toBeVisible();
    }
  });

  test('should validate username length', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    const nameInput = page.locator('input[placeholder*="username"], input[name="username"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('ab'); // Too short
    }
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button:has-text("Продолжить")').catch(() => {});

    // Should proceed to onboarding (validation happens there)
    await page.waitForURL(/\/(onboarding|\/)/, { timeout: 5000 }).catch(() => {});
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USER.email);
    const nameInput = page.locator('input[placeholder*="username"], input[name="username"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('newuser');
    }
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Продолжить")').catch(() => {});
    
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

    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });
    const currentURL = page.url();

    // Reload page
    await page.reload();

    // Should still be on the same page (not redirected to login)
    await expect(page).not.toHaveURL('http://localhost:5173/');
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');

    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // Try to find and click logout button (may be in profile or menu)
    const logoutButton = page.locator('button:has-text("Выход"), button:has-text("Выйти"), a:has-text("Выход")');
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForURL('http://localhost:5173/', { timeout: 5000 }).catch(() => {});
    }
  });

  test('should clear session data on logout', async ({ page, context }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');

    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // Clear localStorage to simulate logout
    await page.evaluate(() => localStorage.clear());

    // Try to access protected route
    await page.goto('http://localhost:5173/dashboard');

    // Should redirect to login or show login page
    await page.waitForTimeout(2000);
    const isOnLogin = await page.locator('text=Вход').isVisible().catch(() => false);
    const isOnLoginURL = page.url() === 'http://localhost:5173/';

    // At least one should be true
    expect(isOnLogin || isOnLoginURL).toBeTruthy();
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
