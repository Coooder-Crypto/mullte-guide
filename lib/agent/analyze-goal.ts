import { buildProtocolInfo, buildRecommendationReasons } from "@/lib/agent/build-blocks";
import { parseGoal } from "@/lib/agent/parse-goal";
import { resolveChain, SUPPORTED_CHAINS } from "@/lib/constants/chains";
import { resolveAsset, SUPPORTED_ASSETS } from "@/lib/constants/tokens";
import type { AnalyzeGoalResponse, VaultInsight } from "@/lib/types/agent";
import type { NormalizedVault, RiskPreference, UserConstraints } from "@/lib/types/domain";
import type { EarnVaultResponse } from "@/lib/types/earn";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { filterVaults } from "@/lib/vaults/filter-vaults";
import { normalizeVault } from "@/lib/vaults/normalize-vault";
import { rankVaults } from "@/lib/vaults/rank-vaults";

const EARN_VAULTS_URL = "https://earn.li.fi/v1/earn/vaults";
const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const SILICONFLOW_MODEL = process.env.SILICONFLOW_MODEL || "zai-org/GLM-5.1";

type PlanToolPayload = {
  assistantMessage?: string;
  constraints?: {
    amount?: string;
    asset?: string;
    chain?: string;
    riskPreference?: string;
  };
  recommendedVaultIds?: string[];
  selectedVaultId?: string | null;
  vaultInsights?: Array<{
    vaultId?: string;
    whyRecommended?: string[];
    protocolInfo?: string;
  }>;
};

type SiliconFlowChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: Array<{
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
  }>;
};

const PLAN_TOOL = {
  type: "function",
  function: {
    name: "emit_a2ui_plan",
    description: "Return the parsed DeFi intent, recommended vault ids, and vault explanations for the A2UI workspace.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        assistantMessage: {
          type: "string",
          description: "A concise Chinese assistant reply summarizing the understood intent and recommendation.",
        },
        constraints: {
          type: "object",
          additionalProperties: false,
          properties: {
            amount: { type: "string" },
            asset: {
              type: "string",
              enum: SUPPORTED_ASSETS.map((asset) => asset.symbol),
            },
            chain: {
              type: "string",
              enum: SUPPORTED_CHAINS.map((chain) => chain.name),
            },
            riskPreference: {
              type: "string",
              enum: ["safe", "moderate", "aggressive"],
            },
          },
          required: ["amount", "asset", "chain", "riskPreference"],
        },
        recommendedVaultIds: {
          type: "array",
          items: { type: "string" },
          maxItems: 3,
        },
        selectedVaultId: {
          anyOf: [{ type: "string" }, { type: "null" }],
        },
        vaultInsights: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              vaultId: { type: "string" },
              whyRecommended: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4,
              },
              protocolInfo: { type: "string" },
            },
            required: ["vaultId", "whyRecommended", "protocolInfo"],
          },
        },
      },
      required: ["assistantMessage", "constraints", "recommendedVaultIds", "selectedVaultId", "vaultInsights"],
    },
  },
} as const;

const SYSTEM_PROMPT = [
  "你是 Mullet Guide 的服务端规划模型，负责把用户收益目标转换成 A2UI 工作区所需的结构化结果。",
  "你必须调用 emit_a2ui_plan 工具一次，不能编造 vaultId。",
  "输出要求：assistantMessage 用简洁中文；whyRecommended 为 2 到 4 条短句；protocolInfo 为一句短中文说明。",
  "推荐原则：优先链和资产匹配；safe 偏好优先稳定币、高 TVL、主流协议；moderate 平衡 TVL 与 APY；aggressive 可以更看重 APY。",
  "如果候选 vault 都不合适，recommendedVaultIds 返回空数组，selectedVaultId 返回 null，vaultInsights 返回空数组。",
].join("\n");

