"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  BookOpen,
  Code,
  Eye,
  Dumbbell,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { HintResponse } from "@/lib/validation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface LearningModePanelProps {
  language: string;
  code: string;
  errorTrace?: string;
  sessionId?: string;
  hints: HintResponse[];
  loadingHint: boolean;
  onRequestHint: (level: number, hypothesis?: string) => void;
  onFocusEditor: () => void;
  onRevealCorrection: () => void;
  onOpenSimilarExercise: () => void;
}

export function LearningModePanel({
  language,
  code,
  errorTrace,
  sessionId,
  hints,
  loadingHint,
  onRequestHint,
  onFocusEditor,
  onRevealCorrection,
  onOpenSimilarExercise,
}: LearningModePanelProps) {
  const [hypothesis, setHypothesis] = useState("");
  const [hypothesisSubmitted, setHypothesisSubmitted] = useState(false);
  const [showConceptCard, setShowConceptCard] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const currentHintLevel = hints.length;
  const nextHintLevel = Math.min(4, currentHintLevel + 1);
  const latestHint = hints[hints.length - 1];

  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
    setMessages(nextHistory);
    setChatLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || "workspace-session",
          language,
          currentCode: code,
          errorTrace,
          userMessage: userMsg,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([
          ...nextHistory,
          {
            role: "assistant",
            content:
              data.error ||
              "I couldn't process that question right now. Try clicking 'Give me a hint' above!",
          },
        ]);
      }
    } catch {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: "Network error while contacting the Socratic Tutor endpoint.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-sm">
      {/* Step 1: Ask the student what they think */}
      <section className="rounded-xl border border-brand-500/30 bg-brand-50/40 dark:bg-brand-950/20 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-brand-500" />
            Socratic Learning Mode — Think First!
          </h3>
          <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
            Hint Stage {currentHintLevel} / 4
          </span>
        </div>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
          Before looking at any answer, what do you think this code is supposed to do, or which line looks suspicious to you?
        </p>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="e.g., I'm trying to print the student's age, or sum the list..."
            aria-label="Your hypothesis about the code"
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="button"
            disabled={loadingHint}
            onClick={() => {
              setHypothesisSubmitted(true);
              onRequestHint(nextHintLevel, hypothesis);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {currentHintLevel === 0 ? "Share & Get Hint 1" : `Get Hint ${nextHintLevel}`}
          </button>
        </div>
        {hypothesisSubmitted && hypothesis && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Great hypothesis! Let&apos;s use that to guide your debugging below.
          </p>
        )}
      </section>

      {/* Interactive Learning Mode Action Bar (Required Signature Controls) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loadingHint}
          onClick={() => onRequestHint(nextHintLevel, hypothesis)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {loadingHint
            ? "Thinking..."
            : currentHintLevel < 4
            ? `Give me a hint (${currentHintLevel + 1}/4)`
            : "Refresh Hint 4 (Frustration Protocol)"}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowConceptCard(true);
            if (hints.length === 0) {
              onRequestHint(1, hypothesis);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <BookOpen className="h-3.5 w-3.5 text-brand-500" />
          Explain this concept
        </button>

        <button
          type="button"
          onClick={onFocusEditor}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
        >
          <Code className="h-3.5 w-3.5" />
          Let me try
        </button>

        <button
          type="button"
          onClick={onRevealCorrection}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Eye className="h-3.5 w-3.5 text-amber-500" />
          Show the correction
        </button>

        <button
          type="button"
          onClick={onOpenSimilarExercise}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Dumbbell className="h-3.5 w-3.5 text-indigo-500" />
          Give me a similar exercise
        </button>
      </div>

      {/* Progressive Hints Ladder */}
      {hints.length > 0 && (
        <div className="space-y-3">
          {hints.map((hint, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {hint.hintTitle}
                </span>
                {hint.targetLine && (
                  <span className="rounded bg-amber-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Inspect Line {hint.targetLine}
                  </span>
                )}
              </div>

              <p className="text-slate-700 dark:text-slate-300">{hint.hintText}</p>

              <div className="rounded-lg bg-brand-500/10 border border-brand-500/20 p-3 text-xs text-slate-800 dark:text-slate-200">
                <strong className="text-brand-600 dark:text-brand-400">
                  Guiding Question:
                </strong>{" "}
                {hint.socraticQuestion}
              </div>

              {(showConceptCard || hint.hintLevel >= 2) && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-xs space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    📘 Concept Spotlight: {hint.conceptSpotlight.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {hint.conceptSpotlight.simpleRule}
                  </p>
                  <p className="italic text-brand-600 dark:text-brand-400">
                    Analogy: {hint.conceptSpotlight.analogy}
                  </p>
                </div>
              )}

              {hint.genericSyntaxExample && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Frustration Protocol — Generic Syntax Pattern (Unrelated Variables):
                  </span>
                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800">
                    <code>{hint.genericSyntaxExample}</code>
                  </pre>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400">
                ✨ {hint.encouragement}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Concept Spotlight when toggled explicitly */}
      {showConceptCard && latestHint && hints.length === 1 && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs space-y-1.5">
          <div className="font-semibold text-indigo-700 dark:text-indigo-300">
            Concept Deep-Dive: {latestHint.conceptSpotlight.title}
          </div>
          <p className="text-slate-700 dark:text-slate-200">
            {latestHint.conceptSpotlight.simpleRule}
          </p>
          <p className="italic text-indigo-600 dark:text-indigo-300">
            Real-World Analogy: {latestHint.conceptSpotlight.analogy}
          </p>
        </div>
      )}

      {/* Socratic Tutor Interactive Follow-Up Chat */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <MessageSquare className="h-4 w-4 text-brand-500" />
          Ask the Socratic Tutor (Follows the Golden Rule)
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Ask why an error happens or test your understanding. The tutor responds with{" "}
          <strong>Diagnosis</strong>, <strong>Location</strong>, <strong>Concept</strong>, and{" "}
          <strong>Next Step</strong> without spoiling the solution.
        </p>

        {messages.length > 0 && (
          <div className="mt-3 max-h-64 overflow-y-auto space-y-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-xs whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "ml-6 bg-brand-600 text-white"
                    : "mr-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="font-semibold mb-1 text-[11px] opacity-75">
                  {msg.role === "user" ? "You" : "Socratic Tutor"}
                </div>
                {msg.content}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendTutorMessage} className="mt-3 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question (e.g., Why is my code throwing a TypeError?)"
            aria-label="Ask the Socratic Tutor a question"
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {chatLoading ? "Sending..." : "Ask Tutor"}
          </button>
        </form>
      </section>
    </div>
  );
}
