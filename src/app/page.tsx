import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bug,
  Lightbulb,
  GraduationCap,
  Terminal,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Code2,
} from "lucide-react";
import { LANGUAGE_LIST } from "@/lib/languages";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800/80 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-Powered Programming Tutor for CS &amp; BCA Beginners</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Understand Code. Fix Errors.{" "}
                <span className="text-brand-600 dark:text-brand-400">
                  Learn to Think Like a Programmer.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Most AI tools just hand you fixed code without teaching you why it broke.{" "}
                <strong className="text-slate-900 dark:text-white">CodeMentor AI</strong> uses
                step-by-step explanations, visual walkthroughs, and Socratic hints so you master
                debugging independently.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Explore Features
                </a>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Socratic Learning Mode
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Line-by-Line Walkthroughs
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Python, JS, Java, C, C++
                </span>
              </div>
            </div>

            {/* Product Preview Card: Code + Error + Educational Socratic Explanation */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-500">
                      student_check.py — Socratic Learning Mode
                    </span>
                  </div>
                  <span className="rounded bg-brand-500/15 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                    Python 3
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Code Preview */}
                  <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 border border-slate-800">
                    <div className="text-slate-500">1 &nbsp;age = 20</div>
                    <div className="bg-red-500/15 text-red-200 -mx-4 px-4 py-1 border-l-2 border-red-500">
                      2 &nbsp;print(&quot;Student is &quot; + age + &quot; years old&quot;)
                    </div>
                  </div>

                  {/* Error Preview */}
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-700 dark:text-red-300">
                    <strong>TypeError (Line 2):</strong> can only concatenate str (not
                    &quot;int&quot;) to str
                  </div>

                  {/* Educational Socratic Tutor Preview */}
                  <div className="rounded-xl border border-brand-500/30 bg-brand-50/60 dark:bg-brand-950/30 p-4 text-xs space-y-2 text-slate-700 dark:text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4" />
                        CodeMentor Socratic Guidance
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Golden Rule Active
                      </span>
                    </div>
                    <p>
                      <strong>• Diagnosis:</strong> You are trying to add two different types of
                      data together: text (<code className="font-mono">str</code>) and a whole
                      number (<code className="font-mono">int</code>).
                    </p>
                    <p>
                      <strong>• Location:</strong> Line 2, variable{" "}
                      <code className="font-mono">age</code> inside{" "}
                      <code className="font-mono">print(...)</code>.
                    </p>
                    <p>
                      <strong>• Concept:</strong> <em>Type Compatibility</em> — In Python, you
                      cannot mathematically add a number to a sentence; it&apos;s like trying to add
                      5 apples to the word &ldquo;hello&rdquo;.
                    </p>
                    <p className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-brand-500/20 font-medium text-brand-700 dark:text-brand-300">
                      <strong>• Next Step:</strong> Look at your <code className="font-mono">age</code>{" "}
                      variable. What built-in Python function converts that number into text before
                      combining it with the rest of the sentence?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-16 sm:py-20 border-b border-slate-200 dark:border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Designed for Learning — Not Blind Copy-Pasting
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Every feature in CodeMentor AI is engineered around one core philosophy:{" "}
              <em>&ldquo;Don&apos;t just fix the code. Teach the student how to fix it.&rdquo;</em>
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Step-by-Step Explanations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Breaks down unfamiliar code into plain-English overviews, line-by-line notes,
                real-world analogies, execution walkthroughs, and a comprehension check quiz.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <Bug className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Structured AI Debugging
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pinpoints syntax, runtime, type, off-by-one, and logic errors. Clearly distinguishes
                static analysis from execution-confirmed bugs and explains how to prevent them.
              </p>
            </div>

            <div className="rounded-xl border border-brand-500/40 bg-brand-50/30 dark:bg-brand-950/20 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Socratic Learning Mode
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Our signature mode: asks what you think first, gives 4 progressive hints (including
                the Frustration Protocol generic example), and lets you try fixing the code yourself.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Guided Practice Mode
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Reinforce variables, conditions, loops, functions, and collections with curated
                beginner challenges, starter code, hints, and transparent sample test checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How the Platform Works */}
      <section className="py-16 sm:py-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How CodeMentor AI Works
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            The 6-step learning workflow designed for practical exam readiness and real-world confidence.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Enter or Select Code",
                desc: "Write your own program in the Monaco IDE or load a starter/buggy template in Python, JS, Java, C, or C++.",
              },
              {
                step: "02",
                title: "Understand Every Line",
                desc: "Click 'Explain Code' to get a beginner-friendly walkthrough, concept analogies, and expected output.",
              },
              {
                step: "03",
                title: "Isolate the Bug",
                desc: "Submit your code and optional compiler error log to identify the exact line number and error category.",
              },
              {
                step: "04",
                title: "Receive Progressive Hints",
                desc: "In Learning Mode, get targeted Socratic questions that guide your thinking without spoiling the answer.",
              },
              {
                step: "05",
                title: "Attempt Your Fix",
                desc: "Click 'Let me try' to edit the highlighted line yourself, or compare Before & After diffs when ready.",
              },
              {
                step: "06",
                title: "Practice Similar Problems",
                desc: "Lock in the concept by solving a related exercise in Practice Mode and saving your session.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5"
              >
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                  STEP {item.step}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Supported Programming Languages
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Click any language below to launch the Coding Workspace preloaded with beginner templates.
              </p>
            </div>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Open Full Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {LANGUAGE_LIST.map((lang) => (
              <Link
                key={lang.id}
                href={`/workspace?lang=${lang.id}`}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:border-brand-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${lang.badgeColor}`}
                  >
                    {lang.extension}
                  </span>
                  <Code2 className="h-4 w-4 text-slate-400 group-hover:text-brand-500" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  {lang.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {lang.versionLabel}
                </p>
                <p className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                  Launch {lang.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            ))}
          </div>

          {/* Security & Transparency Callout */}
          <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Honest AI &amp; Isolated Execution Architecture
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  CodeMentor AI never executes untrusted code on the host server and clearly labels
                  Live AI vs. Static Educational Demo Mode and Verified Execution vs. Static Predictions.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90"
            >
              <Terminal className="h-3.5 w-3.5" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
