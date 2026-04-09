import { STABLECOIN_SYMBOLS } from "@/lib/constants/tokens";
import { safeNumber } from "@/lib/format/amount";
import type { NormalizedVault } from "@/lib/types/domain";
import type { EarnVault } from "@/lib/types/earn";

export function normalizeVault(vault: EarnVault): NormalizedVault | null {
  const underlyingToken = vault.underlyingTokens?.[0];
  if (!underlyingToken) {
    return null;
  }

  return {
    id: vault.slug,
    slug: vault.slug,
    address: vault.address,
    name: vault.name,
    protocol: vault.protocol?.name ?? "unknown",
    protocolUrl: vault.protocol?.url,
    chainId: vault.chainId,
    network: vault.network,
    tags: vault.tags ?? [],
    description: vault.description,
    apy: safeNumber(vault.analytics?.apy?.total),
    apyBase: safeNumber(vault.analytics?.apy?.base),
    apyReward: safeNumber(vault.analytics?.apy?.reward),
    tvlUsd: safeNumber(vault.analytics?.tvl?.usd),
    isRedeemable: Boolean(vault.isRedeemable),
    isTransactional: Boolean(vault.isTransactional),
    underlyingToken: {
      symbol: underlyingToken.symbol.toUpperCase(),
      address: underlyingToken.address,
      decimals: underlyingToken.decimals,
    },
    isStablecoin:
      STABLECOIN_SYMBOLS.has(underlyingToken.symbol.toUpperCase()) ||
      (vault.tags ?? []).includes("stablecoin"),
  };
}
