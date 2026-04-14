"use client";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { http } from "viem";
import { WagmiProvider } from "wagmi";
import { WALLET_CHAINS } from "@/lib/constants/chains";

const RPC_TRANSPORTS = {
  1: http("/api/rpc/1"),
  10: http("/api/rpc/10"),
  137: http("/api/rpc/137"),
  8453: http("/api/rpc/8453"),
  42161: http("/api/rpc/42161"),
} as const;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config] = useState(() =>
    getDefaultConfig({
      appName: "Mullet Guide",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
      chains: WALLET_CHAINS,
      transports: RPC_TRANSPORTS,
      ssr: false,
    }),
  );
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
