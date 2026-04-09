export type RiskPreference = "safe" | "moderate" | "aggressive";

export type UserConstraints = {
  rawInput: string;
  amount: string;
  asset: string;
  chain: string;
  chainId: number;
  riskPreference: RiskPreference;
};

export type NormalizedVault = {
  id: string;
  slug: string;
  address: `0x${string}`;
  name: string;
  protocol: string;
  protocolUrl?: string;
  chainId: number;
  network: string;
  tags: string[];
  description?: string;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  tvlUsd: number | null;
  isRedeemable: boolean;
  isTransactional: boolean;
  underlyingToken: {
    symbol: string;
    address: `0x${string}`;
    decimals: number;
  };
  isStablecoin: boolean;
  score?: number;
};

export type PortfolioViewPosition = {
  protocol: string;
  asset: string;
  chain: string;
  amountUsd: number | null;
  apy: number | null;
};
