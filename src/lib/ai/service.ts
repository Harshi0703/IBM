import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ExplainResponse,
  ExplainResponseSchema,
  DebugResponse,
  DebugResponseSchema,
  HintResponse,
  HintResponseSchema,
  analyzeCodeStatically,
} from "@/lib/validation";
import { getLanguageConfig } from "@/lib/languages";
import {
  SOCRATIC_TUTOR_SYSTEM_PROMPT,
  EXPLAIN_SYSTEM_PROMPT,
  DEBUG_SYSTEM_PROMPT,
  HINT_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";

const AI_TIMEOUT_MS = 25_000;

export function isLiveAIConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key.length > 5 && !key.startsWith("your_"));
}

export function getAIModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  }
  return JSON.parse(candidate);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI request timed out.")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// ============================================================================
// 1. EXPLAIN CODE
// ============================================================================

export async function explainCode(params: {
  language: string;
  code: string;
  learningMode?: boolean;
  executionOutput?: string;
}): Promise<ExplainResponse> {
  const langConfig = getLanguageConfig(params.language);

  if (isLiveAIConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: getAIModelName(),
        systemInstruction: EXPLAIN_SYSTEM_PROMPT,
      });

      const prompt = `Language: ${langConfig.name}
Learning Mode Active: ${params.learningMode ? "Yes" : "No"}
${params.executionOutput ? `Actual Execution Output:\n${params.executionOutput}\n` : ""}
Submitted Code:
\`\`\`${params.language}
${params.code}
\`\`\``;

      const result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
      const text = result.response.text();
      const parsed = extractJsonObject(text) as Record<string, unknown>;

      const validated = ExplainResponseSchema.parse({
        ...parsed,
        mode: "live_ai",
        providerLabel: `Live AI (${getAIModelName()})`,
      });
      return validated;
    } catch (error) {
      console.error("Live AI explainCode error:", error);
      throw new Error(
        error instanceof Error
          ? `AI provider error: ${error.message}`
          : "Failed to generate explanation from AI provider."
      );
    }
  }

  return buildDemoExplanation(params);
}

