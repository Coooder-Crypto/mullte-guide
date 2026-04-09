import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";

export const SUPPORTED_CHAINS = [
  { id: base.id, name: "Base", aliases: ["base"] },
  { id: arbitrum.id, name: "Arbitrum", aliases: ["arbitrum", "arb"] },
  { id: mainnet.id, name: "Ethereum", aliases: ["ethereum", "eth", "mainnet"] },
  { id: optimism.id, name: "Optimism", aliases: ["optimism", "op"] },
  { id: polygon.id, name: "Polygon", aliases: ["polygon", "matic"] },
] as const;

export const WALLET_CHAINS = [base, arbitrum, mainnet, optimism, polygon] as const;

export const DEFAULT_CHAIN = SUPPORTED_CHAINS[0];

export function resolveChain(input?: string | null) {
  if (!input) {
    return DEFAULT_CHAIN;
  }

  const normalized = input.trim().toLowerCase();
  return (
    SUPPORTED_CHAINS.find((chain) => {
      return chain.name.toLowerCase() === normalized || chain.aliases.some((alias) => alias === normalized);
    }) ?? DEFAULT_CHAIN
  );
}

export function getChainName(chainId?: number | null) {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.name ?? `Chain ${chainId ?? "Unknown"}`;
}
