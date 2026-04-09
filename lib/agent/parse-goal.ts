import { DEFAULT_CHAIN, resolveChain } from "@/lib/constants/chains";
import { DEFAULT_ASSET, resolveAsset } from "@/lib/constants/tokens";
import type { RiskPreference, UserConstraints } from "@/lib/types/domain";

const SAFE_PATTERN = /(safe|safely|secure|low\s*risk|稳健|安全|保守)/i;
const AGGRESSIVE_PATTERN = /(aggressive|high\s*risk|degen|高风险|激进)/i;
const MODERATE_PATTERN = /(moderate|balanced|平衡|中性)/i;

export function parseGoal(rawInput: string): UserConstraints {
  const amountMatch = rawInput.match(/(\d+(?:\.\d+)?)/);
  const assetMatch = rawInput.match(/\b(USDC|USDT|ETH|DAI)\b/i);
  const chainMatch = rawInput.match(/\b(Base|Arbitrum|Ethereum|Optimism|Polygon|ETH|ARB|OP|MATIC)\b/i);

  const riskPreference = resolveRisk(rawInput);
  const chain = resolveChain(chainMatch?.[0]);
  const asset = resolveAsset(assetMatch?.[0] ?? DEFAULT_ASSET.symbol);

  return {
    rawInput,
    amount: amountMatch?.[0] ?? "100",
    asset,
    chain: chain.name,
    chainId: chain.id,
    riskPreference,
  };
}

function resolveRisk(rawInput: string): RiskPreference {
  if (SAFE_PATTERN.test(rawInput)) {
    return "safe";
  }

  if (AGGRESSIVE_PATTERN.test(rawInput)) {
    return "aggressive";
  }

  if (MODERATE_PATTERN.test(rawInput)) {
    return "moderate";
  }

  return "moderate";
}

export function suggestPrompt() {
  return `invest 100 ${DEFAULT_ASSET.symbol} safely on ${DEFAULT_CHAIN.name}`;
}
