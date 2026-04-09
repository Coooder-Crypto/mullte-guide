"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { erc20Abi } from "viem";
import { useAccount, useChainId, usePublicClient, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { fetchComposerQuote } from "@/lib/api/composer";
import { fetchPortfolioPositions } from "@/lib/api/earn";
import { fromMinimalUnit, isNativeToken } from "@/lib/format/amount";
import { formatTokenAmount } from "@/lib/format/number";
import { normalizePortfolioPositions } from "@/lib/portfolio/normalize-positions";
import { buildQuoteParams } from "@/lib/quote/build-quote-params";
import type { ActionCardData } from "@/lib/types/a2ui";
import type { PortfolioViewPosition } from "@/lib/types/domain";
import type { QuoteResponse } from "@/lib/types/quote";

export function ActionCard({
  data,
  onPortfolioLoaded,
}: {
  data: ActionCardData;
  onPortfolioLoaded: (address: string, positions: PortfolioViewPosition[]) => void;
}) {
  const { address, isConnected } = useAccount();
  const activeChainId = useChainId();
  const publicClient = usePublicClient();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { sendTransactionAsync, isPending: isSendingTransaction } = useSendTransaction();
  const { writeContractAsync, isPending: isApproving } = useWriteContract();

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [depositHash, setDepositHash] = useState<`0x${string}` | undefined>();
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>();
  const [allowanceSatisfied, setAllowanceSatisfied] = useState(false);

  const approvalReceipt = useWaitForTransactionReceipt({
    hash: approvalHash,
    query: { enabled: Boolean(approvalHash) },
  });

  const depositReceipt = useWaitForTransactionReceipt({
    hash: depositHash,
    query: { enabled: Boolean(depositHash) },
  });

  const quoteParams = useMemo(() => {
    if (!address) {
      return null;
    }

    return buildQuoteParams({
      address,
      constraints: data.constraints,
      vault: data.vault,
    });
  }, [address, data.constraints, data.vault]);

  const estimatedOutput = useMemo(() => {
    if (!quote) {
      return null;
    }

    return formatTokenAmount(
      fromMinimalUnit(quote.estimate.toAmount, quote.action.toToken.decimals),
      quote.action.toToken.symbol,
      6,
    );
  }, [quote]);

  useEffect(() => {
    if (approvalReceipt.isSuccess) {
      setAllowanceSatisfied(true);
    }
  }, [approvalReceipt.isSuccess]);

  useEffect(() => {
    if (!depositReceipt.isSuccess || !address) {
      return;
    }

    void fetchPortfolioPositions(address)
      .then((response) => {
        onPortfolioLoaded(address, normalizePortfolioPositions(response.positions));
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }, [address, depositReceipt.isSuccess, onPortfolioLoaded]);

  async function ensureTargetChain() {
    if (activeChainId === data.vault.chainId) {
      return;
    }

    if (!switchChainAsync) {
      throw new Error("当前钱包不支持自动切链，请手动切换后重试。");
    }

    await switchChainAsync({ chainId: data.vault.chainId });
  }

  async function requestQuote() {
    if (!quoteParams) {
      throw new Error("请先连接钱包。");
    }

    setQuoteError(null);
    setIsLoadingQuote(true);

    try {
      const response = await fetchComposerQuote(quoteParams);
      setQuote(response);
      setAllowanceSatisfied(isNativeToken(response.action.fromToken.address));
      await refreshAllowance(response);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Quote 请求失败";
      setQuoteError(message);
      throw error;
    } finally {
      setIsLoadingQuote(false);
    }
  }

  async function refreshAllowance(activeQuote: QuoteResponse) {
    if (!address || !publicClient) {
      return;
    }

    if (isNativeToken(activeQuote.action.fromToken.address)) {
      setAllowanceSatisfied(true);
      return;
    }

    const approvalAddress = activeQuote.estimate.approvalAddress;
    if (!approvalAddress) {
      setAllowanceSatisfied(true);
      return;
    }

    const allowance = await publicClient.readContract({
      abi: erc20Abi,
      address: activeQuote.action.fromToken.address as `0x${string}`,
      functionName: "allowance",
      args: [address, approvalAddress as `0x${string}`],
    });

    setAllowanceSatisfied(allowance >= BigInt(activeQuote.action.fromAmount));
  }

  async function handleApprove() {
    try {
      const activeQuote = quote ?? (await requestQuote());
      const approvalAddress = activeQuote.estimate.approvalAddress;
      if (!approvalAddress) {
        setAllowanceSatisfied(true);
        return;
      }

      await ensureTargetChain();
      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: activeQuote.action.fromToken.address as `0x${string}`,
        functionName: "approve",
        args: [approvalAddress as `0x${string}`, BigInt(activeQuote.action.fromAmount)],
        chainId: data.vault.chainId,
      });
      setApprovalHash(hash);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "授权失败");
    }
  }

  async function handleDeposit() {
    try {
      const activeQuote = quote ?? (await requestQuote());
      await ensureTargetChain();

      if (!allowanceSatisfied) {
        throw new Error("请先完成授权。");
      }

      const transactionRequest = activeQuote.transactionRequest;
      const hash = await sendTransactionAsync({
        to: transactionRequest.to,
        data: transactionRequest.data,
        value: BigInt(transactionRequest.value ?? "0"),
        gas: transactionRequest.gasLimit ? BigInt(transactionRequest.gasLimit) : undefined,
        gasPrice: transactionRequest.gasPrice ? BigInt(transactionRequest.gasPrice) : undefined,
        maxFeePerGas: transactionRequest.maxFeePerGas ? BigInt(transactionRequest.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: transactionRequest.maxPriorityFeePerGas
          ? BigInt(transactionRequest.maxPriorityFeePerGas)
          : undefined,
        chainId: data.vault.chainId,
      });

      setDepositHash(hash);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "存入失败");
    }
  }

  return (
    <section className="panel p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-chip">Action Card</p>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">执行存款</h2>
        </div>
        <div className="w-full rounded-2xl border border-border bg-white/80 px-4 py-2 text-sm text-muted break-words md:w-auto md:rounded-full">
          {data.constraints.amount} {data.constraints.asset} → {data.vault.name}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-border bg-white/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Execution Readiness</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink">
            <li className="rounded-2xl border border-border bg-slate-900/5 px-4 py-3">Composer Quote 使用 GET /v1/quote，通过服务端 Route Handler 代理。</li>
            <li className="rounded-2xl border border-border bg-slate-900/5 px-4 py-3 break-all">`toToken` 固定为 vault.address：{data.vault.address}</li>
            <li className="rounded-2xl border border-border bg-slate-900/5 px-4 py-3">`fromAmount` 按 {data.vault.underlyingToken.decimals} 位精度换算，已兼容 USDC 6 位精度。</li>
          </ul>
        </div>

        <div className="rounded-[28px] border border-border bg-white/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Live State</p>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <StateRow label="钱包状态" value={isConnected ? "已连接" : "未连接"} />
            <StateRow label="当前链" value={activeChainId ? String(activeChainId) : "-"} />
            <StateRow label="目标链" value={String(data.vault.chainId)} />
            <StateRow label="预估输出" value={estimatedOutput ?? "尚未请求 Quote"} />
            <StateRow label="授权状态" value={allowanceSatisfied ? "已满足" : "待授权"} />
          </div>
        </div>
      </div>

      {quoteError ? (
        <div className="mt-5 rounded-3xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">{quoteError}</div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
        {!isConnected ? (
          <div className="w-full sm:w-auto">
            <ConnectButton />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void requestQuote()}
          disabled={!isConnected || isLoadingQuote}
          className="secondary-button"
        >
          {isLoadingQuote ? "请求 Quote 中..." : "1. 获取 Quote"}
        </button>

        <button
          type="button"
          onClick={() => void handleApprove()}
          disabled={!isConnected || isNativeToken(quote?.action.fromToken.address) || allowanceSatisfied || isApproving || approvalReceipt.isLoading || isSwitchingChain}
          className="secondary-button"
        >
          {isApproving || approvalReceipt.isLoading ? "授权处理中..." : "2. 授权代币"}
        </button>

        <button
          type="button"
          onClick={() => void handleDeposit()}
          disabled={!isConnected || !quote || !allowanceSatisfied || isSendingTransaction || depositReceipt.isLoading || isSwitchingChain}
          className="primary-button"
        >
          {isSendingTransaction || depositReceipt.isLoading ? "交易执行中..." : "3. 存入 Vault"}
        </button>
      </div>

      <div className="mt-4 space-y-2 text-sm text-muted">
        <p>如果钱包不在目标链，点击授权或存入时会先尝试自动切链。</p>
        {approvalHash ? <p className="break-all font-mono text-xs text-muted">Approve Tx: {approvalHash}</p> : null}
        {depositHash ? <p className="break-all font-mono text-xs text-muted">Deposit Tx: {depositHash}</p> : null}
      </div>
    </section>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-border bg-slate-900/5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <span>{label}</span>
      <span className="break-all font-medium text-ink sm:text-right">{value}</span>
    </div>
  );
}
