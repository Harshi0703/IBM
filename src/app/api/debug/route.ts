import { NextResponse } from "next/server";
import { DebugRequestSchema } from "@/lib/validation";
import { debugCode } from "@/lib/ai/service";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req);
    const rate = checkRateLimit(`debug:${clientId}`, 25, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many debug requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parsed = DebugRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid request parameters.";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const result = await debugCode(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/debug error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process debugging request.",
      },
      { status: 500 }
    );
  }
}
