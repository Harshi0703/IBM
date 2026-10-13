"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Layers,
  ListChecks,
  Terminal,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { ExplainResponse } from "@/lib/validation";

interface ExplainPanelProps {
  data: ExplainResponse;
}

export function ExplainPanel({ data }: ExplainPanelProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const isCorrect =
    selectedOption !== null && selectedOption === data.learningCheck.correctIndex;

  return (
    <div className="space-y-5 text-sm">
      {/* Provider Mode Transparency Banner */}
      <div
        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
          data.mode === "live_ai"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        }`}
      >
        <span className="font-medium flex items-center gap-1.5">
          {data.mode === "live_ai" ? (
            <Sparkles className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {data.providerLabel}
        </span>
        <span className="uppercase tracking-wider text-[10px] font-semibold">
          {data.language}
        </span>
      </div>

      {/* 1. Overview */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <BookOpen className="h-4 w-4 text-brand-500" />
          1. Overview
        </h3>
        <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
          {data.summary}
        </p>
      </section>

      {/* 2. Line-by-Line Explanation */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <ListChecks className="h-4 w-4 text-brand-500" />
          2. Line-by-Line Explanation
        </h3>
        <div className="mt-3 space-y-2.5">
          {data.lineByLine.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {item.lines}
                </span>
              </div>
              <pre className="mt-1.5 overflow-x-auto rounded bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-slate-100">
                <code>{item.codeSnippet}</code>
              </pre>
              <p className="mt-2 text-slate-700 dark:text-slate-300">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Concepts Used */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Layers className="h-4 w-4 text-brand-500" />
          3. Programming Concepts Used
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {data.concepts.map((concept, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {concept.name}
                </span>
                <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {concept.category}
                </span>
              </div>
              <p className="mt-1.5 text-slate-700 dark:text-slate-300">
                {concept.explanation}
              </p>
              <p className="mt-1.5 text-xs italic text-brand-600 dark:text-brand-400">
                💡 Real-world analogy: {concept.analogy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Execution Walkthrough */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Terminal className="h-4 w-4 text-brand-500" />
          4. Execution Walkthrough
        </h3>
        <ol className="mt-3 space-y-2 border-l-2 border-brand-500/30 pl-4">
          {data.executionWalkthrough.map((step, idx) => (
            <li key={idx} className="text-slate-700 dark:text-slate-300">
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Expected Output */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            5. Expected Output
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              data.expectedOutput.isVerifiedByExecution
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}
          >
            {data.expectedOutput.isVerifiedByExecution
              ? "Verified by Sandbox Execution"
              : "Unverified Static Prediction"}
          </span>
        </div>
        <pre className="mt-2.5 overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800">
          {data.expectedOutput.output}
        </pre>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {data.expectedOutput.verificationNote}
        </p>
      </section>

      {/* 6. Learning Check */}
      <section className="rounded-xl border border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/20 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <HelpCircle className="h-4 w-4 text-brand-500" />
          6. Quick Learning Check
        </h3>
        <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
          {data.learningCheck.question}
        </p>
        <div className="mt-3 space-y-2">
          {data.learningCheck.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? idx === data.learningCheck.correctIndex
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                      : "border-red-500 bg-red-500/15 text-red-800 dark:text-red-200"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/50 text-slate-700 dark:text-slate-300"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selectedOption !== null && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-xs ${
              isCorrect
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                {isCorrect ? "Spot on!" : "Not quite — give it another look!"}
              </p>
              <p className="mt-0.5">{data.learningCheck.explanation}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
