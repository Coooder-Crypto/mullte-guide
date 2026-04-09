# Mullet Guide 进度规划文档

## 1. 规划目标

本规划面向黑客松 MVP 落地，目标是在最短时间内完成一条可演示、可交互、可发起真实交易的主链路。

优先级原则：

1. 工作流能跑通
2. 真接口能返回
3. UI 能解释清楚
4. 代码结构足够清晰，便于赛后继续扩展

## 2. 交付范围

本次交付包含：

- 中文项目说明文档
- Next.js MVP 项目骨架
- Earn / Composer / Portfolio 接入
- A2UI 动态渲染系统
- 钱包连接与交易执行
- Demo 路径与验收清单

## 3. 建议开发节奏

建议按 2.5 天黑客松节奏推进：

- Day 0.5：项目初始化与基础设施
- Day 1：数据链路与 A2UI 主流程
- Day 2：交易执行、持仓回显、联调与 Demo 打磨

## 4. 任务拆分

## Phase 0：需求冻结与技术初始化

### 目标

建立统一工程底座，避免后续反复返工。

### 任务

- 初始化 Next.js + TypeScript + TailwindCSS
- 安装 wagmi、RainbowKit、viem
- 创建基础目录结构
- 配置 `.env.example`
- 明确链、资产、风险枚举常量

### 产出

- 可启动项目骨架
- 基础 Provider 已接入
- 环境变量模板就绪

### 验收标准

- 本地 `pnpm dev` 可启动
- 页面可正常渲染
- 钱包连接按钮可展示

## Phase 1：数据层接入

### 目标

先打通最核心的数据读取与 quote 代理能力。

### 任务

- 封装 Earn API 客户端
- 实现 `GET /v1/earn/vaults`
- 实现 `GET /v1/earn/portfolio/:address/positions`
- 实现 Next.js `app/api/quote/route.ts`
- 代理 Composer `GET /v1/quote`
- 补充错误处理与超时处理

### 产出

- `lib/api/earn.ts`
- `lib/api/composer.ts`
- `app/api/quote/route.ts`

### 验收标准

- 能在本地打印 vaults 数据
- 能用钱包地址拿到 positions
- 能通过内部 API 拿到 quote 响应

### 风险点

- Composer 参数不足导致 quote 失败
- Earn 返回字段命名与预期不一致

## Phase 2：规则解析与推荐逻辑

### 目标

把自然语言输入转换为可执行约束，并据此筛选 vault。

### 任务

- 实现输入解析器 `parse-goal.ts`
- 实现默认值兜底逻辑
- 实现 vault 数据归一化
- 实现按资产、链、风险的筛选逻辑
- 实现推荐排序逻辑
- 处理 `apy = null`、`tvl = string`、`decimals mismatch`

### 产出

- `lib/agent/parse-goal.ts`
- `lib/vaults/filter-vaults.ts`
- `lib/vaults/rank-vaults.ts`
- `lib/format/amount.ts`

### 验收标准

- 输入 `invest 100 USDC safely on Base` 能得到正确约束
- 能输出前 3 个推荐 vault
- APY 缺失时页面不会报错

## Phase 3：A2UI 渲染系统

### 目标

让前端由 schema 驱动，而不是写死每一步页面。

### 任务

- 定义 `A2UIBlock` 类型
- 实现 `build-blocks.ts`
- 实现 `block-renderer.tsx`
- 实现 5 类 block 组件：
  - `constraint_card`
  - `vault_list`
  - `vault_detail`
  - `action_card`
  - `portfolio_view`

### 产出

- `lib/types/a2ui.ts`
- `lib/agent/build-blocks.ts`
- `components/renderer/block-renderer.tsx`
- `components/blocks/*`

### 验收标准

- 页面能基于 JSON blocks 渲染
- 用户选中 vault 后能追加展示详情与操作卡片
- UI 不依赖路由跳转也可完成主流程

## Phase 4：交易发起与钱包联调

### 目标

把推荐结果转成真实链上操作。

### 任务

- 接入钱包连接状态
- 读取账户地址
- 构造 quote 参数
- 确保 `toToken = vault.address`
- 确保 Composer 使用 `GET`
- 使用 wagmi 发起交易
- 增加交易 loading / success / error 状态

### 产出

