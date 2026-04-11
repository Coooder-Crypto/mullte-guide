import Link from "next/link";

export const metadata = {
  title: "About | Mullet Guide",
};

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-chip">About</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Mullet Guide 在做什么
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="secondary-button">
            Back Home
          </Link>
          <Link href="/studio" className="secondary-button">
            Open Studio
          </Link>
        </div>
      </header>

      <section className="panel p-6 md:p-7">
        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard
            title="项目目标"
            body="把复杂 DeFi 收益操作收敛成自然语言输入、推荐解释和可执行交易。用户不需要先理解协议入口，只需要表达目标。"
          />
          <InfoCard
            title="为什么用 LI.FI"
            body="LI.FI 负责统一收益机会发现、统一 quote 生成、统一持仓读取。Mullet Guide 负责把用户意图翻译成推荐和 UI。"
          />
          <InfoCard
            title="当前链路"
            body="输入目标 -> 解析约束 -> 拉 Earn vaults -> 生成 A2UI -> 选择 vault -> 请求 Composer quote -> 钱包交易 -> 拉 portfolio。"
          />
          <InfoCard
            title="产品定位"
            body="这是一个 chat-first 的 A2UI 收益助手，不是复杂多代理系统。重点是让用户更快完成收益决策和执行。"
          />
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[28px] border border-border bg-white/80 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{title}</p>
      <p className="mt-4 text-sm leading-7 text-ink">{body}</p>
    </article>
  );
}
