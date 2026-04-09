import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { address: string } },
) {
  try {
    const response = await fetch(`https://earn.li.fi/v1/earn/portfolio/${params.address}/positions`, {
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
        error: error instanceof Error ? error.message : "Failed to fetch Earn portfolio positions",
      },
      { status: 502 },
    );
  }
}
