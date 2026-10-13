import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSocraticChatReply } from "@/lib/ai/service";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

/**
 * POST /api/tutor
 * Persists code submission snapshots and conversation messages in Prisma (when sessionId exists)
 * and responds using the strict Socratic Tutor system prompt.
 */
export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req);
    const rate = checkRateLimit(`tutor:${clientId}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before sending another message." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.userMessage !== "string" || !body.userMessage.trim()) {
      return NextResponse.json(
        { error: "A valid userMessage is required." },
        { status: 400 }
      );
    }

    const sessionId: string = body.sessionId || "default-session";
    const currentCode: string = body.currentCode || "";
    const errorTrace: string | undefined = body.errorTrace || undefined;
    const userMessage: string = body.userMessage.trim();
    const language: string = body.language || "python";

    let history: Array<{ role: "user" | "assistant"; content: string }> = [];
    let codeSubmissionId: string | null = null;

    // 1. Attempt to fetch past history & record snapshot in Prisma
    try {
      const pastMessages = await prisma.message.findMany({
        where: { session_id: sessionId },
        orderBy: { created_at: "asc" },
        take: 25,
      });

      history = pastMessages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));

      // Ensure parent project exists if foreign key is enforced
      const existingProject = await prisma.project.findUnique({
        where: { id: sessionId },
      });

      if (existingProject) {
        const codeSubmission = await prisma.codeSubmission.create({
          data: {
            session_id: sessionId,
            code_content: currentCode,
            has_error: Boolean(errorTrace),
            error_trace: errorTrace || null,
          },
        });
        codeSubmissionId = codeSubmission.id;

        await prisma.message.create({
          data: {
            session_id: sessionId,
            code_submission_id: codeSubmission.id,
            role: "user",
            content: userMessage,
          },
        });
      }
    } catch {
      // Non-blocking if session is transient or DB is in fallback mode
    }

    // 2. Get the AI's Socratic response
    const aiResult = await generateSocraticChatReply({
      language,
      currentCode,
      errorTrace,
      userMessage,
      learningMode: true,
      history,
    });

    // 3. Save the AI's response to the database if session is tracked
    if (codeSubmissionId) {
      try {
        await prisma.message.create({
          data: {
            session_id: sessionId,
            code_submission_id: codeSubmissionId,
            role: "assistant",
            content: aiResult.reply,
          },
        });
      } catch {
        // Ignore persistence error on transient sessions
      }
    }

    return NextResponse.json({
      reply: aiResult.reply,
      mode: aiResult.mode,
      providerLabel: aiResult.providerLabel,
    });
  } catch (error) {
    console.error("Tutor API Error:", error);
    return NextResponse.json(
      { error: "Failed to process tutor request" },
      { status: 500 }
    );
  }
}
