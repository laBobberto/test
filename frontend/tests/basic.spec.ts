import { test, expect } from '@playwright/test';

test.describe('Basic Tests - No Server Required', () => {
  test('playwright is configured correctly', async () => {
    expect(true).toBe(true);
  });

  test('test framework is working', async () => {
    const sum = 2 + 2;
    expect(sum).toBe(4);
  });
});
