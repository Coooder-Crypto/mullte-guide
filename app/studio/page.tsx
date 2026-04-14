import { SiteHeader } from "@/components/site-header";

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

const routeNotes = [
  {
    path: "/",
    body: "聊天入口与工作区主界面。输入收益目标后直接展开 A2UI。",
  },
  {
    path: "/about",
    body: "解释产品定位、交互原则，以及为什么要采用 chat-first 形式。",
  },
  {
    path: "/studio",
    body: "查看 schema、路由关系与主要实现方向，面向开发和演示使用。",
  },
];

export const metadata = {
  title: "Studio | Mullet Guide",
};

export default function StudioPage() {
  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <section className="panel overflow-hidden px-5 py-6 sm:px-7 sm:py-8">
          <p className="label-chip">Schema Narrative</p>
          <h1 className="display-title mt-5 max-w-4xl text-[2.8rem] text-ink sm:text-[3.8rem] lg:text-[4.4rem]">
            A2UI 不是静态页面，而是会话驱动的界面编排层。
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            用户输入的目标先进入约束解析，然后被翻译成一组 block。页面只负责按顺序渲染 block，而不是写死复杂流程。
          </p>
        </section>

        <aside className="surface-card">
          <p className="label-chip">Routing</p>
          <div className="mt-5 space-y-3">
            {routeNotes.map((item) => (
              <article key={item.path} className="rounded-[10px] border border-black bg-white p-4">
                <p className="text-sm font-semibold text-ink">{item.path}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <article className="surface-card">
          <p className="label-chip">Implementation Notes</p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
            <li className="rounded-[10px] border border-black bg-white px-4 py-3">
              Block renderer 负责把 schema type 路由到具体 React 组件。
            </li>
            <li className="rounded-[10px] border border-black bg-white px-4 py-3">
              首页会在对话成功后原地展开工作区，不切换到新页面。
            </li>
            <li className="rounded-[10px] border border-black bg-white px-4 py-3">
              执行卡接入 quote、授权、交易和 portfolio 拉取，是离用户最近的 onchain 操作层。
            </li>
          </ul>
        </article>

        <article className="panel p-6 md:p-7">
          <p className="label-chip">Schema Example</p>
          <pre className="mt-5 overflow-auto rounded-[10px] border border-black bg-slate-950 p-5 text-[11px] leading-6 text-slate-100 sm:text-xs">
            {JSON.stringify(schemaExample, null, 2)}
          </pre>
        </article>
      </section>
    </main>
  );
}
