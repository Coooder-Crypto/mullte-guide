export type EarnVaultResponse = {
  data: EarnVault[];
  nextCursor?: string;
  total?: number;
};

export type EarnVault = {
  name: string;
  slug: string;
  tags?: string[];
  address: `0x${string}`;
  chainId: number;
  network: string;
  lpTokens?: unknown[];
  protocol?: {
    name?: string;
    url?: string;
  };
  provider?: string;
  syncedAt?: string;
  analytics?: {
    apy?: {
      base?: number | null;
      total?: number | null;
      reward?: number | null;
    };
    tvl?: {
      usd?: string | null;
    };
    apy1d?: number | null;
    apy7d?: number | null;
    apy30d?: number | null;
    updatedAt?: string;
  };
  description?: string;
  redeemPacks?: Array<{ name?: string; stepsType?: string }>;
  depositPacks?: Array<{ name?: string; stepsType?: string }>;
  isRedeemable?: boolean;
  isTransactional?: boolean;
  underlyingTokens?: Array<{
    symbol: string;
    address: `0x${string}`;
    decimals: number;
  }>;
};

export type EarnPortfolioResponse = {
  positions: EarnPortfolioPosition[];
};

export type EarnPortfolioPosition = {
  protocol?: { name?: string };
  vault?: {
    name?: string;
    address?: string;
    network?: string;
    chainId?: number;
    protocol?: { name?: string };
    analytics?: { apy?: { total?: number | null } };
    underlyingTokens?: Array<{ symbol?: string }>;
  };
  network?: string;
  chainId?: number;
  amountUsd?: string | number | null;
  balanceUSD?: string | number | null;
  valueUsd?: string | number | null;
  analytics?: { apy?: { total?: number | null } };
  underlyingTokens?: Array<{ symbol?: string }>;
  asset?: { symbol?: string };
  [key: string]: unknown;
};
