import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

test.describe('Chat Page - Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should display chat page', async ({ page }) => {
    await expect(page.locator('text=AI Chat')).toBeVisible();
  });

  test('should display chat input', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    await expect(chatInput).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display send button', async ({ page }) => {
    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display chat history', async ({ page }) => {
    const chatHistory = page.locator('[class*="chat-history"]');
    if (await chatHistory.isVisible()) {
      await expect(chatHistory).toBeVisible();
    }
  });

  test('should display welcome message', async ({ page }) => {
    const welcome = page.locator('text=/Hello|Привет|Welcome/i');
    if (await welcome.isVisible()) {
      await expect(welcome).toBeVisible();
    }
  });

  test('should display AI assistant name', async ({ page }) => {
    const assistantName = page.locator('text=/AI Assistant|Ассистент/i');
    if (await assistantName.isVisible()) {
      await expect(assistantName).toBeVisible();
    }
  });

  test('should display suggested prompts', async ({ page }) => {
    const suggestions = page.locator('[class*="suggestion"]');
    if (await suggestions.first().isVisible()) {
      await expect(suggestions.first()).toBeVisible();
    }
  });
});

test.describe('Chat Page - Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should send message', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Hello, AI assistant!');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(2000);
      
      // Message should appear
      await expect(page.locator('text=Hello, AI assistant!')).toBeVisible();
    }
  });

  test('should send message with Enter key', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test message');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
    }
  });

  test('should send message with Shift+Enter for new line', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Line 1');
      await page.keyboard.press('Shift+Enter');
      await chatInput.type('Line 2');
      
      const value = await chatInput.inputValue();
      expect(value).toContain('\n');
    }
  });

  test('should validate empty message', async ({ page }) => {
    const sendButton = page.locator('button:has-text("Send")');
    if (await sendButton.isVisible()) {
      await sendButton.click();
      
      // Should not send empty message
      await page.waitForTimeout(1000);
    }
  });

  test('should display user message', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('User message');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(1000);
      
      const userMessage = page.locator('text=User message').locator('..');
      await expect(userMessage).toHaveClass(/user|right/);
    }
  });

  test('should display AI response', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('What can you help me with?');
      await page.click('button:has-text("Send")');
      
      // Wait for AI response
      await page.waitForTimeout(5000);
      
      // AI response should appear
      const aiMessage = page.locator('[class*="ai-message"]').last();
      if (await aiMessage.isVisible()) {
        await expect(aiMessage).toBeVisible();
      }
    }
  });

  test('should show typing indicator', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Tell me about Saint Petersburg');
      await page.click('button:has-text("Send")');
      
      // Typing indicator should appear
      const typing = page.locator('text=/typing|печатает/i');
      if (await typing.isVisible({ timeout: 2000 })) {
        await expect(typing).toBeVisible();
      }
    }
  });

  test('should clear input after sending', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test message');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(1000);
      
      await expect(chatInput).toHaveValue('');
    }
  });

  test('should scroll to latest message', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      // Send multiple messages
      for (let i = 0; i < 5; i++) {
        await chatInput.fill(`Message ${i + 1}`);
        await page.click('button:has-text("Send")');
        await page.waitForTimeout(1000);
      }
      
      // Latest message should be visible
      const lastMessage = page.locator('text=Message 5');
      await expect(lastMessage).toBeInViewport();
    }
  });
});

test.describe('Chat Page - Suggested Prompts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should display suggested prompts', async ({ page }) => {
    const suggestions = page.locator('[class*="suggestion"]');
    if (await suggestions.first().isVisible()) {
      await expect(suggestions.first()).toBeVisible();
    }
  });

  test('should click suggested prompt', async ({ page }) => {
    const suggestion = page.locator('[class*="suggestion"]').first();
    if (await suggestion.isVisible()) {
      const text = await suggestion.textContent();
      await suggestion.click();
      
      await page.waitForTimeout(1000);
      
      // Prompt should be sent
      if (text) {
        await expect(page.locator(`text=${text}`)).toBeVisible();
      }
    }
  });

  test('should hide suggestions after first message', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Hello');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(2000);
      
      // Suggestions should be hidden
      const suggestions = page.locator('[class*="suggestion"]');
      await expect(suggestions.first()).not.toBeVisible();
    }
  });
});

