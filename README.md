# Mullet Guide

Mullet Guide 是一个面向 DeFi 新手与轻度策略用户的 AI-powered A2UI 收益助手。用户用自然语言描述目标，例如“在 Base 上安全地投入 100 USDC”，系统会解析约束、检索 LI.FI Earn Vault、解释推荐理由、生成交易并展示持仓结果。

当前仓库已包含中文项目文档与开发进度规划，适合作为黑客松 MVP 落地基线。

当前代码已落地一个可运行的 Next.js MVP，包含：

- 自然语言目标输入
- 服务端 LLM 解析金额、资产、链、风险偏好
- Earn Vault 拉取、筛选与排序
- A2UI block schema 生成与动态渲染
- 钱包连接
- Composer Quote 代理
- ERC20 授权 + Deposit 交易执行
- Portfolio positions 查询与展示

## 当前架构

当前实现不是让前端直接调用模型，也不是让模型直接生成任意页面。实际链路是：

1. 前端把用户输入提交到 `/api/agent/analyze`
2. 服务端拉取 LI.FI Earn vault，并把候选列表连同用户目标一起发给 SiliconFlow `zai-org/GLM-5.1`
3. 模型通过函数调用返回结构化规划结果：约束、推荐 vault 顺序、推荐理由、协议说明
4. 前端继续使用现有 A2UI block renderer 渲染 `constraint_card`、`vault_list`、`vault_detail`、`action_card`
5. 交易执行、授权、portfolio 回拉仍然走真实链上流程，不经过 LLM

因此，LLM 现在负责“理解和规划”，不负责“直接发交易”。

## 文档入口

- [项目文档](./docs/project-doc.md)
- [进度规划文档](./docs/progress-plan.md)

## MVP 目标

- 自然语言输入收益目标
- 服务端 LLM 解析资产、链、金额、风险偏好
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
SILICONFLOW_API_KEY=your_siliconflow_api_key
SILICONFLOW_MODEL=zai-org/GLM-5.1
ETHEREUM_RPC_URL=your_mainnet_rpc_url
BASE_RPC_URL=your_base_rpc_url
ARBITRUM_RPC_URL=your_arbitrum_rpc_url
OPTIMISM_RPC_URL=your_optimism_rpc_url
POLYGON_RPC_URL=your_polygon_rpc_url
```

说明：

- `SILICONFLOW_API_KEY` 仅服务端使用，前端不会直接暴露
- `SILICONFLOW_MODEL` 默认就是 `zai-org/GLM-5.1`，通常不需要改
- 五个 `*_RPC_URL` 是可选的；不配时会回退到 `viem/chains` 的默认 RPC
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 会暴露到浏览器，因此必须使用公开的 WalletConnect Project ID

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
2. 服务端调用 GLM-5.1 解析意图并挑选候选 vault
3. 渲染 `vault_list`
4. 选择目标 vault，渲染 `vault_detail` 与 `action_card`
5. 获取 Composer Quote
6. 如需授权，先执行 ERC20 approve
7. 执行 deposit
8. 拉取并展示 `portfolio_view`

## 关键文件

- `app/api/agent/analyze/route.ts`
  服务端 A2UI 规划入口
- `lib/agent/analyze-goal.ts`
  LLM 提示词、函数调用 schema、候选 vault 选择与回退逻辑
- `components/home-page.tsx`
  首页会话流与工作区状态管理
- `lib/agent/build-blocks.ts`
  A2UI block 组装逻辑
- `components/blocks/action-card.tsx`
  Quote、授权、切链、交易与 portfolio 回拉
- `app/api/rpc/[chainId]/route.ts`
  同源 RPC 代理，避免浏览器直连第三方 RPC 时出现 CORS 问题

## 已知说明

- `GET /v1/quote` 通过 [app/api/quote/route.ts](/Users/coooder/Code/Web3/mullet-guide/app/api/quote/route.ts) 代理，`LIFI_API_KEY` 未配置时会直接报错。
- 首页目标分析通过 [app/api/agent/analyze/route.ts](/Users/coooder/Code/Web3/mullet-guide/app/api/agent/analyze/route.ts) 调用 SiliconFlow `zai-org/GLM-5.1`，`SILICONFLOW_API_KEY` 未配置时会自动回退到规则解析。
- Quote 参数构造在 [build-quote-params.ts](/Users/coooder/Code/Web3/mullet-guide/lib/quote/build-quote-params.ts)，其中 `toToken` 固定为 `vault.address`。
- Earn API 通过内部 route 代理，便于统一错误处理。
- 浏览器侧 wagmi public client 走 [app/api/rpc/[chainId]/route.ts](/Users/coooder/Code/Web3/mullet-guide/app/api/rpc/[chainId]/route.ts)，避免默认第三方 RPC 的 CORS 问题。
- RainbowKit / wagmi 在 Next 构建阶段仍会输出少量上游警告，但当前 `pnpm build` 可成功完成。
