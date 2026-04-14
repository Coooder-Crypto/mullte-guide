import { Eyebrow, MetricCard } from "@/components/ui/flat-primitives";
import { SiteHeader } from "@/components/site-header";

const principles = [
  {
    title: "先压约束，再做推荐",
    body: "用户先表达目标，系统把金额、资产、链和风险偏好压成结构化约束，再进入排序和解释。",
  },
  {
    title: "工作区原地展开",
    body: "不把用户丢去新的工具页，首页本身就是一个可以从 chat 切到交易的操作面。",
  },
  {
    title: "推荐与执行同屏",
    body: "推荐不是终点，详情、quote、授权和交易状态都在一个连续界面里完成。",
  },
  {
    title: "LI.FI 负责统一入口",
    body: "收益机会发现、quote 生成和持仓读取都由 LI.FI 提供统一能力，前端专注决策体验。",
  },
];

export const metadata = {
  title: "About | Mullet Guide",
};

export default function AboutPage() {
  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="panel overflow-hidden px-5 py-6 sm:px-7 sm:py-8">
          <p className="label-chip">Product Positioning</p>
          <h1 className="display-title mt-5 max-w-4xl text-[2.8rem] text-ink sm:text-[3.9rem] lg:text-[4.6rem]">
            不是另一个 DeFi dashboard，而是一套更短的收益执行路径。
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            Mullet Guide 的重点不是堆更多协议入口，而是把“想做什么”直接收敛成“下一步能点什么”。用户不需要先理解协议结构，只需要表达目标。
          </p>
        </section>

        <aside className="surface-card">
          <p className="label-chip">What It Changes</p>
          <div className="mt-5 grid gap-3">
            <MetricCard label="输入方式" value="自然语言" detail="用户先说目标，不先选协议入口。" />
            <MetricCard label="输出方式" value="A2UI 工作区" detail="推荐、解释与执行动作同屏展开。" />
            <MetricCard label="底层能力" value="LI.FI" detail="统一的 vault、quote 与 portfolio 数据入口。" />
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {principles.map((item) => (
          <article key={item.title} className="surface-card">
            <Eyebrow>{item.title}</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-ink">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
