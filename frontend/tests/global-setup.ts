import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Setting up tests...');
  
  // Get auth token
  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      process.env.TEST_AUTH_TOKEN = data.access_token;
      console.log('✓ Auth token obtained');
    } else {
      console.warn('⚠ Failed to get auth token, tests may fail');
    }
  } catch (error) {
    console.warn('⚠ Could not connect to backend:', error);
  }
  
  // Check if servers are running
  try {
    const frontendCheck = await fetch('http://localhost:5173');
    const backendCheck = await fetch('http://localhost:8000/health');
    
    if (frontendCheck.ok && backendCheck.ok) {
      console.log('✓ Frontend and Backend are running');
    } else {
      console.warn('⚠ Servers may not be running properly');
    }
  } catch (error) {
    console.error('✗ Servers are not accessible');
  }
}

export default globalSetup;
