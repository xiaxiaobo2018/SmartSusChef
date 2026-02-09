# SmartSusChef Ingredient Management - 全局原料功能迁移记录

**更新日期**: 2026年2月9日  
**状态**: 🔄 进行中 - 整个系统已连通，用户登陆问题待调查

---

## 核心需求
将前端的20个默认原料改造为：
1. **全局原料表** (`GlobalIngredients`) — 固定20种，不可编辑（Unit、CarbonFootprint只读）
2. **门店原料表** (`Ingredients`) — 门店可选择引用全局原料或定义自定义原料
3. **API** — 前端加载全局原料列表，保存时传递 `globalIngredientId`

---

## 已完成的工作 ✅

### 1. 数据库改动
- **创建表**: `GlobalIngredients` 包含 20 条种子数据
  - 字段: `Id` (GUID), `Name`, `Unit`, `CarbonFootprint`, `IsDefault`, `CreatedAt`, `UpdatedAt`
  - 已验证库中存在且数据完整（Beef、Butter、Cheese...Tomato）
  
- **修改表**: `Ingredients` 添加 `GlobalIngredientId` 外键
  - 字段: `GlobalIngredientId` (nullable CHAR(36), utf8mb4_unicode_ci)
  - 外键约束: `FK_Ingredients_GlobalIngredients` (ON DELETE SET NULL)
  - 索引: `IX_Ingredients_GlobalIngredientId`
  - **执行方式**: 直接 SQL 操作（避免 EF 迁移冲突）

### 2. 后端代码改动

#### 模型层 (`backend/SmartSusChef.Api/Models/`)
- **GlobalIngredient.cs** (新建)
  ```csharp
  public class GlobalIngredient {
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Unit { get; set; }
    public decimal CarbonFootprint { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
  }
  ```

- **Ingredient.cs** (修改)
  - 添加字段: `public Guid? GlobalIngredientId { get; set; }`
  - 添加导航属性: `public GlobalIngredient? GlobalIngredient { get; set; }`

#### DTO 层 (`backend/SmartSusChef.Api/DTOs/IngredientDtos.cs`)
- **IngredientDto**: 添加 `string? GlobalIngredientId` 字段
- **CreateIngredientRequest**: 添加 `string? GlobalIngredientId = null` 参数
- **UpdateIngredientRequest**: 添加 `string? GlobalIngredientId = null` 参数

#### DbContext 配置 (`backend/SmartSusChef.Api/Data/ApplicationDbContext.cs`)
- 注册: `public DbSet<GlobalIngredient> GlobalIngredients { get; set; }`
- 配置模型: 精度设置、唯一索引、种子数据 (20 条)

#### API 服务层
- **GlobalIngredientService.cs** (新建) — 查询全局原料列表
- **IngredientService.cs** (修改)
  - `CreateAsync()`: 验证 `GlobalIngredientId` 存在，保存引用
  - `UpdateAsync()`: 同上
  - `MapToDto()`: 映射 `GlobalIngredientId` 到 DTO

#### 控制器层
- **GlobalIngredientsController.cs** (新建)
  - `GET /api/globalingredients` — 获取全部全局原料 (允许匿名)
  - `GET /api/globalingredients/{id}` — 获取单条 (允许匿名)

#### 配置
- **launchSettings.json** (修改)
  - 添加环境变量: `ConnectionStrings__DefaultConnection` 指向远程 DB (oversea.zyh111.icu:33333)
  - 确保设计时和运行时都使用正确的连接字符串

### 3. 前端代码改动

#### 类型定义 (`frontend/src/app/types/index.ts`)
- 新增接口:
  ```typescript
  export interface GlobalIngredient {
    id: string;
    name: string;
    unit: string;
    carbonFootprint: number;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  ```
- 修改 `Ingredient`: 添加 `globalIngredientId?: string` 字段

#### API 服务 (`frontend/src/app/services/api.ts`)
- **IngredientDto**: 添加 `globalIngredientId?: string`
- **CreateIngredientRequest**: 添加 `globalIngredientId?: string`
- **UpdateIngredientRequest**: 添加 `globalIngredientId?: string`

#### AppContext 映射 (`frontend/src/app/context/AppContext.tsx`)
- **mapIngredientDto()**: 映射 `globalIngredientId` 字段
- **addIngredient()** / **updateIngredient()**: 传递 `globalIngredientId` 给 API

#### 组件改动 (`frontend/src/app/components/management/IngredientManagement.tsx`)
- **useEffect Hook** (新增): 启动时从 `http://localhost:5001/api/globalingredients` 加载 20 个全局原料
- **下拉列表**: 动态渲染全局原料选项 + "Others" 自定义选项
- **Unit / CarbonFootprint 字段**:
  - 当选中全局原料时: `disabled={true}` + `bg-gray-100` (灰色只读展示)
  - 当选中 "Others" 时: 正常可编辑
