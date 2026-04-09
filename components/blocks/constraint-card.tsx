import type { ConstraintCardData } from "@/lib/types/a2ui";

const riskMap = {
  safe: "稳健",
  moderate: "平衡",
  aggressive: "进取",
} as const;

export function ConstraintCard({ data }: { data: ConstraintCardData }) {
  return (
    <section className="panel p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-chip">Constraint Card</p>
          <h2 className="mt-3 text-2xl font-semibold">系统已解析你的收益目标</h2>
        </div>
        <p className="max-w-xl text-sm text-muted">先把模糊意图压成结构化约束，后续所有筛选、解释和交易都围绕这一张卡展开。</p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <InfoCell label="资产" value={data.asset} />
        <InfoCell label="目标链" value={data.chain} />
        <InfoCell label="金额" value={`${data.amount} ${data.asset}`} />
        <InfoCell label="风险偏好" value={riskMap[data.riskPreference]} />
      </div>
    </section>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
