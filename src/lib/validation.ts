import { z } from "zod";

export const SupportedLanguageSchema = z.enum([
  "python",
  "javascript",
  "java",
  "c",
  "cpp",
]);

export const MAX_CODE_LENGTH = 25000;
export const MAX_MESSAGE_LENGTH = 4000;

// ============================================================================
// Incoming API Request Schemas
// ============================================================================

export const ExplainRequestSchema = z.object({
  language: SupportedLanguageSchema,
  code: z
    .string()
    .min(1, "Please enter some code to explain.")
    .max(MAX_CODE_LENGTH, `Code exceeds maximum allowed length of ${MAX_CODE_LENGTH} characters.`),
  learningMode: z.boolean().optional().default(true),
  executionOutput: z.string().max(10000).optional(),
});

export const DebugRequestSchema = z.object({
  language: SupportedLanguageSchema,
  code: z
    .string()
    .min(1, "Please enter some code to debug.")
    .max(MAX_CODE_LENGTH, `Code exceeds maximum allowed length of ${MAX_CODE_LENGTH} characters.`),
  errorTrace: z.string().max(10000).optional(),
  executionOutput: z.string().max(10000).optional(),
  isExecutionConfirmed: z.boolean().optional().default(false),
  learningMode: z.boolean().optional().default(true),
});

export const HintRequestSchema = z.object({
  language: SupportedLanguageSchema,
  code: z
    .string()
    .min(1, "Please enter code to request a hint.")
    .max(MAX_CODE_LENGTH, `Code exceeds maximum allowed length of ${MAX_CODE_LENGTH} characters.`),
  hintLevel: z.number().int().min(1).max(4).default(1),
  errorTrace: z.string().max(10000).optional(),
  studentHypothesis: z.string().max(2000).optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

export const ChatRequestSchema = z.object({
  sessionId: z.string().optional(),
  language: SupportedLanguageSchema.optional().default("python"),
  code: z.string().max(MAX_CODE_LENGTH).optional().default(""),
  errorTrace: z.string().max(10000).optional(),
  userMessage: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(MAX_MESSAGE_LENGTH, "Message is too long."),
  learningMode: z.boolean().optional().default(true),
  history: z.array(ChatMessageSchema).max(30).optional().default([]),
});

export const ExecuteRequestSchema = z.object({
  language: SupportedLanguageSchema,
  code: z
    .string()
    .min(1, "Cannot execute empty code.")
    .max(MAX_CODE_LENGTH, `Code exceeds maximum allowed length of ${MAX_CODE_LENGTH} characters.`),
  stdin: z.string().max(4000).optional().default(""),
});

export const ProjectCreateSchema = z.object({
  title: z.string().min(1, "Project title is required.").max(120),
  language: SupportedLanguageSchema,
  code: z.string().min(1).max(MAX_CODE_LENGTH),
  learningMode: z.boolean().optional().default(true),
  lastExplanationJson: z.string().optional().nullable(),
  lastDebugJson: z.string().optional().nullable(),
  lastExecutionJson: z.string().optional().nullable(),
  hintsUsed: z.number().int().min(0).optional().default(0),
});

export const ProjectUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  language: SupportedLanguageSchema.optional(),
  code: z.string().min(1).max(MAX_CODE_LENGTH).optional(),
  learningMode: z.boolean().optional(),
  lastExplanationJson: z.string().optional().nullable(),
  lastDebugJson: z.string().optional().nullable(),
  lastExecutionJson: z.string().optional().nullable(),
  hintsUsed: z.number().int().min(0).optional(),
});

// ============================================================================
// Structured AI Output Schemas
// ============================================================================

export const LineExplanationSchema = z.object({
  lines: z.string(),
  codeSnippet: z.string(),
  explanation: z.string(),
});

export const ConceptItemSchema = z.object({
  name: z.string(),
  category: z.string(),
  explanation: z.string(),
  analogy: z.string(),
});

export const ExplainResponseSchema = z.object({
  mode: z.enum(["live_ai", "demo"]),
  providerLabel: z.string(),
  summary: z.string(),
  language: z.string(),
  lineByLine: z.array(LineExplanationSchema),
  concepts: z.array(ConceptItemSchema),
  executionWalkthrough: z.array(z.string()),
  expectedOutput: z.object({
    output: z.string(),
    isVerifiedByExecution: z.boolean(),
    verificationNote: z.string(),
  }),
  learningCheck: z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number().int().min(0),
    explanation: z.string(),
  }),
});