function buildDemoExplanation(params: {
  language: string;
  code: string;
  executionOutput?: string;
}): ExplainResponse {
  const langConfig = getLanguageConfig(params.language);
  const rawLines = params.code.split(/\r?\n/);
  const nonEmptyLines = rawLines
    .map((text, idx) => ({ lineNum: idx + 1, text: text.trim() }))
    .filter((l) => l.text.length > 0 && !l.text.startsWith("//") && !l.text.startsWith("#"));

  const lineByLine = nonEmptyLines.slice(0, 8).map((item) => {
    let explanation = "Executes a program statement and updates the current state.";
    if (/^(def |function |public static |int [a-zA-Z0-9_]+\(|void )/.test(item.text)) {
      explanation =
        "Defines a reusable function/method block so this logic can be called with inputs.";
    } else if (/^(for |while )/.test(item.text)) {
      explanation =
        "Starts a loop (iteration) that repeats the indented/enclosed block for each item or step.";
    } else if (/^(if |else if |elif |else)/.test(item.text)) {
      explanation =
        "Evaluates a conditional decision branch to decide which block of code should run.";
    } else if (/(print|console\.log|System\.out\.print|printf|cout)/.test(item.text)) {
      explanation =
        "Displays the computed value or message to the standard output console so you can inspect the result.";
    } else if (/^return\b/.test(item.text)) {
      explanation =
        "Sends the final calculated value back to the caller and exits the current function.";
    } else if (/=/.test(item.text)) {
      explanation =
        "Creates or updates a variable in memory by storing the value on the right into the name on the left.";
    }

    return {
      lines: `Line ${item.lineNum}`,
      codeSnippet: item.text.slice(0, 120),
      explanation,
    };
  });

  const concepts: ExplainResponse["concepts"] = [];
  const codeText = params.code;

  if (/[a-zA-Z_][a-zA-Z0-9_]*\s*=[^=]/.test(codeText)) {
    concepts.push({
      name: "Variables & Assignment",
      category: "Variables",
      explanation:
        "Variables give a human-readable name to a piece of data stored in computer memory.",
      analogy: "Think of a variable like a labeled storage box where you can place and update a value.",
    });
  }
  if (/\b(for|while)\b/.test(codeText)) {
    concepts.push({
      name: "Loops (Iteration)",
      category: "Loops",
      explanation:
        "A loop repeats a block of instructions automatically until a stopping condition is reached.",
      analogy:
        "Iteration is like checking each flashcard in a deck one by one until you reach the last card.",
    });
  }
  if (/\b(if|else|elif|switch)\b/.test(codeText)) {
    concepts.push({
      name: "Conditional Statements",
      category: "Conditions",
      explanation:
        "Conditionals let your program make decisions based on whether a test expression is true or false.",
      analogy:
        "Like checking the weather before leaving home: IF it is raining, bring an umbrella; ELSE wear sunglasses.",
    });
  }
  if (/\b(def|function|void|public static|int main)\b/.test(codeText)) {
    concepts.push({
      name: "Functions & Modular Logic",
      category: "Functions",
      explanation:
        "Functions bundle a set of steps under a single name so you can reuse them without copying code.",
      analogy:
        "A function is like a kitchen blender: you put ingredients (inputs) in, it runs its steps, and hands back a smoothie (return value).",
    });
  }
  if (/\[.*\]|vector<|int\[\]/.test(codeText)) {
    concepts.push({
      name: "Arrays / Lists (Collections)",
      category: "Collections",
      explanation:
        "Collections store an ordered sequence of items that can be accessed by their zero-based position index.",
      analogy:
        "Like a row of numbered lockers starting at locker #0, where each locker holds one item.",
    });
  }
  if (concepts.length === 0) {
    concepts.push({
      name: "Sequential Execution",
      category: "Input/Output",
      explanation: "The computer reads and executes statements from top to bottom, one line at a time.",
      analogy: "Like following a cooking recipe step-by-step from the top of the page to the bottom.",
    });
  }

  const staticIssues = analyzeCodeStatically(params.language, params.code);
  const predictedOutput =
    params.executionOutput?.trim() ||
    (staticIssues.length > 0
      ? `Potential Error Detected on Line ${staticIssues[0].line ?? "?"}: ${staticIssues[0].title} (${staticIssues[0].category})`
      : `Program executes sequentially in ${langConfig.name} and prints its formatted output to the console.`);

  return {
    mode: "demo",
    providerLabel: "Educational Demo Mode (Static Analysis — Set GEMINI_API_KEY for Live AI)",
    summary: `This ${langConfig.name} program contains ${nonEmptyLines.length} active statement(s) demonstrating ${concepts.map((c) => c.name.toLowerCase()).join(", ")}.${
      staticIssues.length > 0
        ? ` Note: Static inspection flagged ${staticIssues.length} potential issue(s) you may want to inspect in Debug Mode.`
        : ""
    }`,
    language: langConfig.name,
    lineByLine,
    concepts,
    executionWalkthrough: [
      `Step 1: The ${langConfig.name} runtime reads definitions, imports, and initial variable assignments.`,
      /\b(for|while)\b/.test(codeText)
        ? "Step 2: The loop iterates through the sequence, updating accumulator or state variables on each pass."
        : "Step 2: Core expressions and helper functions are evaluated with the provided values.",
      /\b(if|else)\b/.test(codeText)
        ? "Step 3: The conditional branch checks whether the condition holds true and selects the matching path."
        : "Step 3: Final results are prepared for output.",
      "Step 4: Output statements print the result to the console.",
    ],
    expectedOutput: {
      output: predictedOutput,
      isVerifiedByExecution: Boolean(params.executionOutput),
      verificationNote: params.executionOutput
        ? "Verified by actual sandbox code execution."
        : "Unverified static prediction (configure Judge0 or run code to verify actual runtime output).",
    },
    learningCheck: {
      question:
        /\b(for|while)\b/.test(codeText)
          ? "What happens if a loop's stopping condition is never reached or goes one step past the collection's last index?"
          : "Why do we store intermediate values in named variables instead of writing everything on a single line?",
      options: /\b(for|while)\b/.test(codeText)
        ? [
            "It causes an out-of-bounds / index error or an infinite loop",
            "The compiler automatically deletes the loop",
            "The array doubles its size automatically",
            "The program runs twice as fast",
          ]
        : [
            "Variables make code readable, reusable, and easier to inspect step-by-step while debugging",
            "Variables make the file size smaller on disk",
            "Programming languages forbid expressions without variables",
            "Variables prevent all syntax errors automatically",
          ],
      correctIndex: 0,
      explanation:
        /\b(for|while)\b/.test(codeText)
          ? "Collections use zero-based indexing, so valid indices run from 0 up to length - 1. Going past length - 1 accesses invalid memory or undefined elements."
          : "Storing values in descriptive variables lets you inspect intermediate steps and makes your intent clear to humans.",
    },
  };
}

// ============================================================================
// 2. DEBUG CODE
// ============================================================================

export async function debugCode(params: {
  language: string;
  code: string;
  errorTrace?: string;
  executionOutput?: string;
  isExecutionConfirmed?: boolean;
  learningMode?: boolean;
}): Promise<DebugResponse> {
  const langConfig = getLanguageConfig(params.language);

  if (isLiveAIConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: getAIModelName(),
        systemInstruction: DEBUG_SYSTEM_PROMPT,
      });

      const prompt = `Language: ${langConfig.name}
Execution Confirmed: ${params.isExecutionConfirmed ? "Yes (real sandbox output provided)" : "No (static code analysis only)"}
Error Trace / Compiler Output:
${params.errorTrace || "None provided."}

Standard Output:
${params.executionOutput || "None provided."}

Submitted Code:
\`\`\`${params.language}
${params.code}
\`\`\``;

      const result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
      const text = result.response.text();
      const parsed = extractJsonObject(text) as Record<string, unknown>;

      return DebugResponseSchema.parse({
        ...parsed,
        mode: "live_ai",
        providerLabel: `Live AI (${getAIModelName()})`,
      });
    } catch (error) {
      console.error("Live AI debugCode error:", error);
      throw new Error(
        error instanceof Error
          ? `AI provider error: ${error.message}`
          : "Failed to analyze code with AI provider."
      );
    }
  }

  return buildDemoDebug(params);
}