- `lib/quote/build-quote-params.ts`
- `components/blocks/action-card.tsx`
- 钱包写链逻辑

### 验收标准

- 点击按钮能请求 quote
- 钱包可弹窗确认交易
- 交易状态在 UI 上可见

## Phase 5：Portfolio 回显与 Demo 打磨

### 目标

在交易完成后回显用户持仓，形成闭环。

### 任务

- 交易成功后刷新 positions
- 渲染 `portfolio_view`
- 补充空状态与错误态
- 优化主流程文案
- 准备演示脚本

### 产出

- `components/blocks/portfolio-view.tsx`
- 主流程闭环 Demo

### 验收标准

- 交易成功后能看到持仓信息
- Demo 从输入到持仓回显无阻塞
- 页面文案与交互足够清晰

## 5. P0 / P1 / P2 优先级

## P0：必须完成

- 自然语言输入
- 规则解析
- Earn vaults 获取
- A2UI block 渲染
- vault 选择
- Composer quote
- 钱包交易
- portfolio positions 展示

## P1：建议完成

- 更好的推荐理由文案
- 更可靠的排序策略
- 更完整的错误处理
- Skeleton / loading 状态

## P2：可选增强

- 多 vault 对比
- 风险标签解释
- 更丰富的链与资产支持
- Demo 数据缓存

## 6. 人员分工建议

如果是 2 到 3 人团队，建议按以下方式拆分：

### 角色 A：前端与 A2UI

- 页面框架
- block renderer
- block 组件
- UI 联调

### 角色 B：协议集成与交易

- Earn API 接入
- Composer quote 代理
- 钱包执行交易
- portfolio 回显

### 角色 C：产品与规则逻辑

- 输入解析
- 推荐排序
- 文案与推荐理由
- Demo 路径梳理

如果只有 1 人，则按 Phase 0 到 Phase 5 顺序串行推进，不建议并行开太多分支。

## 7. 关键里程碑

### 里程碑 1：能拿到 vaults

判断标准：

- 页面输入后能显示解析结果
- 推荐列表来自真实 Earn API

### 里程碑 2：能拿到 quote

判断标准：

- 用户选择 vault 后能成功请求 quote
- 参数满足 `GET` 与 `toToken = vault.address`

### 里程碑 3：能发起真实交易

判断标准：

- 钱包能签名
- 交易状态可见

### 里程碑 4：能展示持仓闭环

判断标准：

- 交易完成后能看到 positions
- Demo 主链路完整

## 8. 风险清单与应对

## 风险 A：真实交易路径不稳定

应对：

- 提前准备测试钱包与测试资产
- quote 失败时保留错误信息，不让页面卡死

## 风险 B：接口字段缺失导致前端崩溃

应对：

- 所有接口响应先做 normalize
- UI 只消费归一化数据

## 风险 C：黑客松时间不足

应对：

- 坚持 P0 优先
- 不做复杂动画与过度美化
- 所有高级能力都放到 P1/P2

## 风险 D：自然语言解析不稳定

应对：

- 坚持规则解析
- 用默认值兜底
- 在 UI 中展示“系统理解为”以便用户确认

## 9. 测试与验收建议

## 功能测试

- 输入不同金额、资产、链是否能正确解析
- `USDC` 6 位精度是否正确转换
- `apy = null` 时是否正常展示
- `tvl` 字符串是否正确格式化
- quote 请求是否始终使用 `GET`

## 回归测试

- 更换 vault 后详情与 action card 是否同步更新
- 钱包断开状态下 CTA 是否正确提示
- portfolio 空状态是否正常显示

## Demo 彩排清单

1. 打开页面并连接钱包
2. 输入 `invest 100 USDC safely on Base`
3. 展示约束卡片与推荐 vault
4. 点击某个 vault 查看详情
5. 点击存入，展示 quote 与钱包交互
6. 交易完成后展示 portfolio

## 10. 完成定义

以下条件全部满足时，可认为项目达到黑客松 MVP 完成标准：

1. Demo 用例可以从输入一直走到 portfolio 回显。
2. 使用了 Earn Data API 与 Composer API。
3. 使用了指定的 3 个必接接口。
4. 满足 `null APY`、`TVL string`、`decimals mismatch` 处理要求。
5. 前端使用 A2UI JSON schema 驱动组件渲染。
6. 工程结构清晰，后续可以继续扩展。
