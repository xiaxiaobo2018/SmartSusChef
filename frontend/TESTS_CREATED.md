# Frontend 单元测试 - 已创建文件汇总

## ✅ 已完成的测试文件

### 📁 工具函数测试 (Utils) - 优先级 1

#### 1. `src/app/utils/__tests__/unitConversion.test.ts`
- **测试覆盖**:
  - ✅ `convertUnit()` - 单位转换（g→kg, ml→L）
  - ✅ `formatQuantity()` - 格式化显示
  - ✅ `getStandardizedQuantity()` - 标准化计量
  - ✅ `convertBetweenUnits()` - 单位互转
- **测试用例数**: 50+
- **覆盖场景**: 
  - 正常转换
  - 边界值（0, 999, 1000, 1001）
  - 自定义阈值
  - 未知单位处理

#### 2. `src/app/utils/__tests__/dateFormat.test.ts`
- **测试覆盖**:
  - ✅ `formatSingaporeDate()` - 新加坡日期格式
  - ✅ `formatSingaporeDateTime()` - 带时间的日期
  - ✅ `formatShortDate()` - 短日期格式
  - ✅ `formatDateWithDay()` - 带星期的日期
  - ✅ `formatDateTimeLog()` - 24小时制日志格式
- **测试用例数**: 30+
- **覆盖场景**:
  - Date 对象和 ISO 字符串
  - 12小时与24小时格式
  - 边界日期（年初、年末、闰年）

#### 3. `src/app/utils/__tests__/recipeCalculations.test.ts`
- **测试覆盖**:
  - ✅ `calculateRecipeWeight()` - 配方重量计算
  - ✅ `calculateRecipeCarbon()` - 碳足迹计算
  - ✅ `calculateRecipeCost()` - 成本计算
  - ✅ `getRecipeUnit()` - 获取配方单位
  - ✅ `getRecipeIngredientBreakdown()` - 原料分解
- **测试用例数**: 40+
- **覆盖场景**:
  - 单一原料配方
  - 多原料配方
  - 嵌套子配方（递归）
  - 缺失数据处理
  - 空配方

#### 4. `src/app/utils/__tests__/csvValidator.test.ts`
- **测试覆盖**:
  - ✅ `DATE_FORMATS` - 日期格式验证
  - ✅ `CSVValidator` 类初始化
  - ✅ `validate()` - CSV 数据验证
  - ✅ 日期解析（多种格式）
  - ✅ 数量验证
  - ✅ 菜品名称验证
- **测试用例数**: 35+
- **覆盖场景**:
  - 空文件检测
  - 缺失列检测
  - 日期格式验证
  - 数量验证（负数、非数字）
  - 混合有效/无效行
  - 大量错误汇总

---

### 📁 API 服务测试 - 优先级 1

#### 5. `src/app/services/__tests__/api.test.ts`
- **测试覆盖**:
  - ✅ Token 管理（`setAuthToken`, `getAuthToken`）
  - ✅ `authApi.login()` - 登录
  - ✅ `authApi.register()` - 注册
  - ✅ `authApi.getCurrentUser()` - 获取当前用户
  - ✅ HTTP 错误处理（401, 403, 404, 500）
  - ✅ 网络错误处理
  - ✅ 请求头验证
- **测试用例数**: 30+
- **Mock 工具**:
  - ✅ `global.fetch` mock
  - ✅ `localStorage` mock
- **覆盖场景**:
  - 成功登录/注册
  - 认证失败
  - Token 过期处理
  - 服务器错误
  - 网络故障

---

### 📁 Context 测试 - 优先级 1

#### 6. `src/app/context/__tests__/AppContext.test.tsx`
- **测试覆盖**:
  - ✅ Provider 渲染
  - ✅ `useAppContext` Hook
  - ✅ `login()` - 登录逻辑
  - ✅ `logout()` - 登出逻辑
  - ✅ `register()` - 注册逻辑
  - ✅ 初始状态验证
  - ✅ Context 方法暴露
- **测试用例数**: 20+
- **覆盖场景**:
  - Context 提供和消费
  - 认证流程
  - 状态更新
  - 错误处理
  - Store setup 标志

---

### 📁 核心组件测试 - 优先级 2