export const ErrorCategorySchema = z.enum([
  "Syntax Error",
  "Runtime Error",
  "Type Error",
  "Undefined / Uninitialized Variable",
  "Incorrect Condition",
  "Off-By-One / Bounds Error",
  "Logic Error",
  "Division By Zero",
  "No Obvious Error Found",
]);

export const IssueItemSchema = z.object({
  line: z.number().int().nullable(),
  category: ErrorCategorySchema,
  title: z.string(),
  description: z.string(),
  whyItHappens: z.string(),
  confidence: z.enum(["confirmed_by_execution", "inferred_static", "possible_needs_testing"]),
});

export const DebugResponseSchema = z.object({
  mode: z.enum(["live_ai", "demo"]),
  providerLabel: z.string(),
  hasErrors: z.boolean(),
  overallDiagnosis: z.string(),
  errorCategory: ErrorCategorySchema,
  primaryLine: z.number().int().nullable(),
  verificationStatus: z.enum([
    "confirmed_by_execution",
    "inferred_from_static_analysis",
    "needs_more_input",
  ]),
  verificationNote: z.string(),
  socraticGuidance: z.object({
    diagnosis: z.string(),
    location: z.string(),
    concept: z.string(),
    nextStep: z.string(),
  }),
  suspectedIssues: z.array(IssueItemSchema),
   verifiedIssues: z.array(IssueItemSchema),
  suggestedFix: z.string(),
  correctedCode: z.string(),
  changeExplanation: z.array(z.string()),
  preventionTip: z.string(),
  followUpQuestion: z.string(),
  similarExercisePrompt: z.string(),
});

export const HintResponseSchema = z.object({
  mode: z.enum(["live_ai", "demo"]),
  providerLabel: z.string(),
  hintLevel: z.number().int().min(1).max(4),
  hintTitle: z.string(),
  socraticQuestion: z.string(),
  hintText: z.string(),
  conceptSpotlight: z.object({
    title: z.string(),
    simpleRule: z.string(),
    analogy: z.string(),
  }),
  targetLine: z.number().int().nullable(),
  genericSyntaxExample: z.string().nullable(),
  encouragement: z.string(),
});

export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;
export type DebugResponse = z.infer<typeof DebugResponseSchema>;
export type HintResponse = z.infer<typeof HintResponseSchema>;

// ============================================================================
// Static Error Classification & Heuristic Helper
// ============================================================================

export interface StaticFinding {
  line: number | null;
  category: z.infer<typeof ErrorCategorySchema>;
  title: string;
  description: string;
  whyItHappens: string;
  conceptName: string;
  conceptAnalogy: string;
  nextStepQuestion: string;
  suggestedLineFix?: string;
}

