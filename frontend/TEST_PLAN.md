# SmartSusChef Frontend 单元测试计划

## 测试环境配置
- ✅ 测试框架: Vitest
- ✅ 测试库: @testing-library/react
- ✅ 断言库: @testing-library/jest-dom
- ✅ 测试环境: jsdom
- ✅ 配置文件: vite.config.ts

## 测试优先级分类

### 🔴 优先级 1 - 核心业务逻辑（必须测试）

#### 1. 工具函数 (Utils) - 纯函数，易于测试
- **`src/app/utils/unitConversion.ts`** ⭐⭐⭐
  - `convertUnit()` - 测试 g→kg, ml→L 转换
  - `formatQuantity()` - 测试格式化输出
  - `getStandardizedQuantity()` - 测试标准化计量单位
  - 边界条件: 0, 负数, 临界值 (999, 1000, 1001)

- **`src/app/utils/recipeCalculations.ts`** ⭐⭐⭐
  - `calculateRecipeWeight()` - 测试递归计算
  - `calculateRecipeCarbonFootprint()` - 测试碳足迹计算
  - `calculateRecipeCost()` - 测试成本计算
  - 边界条件: 空配方, 嵌套配方, 缺失数据

- **`src/app/utils/dateFormat.ts`** ⭐⭐
  - 日期格式化函数
  - 时区处理

- **`src/app/utils/csvValidator.ts`** ⭐⭐
  - CSV 验证逻辑
  - 数据格式校验

#### 2. API 服务 (Services)
- **`src/app/services/api.ts`** ⭐⭐⭐
  - `fetchWithAuth()` - Mock fetch, 测试鉴权逻辑
  - `setAuthToken()` / `getAuthToken()` - 测试 token 管理
  - API 调用函数 - 使用 Mock 测试各个 API 端点
  - 错误处理: 401, 403, 404, 500

#### 3. Context 状态管理
- **`src/app/context/AppContext.tsx`** ⭐⭐
  - Provider 渲染测试
  - 状态更新逻辑
  - Context 值的正确性

---

### 🟡 优先级 2 - UI 组件（推荐测试）

#### 1. 核心页面组件
- **`src/app/components/LoginPage.tsx`** ⭐⭐
  - 表单渲染
  - 输入验证
  - 提交行为
  - 错误提示

- **`src/app/components/RegisterPage.tsx`** ⭐⭐
  - 表单验证逻辑
  - 密码强度检查
  - 注册流程

- **`src/app/components/Dashboard.tsx`** ⭐
  - 基本渲染测试
  - 导航逻辑

#### 2. Dashboard 子组件
- **`src/app/components/dashboard/DataInputForm.tsx`** ⭐⭐
  - 表单输入测试
  - 数据格式化
  
- **`src/app/components/dashboard/SalesInputForm.tsx`** ⭐⭐
- **`src/app/components/dashboard/WastageInputForm.tsx`** ⭐⭐
  - 输入验证
  - 数据提交

- **`src/app/components/dashboard/SalesTrendChart.tsx`** ⭐
- **`src/app/components/dashboard/WastageTrendChart.tsx`** ⭐
- **`src/app/components/dashboard/DistributionPieChart.tsx`** ⭐
  - 测试数据传递
  - 空数据处理

- **`src/app/components/dashboard/PredictionSummary.tsx`** ⭐
- **`src/app/components/dashboard/PredictionDetail.tsx`** ⭐
  - 预测数据展示
  - 计算正确性

#### 3. Management 组件
- **`src/app/components/management/IngredientManagement.tsx`** ⭐⭐
  - CRUD 操作测试
  - 数据验证

- **`src/app/components/management/RecipeManagement.tsx`** ⭐⭐
  - 配方创建/编辑
  - 关联关系处理

- **`src/app/components/management/SalesManagement.tsx`** ⭐
- **`src/app/components/management/WastageManagement.tsx`** ⭐
  - 列表渲染
  - 过滤/排序功能

- **`src/app/components/management/ImportSalesData.tsx`** ⭐
- **`src/app/components/management/ExportData.tsx`** ⭐
  - 文件上传/下载
  - 数据转换

---

### 🟢 优先级 3 - UI 基础组件（可选测试）

`src/app/components/ui/` 目录下的组件大部分是 shadcn/ui 的基础组件，通常由社区维护和测试。可根据需要测试：

- **高交互组件**（如果有自定义逻辑）：
  - `button.tsx`
  - `input.tsx`
  - `select.tsx`
  - `dialog.tsx`
  - `form.tsx`

- **其他基础组件**: 除非有自定义修改，否则不需要测试

---

## 测试文件结构建议

