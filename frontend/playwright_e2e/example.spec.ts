import { test, expect } from '@playwright/test';

/**
 * 示例测试 - 验证 Playwright 配置正确
 * 你可以在之后删除这个文件
 */
test('Playwright 配置验证 - 应用能正常加载', async ({ page }) => {
  await page.goto('/');

  // 验证页面加载成功（根据实际页面内容调整）
  await expect(page).toHaveURL(/\//);
});
