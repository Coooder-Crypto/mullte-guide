import type { NormalizedVault, UserConstraints } from "@/lib/types/domain";

const TRUSTED_PROTOCOLS = new Set(["aave-v3", "morpho-v1", "euler-v2"]);

export function rankVaults(vaults: NormalizedVault[], constraints: UserConstraints) {
  return [...vaults]
    .map((vault) => ({
      ...vault,
      score: scoreVault(vault, constraints),
    }))
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
}

function scoreVault(vault: NormalizedVault, constraints: UserConstraints) {
  let score = 0;

  if (vault.chainId === constraints.chainId) score += 45;
  if (vault.underlyingToken.symbol === constraints.asset) score += 35;
  if (vault.isTransactional) score += 20;
  if (vault.isRedeemable) score += 8;
  if (TRUSTED_PROTOCOLS.has(vault.protocol)) score += 10;

  if (constraints.riskPreference === "safe") {
    if (vault.isStablecoin) score += 30;
    if (vault.tags.includes("il-risk")) score -= 20;
    score += Math.min(25, Math.log10((vault.tvlUsd ?? 1) + 1) * 4.5);
    score += Math.min(12, vault.apy ?? 0);
  }

  if (constraints.riskPreference === "moderate") {
    if (vault.isStablecoin) score += 10;
    score += Math.min(18, Math.log10((vault.tvlUsd ?? 1) + 1) * 3);
    score += Math.min(18, (vault.apy ?? 0) * 1.4);
  }

  if (constraints.riskPreference === "aggressive") {
    score += Math.min(12, Math.log10((vault.tvlUsd ?? 1) + 1) * 2);
    score += Math.min(28, (vault.apy ?? 0) * 2);
  }

  if (vault.apy === null) score -= 4;

  return Number(score.toFixed(2));
}
