import type { NormalizedVault, PortfolioViewPosition, UserConstraints } from "@/lib/types/domain";

export type ConstraintCardData = UserConstraints;

export type VaultListData = {
  title: string;
  items: NormalizedVault[];
};

export type VaultDetailData = {
  vault: NormalizedVault;
  whyRecommended: string[];
  protocolInfo: string;
};

export type ActionCardData = {
  vault: NormalizedVault;
  constraints: UserConstraints;
};

export type PortfolioViewData = {
  address: string;
  positions: PortfolioViewPosition[];
};

export type A2UIBlock =
  | { type: "constraint_card"; data: ConstraintCardData }
  | { type: "vault_list"; data: VaultListData }
  | { type: "vault_detail"; data: VaultDetailData }
  | { type: "action_card"; data: ActionCardData }
  | { type: "portfolio_view"; data: PortfolioViewData };
