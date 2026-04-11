import Link from "next/link";

const schemaExample = [
  {
    type: "constraint_card",
    data: {
      asset: "USDC",
      chain: "Base",
      amount: "100",
      riskPreference: "safe",
    },
  },
  {
    type: "vault_list",
    data: {
      title: "为你筛选的 Base USDC 候选 Vault",
      items: [
        {
          id: "8453-0xee8f4ec5672f09119b96ab6fb59c27e1b7e44b61",
          name: "GTUSDCP",
          protocol: "morpho-v1",
          apy: 4.2,
          tvlUsd: 357343711,
          tags: ["stablecoin", "single"],
        },
      ],
    },
  },
];

export const metadata = {
  title: "Studio | Mullet Guide",
};

export default function StudioPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-chip">Studio</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            A2UI Schema 与路由说明
          </h1>
        </div>
        <Link href="/" className="secondary-button">
          Back Home
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel p-6 md:p-7">
          <p className="label-chip">Routing</p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-ink">
            <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">
              <strong>/</strong>：聊天入口，只保留对话和弹出的 A2UI 工作区
            </li>
            <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">
              <strong>/about</strong>：产品背景、目标和 LI.FI 结合方式
            </li>
            <li className="rounded-2xl border border-border bg-white/80 px-4 py-3">
              <strong>/studio</strong>：A2UI schema 示例和实现说明
            </li>
          </ul>
        </article>

        <article className="panel p-6 md:p-7">
          <p className="label-chip">Schema Example</p>
          <pre className="mt-5 overflow-auto rounded-[24px] border border-border bg-slate-950 p-4 text-[11px] leading-6 text-slate-100 sm:text-xs">
            {JSON.stringify(schemaExample, null, 2)}
          </pre>
        </article>
      </section>
    </main>
  );
}
