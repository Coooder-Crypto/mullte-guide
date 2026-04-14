import type { NormalizedVault, UserConstraints } from "@/lib/types/domain";

export type VaultInsight = {
  whyRecommended: string[];
  protocolInfo: string;
};

export type AnalyzeGoalResponse = {
  message: string;
  constraints: UserConstraints;
  vaults: NormalizedVault[];
  selectedVaultId: string | null;
  vaultInsights: Record<string, VaultInsight>;
};
