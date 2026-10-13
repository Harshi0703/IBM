import { describe, it, expect } from "vitest";
import {
  ExplainRequestSchema,
  DebugRequestSchema,
  HintRequestSchema,
  ExecuteRequestSchema,
  ExplainResponseSchema,
  DebugResponseSchema,
  analyzeCodeStatically,
  MAX_CODE_LENGTH,
} from "@/lib/validation";
import {
  LANGUAGE_LIST,
  getLanguageConfig,
  isSupportedLanguage,
} from "@/lib/languages";
import { checkRateLimit } from "@/lib/rate-limit";

describe("Unit Tests: Language Configuration", () => {
  it("supports Python, JavaScript, Java, C, and C++", () => {
    const ids = LANGUAGE_LIST.map((l) => l.id);
    expect(ids).toEqual(["python", "javascript", "java", "c", "cpp"]);
    expect(isSupportedLanguage("python")).toBe(true);
    expect(isSupportedLanguage("rust")).toBe(false);
  });

  it("returns starter and buggy templates for every language", () => {
    for (const lang of LANGUAGE_LIST) {
      const cfg = getLanguageConfig(lang.id);
      expect(cfg.defaultCode.length).toBeGreaterThan(20);
      expect(cfg.buggyCode.length).toBeGreaterThan(20);
      expect(cfg.templates.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("Unit Tests: Input & Output Schema Validation", () => {
  it("rejects empty code in ExplainRequestSchema", () => {
    const res = ExplainRequestSchema.safeParse({
      language: "python",
      code: "",
    });
    expect(res.success).toBe(false);
  });

  it("rejects oversized code payloads", () => {
    const huge = "x = 1\n".repeat(MAX_CODE_LENGTH);
    const res = DebugRequestSchema.safeParse({
      language: "python",
      code: huge,
    });
    expect(res.success).toBe(false);
  });

  it("validates HintRequestSchema hintLevel bounds (1..4)", () => {
    expect(
      HintRequestSchema.safeParse({
        language: "python",
        code: "print(1)",
        hintLevel: 2,
      }).success
    ).toBe(true);

    expect(
      HintRequestSchema.safeParse({
        language: "python",
        code: "print(1)",
        hintLevel: 9,
      }).success
    ).toBe(false);
  });

  it("validates ExecuteRequestSchema", () => {
    expect(
      ExecuteRequestSchema.safeParse({
        language: "cpp",
        code: "int main() { return 0; }",
      }).success
    ).toBe(true);
  });

  it("rejects malformed AI response objects", () => {
    const badExplain = ExplainResponseSchema.safeParse({
      mode: "demo",
      summary: "Missing required fields",
    });
    expect(badExplain.success).toBe(false);

    const badDebug = DebugResponseSchema.safeParse({
      mode: "live_ai",
      hasErrors: "not-a-boolean",
    });
    expect(badDebug.success).toBe(false);
  });
});

describe("Unit Tests: Static Error Classification Engine", () => {
  it("detects Python TypeError (string + int concatenation) and range(len + 1) off-by-one", () => {
    const code = `age = 20\nprint("Student is " + age + " years old")\nscores = [1, 2]\nfor i in range(len(scores) + 1):\n    print(scores[i])`;
    const findings = analyzeCodeStatically("python", code);
    expect(findings.length).toBeGreaterThanOrEqual(2);
    expect(findings[0].category).toBe("Type Error");
    expect(findings[0].line).toBe(2);
    expect(findings[1].category).toBe("Off-By-One / Bounds Error");
    expect(findings[1].line).toBe(4);
  });

  it("detects JavaScript <= array.length off-by-one loop bug", () => {
    const code = `const arr = [1, 2, 3];\nfor (let i = 0; i <= arr.length; i++) {\n  console.log(arr[i]);\n}`;
    const findings = analyzeCodeStatically("javascript", code);
    expect(findings.length).toBe(1);
    expect(findings[0].category).toBe("Off-By-One / Bounds Error");
    expect(findings[0].line).toBe(2);
  });

  it("detects Java String == comparison and array bounds bug", () => {
    const code = `public class Main {\n  public static void main(String[] args) {\n    String status = "PASS";\n    if (status == "PASS") {}\n  }\n}`;
    const findings = analyzeCodeStatically("java", code);
    expect(findings.some((f) => f.category === "Logic Error")).toBe(true);
  });

  it("detects C uninitialized accumulator and single '=' assignment inside if()", () => {
    const code = `int main() {\n  int count = 5;\n  int sum;\n  if (count = 10) {}\n}`;
    const findings = analyzeCodeStatically("c", code);
    expect(findings.some((f) => f.category === "Undefined / Uninitialized Variable")).toBe(true);
    expect(findings.some((f) => f.category === "Incorrect Condition")).toBe(true);
  });

  it("classifies explicit runtime error tracebacks accurately", () => {
    const findings = analyzeCodeStatically(
      "python",
      "print(unknown_var)",
      "Traceback (most recent call last):\n  File 'main.py', line 1\nNameError: name 'unknown_var' is not defined"
    );
    expect(findings.length).toBe(1);
    expect(findings[0].category).toBe("Undefined / Uninitialized Variable");
    expect(findings[0].line).toBe(1);
  });
});

describe("Unit Tests: Sliding Window Rate Limiter", () => {
  it("allows requests within quota and blocks when limit is exceeded", () => {
    const key = `test-client-${Date.now()}`;
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(false);
  });
});
