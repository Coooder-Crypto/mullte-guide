import clsx from "clsx";
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
    <section className="panel p-6 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-chip">Vault List</p>
          <h2 className="mt-3 text-2xl font-semibold">{data.title}</h2>
        </div>
        <p className="max-w-xl text-sm text-muted">优先展示可交易、链和资产最匹配的 vault。稳健模式下会提高稳定币与高 TVL 的权重。</p>
      </div>

      <div className="mt-6 grid gap-4">
        {data.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/60 p-6 text-sm text-muted">
            没有找到可直接推荐的 vault。可以尝试修改资产、链或风险偏好。
          </div>
        ) : (
          data.items.map((vault, index) => {
            const isSelected = selectedVaultId === vault.id;
            return (
              <button
                key={vault.id}
                type="button"
                onClick={() => onSelectVault(vault.id)}
                className={clsx(
                  "rounded-[28px] border p-5 text-left transition",
                  isSelected
                    ? "border-accent bg-accentSoft"
                    : "border-border bg-white/80 hover:border-accent/40 hover:bg-white",
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted">#{index + 1}</span>
                      <h3 className="text-xl font-semibold">{vault.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {vault.protocol} · {vault.network} · {vault.underlyingToken.symbol}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vault.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid min-w-[220px] grid-cols-2 gap-3 text-sm">
                    <Metric label="APY" value={formatPercent(vault.apy)} />
                    <Metric label="TVL" value={formatCurrency(vault.tvlUsd)} />
                    <Metric label="底层资产" value={vault.underlyingToken.symbol} />
                    <Metric label="状态" value={vault.isTransactional ? "可交易" : "只读"} />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white/60 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
