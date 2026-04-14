import { NextResponse } from "next/server";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const RPC_URLS: Record<number, string | undefined> = {
  [mainnet.id]: process.env.ETHEREUM_RPC_URL || mainnet.rpcUrls.default.http[0],
  [optimism.id]: process.env.OPTIMISM_RPC_URL || optimism.rpcUrls.default.http[0],
  [polygon.id]: process.env.POLYGON_RPC_URL || polygon.rpcUrls.default.http[0],
  [base.id]: process.env.BASE_RPC_URL || base.rpcUrls.default.http[0],
  [arbitrum.id]: process.env.ARBITRUM_RPC_URL || arbitrum.rpcUrls.default.http[0],
};

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { chainId: string } }) {
  const chainId = Number(params.chainId);
  const rpcUrl = RPC_URLS[chainId];

  if (!rpcUrl) {
    return NextResponse.json(
      {
        error: `Unsupported chain id: ${params.chainId}`,
      },
      { status: 404 },
    );
  }

  try {
    const body = await request.text();
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body,
      cache: "no-store",
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, `Failed to proxy RPC request for chain ${params.chainId}`),
      },
      { status: 502 },
    );
  }
}
