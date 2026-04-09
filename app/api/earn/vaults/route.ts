import { NextResponse } from "next/server";

const EARN_VAULTS_URL = "https://earn.li.fi/v1/earn/vaults";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch(EARN_VAULTS_URL, {
      headers: {
        accept: "application/json",
      },
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
        error: error instanceof Error ? error.message : "Failed to fetch Earn vaults",
      },
      { status: 502 },
    );
  }
}
