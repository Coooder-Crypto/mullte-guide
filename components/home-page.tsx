"use client";

import { type KeyboardEvent, useMemo, useState } from "react";
import { BlockRenderer } from "@/components/renderer/block-renderer";
import { SiteHeader } from "@/components/site-header";
import { buildBlocks } from "@/lib/agent/build-blocks";
import { parseGoal, suggestPrompt } from "@/lib/agent/parse-goal";
import { fetchEarnVaults } from "@/lib/api/earn";
import type { NormalizedVault, PortfolioViewPosition, UserConstraints } from "@/lib/types/domain";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { filterVaults } from "@/lib/vaults/filter-vaults";
import { normalizeVault } from "@/lib/vaults/normalize-vault";
import { rankVaults } from "@/lib/vaults/rank-vaults";

const DEFAULT_PROMPT = suggestPrompt();
const QUICK_PROMPTS = [
  DEFAULT_PROMPT,
  "deploy 250 USDC on Base with balanced risk",
  "park 1 ETH safely on Arbitrum",
];

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
      content: "描述你的收益目标，例如：invest 100 USDC safely on Base。",
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
              ? `已理解为 ${parsedConstraints.amount} ${parsedConstraints.asset} on ${parsedConstraints.chain}，风险偏好 ${riskLabel(parsedConstraints.riskPreference)}。`
              : `已理解为 ${parsedConstraints.amount} ${parsedConstraints.asset} on ${parsedConstraints.chain}，但当前没有找到合适的候选 vault。`,
        },
      ]);
    } catch (unknownError) {
      const message = getErrorMessage(unknownError, "加载 vault 数据失败");
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

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleAnalyze();
    }
  }

  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="panel flex min-h-[calc(100vh-10rem)] flex-col overflow-hidden">
        <div className="border-b border-border/80 px-5 py-5 md:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-chip">Chat</p>
              <h1 className="mt-4 text-2xl font-semibold text-ink sm:text-[2rem]">说出你的收益目标</h1>
            </div>
            <p className="text-sm text-muted">Ctrl / Cmd + Enter 发送</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-auto bg-[#fcfcfc] px-4 py-5 md:px-6">
            {messages.map((message) => (
              <ChatBubble key={message.id} role={message.role} content={message.content} />
            ))}

            {isLoading ? <LoadingBubble /> : null}

            {error ? (
              <div className="rounded-[10px] border border-orange-500 bg-[#fff7ed] px-4 py-4 text-sm text-orange-900">
                {error}
              </div>
            ) : null}

            {hasWorkspace ? (
              <section className="rounded-[10px] border border-black bg-white p-3 shadow-[10px_10px_0_0_var(--accent-soft)] sm:p-4">
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
            ) : isLoading ? (
              <WorkspaceSkeleton />
            ) : (
              <section className="surface-card border-dashed px-5 py-6 text-sm leading-7 text-muted">
                发送目标后，这里会展开可执行工作区。
              </section>
            )}
          </div>

          <div className="border-t border-border/80 bg-[#f4f4f5] px-4 py-4 md:px-6">
            <div className="composer-shell">
              <label htmlFor="goal-input" className="block text-sm font-medium text-ink">
                收益目标
              </label>
              <textarea
                id="goal-input"
                value={goalInput}
                onChange={(event) => setGoalInput(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                rows={4}
                className="mt-3 min-h-[120px] w-full resize-none rounded-[8px] border border-black bg-white px-3 py-3 text-base leading-7 text-ink"
                placeholder="Type your yield goal..."
              />

              <div className="soft-divider mt-4" />

              <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setGoalInput(prompt)}
                      disabled={isLoading}
                      className="prompt-pill"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setGoalInput(DEFAULT_PROMPT)}
                    disabled={isLoading}
                    className="secondary-button"
                  >
                    Use Demo Prompt
                  </button>

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
        className={`max-w-[94%] rounded-[10px] border px-4 py-4 text-sm leading-7 sm:max-w-[82%] ${
          isUser
            ? "border-black bg-black text-white shadow-[10px_10px_0_0_rgba(24,24,27,0.12)]"
            : "border-black bg-white text-ink shadow-[10px_10px_0_0_var(--accent-soft)]"
        }`}
      >
        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${isUser ? "text-white/72" : "text-muted"}`}>
          {isUser ? "You" : "Mullet Guide"}
        </p>
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="flat-card max-w-[94%] px-4 py-4 shadow-[10px_10px_0_0_var(--accent-soft)] sm:max-w-[82%]">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Mullet Guide</p>
        <div className="space-y-2">
          <div className="skeleton-block h-4 w-40" />
          <div className="skeleton-block h-4 w-56" />
          <div className="skeleton-block h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <section className="surface-card border-dashed">
      <div className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <article key={item} className="flat-card p-4">
            <div className="space-y-3">
              <div className="skeleton-block h-3 w-20" />
              <div className="skeleton-block h-6 w-32" />
              <div className="skeleton-block h-4 w-full" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function riskLabel(risk: UserConstraints["riskPreference"]) {
  if (risk === "safe") return "稳健";
  if (risk === "aggressive") return "进取";
  return "平衡";
}
