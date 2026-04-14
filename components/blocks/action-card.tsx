"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { DetailRow, Eyebrow, MetricCard } from "@/components/ui/flat-primitives";
import { erc20Abi } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { fetchComposerQuote } from "@/lib/api/composer";
import { fetchPortfolioPositions } from "@/lib/api/earn";
import { fromMinimalUnit, isNativeToken } from "@/lib/format/amount";
import { formatTokenAmount } from "@/lib/format/number";
import { normalizePortfolioPositions } from "@/lib/portfolio/normalize-positions";
import { buildQuoteParams } from "@/lib/quote/build-quote-params";
import { getChainName } from "@/lib/constants/chains";
import type { ActionCardData } from "@/lib/types/a2ui";
import type { PortfolioViewPosition } from "@/lib/types/domain";
import type { QuoteResponse } from "@/lib/types/quote";
import { getErrorMessage } from "@/lib/utils/get-error-message";

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

  const minimumOutput = useMemo(() => {
    if (!quote?.estimate.toAmountMin) {
      return null;
    }

    return formatTokenAmount(
      fromMinimalUnit(quote.estimate.toAmountMin, quote.action.toToken.decimals),
      quote.action.toToken.symbol,
      6,
    );
  }, [quote]);

  const approvalRequired = quote ? !isNativeToken(quote.action.fromToken.address) : true;
  const activeChainLabel = activeChainId ? getChainName(activeChainId) : "未连接";
  const targetChainLabel = getChainName(data.vault.chainId);

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
      await refreshAllowance(response);
      return response;
    } catch (error) {
      const message = getErrorMessage(error, "Quote 请求失败");
      setQuoteError(message);
      throw error;
    } finally {
      setIsLoadingQuote(false);
    }
  }

  async function getActiveQuote() {
    return quote ?? (await requestQuote());
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
      const activeQuote = await getActiveQuote();
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
      setQuoteError(getErrorMessage(error, "授权失败"));
    }
  }

  async function handleDeposit() {
    try {
      const activeQuote = await getActiveQuote();
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
      setQuoteError(getErrorMessage(error, "存入失败"));
    }
  }

  return (
    <section className="panel overflow-hidden p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="label-chip">Action Card</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-[2rem]">执行存款</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            钱包连接后，这里会承接 quote、授权、切链和最终存款动作，避免用户跳到外部工具继续操作。
          </p>
        </div>

        <div className="rounded-[10px] border border-black bg-white px-4 py-3 text-sm text-muted md:max-w-[360px]">
          {data.constraints.amount} {data.constraints.asset} → {data.vault.name}
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <StepStatusCard
          step="01"
          title="获取 Quote"
          status={quote ? "已就绪" : isLoadingQuote ? "请求中" : "待执行"}
          detail={quote ? `预估输出 ${estimatedOutput ?? "-"}` : "先确认执行路径和预估结果。"}
        />
        <StepStatusCard
          step="02"
          title="授权代币"
          status={
            !approvalRequired
              ? "无需授权"
              : allowanceSatisfied
                ? "已满足"
                : isApproving || approvalReceipt.isLoading
                  ? "处理中"
                  : "待授权"
          }
          detail={!approvalRequired ? "当前资产可直接发送交易。" : "ERC-20 资产需要先检查 allowance。"}
        />
        <StepStatusCard
          step="03"
          title="存入 Vault"
          status={
            depositReceipt.isSuccess
              ? "已确认"
              : depositHash
                ? "待确认"
                : isSendingTransaction || depositReceipt.isLoading
                  ? "执行中"
                  : "待执行"
          }
          detail={depositHash ? "交易已发出，等待链上确认并回拉持仓。" : "准备完成后可直接提交最终交易。"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="trust-pill">Quote 先展示再交易</span>
        <span className="trust-pill">钱包本地签名</span>
        <span className="trust-pill">目标链先校验</span>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <section className="flat-card p-5">
          <Eyebrow>Execution Guardrails</Eyebrow>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-ink">
            <li className="flat-card-muted px-4 py-3">
              Composer Quote 通过服务端 Route Handler 代理，前端只消费统一响应。
            </li>
            <li className="flat-card-muted break-all px-4 py-3">
              目标 token 固定为 vault 地址：{data.vault.address}
            </li>
            <li className="flat-card-muted px-4 py-3">
              输入金额会按 {data.vault.underlyingToken.decimals} 位精度转换，兼容稳定币与 ETH 资产。
            </li>
          </ul>
        </section>

        <section className="flat-card p-5">
          <Eyebrow>Live State</Eyebrow>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <DetailRow label="钱包状态" value={isConnected ? "已连接" : "未连接"} />
            <DetailRow label="当前链" value={activeChainLabel} />
            <DetailRow label="目标链" value={targetChainLabel} />
            <DetailRow label="预估输出" value={estimatedOutput ?? "尚未请求 Quote"} />
            <DetailRow label="授权状态" value={allowanceSatisfied ? "已满足" : "待授权"} />
          </div>
        </section>
      </div>

      {quote ? (
        <section className="mt-6 rounded-[10px] border border-black bg-accentSoft p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Quote Preview</Eyebrow>
              <h3 className="mt-2 text-xl font-semibold text-ink">本次执行路径概览</h3>
            </div>
            {quote.estimate.executionDuration ? (
              <span className="status-pill">
                约 {Math.ceil(quote.estimate.executionDuration / 60)} 分钟
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard
              label="From"
              value={formatTokenAmount(
                fromMinimalUnit(quote.action.fromAmount, quote.action.fromToken.decimals),
                quote.action.fromToken.symbol,
                6,
              )}
              valueClassName="mt-2 text-base"
            />
            <MetricCard label="To" value={estimatedOutput ?? "-"} valueClassName="mt-2 text-base" />
            <MetricCard label="Min Receive" value={minimumOutput ?? "未提供"} valueClassName="mt-2 text-base" />
          </div>
        </section>
      ) : isLoadingQuote ? (
        <section className="mt-6 rounded-[10px] border border-black bg-accentSoft p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Quote Preview</Eyebrow>
              <h3 className="mt-2 text-xl font-semibold text-ink">正在请求执行路径</h3>
            </div>
            <span className="status-pill">Loading</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="flat-card p-4">
              <div className="space-y-3">
                <div className="skeleton-block h-3 w-16" />
                <div className="skeleton-block h-5 w-28" />
              </div>
            </div>
            <div className="flat-card p-4">
              <div className="space-y-3">
                <div className="skeleton-block h-3 w-12" />
                <div className="skeleton-block h-5 w-24" />
              </div>
            </div>
            <div className="flat-card p-4">
              <div className="space-y-3">
                <div className="skeleton-block h-3 w-24" />
                <div className="skeleton-block h-5 w-32" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {quoteError ? (
        <div className="mt-5 rounded-[10px] border border-orange-500 bg-[#fff7ed] px-4 py-4 text-sm text-orange-900">
          {quoteError}
        </div>
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
          disabled={
            !isConnected ||
            isNativeToken(quote?.action.fromToken.address) ||
            allowanceSatisfied ||
            isApproving ||
            approvalReceipt.isLoading ||
            isSwitchingChain
          }
          className="secondary-button"
        >
          {isApproving || approvalReceipt.isLoading ? "授权处理中..." : "2. 授权代币"}
        </button>

        <button
          type="button"
          onClick={() => void handleDeposit()}
          disabled={
            !isConnected ||
            !quote ||
            !allowanceSatisfied ||
            isSendingTransaction ||
            depositReceipt.isLoading ||
            isSwitchingChain
          }
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

function StepStatusCard({
  step,
  title,
  status,
  detail,
}: {
  step: string;
  title: string;
  status: string;
  detail: string;
}) {
  return (
    <article className="metric-tile">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{`Step ${step}`}</Eyebrow>
        <span className="rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-ink">{status}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </article>
  );
}
