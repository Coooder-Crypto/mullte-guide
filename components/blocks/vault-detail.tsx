import { formatCurrency, formatPercent } from "@/lib/format/number";
import type { VaultDetailData } from "@/lib/types/a2ui";

export function VaultDetail({ data }: { data: VaultDetailData }) {
  const { vault } = data;

  return (
    <section className="panel p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-chip">Vault Detail</p>
          <h2 className="mt-3 text-2xl font-semibold">{vault.name}</h2>
          <p className="mt-2 text-sm text-muted">{vault.protocol} · {vault.network}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Pill label="总 APY" value={formatPercent(vault.apy)} />
          <Pill label="Base APY" value={formatPercent(vault.apyBase)} />
          <Pill label="Reward APY" value={formatPercent(vault.apyReward)} />
          <Pill label="TVL" value={formatCurrency(vault.tvlUsd)} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[28px] border border-border bg-white/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Why Recommended</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink">
            {data.whyRecommended.map((reason) => (
              <li key={reason} className="rounded-2xl border border-border bg-slate-900/5 px-4 py-3">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] border border-border bg-white/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Protocol Context</p>
          <p className="mt-4 text-sm leading-7 text-muted">{data.protocolInfo}</p>
          {vault.protocolUrl ? (
            <a
              href={vault.protocolUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              查看协议页面
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-border bg-white/80 px-4 py-2">
      <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="ml-2 font-semibold text-ink">{value}</span>
    </div>
  );
}
