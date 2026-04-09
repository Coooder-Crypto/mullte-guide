import { ActionCard } from "@/components/blocks/action-card";
import { ConstraintCard } from "@/components/blocks/constraint-card";
import { PortfolioView } from "@/components/blocks/portfolio-view";
import { VaultDetail } from "@/components/blocks/vault-detail";
import { VaultList } from "@/components/blocks/vault-list";
import type { A2UIBlock } from "@/lib/types/a2ui";
import type { PortfolioViewPosition } from "@/lib/types/domain";

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
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "constraint_card":
            return <ConstraintCard key={key} data={block.data} />;
          case "vault_list":
            return <VaultList key={key} data={block.data} selectedVaultId={selectedVaultId} onSelectVault={onSelectVault} />;
          case "vault_detail":
            return <VaultDetail key={key} data={block.data} />;
          case "action_card":
            return <ActionCard key={key} data={block.data} onPortfolioLoaded={onPortfolioLoaded} />;
          case "portfolio_view":
            return <PortfolioView key={key} data={block.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
