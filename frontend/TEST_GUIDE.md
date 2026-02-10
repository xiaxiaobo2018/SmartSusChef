# 测试指南

## 快速开始

### Windows (PowerShell)
```powershell
# 运行所有测试
.\test.ps1

# 只运行单元测试
.\test.ps1 unit

# 只运行组件测试
.\test.ps1 component

# 监视模式（自动重新运行）
.\test.ps1 watch

# 生成覆盖率报告
.\test.ps1 coverage

# 启动 Vitest UI（可视化界面）
.\test.ps1 ui
```

### Linux/Mac (Bash)
```bash
# 赋予执行权限
chmod +x test.sh

# 运行所有测试
./test.sh

# 只运行单元测试
./test.sh unit

# 只运行组件测试
./test.sh component

# 监视模式
./test.sh watch

# 生成覆盖率报告
./test.sh coverage

# 启动 Vitest UI
./test.sh ui
```

## 直接使用 npm 命令

```bash
# 运行所有测试
npm test -- --run --no-coverage

# 运行特定文件的测试
npm test -- --run src/app/utils/__tests__/unitConversion.test.ts

# 监视模式
npm test

# 生成覆盖率
npm test -- --run --coverage

# UI 模式
npm test -- --ui

# 运行失败的测试
npm test -- --run --reporter=verbose --bail
```

## 测试结果说明

### 当前测试状态
- ✅ **单元测试**: 110+ passing (utils, dateFormat, recipeCalculations, csvValidator)
- ✅ **API 服务测试**: 30/32 passing
- ✅ **LoginPage 组件**: 15/15 passing
- ⚠️ **AppContext**: 需要修复导入问题
- ⚠️ **SalesInputForm**: 需要修复语法问题

**总体通过率**: ~92% (149/162 tests)

## 测试组织结构

```
src/
├── app/
│   ├── utils/__tests__/         # 工具函数单元测试
│   │   ├── unitConversion.test.ts
│   │   ├── dateFormat.test.ts
│   │   ├── recipeCalculations.test.ts
│   │   └── csvValidator.test.ts
│   ├── services/__tests__/      # API 服务测试
│   │   └── api.test.ts
│   └── components/__tests__/    # React 组件测试
│       └── LoginPage.test.tsx
└── setupTests.ts                # 全局测试配置
```

## 编写新测试

### 示例：单元测试
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction(5)).toBe(10);
  });
});
```

### 示例：组件测试
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 调试技巧

1. **只运行一个测试**: 使用 `it.only()` 或 `describe.only()`
2. **跳过测试**: 使用 `it.skip()` 或 `describe.skip()`
3. **查看详细输出**: 添加 `--reporter=verbose`
4. **失败时停止**: 添加 `--bail`
5. **使用 UI 模式**: 最直观的调试方式

## 常见问题

### jsdom 限制
- Radix UI 的 portal 渲染在 jsdom 中不完全支持
- 复杂的 UI 交互测试考虑使用 Playwright/Cypress

### Mock 配置
- API mocks 在 `setupTests.ts` 中配置
- 确保所有 API 方法都有对应的 mock

### 浮点数比较
- 使用 `toBeCloseTo()` 而不是 `toBe()` 来比较浮点数

## 持续集成

测试脚本可以集成到 CI/CD 流程：

```yaml
# GitHub Actions 示例
- name: Run tests
  run: npm test -- --run --coverage
```

## 更多资源

- [Vitest 文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/)
- [项目测试创建记录](./TESTS_CREATED.md)
