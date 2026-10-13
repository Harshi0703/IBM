"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  GraduationCap,
  Lightbulb,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  LANGUAGE_LIST,
  SupportedLanguageId,
  getLanguageConfig,
  isSupportedLanguage,
} from "@/lib/languages";
import { PRACTICE_EXERCISES, PracticeExercise } from "@/lib/exercises";
import { analyzeCodeStatically } from "@/lib/validation";

interface AttemptFeedback {
  passed: boolean;
  evaluationType: "sandbox_runtime" | "static_construct_check";
  message: string;
  actualOutput?: string;
  details: string[];
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const { settings, recordActivity, showToast } = useApp();

  const [language, setLanguage] = useState<SupportedLanguageId>(settings.defaultLanguage);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string>(PRACTICE_EXERCISES[0].id);
  const [code, setCode] = useState<string>(
    PRACTICE_EXERCISES[0].starterCode[settings.defaultLanguage]
  );
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);

  const filteredExercises = PRACTICE_EXERCISES.filter(
    (ex) => difficultyFilter === "All" || ex.difficulty === difficultyFilter
  );

  const activeExercise: PracticeExercise =
    PRACTICE_EXERCISES.find((ex) => ex.id === selectedId) || PRACTICE_EXERCISES[0];

  useEffect(() => {
    const langParam = searchParams.get("lang");
    if (langParam && isSupportedLanguage(langParam)) {
      setLanguage(langParam);
      setCode(activeExercise.starterCode[langParam]);
    }
  }, [searchParams, activeExercise]);

  const handleSelectExercise = (ex: PracticeExercise) => {
    setSelectedId(ex.id);
    setCode(ex.starterCode[language]);
    setRevealedHints(0);
    setFeedback(null);
  };

  const handleLanguageChange = (newLang: SupportedLanguageId) => {
    setLanguage(newLang);
    setCode(activeExercise.starterCode[newLang]);
    setRevealedHints(0);
    setFeedback(null);
  };

  const handleSubmitAttempt = async () => {
    if (!code.trim()) {
      showToast("Please write your solution before submitting.", "error");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    recordActivity("exercise", language);

    try {
      const sampleTest = activeExercise.sampleTests[0];
      const execRes = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          stdin: sampleTest?.stdin || "",
        }),
      });
      const execData = await execRes.json();

      // Case A: Real Sandbox Execution is configured and ran
      if (execRes.ok && execData.configured && execData.executed) {
        const actual = (execData.stdout || "").trim();
        const expected = (sampleTest?.expectedOutput || "").trim();
        const passed = !execData.hasError && actual === expected;

        setFeedback({
          passed,
          evaluationType: "sandbox_runtime",
          actualOutput: actual || execData.stderr || execData.compileOutput || "(no output)",
          message: passed
            ? "Sample test case passed via live sandbox execution!"
            : "Your solution did not match the expected sample output.",
          details: [
            `Expected sample output: "${expected}"`,
            `Actual sandbox output: "${actual || execData.stderr || "Error"}"`,
          ],
        });
        return;
      }

      // Case B: Sandbox is not configured -> Run honest Static Construct & Error Inspection
      const staticErrors = analyzeCodeStatically(language, code);
      const patterns = activeExercise.requiredConstructs[language] || [];
      const allPatternsMatched = patterns.every((regex) => regex.test(code));
      const passedStatic = staticErrors.length === 0 && allPatternsMatched;

      setFeedback({
        passed: passedStatic,
        evaluationType: "static_construct_check",
        message: passedStatic
          ? "Passed static code structure & bug check! (Note: Live sandbox execution is not configured; only static construct rules were evaluated.)"
          : "Your attempt still has a static issue or is missing a required construct.",
        details:
          staticErrors.length > 0
            ? staticErrors.map(
                (err) => `Line ${err.line ?? "?"}: ${err.title} — ${err.nextStepQuestion}`
              )
            : allPatternsMatched
            ? [
                "All expected language constructs and boundary conditions were found in your code.",
                "To verify actual console output against hidden/runtime test suites, configure JUDGE0_API_URL in .env.",
              ]
            : [
                "Your code does not yet include the complete logic or return/print statement required by the problem.",
                "Try revealing a hint below to see what construct is needed!",
              ],
      });
    } catch {
      showToast("Could not evaluate attempt.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const langConfig = getLanguageConfig(language);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-brand-500" />
            Practice Mode — Guided Programming Challenges
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Select a beginner challenge below, use progressive hints if needed, and test your solution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguageId)}
            aria-label="Practice Language"
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
          >
            {LANGUAGE_LIST.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            aria-label="Filter by Difficulty"
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Easy">Easy</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Challenge List */}
        <div className="lg:col-span-4 space-y-3">
          {filteredExercises.map((ex) => {
            const active = ex.id === activeExercise.id;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  active
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-brand-500/10 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                    {ex.topic}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      ex.difficulty === "Beginner"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : ex.difficulty === "Easy"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {ex.difficulty}
                  </span>
                </div>
                <h2 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {ex.title}
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {ex.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Area: Problem Details + Editor + Evaluation */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {activeExercise.topic} • {activeExercise.difficulty}
              </span>
              <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {activeExercise.title}
              </h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeExercise.problemStatement}
              </p>
            </div>

            {/* Sample Inputs & Expected Outputs */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Sample Test Case (Visible Check)
                </span>
                <span className="text-[11px] text-slate-500">
                  Note: Sample tests check basic behavior, not comprehensive hidden edge cases
                </span>
              </div>
              {activeExercise.sampleTests.map((t) => (
                <div key={t.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="rounded bg-slate-200/70 dark:bg-slate-900 p-2">
                    <span className="text-slate-500 block text-[10px]">Sample Input:</span>
                    <span>{t.inputDescription}</span>
                  </div>
                  <div className="rounded bg-slate-200/70 dark:bg-slate-900 p-2">
                    <span className="text-slate-500 block text-[10px]">Expected Output:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {t.expectedOutput}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Progressive Hints */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setRevealedHints((prev) =>
                      Math.min(activeExercise.hints.length, prev + 1)
                    )
                  }
                  disabled={revealedHints >= activeExercise.hints.length}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {revealedHints < activeExercise.hints.length
                    ? `Show Hint (${revealedHints + 1}/${activeExercise.hints.length})`
                    : "All Hints Revealed"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCode(activeExercise.starterCode[language]);
                    setFeedback(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Starter Code
                </button>
              </div>

              {revealedHints > 0 && (
                <div className="space-y-2 pt-1">
                  {activeExercise.hints.slice(0, revealedHints).map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <strong>Hint {i + 1}:</strong> {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Editor
                height="260px"
                language={langConfig.monacoLanguage}
                theme={settings.theme === "dark" ? "vs-dark" : "light"}
                value={code}
                onChange={(val) => setCode(val ?? "")}
                options={{
                  fontSize: settings.editorFontSize,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmitAttempt}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {submitting ? "Evaluating Solution..." : "Submit Attempt"}
              </button>
            </div>

            {/* Feedback & Post-Attempt Explanation */}
            {feedback && (
              <div
                className={`rounded-xl border p-4 text-xs space-y-3 ${
                  feedback.passed
                    ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-red-500/40 bg-red-50/40 dark:bg-red-950/20"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {feedback.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-slate-900 dark:text-white">{feedback.message}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    {feedback.evaluationType === "sandbox_runtime" ? (
                      "Verified by Sandbox Runtime"
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        Static Structure Check (Sandbox Unconfigured)
                      </>
                    )}
                  </span>
                </div>

                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  {feedback.details.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-brand-500" />
                    Concept Takeaway
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {activeExercise.postAttemptExplanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Loading Practice Mode...
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
