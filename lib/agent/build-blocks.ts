import { getChainName } from "@/lib/constants/chains";
import type { A2UIBlock } from "@/lib/types/a2ui";
import type { NormalizedVault, PortfolioViewPosition, UserConstraints } from "@/lib/types/domain";

export function buildBlocks(params: {
  constraints: UserConstraints | null;
  vaults: NormalizedVault[];
  selectedVault: NormalizedVault | null;
  portfolioAddress?: string | null;
  portfolioPositions?: PortfolioViewPosition[];
}): A2UIBlock[] {
  const { constraints, vaults, selectedVault, portfolioAddress, portfolioPositions = [] } = params;
  if (!constraints) {
    return [];
  }

  const blocks: A2UIBlock[] = [
    {
      type: "constraint_card",
      data: constraints,
    },
    {
      type: "vault_list",
      data: {
        title: `为你筛选的 ${constraints.chain} ${constraints.asset} 候选 Vault`,
        items: vaults,
      },
    },
  ];

  if (selectedVault) {
    blocks.push({
      type: "vault_detail",
      data: {
        vault: selectedVault,
        whyRecommended: buildRecommendationReasons(selectedVault, constraints),
        protocolInfo: buildProtocolInfo(selectedVault),
      },
    });

    blocks.push({
      type: "action_card",
      data: {
        vault: selectedVault,
        constraints,
      },
    });
  }

  if (portfolioAddress && portfolioPositions.length > 0) {
    blocks.push({
      type: "portfolio_view",
      data: {
        address: portfolioAddress,
        positions: portfolioPositions,
      },
    });
  }

  return blocks;
}

function buildRecommendationReasons(vault: NormalizedVault, constraints: UserConstraints) {
  const reasons = [
    `${getChainName(vault.chainId)} 链与用户目标链一致`,
    `${vault.underlyingToken.symbol} 与输入资产匹配`,
  ];

  if (constraints.riskPreference === "safe" && vault.isStablecoin) {
    reasons.push("底层资产属于稳定币，符合稳健偏好");
  }

  if (vault.tvlUsd) {
    reasons.push(`TVL 较高，当前规模约 ${Math.round(vault.tvlUsd).toLocaleString("zh-CN")} USD`);
  }

  if (vault.apy !== null) {
    reasons.push(`当前总 APY 为 ${vault.apy.toFixed(2)}%`);
  } else {
    reasons.push("APY 数据暂缺，因此主要按链、资产和 TVL 推荐");
  }

  return reasons;
}

function buildProtocolInfo(vault: NormalizedVault) {
  const stableHint = vault.isStablecoin ? "以稳定币收益策略为主。" : "以单资产收益或协议包装资产为主。";
  return `${vault.protocol} on ${getChainName(vault.chainId)}。${stableHint}`;
}
