import { formatCurrency, formatPercent } from "@/lib/format/number";
import type { PortfolioViewData } from "@/lib/types/a2ui";

export function PortfolioView({ data }: { data: PortfolioViewData }) {
  return (
    <section className="panel p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-chip">Portfolio View</p>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">最新持仓</h2>
        </div>
        <p className="w-full break-all font-mono text-xs text-muted md:w-auto md:text-right">{data.address}</p>
      </div>

      <div className="mt-6 grid gap-3">
        {data.positions.map((position, index) => (
          <div key={`${position.protocol}-${position.asset}-${index}`} className="rounded-[24px] border border-border bg-white/80 p-4 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">{position.asset}</p>
                <p className="mt-1 break-words text-sm text-muted">{position.protocol} · {position.chain}</p>
              </div>
              <div className="grid w-full grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:min-w-[260px] md:w-auto">
                <Metric label="价值" value={formatCurrency(position.amountUsd)} />
                <Metric label="APY" value={formatPercent(position.apy)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-900/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
