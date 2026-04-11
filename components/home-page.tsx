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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function HomePage() {
  const [goalInput, setGoalInput] = useState("");
  const [constraints, setConstraints] = useState<UserConstraints | null>(null);
  const [vaults, setVaults] = useState<NormalizedVault[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [portfolioAddress, setPortfolioAddress] = useState<string | null>(null);
  const [portfolioPositions, setPortfolioPositions] = useState<PortfolioViewPosition[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "描述你的收益目标，例如：invest 100 USDC safely on Base。我会先理解约束，再弹出对应的 A2UI 工作区。",
    },
  ]);
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

  const hasWorkspace = blocks.length > 0;

  async function handleAnalyze() {
    const trimmed = goalInput.trim() || DEFAULT_PROMPT;

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      },
    ]);

    setIsLoading(true);
    setError(null);
    setPortfolioAddress(null);
    setPortfolioPositions([]);

    try {
      const parsedConstraints = parseGoal(trimmed);
      const response = await fetchEarnVaults();
      const normalized = response.data
        .map(normalizeVault)
        .filter((vault): vault is NormalizedVault => Boolean(vault));

      const filtered = filterVaults(normalized, parsedConstraints);
      const ranked = rankVaults(filtered, parsedConstraints).slice(0, 3);

      setConstraints(parsedConstraints);
      setVaults(ranked);
      setSelectedVaultId(ranked[0]?.id ?? null);
      setGoalInput("");
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            ranked.length > 0
              ? `已理解为 ${parsedConstraints.amount} ${parsedConstraints.asset} on ${parsedConstraints.chain}，风险偏好 ${riskLabel(parsedConstraints.riskPreference)}。下面弹出候选 vault 和执行工作区。`
              : `已理解为 ${parsedConstraints.amount} ${parsedConstraints.asset} on ${parsedConstraints.chain}，但当前没有找到合适的候选 vault。`,
        },
      ]);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "加载 vault 数据失败";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: `请求失败：${message}`,
        },
      ]);
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
            Chat-first A2UI Yield Assistant
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/about" className="secondary-button">
            About
          </Link>
          <Link href="/studio" className="secondary-button">
            Studio
          </Link>
          <div className="w-full sm:w-auto">
            <ConnectButton />
          </div>
        </div>
      </header>

      <section className="panel flex min-h-[72vh] flex-1 flex-col overflow-hidden">
        <div className="border-b border-border px-5 py-4 md:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label-chip">Conversation</p>
              <h2 className="mt-3 text-xl font-semibold sm:text-2xl">先对话，再弹出操作界面</h2>
            </div>
            <div className="rounded-full border border-border bg-white/80 px-4 py-2 text-xs text-muted">
              示例：{DEFAULT_PROMPT}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-auto px-4 py-5 md:px-6">
            {messages.map((message) => (
              <ChatBubble key={message.id} role={message.role} content={message.content} />
            ))}

            {error ? (
              <div className="rounded-3xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                {error}
              </div>
            ) : null}

            {hasWorkspace ? (
              <section className="rounded-[28px] border border-border bg-white/75 p-3 shadow-panel sm:p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="label-chip">A2UI Workspace</p>
                    <h3 className="mt-3 text-lg font-semibold sm:text-xl">已根据对话生成可执行界面</h3>
                  </div>
                  <p className="max-w-md text-sm text-muted">
                    这里不再是首页说明区，而是对话结果直接展开的操作工作区。
                  </p>
                </div>

                <BlockRenderer
                  blocks={blocks}
                  selectedVaultId={selectedVaultId}
                  onSelectVault={setSelectedVaultId}
                  onPortfolioLoaded={(address, positions) => {
                    setPortfolioAddress(address);
                    setPortfolioPositions(positions);
                  }}
                />
              </section>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border bg-white/50 px-5 py-6 text-sm text-muted">
                还没有生成 A2UI 工作区。发送一条收益目标后，这里会自动展开约束卡、vault 列表、详情卡和交易卡。
              </div>
            )}
          </div>

          <div className="border-t border-border bg-white/50 px-4 py-4 md:px-6">
            <div className="rounded-[28px] border border-border bg-white/85 p-3 sm:p-4">
              <textarea
                value={goalInput}
                onChange={(event) => setGoalInput(event.target.value)}
                rows={3}
                className="w-full resize-none bg-transparent text-base text-ink outline-none"
                placeholder="Type your yield goal..."
              />
              <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setGoalInput(DEFAULT_PROMPT)} className="secondary-button">
                    Use Demo Prompt
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void handleAnalyze()}
                  disabled={isLoading}
                  className="primary-button"
                >
                  {isLoading ? "Thinking..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-[28px] px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${
          isUser
            ? "bg-accent text-white"
            : "border border-border bg-white/80 text-ink"
        }`}
      >
        <p className={`mb-1 text-[10px] uppercase tracking-[0.18em] ${isUser ? "text-white/70" : "text-muted"}`}>
          {isUser ? "You" : "Mullet Guide"}
        </p>
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}

function riskLabel(risk: UserConstraints["riskPreference"]) {
  if (risk === "safe") return "稳健";
  if (risk === "aggressive") return "进取";
  return "平衡";
}
