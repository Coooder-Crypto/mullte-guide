import type { QuoteRequest, QuoteResponse } from "@/lib/types/quote";

function toSearchParams(params: QuoteRequest) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });

  return search;
}

export async function fetchComposerQuote(params: QuoteRequest) {
  const response = await fetch(`/api/quote?${toSearchParams(params).toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Quote request failed: ${response.status}`);
  }

  return (await response.json()) as QuoteResponse;
}
