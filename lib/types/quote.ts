export type QuoteRequest = {
  fromChain: string | number;
  toChain: string | number;
  fromToken: string;
  toToken: string;
  fromAddress: string;
  toAddress?: string;
  fromAmount: string;
  slippage?: string;
  order?: "RECOMMENDED" | "FASTEST" | "CHEAPEST";
  integrator?: string;
};

export type QuoteToken = {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name?: string;
  logoURI?: string;
  priceUSD?: string;
};

export type QuoteResponse = {
  id: string;
  type: string;
  tool: string;
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: QuoteToken;
    toToken: QuoteToken;
    fromAmount: string;
    slippage?: number;
    fromAddress: string;
    toAddress?: string;
  };
  estimate: {
    fromAmount: string;
    toAmount: string;
    toAmountMin?: string;
    approvalAddress?: string;
    executionDuration?: number;
    feeCosts?: Array<{
      name?: string;
      amount?: string;
      amountUSD?: string;
      token?: QuoteToken;
    }>;
  };
  transactionRequest: {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: string;
    gasLimit?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
};
