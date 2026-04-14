import { DataPill, Eyebrow } from "@/components/ui/flat-primitives";
import { formatCurrency, formatPercent } from "@/lib/format/number";
import type { VaultDetailData } from "@/lib/types/a2ui";

export function VaultDetail({ data }: { data: VaultDetailData }) {
  const { vault } = data;
  const capabilityItems = [
    { label: "交易能力", value: vault.isTransactional ? "支持" : "暂不支持" },
    { label: "赎回能力", value: vault.isRedeemable ? "支持" : "待确认" },
    { label: "风险侧重", value: vault.isStablecoin ? "稳定币收益" : "单资产 / 包装资产" },
  ];

  return (
    <section className="panel overflow-hidden p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="label-chip">Vault Detail</p>
          <h2 className="mt-4 break-words text-2xl font-semibold text-ink sm:text-[2rem]">{vault.name}</h2>
          <p className="mt-3 break-words text-sm leading-7 text-muted">
            {vault.protocol} · {vault.network}
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-3 lg:w-auto">
          <DataPill label="总 APY" value={formatPercent(vault.apy)} />
          <DataPill label="Base APY" value={formatPercent(vault.apyBase)} />
          <DataPill label="Reward APY" value={formatPercent(vault.apyReward)} />
          <DataPill label="TVL" value={formatCurrency(vault.tvlUsd)} />
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <section className="flat-card p-5">
          <Eyebrow>Why This Vault</Eyebrow>
          <div className="mt-4 grid gap-3">
            {data.whyRecommended.map((reason, index) => (
              <article key={reason} className="flat-card-muted px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-black bg-white text-sm font-semibold text-ink">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-ink">{reason}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="flat-card p-5">
            <Eyebrow>Protocol Context</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-muted">{data.protocolInfo}</p>
            <p className="mt-4 text-sm leading-7 text-muted">
              {vault.description ?? "当前推荐主要基于链、资产、收益表现和可执行能力的组合评分。"}
            </p>

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
          </section>

          <section className="flat-card p-5">
            <Eyebrow>Capabilities</Eyebrow>
            <div className="mt-4 grid gap-3">
              {capabilityItems.map((item) => (
                <article key={item.label} className="flat-card-muted px-4 py-4">
                  <Eyebrow className="tracking-[0.2em]">{item.label}</Eyebrow>
                  <p className="mt-2 text-base font-semibold text-ink">{item.value}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {vault.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-ink">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
