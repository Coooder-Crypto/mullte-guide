import type { AnalyzeGoalResponse } from "@/lib/types/agent";

export async function fetchGoalAnalysis(input: string) {
  const response = await fetch("/api/agent/analyze", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ input }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Analyze request failed: ${response.status}`);
  }

  return (await response.json()) as AnalyzeGoalResponse;
}