```
frontend/src/
├── app/
│   ├── utils/
│   │   ├── __tests__/
│   │   │   ├── unitConversion.test.ts
│   │   │   ├── recipeCalculations.test.ts
│   │   │   ├── dateFormat.test.ts
│   │   │   └── csvValidator.test.ts
│   ├── services/
│   │   └── __tests__/
│   │       └── api.test.ts
│   ├── context/
│   │   └── __tests__/
│   │       └── AppContext.test.tsx
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── LoginPage.test.tsx
│   │   │   ├── RegisterPage.test.tsx
│   │   │   ├── Dashboard.test.tsx
│   │   │   └── Header.test.tsx
│   │   ├── dashboard/
│   │   │   └── __tests__/
│   │   │       ├── DataInputForm.test.tsx
│   │   │       ├── SalesInputForm.test.tsx
│   │   │       ├── WastageInputForm.test.tsx
│   │   │       ├── SalesTrendChart.test.tsx
│   │   │       ├── PredictionSummary.test.tsx
│   │   │       └── ... (其他 dashboard 组件)
│   │   └── management/
│   │       └── __tests__/
│   │           ├── IngredientManagement.test.tsx
│   │           ├── RecipeManagement.test.tsx
│   │           ├── SalesManagement.test.tsx
│   │           └── ... (其他 management 组件)
└── __mocks__/
    ├── api.ts
    └── localStorage.ts
```

---

## 推荐测试顺序

### 第一阶段: 基础测试 (1-2天)
1. ✅ 配置测试环境 (已完成)
2. ⭐ **工具函数测试**
   - `unitConversion.test.ts`
   - `recipeCalculations.test.ts`
   - `dateFormat.test.ts`
   - `csvValidator.test.ts`

### 第二阶段: 核心业务 (2-3天)
3. ⭐ **API 服务测试**
   - `api.test.ts` (需要 Mock fetch)
4. ⭐ **Context 测试**
   - `AppContext.test.tsx`

### 第三阶段: 关键组件 (3-5天)
5. ⭐ **表单组件**
   - `LoginPage.test.tsx`
   - `RegisterPage.test.tsx`
   - `DataInputForm.test.tsx`
   - `SalesInputForm.test.tsx`
   - `WastageInputForm.test.tsx`

6. ⭐ **管理功能**
   - `IngredientManagement.test.tsx`
   - `RecipeManagement.test.tsx`

### 第四阶段: 补充测试 (按需)
7. **图表和展示组件**
8. **其他页面组件**

---

## 测试覆盖率目标

- **核心业务逻辑**: 90%+ 覆盖率
- **UI 组件**: 70%+ 覆盖率
- **整体项目**: 80%+ 覆盖率

---

## 需要的 Mock 和测试工具

### 1. API Mock
```typescript
// __mocks__/api.ts
export const mockFetch = vi.fn();
global.fetch = mockFetch;
```

### 2. LocalStorage Mock
```typescript
// setupTests.ts 中添加
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

### 3. React Router Mock
如果使用了路由，需要 Mock:
```typescript
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));
```

---

## 运行测试命令

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test -- --coverage

# 运行单个测试文件
npm test -- unitConversion.test.ts

# 监听模式（开发时推荐）
npm test -- --watch

# UI 模式
npm run test -- --ui
```

---

## 测试编写注意事项

1. **遵循 AAA 模式**: Arrange (准备) → Act (执行) → Assert (断言)
2. **测试描述要清晰**: `it('should convert 1500g to 1.5kg')`
3. **边界条件测试**: 测试 0、负数、极大值、null、undefined
4. **隔离测试**: 每个测试要独立，不依赖其他测试
5. **Mock 外部依赖**: API 调用、localStorage、定时器等
6. **用户行为驱动**: 使用 `userEvent` 模拟真实交互
7. **可访问性**: 使用 `getByRole`, `getByLabelText` 而非 `getByTestId`

---

## 预估工作量

| 优先级     | 测试文件数     | 预估时间     |
| ---------- | -------------- | ------------ |
| 🔴 优先级 1 | ~10 个文件     | 3-5 天       |
| 🟡 优先级 2 | ~20 个文件     | 5-8 天       |
| 🟢 优先级 3 | ~10 个文件     | 2-3 天       |
| **总计**   | **~40 个文件** | **10-16 天** |

---

## 下一步行动

1. **立即开始**: 从 `unitConversion.test.ts` 开始编写第一个测试
2. **渐进优化**: 逐步增加测试覆盖率
3. **CI/CD 集成**: 在 GitHub Actions 中运行测试
4. **定期审查**: 每周检查测试覆盖率报告

需要我帮你开始编写任何具体的测试文件吗？
