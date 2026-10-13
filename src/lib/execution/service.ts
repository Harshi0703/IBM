import { getLanguageConfig, isSupportedLanguage } from "@/lib/languages";

export interface ExecutionResult {
  configured: boolean;
  executed: boolean;
  statusDescription: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number | null;
  timeSeconds: string | null;
  memoryKb: number | null;
  hasError: boolean;
  setupNotice?: string;
}

const EXECUTION_TIMEOUT_MS = 12_000;
const MAX_OUTPUT_CHARS = 8_000;

export function isExecutionServiceConfigured(): boolean {
  const url = process.env.JUDGE0_API_URL?.trim();
  return Boolean(url && url.startsWith("http"));
}

function truncateOutput(text: string | null | undefined): string {
  if (!text) return "";
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  return text.slice(0, MAX_OUTPUT_CHARS) + "\n... [Output truncated for safety]";
}

/**
 * Isolated code execution adapter via Judge0 CE API.
 * Security policy: Never executes untrusted code on the host server or shell.
 */
export async function executeCodeInSandbox(params: {
  language: string;
  code: string;
  stdin?: string;
}): Promise<ExecutionResult> {
  if (!isSupportedLanguage(params.language)) {
    throw new Error(`Unsupported language: ${params.language}`);
  }

  if (!isExecutionServiceConfigured()) {
    return {
      configured: false,
      executed: false,
      statusDescription: "Sandbox Execution Not Configured",
      stdout: "",
      stderr: "",
      compileOutput: "",
      exitCode: null,
      timeSeconds: null,
      memoryKb: null,
      hasError: false,
      setupNotice:
        "Isolated code execution requires a configured Judge0 sandbox endpoint (JUDGE0_API_URL in .env). For security, CodeMentor AI never executes arbitrary submitted code directly on the host server. You can still use Explain Code, Static AI Debugging, and Socratic Learning Mode!",
    };
  }

  const langConfig = getLanguageConfig(params.language);
  const baseUrl = process.env.JUDGE0_API_URL!.replace(/\/+$/, "");
  const apiKey = process.env.JUDGE0_API_KEY?.trim();
  const apiHost = process.env.JUDGE0_API_HOST?.trim() || "judge0-ce.p.rapidapi.com";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["X-RapidAPI-Key"] = apiKey;
    headers["X-RapidAPI-Host"] = apiHost;
    headers["X-Auth-Token"] = apiKey;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${baseUrl}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: params.code,
          language_id: langConfig.judge0Id,
          stdin: params.stdin || "",
          cpu_time_limit: 5.0,
          memory_limit: 128000,
          enable_network: false,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Sandbox provider returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      stdout?: string | null;
      stderr?: string | null;
      compile_output?: string | null;
      message?: string | null;
      exit_code?: number | null;
      time?: string | null;
      memory?: number | null;
      status?: { id?: number; description?: string };
    };

    const statusId = data.status?.id ?? 0;
    const statusDescription = data.status?.description ?? "Completed";
    const stdout = truncateOutput(data.stdout);
    const stderr = truncateOutput(data.stderr || data.message);
    const compileOutput = truncateOutput(data.compile_output);
    // Judge0 status ID 3 === Accepted (ran cleanly)
    const hasError = statusId !== 3 || Boolean(stderr) || Boolean(compileOutput);

    return {
      configured: true,
      executed: true,
      statusDescription,
      stdout,
      stderr,
      compileOutput,
      exitCode: data.exit_code ?? null,
      timeSeconds: data.time ?? null,
      memoryKb: data.memory ?? null,
      hasError,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Sandbox execution timed out after 12 seconds.");
    }
    throw new Error(
      error instanceof Error
        ? `Sandbox execution failed: ${error.message}`
        : "Sandbox execution service unavailable."
    );
  } finally {
    clearTimeout(timeout);
  }
}
