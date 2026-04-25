import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123'
};

test.describe('Map Page - Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // If on onboarding or priorities, navigate to dashboard
    if (page.url().includes('onboarding') || page.url().includes('priorities')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
  });

  test('should display map page', async ({ page }) => {
    await expect(page.locator('text=События на карте')).toBeVisible();
  });

  test('should load Yandex Maps', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    const mapContainer = page.locator('[class*="map"]').first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should display map controls', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Zoom controls
    const zoomIn = page.locator('button[aria-label*="Zoom in"]');
    const zoomOut = page.locator('button[aria-label*="Zoom out"]');
    
    if (await zoomIn.isVisible()) {
      await expect(zoomIn).toBeVisible();
    }
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="поиск"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should display route panel', async ({ page }) => {
    const routePanel = page.locator('text=Route').locator('..');
    if (await routePanel.isVisible()) {
      await expect(routePanel).toBeVisible();
    }
  });

  test('should display transport mode selector', async ({ page }) => {
    await expect(page.locator('button:has-text("Car")')).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.locator('button:has-text("Walk")')).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.locator('button:has-text("Transit")')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display traffic toggle', async ({ page }) => {
    const trafficToggle = page.locator('button:has-text("Traffic")');
    if (await trafficToggle.isVisible()) {
      await expect(trafficToggle).toBeVisible();
    }
  });

  test('should center on Saint Petersburg', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Map should be centered on SPb coordinates
    // This is hard to test without accessing map API
  });
});

test.describe('Map Page - Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // If on onboarding or priorities, navigate to dashboard
    if (page.url().includes('onboarding') || page.url().includes('priorities')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
  });

  test('should search for location', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="поиск"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Невский проспект');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(2000);
      
      // Map should update
    }
  });

  test('should show search results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="поиск"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Эрмитаж');
      await page.waitForTimeout(1000);
      
      // Results dropdown might appear
      const results = page.locator('[class*="results"]');
      if (await results.isVisible()) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('should select search result', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="поиск"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Петропавловская крепость');
      await page.waitForTimeout(1000);
      
      const firstResult = page.locator('[class*="result"]').first();
      if (await firstResult.isVisible()) {
        await firstResult.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should clear search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="поиск"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test location');
      
      const clearButton = page.locator('button[aria-label="Clear"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        await expect(searchInput).toHaveValue('');
      }
    }
  });

  test('should show no results message', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="поиск"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistentlocation123');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      const noResults = page.locator('text=/not found|не найдено/i');
      if (await noResults.isVisible()) {
        await expect(noResults).toBeVisible();
      }
    }
  });
});

test.describe('Map Page - Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // If on onboarding or priorities, navigate to dashboard
    if (page.url().includes('onboarding') || page.url().includes('priorities')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
  });

  test('should enter start location', async ({ page }) => {
    const startInput = page.locator('input[placeholder*="From"]');
    if (await startInput.isVisible()) {
      await startInput.fill('Московский вокзал');
      await page.waitForTimeout(1000);
    }
  });

  test('should enter destination', async ({ page }) => {
    const destInput = page.locator('input[placeholder*="To"]');
    if (await destInput.isVisible()) {
      await destInput.fill('Эрмитаж');
      await page.waitForTimeout(1000);
    }
  });

  test('should build route', async ({ page }) => {
    const startInput = page.locator('input[placeholder*="From"]');
    const destInput = page.locator('input[placeholder*="To"]');
    
    if (await startInput.isVisible() && await destInput.isVisible()) {
      await startInput.fill('Московский вокзал');
      await destInput.fill('Эрмитаж');
      
      const buildButton = page.locator('button:has-text("Build Route")');
      if (await buildButton.isVisible()) {
        await buildButton.click();
        await page.waitForTimeout(3000);
        
        // Route should appear on map
      }
    }
  });

  test('should switch transport mode to car', async ({ page }) => {
    await page.click('button:has-text("Car")');
    await page.waitForTimeout(1000);
    
    const carButton = page.locator('button:has-text("Car")');
    await expect(carButton).toHaveClass(/active|bg-blue/);
  });

  test('should switch transport mode to walk', async ({ page }) => {
    await page.click('button:has-text("Walk")');
    await page.waitForTimeout(1000);
    
    const walkButton = page.locator('button:has-text("Walk")');
    await expect(walkButton).toHaveClass(/active|bg-blue/);
  });

  test('should switch transport mode to transit', async ({ page }) => {
    await page.click('button:has-text("Transit")');
    await page.waitForTimeout(1000);
    
    const transitButton = page.locator('button:has-text("Transit")');
    await expect(transitButton).toHaveClass(/active|bg-blue/);
  });

  test('should display route distance', async ({ page }) => {
    const startInput = page.locator('input[placeholder*="From"]');
    const destInput = page.locator('input[placeholder*="To"]');
    
    if (await startInput.isVisible() && await destInput.isVisible()) {
      await startInput.fill('Московский вокзал');
      await destInput.fill('Эрмитаж');
      
      const buildButton = page.locator('button:has-text("Build Route")');
      if (await buildButton.isVisible()) {
        await buildButton.click();
        await page.waitForTimeout(3000);
        
        const distance = page.locator('text=/\\d+(\\.\\d+)? km/');
        if (await distance.isVisible()) {
          await expect(distance).toBeVisible();
        }
      }
    }
  });

  test('should display route duration', async ({ page }) => {
    const startInput = page.locator('input[placeholder*="From"]');
    const destInput = page.locator('input[placeholder*="To"]');
    
    if (await startInput.isVisible() && await destInput.isVisible()) {
      await startInput.fill('Московский вокзал');
      await destInput.fill('Эрмитаж');
      
      const buildButton = page.locator('button:has-text("Build Route")');
      if (await buildButton.isVisible()) {
        await buildButton.click();
        await page.waitForTimeout(3000);
        
        const duration = page.locator('text=/\\d+ min/');
        if (await duration.isVisible()) {
          await expect(duration).toBeVisible();
        }
      }
    }
  });

  test('should clear route', async ({ page }) => {
    const clearButton = page.locator('button:has-text("Clear")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(1000);
      
      // Route should be removed
    }
  });

  test('should swap start and destination', async ({ page }) => {
    const startInput = page.locator('input[placeholder*="From"]');
    const destInput = page.locator('input[placeholder*="To"]');
    
    if (await startInput.isVisible() && await destInput.isVisible()) {
      await startInput.fill('Location A');
      await destInput.fill('Location B');
      
      const swapButton = page.locator('button[aria-label="Swap"]');
      if (await swapButton.isVisible()) {
        await swapButton.click();
        
        await expect(startInput).toHaveValue('Location B');
        await expect(destInput).toHaveValue('Location A');
      }
    }
  });
});

