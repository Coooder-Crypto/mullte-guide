import { toMinimalUnit } from "@/lib/format/amount";
import type { UserConstraints } from "@/lib/types/domain";
import type { QuoteRequest } from "@/lib/types/quote";
import type { NormalizedVault } from "@/lib/types/domain";

export function buildQuoteParams(params: {
  address: string;
  constraints: UserConstraints;
  vault: NormalizedVault;
}): QuoteRequest {
  const { address, constraints, vault } = params;

  return {
    fromChain: vault.chainId,
    toChain: vault.chainId,
    fromToken: vault.underlyingToken.address,
    toToken: vault.address,
    fromAddress: address,
    toAddress: address,
    fromAmount: toMinimalUnit(constraints.amount, vault.underlyingToken.decimals),
    slippage: "0.005",
    order: "RECOMMENDED",
    integrator: "mullet-guide",
  };
}
