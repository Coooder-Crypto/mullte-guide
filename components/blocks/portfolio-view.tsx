import { MetricCard } from "@/components/ui/flat-primitives";
import { formatCurrency, formatPercent } from "@/lib/format/number";
import type { PortfolioViewData } from "@/lib/types/a2ui";

export function PortfolioView({ data }: { data: PortfolioViewData }) {
  const protocolCount = new Set(data.positions.map((position) => position.protocol)).size;
  const chainCount = new Set(data.positions.map((position) => position.chain)).size;

  return (
    <section className="panel overflow-hidden p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="label-chip">Portfolio View</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-[2rem]">最新持仓</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            交易成功后，页面会直接把最新持仓回拉进工作区，帮助你确认资金已经落到目标协议。
          </p>
        </div>

        <p className="w-full break-all rounded-[10px] border border-black bg-white px-4 py-3 font-mono text-xs text-muted md:w-auto md:max-w-[360px]">
          {data.address}
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <MetricCard label="持仓条目" value={`${data.positions.length}`} />
        <MetricCard label="协议数" value={`${protocolCount}`} />
        <MetricCard label="链数量" value={`${chainCount}`} />
      </div>

      <div className="mt-6 grid gap-3">
        {data.positions.map((position, index) => (
          <article key={`${position.protocol}-${position.asset}-${index}`} className="flat-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-black bg-white text-sm font-semibold text-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="break-words text-xl font-semibold text-ink">{position.asset}</p>
                </div>
                <p className="mt-3 break-words text-sm leading-7 text-muted">
                  {position.protocol} · {position.chain}
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[320px]">
                <MetricCard label="价值" value={formatCurrency(position.amountUsd)} className="bg-[#f4f4f5]" valueClassName="mt-2 text-base" />
                <MetricCard label="APY" value={formatPercent(position.apy)} className="bg-[#f4f4f5]" valueClassName="mt-2 text-base" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