export async function analyzeGoal(rawInput: string): Promise<AnalyzeGoalResponse> {
  const fallbackConstraints = parseGoal(rawInput);
  const normalizedVaults = await fetchNormalizedVaults();
  const fallbackResponse = buildFallbackResponse(rawInput, normalizedVaults, fallbackConstraints);

  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return fallbackResponse;
  }

  const candidates = buildInitialCandidates(normalizedVaults, fallbackConstraints);

  try {
    const llmPlan = await requestPlanFromSiliconFlow(rawInput, candidates, apiKey);
    const constraints = normalizeConstraints(rawInput, llmPlan.constraints, fallbackConstraints);
    const rankedVaults = buildRankedVaults(normalizedVaults, constraints);
    const selectedVaults = buildSelectedVaults(rankedVaults, llmPlan.recommendedVaultIds);
    const vaultInsights = buildVaultInsights(selectedVaults, constraints, llmPlan.vaultInsights);

    return {
      message: llmPlan.assistantMessage?.trim() || fallbackResponse.message,
      constraints,
      vaults: selectedVaults,
      selectedVaultId: selectVaultId(selectedVaults, llmPlan.selectedVaultId),
      vaultInsights,
    };
  } catch (error) {
    console.error("SiliconFlow analyze failed:", getErrorMessage(error, "Unknown SiliconFlow error"));
    return fallbackResponse;
  }
}

