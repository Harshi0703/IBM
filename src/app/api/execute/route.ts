import { NextResponse } from "next/server";
import { ExecuteRequestSchema } from "@/lib/validation";
import { executeCodeInSandbox } from "@/lib/execution/service";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req);
    const rate = checkRateLimit(`execute:${clientId}`, 15, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Execution rate limit reached. Please wait a moment before running code again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parsed = ExecuteRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid execution request.";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const result = await executeCodeInSandbox(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/execute error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Sandbox execution failed.",
      },
      { status: 500 }
    );
  }
}
