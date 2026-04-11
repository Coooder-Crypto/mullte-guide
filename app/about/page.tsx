import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-3 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-6 md:px-6 md:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-chip">Project Overview</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Mullet Guide
          </h1>
        </div>

        <Link href="/" className="secondary-button">
          返回首页
        </Link>
      </header>

      <section className="panel p-6 md:p-8">
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">项目要做什么</h2>
            <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
              Mullet Guide 是一个面向普通用户的 DeFi 收益助手。用户只需要用自然语言描述目标，例如“invest 100 USDC safely on Base”，系统就会把模糊意图解析成可执行约束，筛选合适的收益 vault，解释推荐原因，并引导用户完成实际存款。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Understand"
              body="解析资产、金额、链和风险偏好，把自然语言压成结构化约束。"
            />
            <InfoCard
              title="Recommend"
              body="基于 Earn vault 数据做筛选和排序，展示 APY、TVL、协议和推荐理由。"
            />
            <InfoCard
              title="Execute"
              body="生成 Composer quote，连接钱包完成 approve 与 deposit，并在交易后展示持仓。"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">为什么结合 LI.FI</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <InfoCard
                title="Earn Discovery"
                body="用 Earn API 聚合不同协议和链上的收益 vault，免去手动整合 Aave、Morpho、Euler 等数据。"
              />
              <InfoCard
                title="Composer Execution"
                body="用 Composer 的 quote 把 toToken 指向 vault.address，直接生成存款路径，而不是自己对接每个协议 ABI。"
              />
              <InfoCard
                title="Portfolio Feedback"
                body="用 portfolio positions 接口在交易后回显持仓，形成完整闭环。"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">当前 MVP 范围</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink sm:text-base">
              <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">自然语言输入收益目标</li>
              <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">规则解析资产、链、金额、风险偏好</li>
              <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">Earn vault 拉取、筛选、排序和推荐解释</li>
              <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">Composer quote、钱包授权与 deposit 交易发起</li>
              <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">Portfolio positions 展示交易后的收益持仓</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-border bg-white/80 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{title}</p>
      <p className="mt-3 text-sm leading-7 text-ink">{body}</p>
    </div>
  );
}