#### 7. `src/app/components/__tests__/LoginPage.test.tsx`
- **测试覆盖**:
  - ✅ 表单渲染
  - ✅ 用户输入
  - ✅ 表单提交
  - ✅ 登录成功/失败
  - ✅ 忘记密码流程
  - ✅ 导航功能
  - ✅ 错误显示
  - ✅ Loading 状态
- **测试用例数**: 25+
- **集成测试**:
  - ✅ 与 AppContext 集成
  - ✅ API 调用 mock
  - ✅ Toast 通知 mock

#### 8. `src/app/components/dashboard/__tests__/SalesInputForm.test.tsx`
- **测试覆盖**:
  - ✅ 表单渲染
  - ✅ 配方下拉列表
  - ✅ 表单验证（空值、负数、零）
  - ✅ 添加销售数据
  - ✅ 提交后清空表单
  - ✅ Loading 状态
  - ✅ 最近条目表格
- **测试用例数**: 20+
- **覆盖场景**:
  - 仅显示主菜（过滤子配方）
  - 数量验证
  - 成功提交
  - 空状态

---

## 📊 测试统计

| 类别             | 文件数 | 测试用例数 | 状态       |
| ---------------- | ------ | ---------- | ---------- |
| 工具函数 (Utils) | 4      | ~155       | ✅ 完成     |
| API 服务         | 1      | ~30        | ✅ 完成     |
| Context          | 1      | ~20        | ✅ 完成     |
| 组件             | 2      | ~45        | ✅ 完成     |
| **总计**         | **8**  | **~250**   | ✅ **完成** |

---

## 🚀 如何运行测试

### 运行所有测试
```bash
npm test
```

### 运行单个测试文件
```bash
npm test unitConversion.test.ts
```

### 监听模式（开发推荐）
```bash
npm test -- --watch
```

### 生成覆盖率报告
```bash
npm test -- --coverage
```

### UI 模式
```bash
npm test -- --ui
```

---

## 📝 测试代码示例

### 工具函数测试示例
```typescript
describe('convertUnit', () => {
  it('should convert grams to kilograms at threshold', () => {
    const result = convertUnit(1000, 'g');
    expect(result.quantity).toBe(1);
    expect(result.unit).toBe('kg');
  });
});
```

### API 测试示例（使用 Mock）
```typescript
it('should call login API with credentials', async () => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ token: 'test-token', user: {} }),
  });

  await authApi.login({ username: 'user', password: 'pass' });
  
  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining('/auth/login'),
    expect.objectContaining({ method: 'POST' })
  );
});
```

### 组件测试示例
```typescript
it('should submit form with valid data', async () => {
  render(<LoginPage />);
  
  await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
  await userEvent.type(screen.getByLabelText(/password/i), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  
  expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
});
```

---

## 🎯 下一步建议

### 继续添加的测试文件（按优先级）

#### 优先级 2 - 推荐继续测试
1. **RegisterPage.test.tsx** - 注册页面
2. **WastageInputForm.test.tsx** - 食物浪费录入
3. **IngredientManagement.test.tsx** - 原料管理
4. **RecipeManagement.test.tsx** - 配方管理
5. **ImportSalesData.test.tsx** - 批量数据导入
6. **ExportData.test.tsx** - 数据导出

#### 优先级 3 - 可选测试
- Dashboard 图表组件
- Weather/Calendar 小部件
- 其他显示组件

---

## ✅ 测试最佳实践

1. **AAA 模式**: Arrange → Act → Assert
2. **清晰命名**: `it('should convert grams to kg when >= 1000')`
3. **Mock 外部依赖**: API、localStorage、fetch
4. **测试用户行为**: 使用 `userEvent` 而非 `fireEvent`
5. **可访问性优先**: 使用 `getByRole`, `getByLabelText`
6. **独立测试**: 每个测试互不影响
7. **边界条件**: 测试 0、负数、极值、null、undefined

---

## 🛠️ 已配置的测试工具

- ✅ **Vitest** - 测试运行器
- ✅ **@testing-library/react** - React 组件测试
- ✅ **@testing-library/user-event** - 用户交互模拟
- ✅ **jsdom** - DOM 环境模拟
- ✅ **vi.mock** - Mock 工具

---

## 📖 相关文档

- [TEST_PLAN.md](../TEST_PLAN.md) - 完整测试计划
- [Vitest 文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/)

---

**创建日期**: 2026-02-09  
**状态**: ✅ 第一阶段完成 - 核心测试已创建  
**下一步**: 继续添加优先级 2 的组件测试