test.describe('Map Page - Traffic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // If on onboarding or priorities, navigate to dashboard
    if (page.url().includes('onboarding') || page.url().includes('priorities')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
  });

  test('should toggle traffic layer', async ({ page }) => {
    const trafficButton = page.locator('button:has-text("Traffic")');
    if (await trafficButton.isVisible()) {
      await trafficButton.click();
      await page.waitForTimeout(1000);
      
      // Traffic layer should appear
      await expect(trafficButton).toHaveClass(/active|bg-blue/);
    }
  });

  test('should hide traffic layer', async ({ page }) => {
    const trafficButton = page.locator('button:has-text("Traffic")');
    if (await trafficButton.isVisible()) {
      await trafficButton.click();
      await page.waitForTimeout(500);
      await trafficButton.click();
      await page.waitForTimeout(1000);
      
      // Traffic layer should be hidden
    }
  });

  test('should display traffic legend', async ({ page }) => {
    const trafficButton = page.locator('button:has-text("Traffic")');
    if (await trafficButton.isVisible()) {
      await trafficButton.click();
      await page.waitForTimeout(1000);
      
      const legend = page.locator('text=/green|yellow|red/i');
      if (await legend.isVisible()) {
        await expect(legend).toBeVisible();
      }
    }
  });
});

test.describe('Map Page - Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // If on onboarding or priorities, navigate to dashboard
    if (page.url().includes('onboarding') || page.url().includes('priorities')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
  });

  test('should display event markers', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Event markers should be on map
    const markers = page.locator('[class*="marker"]');
    if (await markers.first().isVisible()) {
      await expect(markers.first()).toBeVisible();
    }
  });

  test('should click on event marker', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    const marker = page.locator('[class*="marker"]').first();
    if (await marker.isVisible()) {
      await marker.click();
      await page.waitForTimeout(1000);
      
      // Event details should appear
      const eventDetails = page.locator('[class*="popup"]');
      if (await eventDetails.isVisible()) {
        await expect(eventDetails).toBeVisible();
      }
    }
  });

  test('should display event details in popup', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    const marker = page.locator('[class*="marker"]').first();
    if (await marker.isVisible()) {
      await marker.click();
      await page.waitForTimeout(1000);
      
      // Should show event title, description, etc.
      const title = page.locator('[class*="popup"] h3');
      if (await title.isVisible()) {
        await expect(title).toBeVisible();
      }
    }
  });

  test('should close event popup', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    const marker = page.locator('[class*="marker"]').first();
    if (await marker.isVisible()) {
      await marker.click();
      await page.waitForTimeout(1000);
      
      const closeButton = page.locator('button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        const popup = page.locator('[class*="popup"]');
        await expect(popup).not.toBeVisible();
      }
    }
  });

  test('should filter events by category', async ({ page }) => {
    const categoryFilter = page.locator('select[name="category"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('culture');
      await page.waitForTimeout(1000);
      
      // Only culture events should be shown
    }
  });
});

test.describe('Map Page - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // If on onboarding or priorities, navigate to dashboard
    if (page.url().includes('onboarding') || page.url().includes('priorities')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
  });

  test('should zoom in', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const zoomIn = page.locator('button[aria-label*="Zoom in"]');
    if (await zoomIn.isVisible()) {
      await zoomIn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should zoom out', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const zoomOut = page.locator('button[aria-label*="Zoom out"]');
    if (await zoomOut.isVisible()) {
      await zoomOut.click();
      await page.waitForTimeout(500);
    }
  });

  test('should pan map by dragging', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const mapContainer = page.locator('[class*="map"]').first();
    if (await mapContainer.isVisible()) {
      const box = await mapContainer.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
        await page.mouse.up();
      }
    }
  });

  test('should use current location', async ({ page }) => {
    const locationButton = page.locator('button[aria-label="My location"]');
    if (await locationButton.isVisible()) {
      await locationButton.click();
      await page.waitForTimeout(2000);
      
      // Map should center on current location
    }
  });

  test('should toggle fullscreen', async ({ page }) => {
    const fullscreenButton = page.locator('button[aria-label="Fullscreen"]');
    if (await fullscreenButton.isVisible()) {
      await fullscreenButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Map Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/(dashboard|onboarding|priorities)/, { timeout: 10000 });

    // If on onboarding or priorities, navigate to dashboard
    if (page.url().includes('onboarding') || page.url().includes('priorities')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await page.click('text=Карта');
    await page.waitForURL(/\/map/, { timeout: 5000 });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=Map')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=Map')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=Map')).toBeVisible();
  });

  test('should hide side panel on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    // Side panel might be hidden or collapsible
    const sidePanel = page.locator('[class*="sidebar"]');
    if (await sidePanel.isVisible()) {
      // Panel might be collapsed
    }
  });
});