function buildCorrectedDemoCode(language: string, code: string): {
  correctedCode: string;
  changes: string[];
} {
  let fixed = code;
  const changes: string[] = [];

  if (language === "python") {
    if (/print\s*\(.*["'].*\+.*\b(age|count|total|score|num|result)\b/.test(fixed) && !fixed.includes("str(")) {
      fixed = fixed.replace(
        /(print\s*\([^\n]*?\+\s*)\b(age|count|total|score|num|result)\b/g,
        "$1str($2)"
      );
      changes.push("Wrapped numeric variable with `str(...)` so Python concatenates strings safely without raising a TypeError.");
    }
    if (/range\s*\(\s*len\s*\(([^)]+)\)\s*\+\s*1\s*\)/.test(fixed)) {
      fixed = fixed.replace(/range\s*\(\s*len\s*\(([^)]+)\)\s*\+\s*1\s*\)/g, "range(len($1))");
      changes.push("Removed `+ 1` inside `range(len(...))` so the loop stops at the last valid index (`len - 1`).");
    }
    if (/return\s+total\s*\/\s*len\(numbers\)/.test(fixed) && !/if\s+len\(numbers\)\s*==\s*0/.test(fixed)) {
      fixed = fixed.replace(
        /def find_mean\(numbers\):\s*\n/,
        "def find_mean(numbers):\n    if len(numbers) == 0:\n        return 0\n"
      );
      changes.push("Added a guard clause (`if len(numbers) == 0: return 0`) before dividing to prevent `ZeroDivisionError` on empty lists.");
    }
  }

  if (language === "javascript" || language === "java" || language === "cpp") {
    if (/for\s*\(([^;]+);\s*([a-zA-Z0-9_]+)\s*<=\s*([a-zA-Z0-9_.]+\.(?:length|size\(\)))/.test(fixed)) {
      fixed = fixed.replace(
        /for\s*\(([^;]+);\s*([a-zA-Z0-9_]+)\s*<=\s*([a-zA-Z0-9_.]+\.(?:length|size\(\)))/g,
        "for ($1; $2 < $3"
      );
      changes.push("Changed loop condition from `<=` to `<` so the index stays strictly within valid collection bounds (`0` to `length - 1`).");
    }
  }

  if (language === "java" && /if\s*\(\s*status\s*==\s*"PASS"\s*\)/.test(fixed)) {
    fixed = fixed.replace(/if\s*\(\s*status\s*==\s*"PASS"\s*\)/, 'if ("PASS".equals(status))');
    changes.push('Replaced `status == "PASS"` with `"PASS".equals(status)` to compare string character content rather than object memory references.');
  }

  if ((language === "c" || language === "cpp") && /int\s+sum\s*;/.test(fixed)) {
    fixed = fixed.replace(/int\s+sum\s*;/, "int sum = 0;");
    changes.push("Initialized `int sum = 0;` at declaration so accumulation starts from zero instead of uninitialized memory garbage.");
  }

  if ((language === "c" || language === "cpp" || language === "javascript") && /if\s*\(\s*count\s*=\s*10\s*\)/.test(fixed)) {
    fixed = fixed.replace(/if\s*\(\s*count\s*=\s*10\s*\)/, "if (count == 10)");
    changes.push("Changed `if (count = 10)` to `if (count == 10)` so the condition compares `count` to 10 instead of overwriting it.");
  }

  if (language === "cpp" && /total\s*\/\s*0/.test(fixed)) {
    fixed = fixed.replace(/total\s*\/\s*0/, "total / scores.size()");
    changes.push("Replaced literal `/ 0` with `/ scores.size()` to compute the actual average without dividing by zero.");
  }

  if (changes.length === 0) {
    changes.push("Reviewed code structure; no automated line replacements were required.");
  }

  return { correctedCode: fixed, changes };
}

function buildDemoDebug(params: {
  language: string;
  code: string;
  errorTrace?: string;
  executionOutput?: string;
  isExecutionConfirmed?: boolean;
}): DebugResponse {
  const findings = analyzeCodeStatically(params.language, params.code, params.errorTrace);
  const isConfirmed = Boolean(params.isExecutionConfirmed && params.errorTrace);

  if (findings.length === 0) {
    return {
      mode: "demo",
      providerLabel: "Educational Demo Mode (Static Analysis — Set GEMINI_API_KEY for Live AI)",
      hasErrors: false,
      overallDiagnosis:
        "No obvious syntax or common logic bugs were detected by static analysis. If your program produces unexpected output for specific inputs, share the input or error log!",
      errorCategory: "No Obvious Error Found",
      primaryLine: null,
      verificationStatus: params.isExecutionConfirmed
        ? "confirmed_by_execution"
        : "inferred_from_static_analysis",
      verificationNote: params.isExecutionConfirmed
        ? "Code executed without throwing runtime errors."
        : "Inferred from static code analysis only (code was not executed). Test with edge-case inputs to verify.",
      socraticGuidance: {
        diagnosis:
          "Your code looks structurally sound on static inspection, with no obvious syntax or bounds errors.",
        location: "Full program scope",
        concept:
          "Boundary Testing — Even when code compiles cleanly, testing edge cases (like 0, negative numbers, or empty lists) verifies its logic.",
        nextStep:
          "What happens if you pass an empty list or zero into your main calculation? Try testing an edge case!",
      },
      suspectedIssues: [],
      verifiedIssues: [],
      suggestedFix: "No syntax fix needed. Consider adding input validation for empty or extreme inputs.",
      correctedCode: params.code,
      changeExplanation: ["No errors detected; original code preserved."],
      preventionTip:
        "Always test your functions with at least three cases: a normal input, a boundary input (like 0 or 1 item), and an empty input.",
      followUpQuestion:
        "Can you think of one input value that might cause your code to behave unexpectedly?",
      similarExercisePrompt:
        "Try modifying your program to handle empty inputs gracefully with an `if` check.",
    };
  }

  const primary = findings[0];
  const { correctedCode, changes } = buildCorrectedDemoCode(params.language, params.code);

  const mappedIssues: DebugResponse["suspectedIssues"] = findings.map((f) => ({
    line: f.line,
    category: f.category,
    title: f.title,
    description: f.description,
    whyItHappens: f.whyItHappens,
    confidence: isConfirmed ? "confirmed_by_execution" : "inferred_static",
  }));

  return {
    mode: "demo",
    providerLabel: "Educational Demo Mode (Static Analysis — Set GEMINI_API_KEY for Live AI)",
    hasErrors: true,
    overallDiagnosis: `Detected ${findings.length} issue(s): ${primary.title}${
      primary.line ? ` on Line ${primary.line}` : ""
    }.`,
    errorCategory: primary.category,
    primaryLine: primary.line,
    verificationStatus: isConfirmed ? "confirmed_by_execution" : "inferred_from_static_analysis",
    verificationNote: isConfirmed
      ? "Confirmed by execution error output."
      : "Inferred from static code analysis (not yet verified by live sandbox execution).",
    socraticGuidance: {
      diagnosis: `${primary.description} ${primary.whyItHappens}`,
      location: primary.line ? `Line ${primary.line}` : "Check the highlighted expression",
      concept: `${primary.conceptName} — ${primary.conceptAnalogy}`,
      nextStep: primary.nextStepQuestion,
    },
    suspectedIssues: isConfirmed ? [] : mappedIssues,
    verifiedIssues: isConfirmed ? mappedIssues : [],
    suggestedFix: changes.join(" "),
    correctedCode,
    changeExplanation: changes,
    preventionTip:
      "When writing loops and conditions, pause to check: (1) Do variable types match? (2) Does the loop stop at `length - 1`? (3) Are all accumulators initialized?",
    followUpQuestion: primary.nextStepQuestion,
    similarExercisePrompt: `Practice Challenge: Write a small 5-line snippet that demonstrates ${primary.conceptName} without triggering a ${primary.category}.`,
  };
}

// ============================================================================
// 3. SOCRATIC HINTS (LEARNING MODE)
// ============================================================================

export async function generateHint(params: {
  language: string;
  code: string;
  hintLevel: number;
  errorTrace?: string;
  studentHypothesis?: string;
}): Promise<HintResponse> {
  const langConfig = getLanguageConfig(params.language);

  if (isLiveAIConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: getAIModelName(),
        systemInstruction: HINT_SYSTEM_PROMPT,
      });

      const prompt = `Language: ${langConfig.name}
Requested Hint Level: ${params.hintLevel} (1 = subtle nudge, 2 = concept & line location, 3 = targeted variable/operator question, 4 = Frustration Protocol generic foo/bar syntax example)
${params.studentHypothesis ? `Student's Hypothesis: "${params.studentHypothesis}"\n` : ""}
${params.errorTrace ? `Error Trace:\n${params.errorTrace}\n` : ""}
Submitted Code:
\`\`\`${params.language}
${params.code}
\`\`\``;

      const result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
      const text = result.response.text();
      const parsed = extractJsonObject(text) as Record<string, unknown>;

      return HintResponseSchema.parse({
        ...parsed,
        mode: "live_ai",
        providerLabel: `Live AI (${getAIModelName()})`,
      });
    } catch (error) {
      console.error("Live AI generateHint error:", error);
      throw new Error(
        error instanceof Error
          ? `AI provider error: ${error.message}`
          : "Failed to generate Socratic hint."
      );
    }
  }

  return buildDemoHint(params);
}

function buildDemoHint(params: {
  language: string;
  code: string;
  hintLevel: number;
  errorTrace?: string;
  studentHypothesis?: string;
}): HintResponse {
  const findings = analyzeCodeStatically(params.language, params.code, params.errorTrace);
  const primary = findings[0];
  const level = Math.min(4, Math.max(1, params.hintLevel));

  if (!primary) {
    return {
      mode: "demo",
      providerLabel: "Educational Demo Mode (Static Analysis — Set GEMINI_API_KEY for Live AI)",
      hintLevel: level,
      hintTitle: `Hint ${level}: Tracing Your Program Step-by-Step`,
      socraticQuestion:
        "If you pretend to be the computer and run line 1 with a small sample input, what value does each variable hold after the first step?",
      hintText:
        "No obvious syntax error stood out! Walk through your variables on paper for the very first and very last step of your code.",
      conceptSpotlight: {
        title: "Dry-Running (Mental Tracing)",
        simpleRule:
          "Dry-running means acting as the computer and writing down each variable's value after every line executes.",
        analogy:
          "Like rehearsing a play script line-by-line before going on stage.",
      },
      targetLine: 1,
      genericSyntaxExample:
        level === 4
          ? "// Generic trace pattern:\n// Step 1: foo = 0\n// Step 2: foo = foo + bar"
          : null,
      encouragement: "You're thinking like an engineer—keep tracing one line at a time!",
    };
  }

  const hintTitles: Record<number, string> = {
    1: "Hint 1: Spot the Area of Interest",
    2: "Hint 2: Isolate the Exact Line & Concept",
    3: "Hint 3: Inspect the Operator or Data Type",
    4: "Hint 4 (Frustration Protocol): Generic Syntax Pattern",
  };

  const hintTexts: Record<number, string> = {
    1: `Focus on how your program handles ${primary.conceptName.toLowerCase()}. Something unexpected happens right around ${
      primary.line ? `Line ${primary.line}` : "your main calculation"
    }.`,
    2: `Look closely at ${primary.line ? `Line ${primary.line}` : "the highlighted expression"}: ${primary.description}`,
    3: `${primary.whyItHappens} ${primary.nextStepQuestion}`,
    4: `You've worked hard on this! Per the Frustration Protocol, here is a generic syntax example using unrelated variables (never giving away your exact code) so you can see the pattern and apply it yourself on ${
      primary.line ? `Line ${primary.line}` : "your line"
    }.`,
  };

  let genericExample: string | null = null;
  if (level === 4) {
    if (primary.category === "Type Error") {
      genericExample = `# Generic Example (using unrelated 'apples' variable):\napples = 5\n# Convert number to string before joining with '+':\nprint("I have " + str(apples) + " apples")`;
    } else if (primary.category === "Off-By-One / Bounds Error") {
      genericExample =
        params.language === "python"
          ? `# Generic Example (stop at len(items), without + 1):\nitems = [10, 20]\nfor idx in range(len(items)):\n    print(items[idx])`
          : `// Generic Example (use '<' instead of '<=' with length):\nfor (let idx = 0; idx < items.length; idx++) {\n  console.log(items[idx]);\n}`;
    } else if (primary.category === "Incorrect Condition") {
      genericExample = `// Generic Example ('==' asks a question, '=' overwrites):\nif (foo == 42) {\n  // runs only when foo equals 42\n}`;
    } else {
      genericExample = `// Generic Pattern:\nint accumulator = 0; // Always initialize before looping\n// Check denominator != 0 before dividing`;
    }
  }

  return {
    mode: "demo",
    providerLabel: "Educational Demo Mode (Static Analysis — Set GEMINI_API_KEY for Live AI)",
    hintLevel: level,
    hintTitle: hintTitles[level],
    socraticQuestion: primary.nextStepQuestion,
    hintText: hintTexts[level],
    conceptSpotlight: {
      title: primary.conceptName,
      simpleRule: primary.whyItHappens,
      analogy: primary.conceptAnalogy,
    },
    targetLine: primary.line,
    genericSyntaxExample: genericExample,
    encouragement:
      level < 4
        ? "Take a look at that line and try editing it in the editor—you've got this!"
        : "Compare the generic `foo/apples` pattern above with your variable and give it a try!",
  };
}

// ============================================================================
// 4. SOCRATIC TUTOR CHAT (/api/chat & /api/tutor)
// ============================================================================

export async function generateSocraticChatReply(params: {
  language: string;
  currentCode: string;
  errorTrace?: string;
  userMessage: string;
  learningMode?: boolean;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<{
  reply: string;
  mode: "live_ai" | "demo";
  providerLabel: string;
}> {
  const contextualPrompt = `CURRENT CODE STATE (${params.language}):
\`\`\`${params.language}
${params.currentCode}
\`\`\`

CURRENT ERROR TRACE:
${params.errorTrace ? params.errorTrace : "No runtime errors, but user has a question."}

STUDENT'S MESSAGE:
"${params.userMessage}"`;

  if (isLiveAIConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: getAIModelName(),
        systemInstruction: SOCRATIC_TUTOR_SYSTEM_PROMPT,
      });

      const formattedHistory = (params.history ?? []).map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({ history: formattedHistory });
      const result = await withTimeout(chat.sendMessage(contextualPrompt), AI_TIMEOUT_MS);
      const aiResponseText = result.response.text();

      return {
        reply: aiResponseText,
        mode: "live_ai",
        providerLabel: `Live AI (${getAIModelName()})`,
      };
    } catch (error) {
      console.error("Live AI Socratic Tutor chat error:", error);
      throw new Error(
        error instanceof Error
          ? `AI provider error: ${error.message}`
          : "Failed to process tutor request."
      );
    }
  }

  // Honest Educational Demo Mode Socratic response following the exact 4-part format:
  // - **Diagnosis:**
  // - **Location:**
  // - **Concept:**
  // - **Next Step:**
  const findings = analyzeCodeStatically(params.language, params.currentCode, params.errorTrace);
  const primary = findings[0];

  if (primary) {
    const reply = `- **Diagnosis:** ${primary.description} ${primary.whyItHappens}
- **Location:** ${primary.line ? `Line ${primary.line}` : "Check your main calculation expression"}.
- **Concept:** **${primary.conceptName}** — ${primary.conceptAnalogy}
- **Next Step:** ${primary.nextStepQuestion}`;

    return {
      reply,
      mode: "demo",
      providerLabel: "Educational Demo Mode (Static Socratic Tutor — Set GEMINI_API_KEY for Live AI)",
    };
  }

  const reply = `- **Diagnosis:** Your code doesn't show an immediate syntax crash, and you asked: *"${params.userMessage.slice(0, 120)}"*.
- **Location:** Review the main function and loop body in your current ${params.language} editor.
- **Concept:** **Step-by-Step Tracing (Dry Run)** — Walking through your code one line at a time is like following a recipe with a checklist to verify each ingredient before baking.
- **Next Step:** Pick one test input value and trace what your variables hold after the very first line runs—does that match what you expected?`;

  return {
    reply,
    mode: "demo",
    providerLabel: "Educational Demo Mode (Static Socratic Tutor — Set GEMINI_API_KEY for Live AI)",
  };
}