export function analyzeCodeStatically(language: string, code: string, errorTrace?: string): StaticFinding[] {
  const findings: StaticFinding[] = [];
  const lines = code.split(/\r?\n/);

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//") || line.startsWith("/*")) {
      return;
    }

    // 1. Python string + int concatenation check
    if (
      language === "python" &&
      /print\s*\(.*["'].*\+.*\b(age|count|total|score|num|result|i)\b/i.test(line) &&
      !line.includes("str(")
    ) {
      findings.push({
        line: lineNum,
        category: "Type Error",
        title: "Combining Text (str) and Number (int) with '+'",
        description: `Line ${lineNum} attempts to glue a text string and a number variable together using '+'.`,
        whyItHappens:
          "In Python, '+' either adds two numbers mathematically or joins two strings together. It refuses to guess which one you want when given one string and one number.",
        conceptName: "Type Compatibility (Strings vs. Integers)",
        conceptAnalogy:
          "It is like trying to mathematically add 5 apples to the word 'hello'—you first have to write '5' as a word before putting it in a sentence.",
        nextStepQuestion:
          "Look at the number variable inside your `print(...)` statement. What built-in Python function converts a number into text (`str`) before joining it?",
      });
    }

    // 2. Python range(len(...) + 1) off-by-one check
    if (language === "python" && /range\s*\(\s*len\s*\([^)]+\)\s*\+\s*1\s*\)/.test(line)) {
      findings.push({
        line: lineNum,
        category: "Off-By-One / Bounds Error",
        title: "Loop Runs One Step Past the End of the List",
        description: `Line ${lineNum} uses \`range(len(...) + 1)\`, which generates an index equal to the list length.`,
        whyItHappens:
          "Because list positions start counting at 0, a list with 3 items only has valid positions 0, 1, and 2. Position 3 does not exist and triggers an IndexError.",
        conceptName: "Zero-Based Indexing & Loop Bounds",
        conceptAnalogy:
          "Imagine a 3-story building where floors are numbered 0, 1, and 2. Asking the elevator to go to floor 3 sends you onto the roof!",
        nextStepQuestion:
          "If `range(len(list))` already stops right at the last valid index, what happens if you remove `+ 1` from your `range(...)` call?",
      });
    }

    // 3. Python empty list division check
    if (language === "python" && /\/\s*len\s*\(/.test(line)) {
      const hasEmptyList = /\[\s*\]/.test(code) && !/if\s+len\(/.test(code) && !/if\s+not\s+/.test(code);
      if (hasEmptyList) {
        findings.push({
          line: lineNum,
          category: "Division By Zero",
          title: "Dividing by `len(...)` When the List Can Be Empty",
          description: `Line ${lineNum} divides by the length of a list without checking if the list has 0 items.`,
          whyItHappens:
            "When an empty list `[]` is passed in, `len()` returns `0`. Dividing any number by `0` is mathematically undefined and raises `ZeroDivisionError`.",
          conceptName: "Guard Clauses & Edge Cases",
          conceptAnalogy:
            "Sharing 0 pizzas among 0 friends has no meaningful answer—you have to check if anyone showed up before dividing the slices.",
          nextStepQuestion:
            "How could you use an `if` statement at the start of the function to check if the list is empty before dividing?",
        });
      }
    }

    // 4. JS / Java / C++ <= .length or .size() off-by-one loop check
    if (
      (language === "javascript" || language === "java" || language === "cpp") &&
      /for\s*\([^;]+;\s*[a-zA-Z0-9_]+\s*<=\s*[a-zA-Z0-9_.]+\.(length|size\(\))/.test(line)
    ) {
      findings.push({
        line: lineNum,
        category: "Off-By-One / Bounds Error",
        title: "Loop Condition Uses `<=` Instead of `<` on Collection Length",
        description: `Line ${lineNum} continues looping when the index equals the length/size of the collection.`,
        whyItHappens:
          language === "javascript"
            ? "In JavaScript, reading `array[array.length]` returns `undefined`. Adding `undefined` to a number turns your total into `NaN` (Not a Number)."
            : "Because indexing starts at 0, the last valid element is at `length - 1`. Accessing index `length` reads outside the array bounds.",
        conceptName: "Zero-Based Array Bounds",
        conceptAnalogy:
          "If a train has 3 cars numbered 0, 1, and 2, stepping into car #3 means stepping off the back of the train!",
        nextStepQuestion:
          "Look closely at the comparison operator `<=` in your `for` loop header. Which comparison operator stops just before the index equals the length?",
      });
    }

    // 5. Java String == comparison check
    if (language === "java" && /if\s*\([^)]*==\s*["'][^"']*["']/.test(line)) {
      findings.push({
        line: lineNum,
        category: "Logic Error",
        title: "Comparing Java Strings with `==` Instead of `.equals()`",
        description: `Line ${lineNum} uses \`==\` to compare a String object with a text literal.`,
        whyItHappens:
          "In Java, `==` checks whether two variables point to the exact same memory address, not whether they contain the same letters.",
        conceptName: "Reference Equality vs. Value Equality",
        conceptAnalogy:
          "Using `==` on Java Strings is like checking if two people live in the exact same house, when you really just wanted to check if they have the same name.",
        nextStepQuestion:
          "Instead of `==`, which built-in method on a Java `String` checks whether two strings have the exact same characters?",
      });
    }

    // 6. C / C++ uninitialized sum/total variable check
    if ((language === "c" || language === "cpp") && /^int\s+(sum|total|count|result)\s*;/.test(line)) {
      findings.push({
        line: lineNum,
        category: "Undefined / Uninitialized Variable",
        title: "Local Variable Declared Without an Initial Starting Value",
        description: `Line ${lineNum} declares a variable without setting it to \`0\` before adding to it in a loop.`,
        whyItHappens:
          "In C and C++, local variables are not automatically set to zero—they hold whatever random leftover bits ('garbage value') were already in that memory slot.",
        conceptName: "Variable Initialization in C/C++",
        conceptAnalogy:
          "Using an uninitialized variable in C is like pouring water into a cup you found on a table without emptying it first.",
        nextStepQuestion:
          "Before you start adding numbers to your accumulator variable, what starting value should you assign to it on the line where it is declared?",
      });
    }

    // 7. C / C++ / JS accidental assignment in if condition: if (x = 10)
    if (
      (language === "c" || language === "cpp" || language === "javascript") &&
      /if\s*\(\s*[a-zA-Z0-9_]+\s*=\s*[^=]/.test(line)
    ) {
      findings.push({
        line: lineNum,
        category: "Incorrect Condition",
        title: "Single `=` (Assignment) Used Inside an `if` Condition Instead of `==`",
        description: `Line ${lineNum} overwrites the variable inside \`if (...)\` instead of comparing it.`,
        whyItHappens:
          "A single `=` puts a new value into the variable and evaluates to truthy (if non-zero), so the `if` branch runs every single time regardless of the original value.",
        conceptName: "Assignment (`=`) vs. Equality Comparison (`==`)",
        conceptAnalogy:
          "A single `=` is a command ('Set the thermostat to 10!'), whereas `==` is a question ('Is the thermostat currently at 10?').",
        nextStepQuestion:
          "Look inside the parentheses of your `if` statement. How do you write the operator that asks a question instead of assigning a value?",
      });
    }

    // 8. Explicit division by literal 0
    if (/\/\s*0\b/.test(line)) {
      findings.push({
        line: lineNum,
        category: "Division By Zero",
        title: "Division by Literal Zero (`/ 0`)",
        description: `Line ${lineNum} divides directly by 0.`,
        whyItHappens:
          "Dividing by zero is undefined in arithmetic and causes a crash or floating-point exception at runtime.",
        conceptName: "Safe Division & Denominators",
        conceptAnalogy:
          "If you want to find the average score per item, you must divide by the count of items, not by zero.",
        nextStepQuestion:
          "Instead of `0`, what variable or expression represents the actual number of elements you are averaging?",
      });
    }
  });

  // Also inspect explicit errorTrace if passed
  if (errorTrace && errorTrace.trim().length > 0 && findings.length === 0) {
    const trace = errorTrace.toLowerCase();
    let category: z.infer<typeof ErrorCategorySchema> = "Runtime Error";
    if (trace.includes("syntaxerror") || trace.includes("expected ';'") || trace.includes("indentationerror")) {
      category = "Syntax Error";
    } else if (trace.includes("typeerror")) {
      category = "Type Error";
    } else if (trace.includes("nameerror") || trace.includes("referenceerror") || trace.includes("undeclared")) {
      category = "Undefined / Uninitialized Variable";
    } else if (trace.includes("indexerror") || trace.includes("outofbounds")) {
      category = "Off-By-One / Bounds Error";
    } else if (trace.includes("zerodivision")) {
      category = "Division By Zero";
    }

    const lineMatch = errorTrace.match(/line\s+(\d+)/i) || errorTrace.match(/:(\d+):/);
    const extractedLine = lineMatch ? parseInt(lineMatch[1], 10) : null;

    findings.push({
      line: extractedLine,
      category,
      title: `${category} Reported in Error Trace`,
      description: `The compiler/interpreter reported: ${errorTrace.split("\n")[0].slice(0, 180)}`,
      whyItHappens:
        "The language runtime encountered an instruction that violated its syntax or type safety rules and halted execution.",
      conceptName: category,
      conceptAnalogy:
        "An error trace is like a GPS recalculating notice—it tells you the exact street (line number) where the computer couldn't follow your directions.",
      nextStepQuestion: extractedLine
        ? `Check line ${extractedLine} and the line immediately above it. Do all variables, types, and punctuation match what the language expects?`
        : "Read the last line of the error message carefully—which variable or symbol is it pointing to?",
    });
  }

  return findings;
}
