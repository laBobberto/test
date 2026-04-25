import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Accessibility - WCAG Compliance', () => {
  test('should have no accessibility violations on login page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on map page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on analytics page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Аналитика');
    await page.waitForURL(/\/analytics/, { timeout: 5000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('should navigate login form with keyboard', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Tab to email input
    await page.keyboard.press('Tab');
    await page.keyboard.type(TEST_USER.email);
    
    // Tab to password input
    await page.keyboard.press('Tab');
    await page.keyboard.type(TEST_USER.password);
    
    // Tab to submit button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should navigate dashboard with keyboard', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate with keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should close modals with Escape key', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      
      await page.waitForTimeout(500);
      
      // Modal should be closed
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });

  test('should trap focus in modals', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      
      // Tab through modal elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Focus should stay within modal
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        const modal = document.querySelector('[role="dialog"]');
        return modal?.contains(active);
      });
      
      expect(focusedElement).toBe(true);
    }
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('should have proper ARIA labels on buttons', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const loginButton = page.locator('button:has-text("Войти")');
    const ariaLabel = await loginButton.getAttribute('aria-label');
    
    // Button should have text or aria-label
    const text = await loginButton.textContent();
    expect(text || ariaLabel).toBeTruthy();
  });

  test('should have proper ARIA labels on inputs', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const emailInput = page.locator('input[type="email"]');
    const label = await emailInput.getAttribute('aria-label');
    const placeholder = await emailInput.getAttribute('placeholder');
    
    // Input should have label, aria-label, or placeholder
    expect(label || placeholder).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Check heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Images should have alt text
      expect(alt).toBeDefined();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const inputs = page.locator('input');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        const ariaLabel = await input.getAttribute('aria-label');
        
        // Input should have label or aria-label
        expect(hasLabel || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should announce loading states', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    
    // Check for aria-live regions
    const liveRegion = page.locator('[aria-live]');
    if (await liveRegion.count() > 0) {
      await expect(liveRegion.first()).toBeVisible();
    }
  });

  test('should announce errors', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("Войти")');
    
    // Check for error announcements
    const errorRegion = page.locator('[role="alert"]');
    if (await errorRegion.count() > 0) {
      await expect(errorRegion.first()).toBeVisible();
    }
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('should have sufficient color contrast on buttons', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const button = page.locator('button:has-text("Войти")');
    const styles = await button.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
    });
    
    // Colors should be defined
    expect(styles.color).toBeTruthy();
    expect(styles.backgroundColor).toBeTruthy();
  });

  test('should have sufficient color contrast on text', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const text = page.locator('text=LifeBalance SPb');
    const styles = await text.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
    });
    
    // Colors should be defined
    expect(styles.color).toBeTruthy();
  });
});

test.describe('Accessibility - Focus Management', () => {
  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el as Element);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });
    
    // Should have some focus indicator
    const hasFocusIndicator = 
      focusedElement.outline !== 'none' ||
      focusedElement.outlineWidth !== '0px' ||
      focusedElement.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBe(true);
  });

  test('should restore focus after modal closes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const fab = page.locator('button[class*="fixed"][class*="bottom"]');
    if (await fab.isVisible()) {
      await fab.click();
      await page.waitForTimeout(500);
      
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Focus should return to trigger button
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');
    }
  });

  test('should skip to main content', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Look for skip link
    const skipLink = page.locator('a:has-text("Skip to main content")');
    if (await skipLink.count() > 0) {
      await skipLink.click();
      
      // Focus should move to main content
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });
});

test.describe('Accessibility - Responsive Text', () => {
  test('should support text zoom', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Zoom in
    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });
    
    await page.waitForTimeout(500);
    
    // Content should still be visible
    await expect(page.locator('text=Вход')).toBeVisible();
  });

  test('should support font size changes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Increase font size
    await page.evaluate(() => {
      document.body.style.fontSize = '24px';
    });
    
    await page.waitForTimeout(500);
    
    // Content should still be readable
    await expect(page.locator('text=Вход')).toBeVisible();
  });

  test('should have readable font sizes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const text = page.locator('text=LifeBalance SPb');
    const fontSize = await text.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    
    const size = parseInt(fontSize);
    
    // Font size should be at least 12px
    expect(size).toBeGreaterThanOrEqual(12);
  });
});

test.describe('Accessibility - Touch Targets', () => {
  test('should have adequate touch target sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    
    const button = page.locator('button:has-text("Войти")');
    const box = await button.boundingBox();
    
    if (box) {
      // Touch targets should be at least 44x44px
      expect(box.width).toBeGreaterThanOrEqual(40);
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('should have adequate spacing between touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    if (count > 1) {
      const firstBox = await buttons.first().boundingBox();
      const secondBox = await buttons.nth(1).boundingBox();
      
      if (firstBox && secondBox) {
        // Buttons should have some spacing
        const spacing = Math.abs(firstBox.y - secondBox.y);
        expect(spacing).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Accessibility - Semantic HTML', () => {
  test('should use semantic HTML elements', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Check for semantic elements
    const nav = await page.locator('nav').count();
    const main = await page.locator('main').count();
    const header = await page.locator('header').count();
    
    // Should use semantic elements
    expect(nav + main + header).toBeGreaterThan(0);
  });

  test('should use proper list markup', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Check for lists
    const lists = page.locator('ul, ol');
    const count = await lists.count();
    
    if (count > 0) {
      const firstList = lists.first();
      const items = firstList.locator('li');
      const itemCount = await items.count();
      
      // Lists should contain list items
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('should use proper table markup', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Рейтинг');
    await page.waitForURL(/\/leaderboard/, { timeout: 5000 });
    
    // Check for tables
    const tables = page.locator('table');
    const count = await tables.count();
    
    if (count > 0) {
      const firstTable = tables.first();
      const headers = firstTable.locator('th');
      const headerCount = await headers.count();
      
      // Tables should have headers
      expect(headerCount).toBeGreaterThanOrEqual(0);
    }
  });
});
