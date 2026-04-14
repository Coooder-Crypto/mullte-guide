import type { ConstraintCardData } from "@/lib/types/a2ui";

const riskMap = {
  safe: "稳健",
  moderate: "平衡",
  aggressive: "进取",
} as const;

export function ConstraintCard({ data }: { data: ConstraintCardData }) {
  return (
    <section className="panel overflow-hidden p-6 md:p-7">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        <div>
          <p className="label-chip">Constraint Card</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-[2rem]">
            系统已经把你的收益目标压成执行参数
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            后续的筛选、解释和交易动作都围绕这一张卡展开，先把自然语言变成稳定可执行的约束。
          </p>
        </div>

        <div className="rounded-[10px] border border-black bg-signalSoft p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Original Intent</p>
          <p className="mt-4 text-sm leading-7 text-ink">{data.rawInput}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCell label="资产" value={data.asset} description="输入被识别为主要投入资产" />
        <InfoCell label="目标链" value={data.chain} description="后续只优先展示这条链上的机会" />
        <InfoCell label="金额" value={`${data.amount} ${data.asset}`} description="用于 quote 与仓位展示的参考规模" />
        <InfoCell label="风险偏好" value={riskMap[data.riskPreference]} description="会影响稳定币、TVL 与收益权重" />
      </div>
    </section>
  );
}

function InfoCell({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <article className="metric-tile">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-3 break-words text-xl font-semibold text-ink sm:text-2xl">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