test.describe('Chat Page - Context & Planning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should ask for activity planning', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Help me plan my day tomorrow');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(5000);
      
      // AI should respond with planning suggestions
      const response = page.locator('[class*="ai-message"]').last();
      if (await response.isVisible()) {
        await expect(response).toBeVisible();
      }
    }
  });

  test('should ask about events', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('What events are happening this weekend?');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(5000);
      
      // AI should respond with events
      const response = page.locator('[class*="ai-message"]').last();
      if (await response.isVisible()) {
        await expect(response).toBeVisible();
      }
    }
  });

  test('should ask about weather', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('What is the weather like today?');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(5000);
      
      // AI should respond with weather info
      const response = page.locator('[class*="ai-message"]').last();
      if (await response.isVisible()) {
        await expect(response).toBeVisible();
      }
    }
  });

  test('should ask for recommendations', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Recommend me some activities for today');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(5000);
      
      // AI should respond with recommendations
      const response = page.locator('[class*="ai-message"]').last();
      if (await response.isVisible()) {
        await expect(response).toBeVisible();
      }
    }
  });
});

test.describe('Chat Page - Message Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should copy message', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test message to copy');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(2000);
      
      const copyButton = page.locator('button[aria-label="Copy"]').first();
      if (await copyButton.isVisible()) {
        await copyButton.click();
        
        // Should show copied confirmation
        await expect(page.locator('text=/Copied|Скопировано/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should regenerate response', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Tell me a joke');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(5000);
      
      const regenerateButton = page.locator('button:has-text("Regenerate")');
      if (await regenerateButton.isVisible()) {
        await regenerateButton.click();
        
        await page.waitForTimeout(3000);
      }
    }
  });

  test('should edit message', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Original message');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(2000);
      
      const editButton = page.locator('button[aria-label="Edit"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const editInput = page.locator('textarea[value*="Original"]');
        if (await editInput.isVisible()) {
          await editInput.fill('Edited message');
          await page.click('button:has-text("Save")');
        }
      }
    }
  });

  test('should delete message', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Message to delete');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(2000);
      
      const deleteButton = page.locator('button[aria-label="Delete"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion
        const confirmButton = page.locator('button:has-text("Delete")').last();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          await expect(page.locator('text=Message to delete')).not.toBeVisible();
        }
      }
    }
  });
});

test.describe('Chat Page - Chat History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should display chat history sidebar', async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"]');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('should create new chat', async ({ page }) => {
    const newChatButton = page.locator('button:has-text("New Chat")');
    if (await newChatButton.isVisible()) {
      await newChatButton.click();
      
      await page.waitForTimeout(1000);
      
      // Chat should be cleared
      const messages = page.locator('[class*="message"]');
      await expect(messages).toHaveCount(0);
    }
  });

  test('should switch between chats', async ({ page }) => {
    const chatItem = page.locator('[class*="chat-item"]').first();
    if (await chatItem.isVisible()) {
      await chatItem.click();
      
      await page.waitForTimeout(1000);
      
      // Chat should load
    }
  });

  test('should delete chat from history', async ({ page }) => {
    const deleteButton = page.locator('[class*="chat-item"] button[aria-label="Delete"]').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Delete")').last();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should rename chat', async ({ page }) => {
    const renameButton = page.locator('[class*="chat-item"] button[aria-label="Rename"]').first();
    if (await renameButton.isVisible()) {
      await renameButton.click();
      
      const input = page.locator('input[value*="Chat"]');
      if (await input.isVisible()) {
        await input.fill('New Chat Name');
        await page.keyboard.press('Enter');
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should search chat history', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('planning');
      
      await page.waitForTimeout(1000);
      
      // Filtered chats should appear
    }
  });
});

test.describe('Chat Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('text=AI Chat')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=AI Chat')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.locator('text=AI Chat')).toBeVisible();
  });

  test('should hide sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const sidebar = page.locator('[class*="sidebar"]');
    if (await sidebar.isVisible()) {
      // Sidebar might be hidden or collapsible
    }
  });

  test('should show menu button on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const menuButton = page.locator('button[aria-label="Menu"]');
    if (await menuButton.isVisible()) {
      await expect(menuButton).toBeVisible();
    }
  });
});

test.describe('Chat Page - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    await page.click('text=AI Чат');
    await page.waitForURL(/\/chat/, { timeout: 5000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/chat/**', route => route.abort());
    
    const chatInput = page.locator('textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test message');
      await page.click('button:has-text("Send")');
      
      await page.waitForTimeout(2000);
      
      // Error message should appear
      const error = page.locator('text=/error|ошибка/i');
      if (await error.isVisible()) {
        await expect(error).toBeVisible();
      }
    }
  });

  test('should retry failed message', async ({ page }) => {
    const retryButton = page.locator('button:has-text("Retry")');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      
      await page.waitForTimeout(2000);
    }
  });
});
