import clsx from "clsx";
import { MetricCard } from "@/components/ui/flat-primitives";
import { formatCurrency, formatPercent } from "@/lib/format/number";
import type { VaultListData } from "@/lib/types/a2ui";

export function VaultList({
  data,
  selectedVaultId,
  onSelectVault,
}: {
  data: VaultListData;
  selectedVaultId?: string | null;
  onSelectVault: (vaultId: string) => void;
}) {
  return (
    <section className="panel overflow-hidden p-6 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="label-chip">Vault List</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-[2rem]">{data.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            优先展示可交易、链和资产最匹配的 vault。稳健模式会进一步提高稳定币暴露和高 TVL 的优先级。
          </p>
        </div>

        <div className="status-pill">
          {data.items.length} 个候选
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {data.items.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-black bg-white p-6 text-sm leading-7 text-muted">
            没有找到可直接推荐的 vault。可以尝试修改资产、链或者风险偏好，再触发一次排序。
          </div>
        ) : (
          data.items.map((vault, index) => {
            const isSelected = selectedVaultId === vault.id;
            const capabilityTags = [
              vault.isTransactional ? "可交易" : "只读",
              vault.isRedeemable ? "可赎回" : "赎回状态待确认",
              vault.isStablecoin ? "稳定币暴露" : "非稳定币策略",
            ];

            return (
              <button
                key={vault.id}
                type="button"
                onClick={() => onSelectVault(vault.id)}
                className={clsx(
                  "rounded-[10px] border border-black p-5 text-left transition sm:p-6",
                  isSelected
                    ? "bg-accentSoft shadow-[10px_10px_0_0_var(--accent)]"
                    : "bg-white hover:bg-slate-50",
                )}
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-black bg-white text-sm font-semibold text-ink">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="break-words text-xl font-semibold text-ink sm:text-2xl">{vault.name}</h3>
                      {isSelected ? <span className="status-pill bg-white text-accentStrong">Selected</span> : null}
                    </div>

                    <p className="mt-3 break-words text-sm leading-7 text-muted">
                      {vault.protocol} · {vault.network} · {vault.underlyingToken.symbol}
                    </p>

                    <p className="mt-3 text-sm leading-7 text-muted">
                      {vault.description ?? "链、资产和执行能力与当前用户意图匹配，适合作为下一步 quote 与交易候选。"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {vault.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-muted">
                          {tag}
                        </span>
                      ))}

                      {capabilityTags.map((tag) => (
                        <span key={tag} className="rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-ink">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:w-[320px]">
                    <MetricCard label="总 APY" value={formatPercent(vault.apy)} valueClassName="mt-2 text-base" />
                    <MetricCard label="TVL" value={formatCurrency(vault.tvlUsd)} valueClassName="mt-2 text-base" />
                    <MetricCard label="底层资产" value={vault.underlyingToken.symbol} valueClassName="mt-2 text-base" />
                    <MetricCard
                      label="状态"
                      value={vault.isTransactional ? "可直接执行" : "仅推荐查看"}
                      valueClassName="mt-2 text-base"
                    />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
