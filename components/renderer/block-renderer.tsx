import type { ReactNode } from "react";
import { ActionCard } from "@/components/blocks/action-card";
import { ConstraintCard } from "@/components/blocks/constraint-card";
import { PortfolioView } from "@/components/blocks/portfolio-view";
import { VaultDetail } from "@/components/blocks/vault-detail";
import { VaultList } from "@/components/blocks/vault-list";
import type { A2UIBlock } from "@/lib/types/a2ui";
import type { PortfolioViewPosition } from "@/lib/types/domain";

const blockLayoutClass: Record<A2UIBlock["type"], string> = {
  constraint_card: "xl:col-span-12",
  vault_list: "xl:col-span-7",
  vault_detail: "xl:col-span-5",
  action_card: "xl:col-span-12",
  portfolio_view: "xl:col-span-12",
};

export function BlockRenderer({
  blocks,
  selectedVaultId,
  onSelectVault,
  onPortfolioLoaded,
}: {
  blocks: A2UIBlock[];
  selectedVaultId?: string | null;
  onSelectVault: (vaultId: string) => void;
  onPortfolioLoaded: (address: string, positions: PortfolioViewPosition[]) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        let component: ReactNode = null;

        switch (block.type) {
          case "constraint_card":
            component = <ConstraintCard data={block.data} />;
            break;
          case "vault_list":
            component = <VaultList data={block.data} selectedVaultId={selectedVaultId} onSelectVault={onSelectVault} />;
            break;
          case "vault_detail":
            component = <VaultDetail data={block.data} />;
            break;
          case "action_card":
            component = <ActionCard data={block.data} onPortfolioLoaded={onPortfolioLoaded} />;
            break;
          case "portfolio_view":
            component = <PortfolioView data={block.data} />;
            break;
          default:
            component = null;
        }

        if (!component) {
          return null;
        }

        return (
          <div key={key} className={blockLayoutClass[block.type]}>
            {component}
          </div>
        );
      })}
    </div>
  );
}
