# Mullet Guide

Mullet Guide 是一个面向 DeFi 新手与轻度策略用户的 AI-powered A2UI 收益助手。用户用自然语言描述目标，例如“在 Base 上安全地投入 100 USDC”，系统会解析约束、检索 LI.FI Earn Vault、解释推荐理由、生成交易并展示持仓结果。

当前仓库已包含中文项目文档与开发进度规划，适合作为黑客松 MVP 落地基线。

当前代码已落地一个可运行的 Next.js MVP，包含：

- 自然语言目标输入
- 规则解析金额、资产、链、风险偏好
- Earn Vault 拉取、筛选与排序
- A2UI block schema 生成与动态渲染
- 钱包连接
- Composer Quote 代理
- ERC20 授权 + Deposit 交易执行
- Portfolio positions 查询与展示

## 文档入口

- [项目文档](./docs/project-doc.md)
- [进度规划文档](./docs/progress-plan.md)

## MVP 目标

- 自然语言输入收益目标
- 规则解析资产、链、金额、风险偏好
- 接入 `GET /v1/earn/vaults` 获取并筛选 vault
- 用 A2UI JSON schema 驱动前端渲染
- 用户选择 vault 后展示解释与操作卡片
- 接入 `GET /v1/quote` 生成交易
- 连接钱包并执行存款
- 接入 `GET /v1/earn/portfolio/:address/positions` 展示持仓

## 强制技术要求

- 前端：Next.js + TypeScript
- 钱包：wagmi + RainbowKit
- 样式：TailwindCSS
- Earn Data API：`https://earn.li.fi`
- Composer API：`https://li.quest`

## 关键约束

- 必须同时集成 Earn Data API 与 Composer API
- Composer `/quote` 必须使用 `GET`
- `toToken` 必须传入 `vault.address`
- 需要处理 `apy = null`
- 需要处理 `tvl` 为字符串
- 需要处理代币精度差异，例如 `USDC = 6`

## 建议下一步

1. 先阅读 [项目文档](./docs/project-doc.md) 对齐功能边界与目录结构。
2. 按 [进度规划文档](./docs/progress-plan.md) 的 P0/P1 顺序初始化项目。
3. 优先打通“输入目标 -> vault 推荐 -> quote -> 钱包交易 -> portfolio”主链路。

## 本地启动

1. 安装依赖

```bash
pnpm install
```

2. 创建环境变量文件

```bash
cp .env.example .env.local
```

3. 配置以下变量

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
LIFI_API_KEY=your_lifi_api_key
```

4. 启动开发环境

```bash
pnpm dev
```

5. 打开浏览器访问

```text
http://localhost:3000
```

## 常用命令

```bash
pnpm dev
pnpm build
pnpm typecheck
```

## Demo 路径

输入：

```text
invest 100 USDC safely on Base
```

预期流程：

1. 生成 `constraint_card`
2. 加载并排序 Base 上的 USDC Vault
3. 选择目标 vault
4. 渲染 `vault_detail` 与 `action_card`
5. 获取 Composer Quote
6. 如需授权，先执行 ERC20 approve
7. 执行 deposit
8. 拉取并展示 `portfolio_view`

## 已知说明

- `GET /v1/quote` 通过 [app/api/quote/route.ts](/Users/coooder/Code/Web3/mullet-guide/app/api/quote/route.ts) 代理，`LIFI_API_KEY` 未配置时会直接报错。
- Quote 参数构造在 [build-quote-params.ts](/Users/coooder/Code/Web3/mullet-guide/lib/quote/build-quote-params.ts)，其中 `toToken` 固定为 `vault.address`。
- Earn API 通过内部 route 代理，便于统一错误处理。
- RainbowKit / wagmi 在 Next 构建阶段仍会输出少量上游警告，但当前 `pnpm build` 可成功完成。
