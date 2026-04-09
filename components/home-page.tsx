"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMemo, useState } from "react";
import { BlockRenderer } from "@/components/renderer/block-renderer";
import { buildBlocks } from "@/lib/agent/build-blocks";
import { parseGoal, suggestPrompt } from "@/lib/agent/parse-goal";
import { fetchEarnVaults } from "@/lib/api/earn";
import type { NormalizedVault, PortfolioViewPosition, UserConstraints } from "@/lib/types/domain";
import { filterVaults } from "@/lib/vaults/filter-vaults";
import { normalizeVault } from "@/lib/vaults/normalize-vault";
import { rankVaults } from "@/lib/vaults/rank-vaults";

const DEFAULT_PROMPT = suggestPrompt();

export function HomePage() {
  const [goalInput, setGoalInput] = useState(DEFAULT_PROMPT);
  const [constraints, setConstraints] = useState<UserConstraints | null>(null);
  const [vaults, setVaults] = useState<NormalizedVault[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [portfolioAddress, setPortfolioAddress] = useState<string | null>(null);
  const [portfolioPositions, setPortfolioPositions] = useState<PortfolioViewPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVault = useMemo(
    () => vaults.find((vault) => vault.id === selectedVaultId) ?? null,
    [selectedVaultId, vaults],
  );

  const blocks = useMemo(
    () =>
      buildBlocks({
        constraints,
        vaults,
        selectedVault,
        portfolioAddress,
        portfolioPositions,
      }),
    [constraints, vaults, selectedVault, portfolioAddress, portfolioPositions],
  );

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    setPortfolioAddress(null);
    setPortfolioPositions([]);

    try {
      const parsedConstraints = parseGoal(goalInput);
      const response = await fetchEarnVaults();
      const normalized = response.data
        .map(normalizeVault)
        .filter((vault): vault is NormalizedVault => Boolean(vault));

      const filtered = filterVaults(normalized, parsedConstraints);
      const ranked = rankVaults(filtered, parsedConstraints).slice(0, 3);

      setConstraints(parsedConstraints);
      setVaults(ranked);
      setSelectedVaultId(ranked[0]?.id ?? null);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "加载 vault 数据失败";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-6 md:px-6 md:py-8">
      <section className="panel overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="label-chip">DeFi Mullet Hackathon MVP</div>
            <h1 className="mt-4 max-w-4xl text-[2.35rem] font-semibold tracking-tight text-ink sm:text-5xl md:mt-5 md:text-6xl">
              Mullet Guide
              <span className="mt-2 block text-lg font-medium text-muted sm:text-xl md:text-2xl">
                AI-powered A2UI DeFi Yield Assistant
              </span>
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base md:mt-5 md:text-lg">
              用自然语言说出你的收益目标，前端会把意图解析成约束卡、vault 列表、解释卡和交易卡。整个体验由 A2UI JSON 驱动，不是写死页面流程。
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-4 lg:items-end">
            <div className="w-full lg:w-auto">
              <ConnectButton />
            </div>
            <div className="rounded-[24px] border border-border bg-white/75 px-4 py-3 text-sm text-muted break-words">
              Demo 推荐输入：<span className="font-mono text-ink">{DEFAULT_PROMPT}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="label-chip">Goal Input</p>
              <h2 className="mt-3 text-xl font-semibold sm:text-2xl">描述你的收益目标</h2>
            </div>
            <p className="max-w-md text-sm text-muted">
              规则解析只处理金额、资产、链与风险偏好，范围小，故意保持简单可控。
            </p>
          </div>

          <textarea
            value={goalInput}
            onChange={(event) => setGoalInput(event.target.value)}
            rows={4}
            className="mt-6 w-full rounded-[24px] border border-border bg-white/80 px-4 py-4 text-base text-ink outline-none transition focus:border-accent sm:px-5"
            placeholder="例如：put 500 USDC into a safe vault on Base above 5% APY"
          />

          <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => void handleAnalyze()}
              disabled={isLoading}
              className="primary-button"
            >
              {isLoading ? "分析并加载中..." : "生成 A2UI 推荐流"}
            </button>
            <button
              type="button"
              onClick={() => setGoalInput(DEFAULT_PROMPT)}
              className="secondary-button"
            >
              填入 Demo Prompt
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-3xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              {error}
            </div>
          ) : null}
        </div>

        <div className="panel p-5 md:p-7">
          <p className="label-chip">A2UI JSON</p>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">当前生成的界面 Schema</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            这个面板用于演示 Agent 并不直接输出静态页面，而是输出 block schema，再由前端 renderer 映射到组件。
          </p>
          <pre className="mt-5 max-h-[380px] overflow-auto rounded-[24px] border border-border bg-slate-950 p-4 text-[11px] leading-6 text-slate-100 whitespace-pre-wrap break-words sm:text-xs sm:whitespace-pre">
            {blocks.length > 0 ? JSON.stringify(blocks, null, 2) : "[]"}
          </pre>
        </div>
      </section>

      <section className="mt-6 pb-10">
        {blocks.length > 0 ? (
          <BlockRenderer
            blocks={blocks}
            selectedVaultId={selectedVaultId}
            onSelectVault={setSelectedVaultId}
            onPortfolioLoaded={(address, positions) => {
              setPortfolioAddress(address);
              setPortfolioPositions(positions);
            }}
          />
        ) : (
          <div className="panel p-6 text-center text-sm text-muted sm:p-8">
            先输入目标并点击“生成 A2UI 推荐流”，系统会生成约束卡、候选 vault 和交易卡片。
          </div>
        )}
      </section>
    </main>
  );
}
