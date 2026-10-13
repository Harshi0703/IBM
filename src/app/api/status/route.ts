import { NextResponse } from "next/server";
import { isLiveAIConfigured, getAIModelName } from "@/lib/ai/service";
import { isExecutionServiceConfigured } from "@/lib/execution/service";

export async function GET() {
  const aiConfigured = isLiveAIConfigured();
  const executionConfigured = isExecutionServiceConfigured();

  return NextResponse.json({
    ai: {
      configured: aiConfigured,
      mode: aiConfigured ? "live_ai" : "demo",
      model: aiConfigured ? getAIModelName() : "Static Educational Engine",
      label: aiConfigured
        ? `Live AI (${getAIModelName()})`
        : "Educational Demo Mode (Set GEMINI_API_KEY in .env for Live AI)",
    },
    execution: {
      configured: executionConfigured,
      provider: executionConfigured ? "Judge0 Sandbox" : "Not Configured (Static Analysis Active)",
    },
  });
}