async function fetchNormalizedVaults() {
  const response = await fetch(EARN_VAULTS_URL, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Failed to fetch Earn vaults: ${response.status}`);
  }

  const payload = (await response.json()) as EarnVaultResponse;
  return payload.data.map(normalizeVault).filter((vault): vault is NormalizedVault => Boolean(vault));
}

function buildFallbackResponse(
  rawInput: string,
  vaults: NormalizedVault[],
  constraints: UserConstraints,
): AnalyzeGoalResponse {
  const selectedVaults = buildRankedVaults(vaults, constraints).slice(0, 3);

  return {
    message:
      selectedVaults.length > 0
        ? `已理解为 ${constraints.amount} ${constraints.asset} on ${constraints.chain}，并结合链、资产、TVL 和风险偏好筛出最适合的候选 vault。`
        : `已理解为 ${constraints.amount} ${constraints.asset} on ${constraints.chain}，但当前没有找到足够匹配的候选 vault。`,
    constraints: {
      ...constraints,
      rawInput,
    },
    vaults: selectedVaults,
    selectedVaultId: selectedVaults[0]?.id ?? null,
    vaultInsights: buildVaultInsights(selectedVaults, constraints),
  };
}

function buildInitialCandidates(vaults: NormalizedVault[], constraints: UserConstraints) {
  const primary = buildRankedVaults(vaults, constraints).slice(0, 6);
  const transactional = rankVaults(
    vaults.filter((vault) => vault.isTransactional),
    constraints,
  ).slice(0, 6);

  return dedupeVaults([...primary, ...transactional]).slice(0, 8);
}

function buildRankedVaults(vaults: NormalizedVault[], constraints: UserConstraints) {
  const filtered = filterVaults(vaults, constraints);
  if (filtered.length > 0) {
    return rankVaults(filtered, constraints);
  }

  const transactional = vaults.filter((vault) => vault.isTransactional);
  return rankVaults(transactional.length > 0 ? transactional : vaults, constraints);
}

function buildSelectedVaults(vaults: NormalizedVault[], recommendedVaultIds?: string[]) {
  const orderedSelection = pickVaultsByIds(vaults, recommendedVaultIds);
  const selected = [...orderedSelection];

  for (const vault of vaults) {
    if (selected.length >= 3) {
      break;
    }

    if (!selected.some((item) => item.id === vault.id)) {
      selected.push(vault);
    }
  }

  return selected.slice(0, 3);
}

function buildVaultInsights(
  vaults: NormalizedVault[],
  constraints: UserConstraints,
  llmInsights?: PlanToolPayload["vaultInsights"],
): Record<string, VaultInsight> {
  const insightMap = new Map(
    (llmInsights ?? [])
      .filter((item): item is Required<NonNullable<PlanToolPayload["vaultInsights"]>[number]> => {
        return Boolean(item?.vaultId && item.protocolInfo && item.whyRecommended && item.whyRecommended.length > 0);
      })
      .map((item) => [
        item.vaultId,
        {
          whyRecommended: item.whyRecommended.slice(0, 4),
          protocolInfo: item.protocolInfo,
        },
      ]),
  );

  return Object.fromEntries(
    vaults.map((vault) => [
      vault.id,
      insightMap.get(vault.id) ?? {
        whyRecommended: buildRecommendationReasons(vault, constraints),
        protocolInfo: buildProtocolInfo(vault),
      },
    ]),
  );
}

function normalizeConstraints(
  rawInput: string,
  llmConstraints: PlanToolPayload["constraints"],
  fallbackConstraints: UserConstraints,
): UserConstraints {
  const chain = resolveChain(llmConstraints?.chain ?? fallbackConstraints.chain);
  const asset = resolveAsset(llmConstraints?.asset ?? fallbackConstraints.asset);

  return {
    rawInput,
    amount: normalizeAmount(llmConstraints?.amount, fallbackConstraints.amount),
    asset,
    chain: chain.name,
    chainId: chain.id,
    riskPreference: normalizeRiskPreference(llmConstraints?.riskPreference, fallbackConstraints.riskPreference),
  };
}

function normalizeAmount(amount: string | undefined, fallback: string) {
  const sanitized = amount?.replace(/[^\d.]/g, "").trim();
  return sanitized ? sanitized : fallback;
}

function normalizeRiskPreference(value: string | undefined, fallback: RiskPreference): RiskPreference {
  if (value === "safe" || value === "moderate" || value === "aggressive") {
    return value;
  }

  return fallback;
}

function selectVaultId(vaults: NormalizedVault[], selectedVaultId?: string | null) {
  if (selectedVaultId && vaults.some((vault) => vault.id === selectedVaultId)) {
    return selectedVaultId;
  }

  return vaults[0]?.id ?? null;
}

function pickVaultsByIds(vaults: NormalizedVault[], ids?: string[]) {
  if (!ids || ids.length === 0) {
    return [];
  }

  return ids
    .map((id) => vaults.find((vault) => vault.id === id) ?? null)
    .filter((vault): vault is NormalizedVault => Boolean(vault));
}

function dedupeVaults(vaults: NormalizedVault[]) {
  const seen = new Set<string>();
  return vaults.filter((vault) => {
    if (seen.has(vault.id)) {
      return false;
    }

    seen.add(vault.id);
    return true;
  });
}

async function requestPlanFromSiliconFlow(rawInput: string, candidates: NormalizedVault[], apiKey: string) {
  const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: SILICONFLOW_MODEL,
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildPlanPrompt(rawInput, candidates),
        },
      ],
      tools: [PLAN_TOOL],
      tool_choice: "auto",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `SiliconFlow request failed: ${response.status}`);
  }

  const payload = (await response.json()) as SiliconFlowChatCompletion;
  const message = payload.choices?.[0]?.message;
  const toolCall = message?.tool_calls?.find((call) => call.function?.name === "emit_a2ui_plan");

  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments) as PlanToolPayload;
  }

  if (message?.content) {
    return JSON.parse(message.content) as PlanToolPayload;
  }

  throw new Error("SiliconFlow response did not include a plan payload");
}

function buildPlanPrompt(rawInput: string, candidates: NormalizedVault[]) {
  return [
    `用户目标：${rawInput}`,
    `允许链：${SUPPORTED_CHAINS.map((chain) => chain.name).join(", ")}`,
    `允许资产：${SUPPORTED_ASSETS.map((asset) => asset.symbol).join(", ")}`,
    "请只从下面候选列表中选择 vaultId，最多 3 个：",
    JSON.stringify(
      candidates.map((vault) => ({
        id: vault.id,
        name: vault.name,
        protocol: vault.protocol,
        chain: vault.network,
        chainId: vault.chainId,
        asset: vault.underlyingToken.symbol,
        apy: vault.apy,
        tvlUsd: vault.tvlUsd,
        isStablecoin: vault.isStablecoin,
        isRedeemable: vault.isRedeemable,
        isTransactional: vault.isTransactional,
        tags: vault.tags.slice(0, 6),
        description: vault.description,
      })),
      null,
      2,
    ),
  ].join("\n\n");
}
