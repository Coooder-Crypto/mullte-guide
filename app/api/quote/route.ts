import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const apiKey = process.env.LIFI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Missing LIFI_API_KEY. Composer quote route is disabled until the API key is configured.",
      },
      { status: 500 },
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL("https://li.quest/v1/quote");
  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-lifi-api-key": apiKey,
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
        error: error instanceof Error ? error.message : "Failed to fetch Composer quote",
      },
      { status: 502 },
    );
  }
}
