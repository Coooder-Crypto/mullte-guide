import { NextResponse } from "next/server";
import { analyzeGoal } from "@/lib/agent/analyze-goal";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: string };
    const input = body.input?.trim();

    if (!input) {
      return NextResponse.json(
        {
          error: "Missing input",
        },
        { status: 400 },
      );
    }

    const result = await analyzeGoal(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to analyze goal"),
      },
      { status: 500 },
    );
  }
}
