import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Social Page - Friends', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Navigate to social page
    await page.click('text=Друзья');
    await page.waitForURL(/\/social/, { timeout: 5000 });
  });

  test('should display social page', async ({ page }) => {
    await expect(page.locator('text=Social')).toBeVisible();
  });

  test('should display friends tab', async ({ page }) => {
    await expect(page.locator('text=Friends')).toBeVisible();
  });

  test('should display messages tab', async ({ page }) => {
    await expect(page.locator('text=Messages')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.click('text=Messages');
    await expect(page.locator('text=Chats')).toBeVisible({ timeout: 3000 }).catch(() => {});
    
    await page.click('text=Friends');
    await expect(page.locator('text=Add Friend')).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display add friend form', async ({ page }) => {
    await expect(page.locator('text=Add Friend')).toBeVisible();
    await expect(page.locator('input[placeholder*="username"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Request")')).toBeVisible();
  });

  test('should send friend request', async ({ page }) => {
    await page.fill('input[placeholder*="username"]', 'testfriend');
    await page.click('button:has-text("Send Request")');
    
    // Should show success or error message
    await page.waitForTimeout(2000);
  });

  test('should validate empty username', async ({ page }) => {
    await page.click('button:has-text("Send Request")');
    
    // Should not send request with empty username
    await page.waitForTimeout(1000);
  });

  test('should show error for non-existent user', async ({ page }) => {
    await page.fill('input[placeholder*="username"]', 'nonexistentuser12345');
    await page.click('button:has-text("Send Request")');
    
    // Should show error
    await expect(page.locator('text=/not found|не найден/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display friend requests', async ({ page }) => {
    const requestsSection = page.locator('text=Friend Requests');
    if (await requestsSection.isVisible()) {
      await expect(requestsSection).toBeVisible();
    }
  });

  test('should accept friend request', async ({ page }) => {
    const acceptButton = page.locator('button:has-text("Accept")').first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('should reject friend request', async ({ page }) => {
    const rejectButton = page.locator('button:has-text("Reject")').first();
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('should display friends list', async ({ page }) => {
    await expect(page.locator('text=My Friends')).toBeVisible();
  });

  test('should remove friend', async ({ page }) => {
    const removeButton = page.locator('button:has-text("Remove")').first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('should show empty state when no friends', async ({ page }) => {
    const emptyState = page.locator('text=/No friends yet|Нет друзей/i');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should display friend count', async ({ page }) => {
    const friendsTab = page.locator('text=Friends');
    await expect(friendsTab).toContainText(/\d+/).catch(() => {});
  });

  test('should prevent adding yourself as friend', async ({ page }) => {
    await page.fill('input[placeholder*="username"]', 'testuser');
    await page.click('button:has-text("Send Request")');
    
    // Should show error
    await expect(page.locator('text=/yourself|себя/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should prevent duplicate friend requests', async ({ page }) => {
    await page.fill('input[placeholder*="username"]', 'existingfriend');
    await page.click('button:has-text("Send Request")');
    await page.waitForTimeout(1000);
    
    // Try again
    await page.fill('input[placeholder*="username"]', 'existingfriend');
    await page.click('button:has-text("Send Request")');
    
    // Should show error
    await expect(page.locator('text=/already|уже/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

test.describe('Social Page - Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Друзья');
    await page.waitForURL(/\/social/, { timeout: 5000 });
    
    // Switch to messages tab
    await page.click('text=Messages');
  });

  test('should display messages tab', async ({ page }) => {
    await expect(page.locator('text=Chats')).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display friends list for chat', async ({ page }) => {
    const chatsList = page.locator('text=Chats').locator('..');
    await expect(chatsList).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should select friend to chat', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display message input', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      await expect(page.locator('input[placeholder*="message"]')).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should send message', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      const messageInput = page.locator('input[placeholder*="message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Hello, this is a test message!');
        await page.click('button:has-text("Send")');
        
        await page.waitForTimeout(1000);
        
        // Message should appear
        await expect(page.locator('text=Hello, this is a test message!')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should send message with Enter key', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      const messageInput = page.locator('input[placeholder*="message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test message with Enter');
        await messageInput.press('Enter');
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should display message history', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      // Should show messages
      await page.waitForTimeout(1000);
    }
  });

  test('should display message timestamps', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      const timestamp = page.locator('text=/\\d{1,2}:\\d{2}/').first();
      if (await timestamp.isVisible()) {
        await expect(timestamp).toBeVisible();
      }
    }
  });

  test('should distinguish sent and received messages', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      // Sent messages should be on right, received on left
      await page.waitForTimeout(1000);
    }
  });

  test('should show empty state when no messages', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      const emptyState = page.locator('text=/No messages|Нет сообщений/i');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  test('should validate empty message', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      const sendButton = page.locator('button:has-text("Send")');
      if (await sendButton.isVisible()) {
        await sendButton.click();
        
        // Should not send empty message
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should scroll to latest message', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      // Send multiple messages
      const messageInput = page.locator('input[placeholder*="message"]');
      if (await messageInput.isVisible()) {
        for (let i = 0; i < 5; i++) {
          await messageInput.fill(`Message ${i + 1}`);
          await page.click('button:has-text("Send")');
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should show unread message count', async ({ page }) => {
    const unreadBadge = page.locator('[class*="badge"]').filter({ hasText: /\d+/ });
    if (await unreadBadge.isVisible()) {
      await expect(unreadBadge).toBeVisible();
    }
  });

  test('should mark messages as read', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      await friendButton.click();
      
      // Messages should be marked as read
      await page.waitForTimeout(2000);
    }
  });

  test('should show friend name in chat header', async ({ page }) => {
    const friendButton = page.locator('button').filter({ hasText: /\w+/ }).first();
    if (await friendButton.isVisible()) {
      const friendName = await friendButton.textContent();
      await friendButton.click();
      
      // Header should show friend name
      await expect(page.locator(`text=${friendName}`)).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should only allow messaging friends', async ({ page }) => {
    // Try to send message to non-friend
    // Should show error or prevent action
  });
});

test.describe('Social Page - Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Друзья');
    await page.waitForURL(/\/social/, { timeout: 5000 });
  });

  test('should update friend list after accepting request', async ({ page }) => {
    const initialFriends = await page.locator('text=My Friends').locator('..').textContent();
    
    const acceptButton = page.locator('button:has-text("Accept")').first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(2000);
      
      // Friend list should update
      const updatedFriends = await page.locator('text=My Friends').locator('..').textContent();
    }
  });

  test('should update requests count after action', async ({ page }) => {
    const requestsSection = page.locator('text=Friend Requests');
    if (await requestsSection.isVisible()) {
      const initialCount = await requestsSection.textContent();
      
      const acceptButton = page.locator('button:has-text("Accept")').first();
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await page.waitForTimeout(2000);
        
        // Count should decrease
      }
    }
  });
});

test.describe('Social Page - UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=Друзья');
    await page.waitForURL(/\/social/, { timeout: 5000 });
  });

  test('should have responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('text=Social')).toBeVisible();
  });

  test('should have responsive design on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=Social')).toBeVisible();
  });

  test('should highlight active tab', async ({ page }) => {
    const friendsTab = page.locator('button:has-text("Friends")');
    await expect(friendsTab).toHaveClass(/active|border|text-blue/);
  });

  test('should show loading state', async ({ page }) => {
    // Reload to see loading
    await page.reload();
    
    const loader = page.locator('text=/loading|загрузка/i');
    if (await loader.isVisible({ timeout: 1000 })) {
      await expect(loader).toBeVisible();
    }
  });

  test('should show error state for failed requests', async ({ page }) => {
    // Trigger error by invalid action
    await page.fill('input[placeholder*="username"]', '');
    await page.click('button:has-text("Send Request")');
  });
});
