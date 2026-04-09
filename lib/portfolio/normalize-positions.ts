import { getChainName } from "@/lib/constants/chains";
import { safeNumber } from "@/lib/format/amount";
import type { PortfolioViewPosition } from "@/lib/types/domain";
import type { EarnPortfolioPosition } from "@/lib/types/earn";

export function normalizePortfolioPositions(positions: EarnPortfolioPosition[]): PortfolioViewPosition[] {
  return positions.map((position) => {
    const chainId = position.chainId ?? position.vault?.chainId ?? null;
    const protocol = position.protocol?.name ?? position.vault?.protocol?.name ?? "Unknown protocol";
    const asset =
      position.asset?.symbol ??
      position.underlyingTokens?.[0]?.symbol ??
      position.vault?.underlyingTokens?.[0]?.symbol ??
      "Unknown asset";

    return {
      protocol,
      asset,
      chain: position.network ?? position.vault?.network ?? getChainName(chainId),
      amountUsd: safeNumber(position.amountUsd ?? position.balanceUSD ?? position.valueUsd),
      apy: safeNumber(position.analytics?.apy?.total ?? position.vault?.analytics?.apy?.total),
    };
  });
}
