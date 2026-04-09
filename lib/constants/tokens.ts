export const SUPPORTED_ASSETS = [
  { symbol: "USDC", aliases: ["usdc"] },
  { symbol: "USDT", aliases: ["usdt"] },
  { symbol: "ETH", aliases: ["eth", "ethereum"] },
  { symbol: "DAI", aliases: ["dai"] },
] as const;

export const DEFAULT_ASSET = SUPPORTED_ASSETS[0];

export const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT", "DAI", "USDE", "USDC.E", "PYUSD", "RLUSD", "USDG"]);

export function resolveAsset(input?: string | null) {
  if (!input) {
    return DEFAULT_ASSET.symbol;
  }

  const normalized = input.trim().toLowerCase();
  return (
    SUPPORTED_ASSETS.find((asset) => asset.symbol.toLowerCase() === normalized || asset.aliases.some((alias) => alias === normalized))
      ?.symbol ?? DEFAULT_ASSET.symbol
  );
}
