import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试文件目录
  testDir: './playwright_e2e',
  
  // 只匹配 .spec.ts 文件
  testMatch: '**/*.spec.ts',
  
  // 并行运行测试
  fullyParallel: true,
  
  // CI 环境下禁止 test.only
  forbidOnly: !!process.env.CI,
  
  // 失败重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 使用单 worker 串行运行，避免多窗口同时弹出
  workers: 1,
  
  // 测试报告 - CI 环境不自动打开，本地环境自动打开
  reporter: [['html', { open: process.env.CI ? 'never' : 'on-failure' }]],
  
  // 报告输出目录（每次运行会覆盖）
  outputDir: 'test-results',
  
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