- **提交逻辑**: 
  - 全局原料: 传递 `globalIngredientId` + 自动填充的 unit/carbon
  - Others: 传递空 `globalIngredientId` + 用户输入的 unit/carbon

### 4. 编译验证 ✅
- **前端 Build**: `npm run build` ✅ 成功 (无 TypeScript 错误)
- **后端 Build**: `dotnet build` ✅ 成功

---

## 当前系统状态

### 连接验证
- ✅ **数据库**: oversea.zyh111.icu:33333 — 连接正常，表和数据全部就位
- ✅ **后端 API**: localhost:5000/5001 — 已编译，launchSettings.json 已修正
- ✅ **前端**: localhost:5173 — 已编译，可正常启动
- ✅ **API 端点**: `GET /api/globalingredients` — 返回 20 条记录

### 当前问题 🔴
**用户登陆失败**: 前端登陆页面提示 "Invalid credentials"
- **可能原因**:
  1. Users 表结构或数据已改变
  2. 密码哈希算法不匹配
  3. 用户凭证数据库存储有问题
  4. API 认证端点有 bug

**调查计划**:
1. 启动后端，查看登陆 API 的完整错误堆栈
2. 检查 Users 表结构和现有用户数据
3. 验证认证逻辑是否有最近改动

---

## 启动命令 (全新开始)

```powershell
# 1. 清理所有进程
Get-Process | Where-Object { $_.ProcessName -match '(dotnet|node)' } | Stop-Process -Force

# 2. 启动后端 (看报错)
cd "D:\Ph.D\ProjectA_opt\SmartSusChef\backend\SmartSusChef.Api"
dotnet run

# 3. 新终端启动前端
cd "D:\Ph.D\ProjectA_opt\SmartSusChef\frontend"
npm run dev

# 4. 或者用一键启动脚本
.\dev-start.ps1
```

---

## 关键文件位置

| 文件 | 路径 | 用途 |
|------|------|------|
| GlobalIngredient 模型 | `backend/SmartSusChef.Api/Models/GlobalIngredient.cs` | 全局原料数据模型 |
| 修改后的 Ingredient 模型 | `backend/SmartSusChef.Api/Models/Ingredient.cs` | 添加 GlobalIngredientId 外键 |
| DbContext 配置 | `backend/SmartSusChef.Api/Data/ApplicationDbContext.cs` | 注册 DbSet + 种子数据 |
| IngredientManagement 组件 | `frontend/src/app/components/management/IngredientManagement.tsx` | 核心前端改动 |
| 全局原料 DTO | `backend/SmartSusChef.Api/DTOs/IngredientDtos.cs` | API 数据结构 |
| 全局原料服务 | `backend/SmartSusChef.Api/Services/GlobalIngredientService.cs` | 查询全局原料 |
| 全局原料控制器 | `backend/SmartSusChef.Api/Controllers/GlobalIngredientsController.cs` | API 端点 |
| 启动配置 | `backend/SmartSusChef.Api/Properties/launchSettings.json` | 环境变量配置 |
| SQL 脚本 | `database/add_global_ingredient_id_field.sql` | 手工 SQL 改动记录 |

---

## 下一步工作

1. **🔍 调查用户登陆问题**
   - 启动后端查看错误日志
   - 检查 Users 表和认证逻辑

2. **✅ 完整端到端测试**  
   - 成功登陆后，导航到 Ingredient Management
   - 添加原料: 选全局原料，验证 unit/carbon 只读
   - 保存: 检查数据库中是否存储了 `GlobalIngredientId`
   - 编辑: 修改原料，确保全局原料的 unit/carbon 不被覆盖

3. **📝 后端验证逻辑** (可选)
   - 在 IngredientService 中添加校验: 若原料选了全局原料，禁止修改 unit/carbon
   - 返回错误提示若尝试修改

4. **🧪 集成测试** (可选)
   - 添加单元测试验证全局原料逻辑
   - 测试外键约束 (删除全局原料时的级联行为)

---

## 重要笔记
- **连接字符串样本**: `Server=oversea.zyh111.icu;Port=33333;Database=smartsuschef;User Id=grp4;Password=grp4;...`
- **API 基础 URL**: `http://localhost:5001` (或 5000，取决于启动配置)
- **前端地址**: `http://localhost:5173`
- **数据库用户**: grp4 / grp4 (仅用于开发)
- **GlobalIngredients 表**: 20 条固定种子，内容自 DB 客户端查询结果确认
- **EF 迁移问题**: 已通过手工 SQL 绕过，避免迁移与现有库结构冲突

