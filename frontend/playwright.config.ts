import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test files directory
  testDir: './playwright_e2e',
  
  // Only match .spec.ts files
  testMatch: '**/*.spec.ts',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Forbid test.only in CI environment
  forbidOnly: !!process.env.CI,
  
  // Retry count on failure
  retries: process.env.CI ? 2 : 0,
  
  // Use single worker for sequential execution
  workers: 1,
  
  // Test reporter - don't auto-open browser to avoid port conflicts
  reporter: [['html', { open: 'never' }]],
  
  // Global configuration
  use: {
    // Base URL - prioritize BASE_URL env var (points to AWS ALB in CI)
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Record trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot settings
    screenshot: 'only-on-failure',
  },

  // Browsers to test
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Auto-start dev server (in CI, BASE_URL points to AWS, no local dev server needed)
  ...(process.env.BASE_URL ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  }),
});
