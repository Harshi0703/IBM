"use client";

import React, { useState } from "react";
import {
  Bug,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Wrench,
} from "lucide-react";
import { DebugResponse } from "@/lib/validation";

interface DebugPanelProps {
  data: DebugResponse;
  originalCode: string;
  learningMode: boolean;
  onApplyCorrection: (correctedCode: string) => void;
  onSwitchToLearningHints: () => void;
}

export function DebugPanel({
  data,
  originalCode,
  learningMode,
  onApplyCorrection,
  onSwitchToLearningHints,
}: DebugPanelProps) {
  const [showSolution, setShowSolution] = useState(!learningMode);

  const allIssues = [...data.verifiedIssues, ...data.suspectedIssues];

  return (
    <div className="space-y-5 text-sm">
      {/* Provider & Verification Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 px-3 py-2 text-xs">
        <span className="font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          {data.mode === "live_ai" ? (
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          )}
          {data.providerLabel}
        </span>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            data.verificationStatus === "confirmed_by_execution"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          {data.verificationStatus === "confirmed_by_execution"
            ? "Confirmed by Execution"
            : "Inferred from Static Analysis"}
        </span>
      </div>

      {/* Socratic 4-Part Diagnosis Card (Matches the user's exact format!) */}
      <section className="rounded-xl border border-brand-500/30 bg-brand-50/40 dark:bg-brand-950/20 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Bug className="h-4 w-4 text-brand-500" />
            Socratic Tutor Diagnosis
          </h3>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
              {data.errorCategory}
            </span>
            {data.primaryLine && (
              <span className="rounded-md bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                Line {data.primaryLine}
              </span>
            )}
          </div>
        </div>

        <ul className="space-y-2.5 text-slate-700 dark:text-slate-200">
          <li>
            <strong className="text-slate-900 dark:text-white">• Diagnosis:</strong>{" "}
            {data.socraticGuidance.diagnosis}
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white">• Location:</strong>{" "}
            <code className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs">
              {data.socraticGuidance.location}
            </code>
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white">• Concept:</strong>{" "}
            {data.socraticGuidance.concept}
          </li>
          <li className="rounded-lg bg-white/80 dark:bg-slate-900/90 border border-brand-500/20 p-3">
            <strong className="text-brand-600 dark:text-brand-400">• Next Step:</strong>{" "}
            {data.socraticGuidance.nextStep}
          </li>
        </ul>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          ℹ️ {data.verificationNote}
        </p>
      </section>

      {/* Detailed Issue Breakdown */}
      {allIssues.length > 0 && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Identified Issues ({allIssues.length})
          </h3>
          <div className="mt-3 space-y-3">
            {allIssues.map((issue, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {issue.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {issue.line && (
                      <span className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-mono font-semibold text-red-600 dark:text-red-400">
                        Line {issue.line}
                      </span>
                    )}
                    <span className="rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300">
                      {issue.confidence === "confirmed_by_execution"
                        ? "Confirmed by Runtime"
                        : "Static Analysis"}
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 text-slate-700 dark:text-slate-300">
                  {issue.description}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <strong>Why this happens:</strong> {issue.whyItHappens}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Learning Mode Gate vs. Direct Solution */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-brand-500" />
              Suggested Correction &amp; Before/After Diff
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {learningMode && !showSolution
                ? "Learning Mode is active: Try fixing the line yourself first, or reveal the comparison below."
                : "Compare your original code with the suggested correction. Remember to test after applying changes!"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {learningMode && !showSolution && (
              <button
                type="button"
                onClick={onSwitchToLearningHints}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Get Progressive Hints
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {showSolution ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Hide Correction
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Show the Correction
                </>
              )}
            </button>
          </div>
        </div>

        {showSolution && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-200">
              <strong>How to fix it:</strong> {data.suggestedFix}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-500">
                  Before (Your Submitted Code)
                </span>
                <pre className="mt-1 max-h-56 overflow-auto rounded-lg border border-red-500/20 bg-slate-950 p-3 font-mono text-xs text-slate-300">
                  <code>{originalCode}</code>
                </pre>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                    After (Suggested Correction — Unverified Until Run)
                  </span>
                </div>
                <pre className="mt-1 max-h-56 overflow-auto rounded-lg border border-emerald-500/20 bg-slate-950 p-3 font-mono text-xs text-emerald-200">
                  <code>{data.correctedCode}</code>
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  What changed and why:
                </span>
                <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  {data.changeExplanation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => onApplyCorrection(data.correctedCode)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Apply to Editor
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Prevention Tip & Follow-up */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          Future Prevention Tip
        </h3>
        <p className="text-slate-700 dark:text-slate-300">{data.preventionTip}</p>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Practice Idea:</strong> {data.similarExercisePrompt}
          </span>
        </div>
      </section>
    </div>
  );
}
