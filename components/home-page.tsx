"use client";

import Link from "next/link";
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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-6 md:px-6 md:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-chip">Mullet Guide</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            AI-powered DeFi Yield Assistant
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/about"
            className="secondary-button"
          >
            项目介绍
          </Link>
          <div className="w-full sm:w-auto">
            <ConnectButton />
          </div>
        </div>
      </header>

      <section className="panel p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-chip">Conversation</p>
            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">告诉我你的收益目标</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted">
            直接输入类似“invest 100 USDC safely on Base”，系统会解析约束、筛选 vault、解释推荐，并引导你完成存款。
          </p>
        </div>

        <textarea
          value={goalInput}
          onChange={(event) => setGoalInput(event.target.value)}
          rows={5}
          className="mt-6 w-full rounded-[24px] border border-border bg-white/80 px-4 py-4 text-base text-ink outline-none transition focus:border-accent sm:px-5"
          placeholder="例如：invest 100 USDC safely on Base"
        />

        <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => void handleAnalyze()}
            disabled={isLoading}
            className="primary-button"
          >
            {isLoading ? "分析并加载中..." : "开始分析"}
          </button>
          <button
            type="button"
            onClick={() => setGoalInput(DEFAULT_PROMPT)}
            className="secondary-button"
          >
            使用示例输入
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-3xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            {error}
          </div>
        ) : null}
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
            输入目标后，这里会依次展示约束解析、vault 推荐、交易卡和持仓结果。
          </div>
        )}
      </section>
    </main>
  );
}
