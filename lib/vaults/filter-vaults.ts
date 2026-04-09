import type { UserConstraints } from "@/lib/types/domain";
import type { NormalizedVault } from "@/lib/types/domain";

export function filterVaults(vaults: NormalizedVault[], constraints: UserConstraints) {
  const transactional = vaults.filter((vault) => vault.isTransactional);
  const onTargetChain = transactional.filter((vault) => vault.chainId === constraints.chainId);
  const exactAsset = onTargetChain.filter((vault) => vault.underlyingToken.symbol === constraints.asset);

  const fallback =
    exactAsset.length > 0
      ? exactAsset
      : onTargetChain.length > 0
        ? onTargetChain
        : transactional.filter((vault) => vault.underlyingToken.symbol === constraints.asset);

  if (constraints.riskPreference !== "safe") {
    return fallback;
  }

  const stablecoinMatches = fallback.filter((vault) => vault.isStablecoin);
  return stablecoinMatches.length > 0 ? stablecoinMatches : fallback;
}
