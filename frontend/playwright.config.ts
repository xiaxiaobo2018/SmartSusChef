import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试文件目录
  testDir: './playwright_e2e',
  
  // 并行运行测试
  fullyParallel: true,
  
  // CI 环境下禁止 test.only
  forbidOnly: !!process.env.CI,
  
  // 失败重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 并行 worker 数量
  workers: process.env.CI ? 1 : undefined,
  
  // 测试报告
  reporter: 'html',
  
  // 全局配置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:5173',
    
    // 失败时记录 trace
    trace: 'on-first-retry',
    
    // 截图设置
    screenshot: 'only-on-failure',
  },

  // 测试的浏览器
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 自动启动开发服务器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
