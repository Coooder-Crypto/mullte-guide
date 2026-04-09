import type { EarnPortfolioResponse, EarnVaultResponse } from "@/lib/types/earn";

async function fetchJson<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchEarnVaults(signal?: AbortSignal) {
  return fetchJson<EarnVaultResponse>("/api/earn/vaults", {
    signal,
    cache: "no-store",
  });
}

export function fetchPortfolioPositions(address: string, signal?: AbortSignal) {
  return fetchJson<EarnPortfolioResponse>(`/api/earn/portfolio/${address}/positions`, {
    signal,
    cache: "no-store",
  });
}
