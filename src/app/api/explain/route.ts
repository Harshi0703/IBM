import { NextResponse } from "next/server";
import { ExplainRequestSchema } from "@/lib/validation";
import { explainCode } from "@/lib/ai/service";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req);
    const rate = checkRateLimit(`explain:${clientId}`, 25, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many explanation requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parsed = ExplainRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid request parameters.";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const explanation = await explainCode(parsed.data);
    return NextResponse.json(explanation);
  } catch (error) {
    console.error("POST /api/explain error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate code explanation.",
      },
      { status: 500 }
    );
  }
}
