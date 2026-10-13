"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  BookOpen,
  Bug,
  GraduationCap,
  FolderKanban,
  Clock,
  Lightbulb,
  Code2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getLanguageConfig, LANGUAGE_LIST } from "@/lib/languages";
import { StoredProject } from "@/lib/db";

const BEGINNER_TIPS = [
  {
    title: "Read Error Messages Bottom-Up",
    text: "In Python and Java, the very last line of a traceback tells you the exact error type (like TypeError or IndexError), and the line number shows where it happened.",
  },
  {
    title: "Watch Out for Off-By-One Loops",
    text: "Arrays and lists start at index 0. A list with 5 items has valid indices 0, 1, 2, 3, and 4—so use `< length` instead of `<= length`.",
  },
  {
    title: "Assignment (`=`) vs. Comparison (`==`)",
    text: "A single `=` puts a value into a box. A double `==` asks whether two values are equal. Inside an `if (...)` condition, you almost always want `==`.",
  },
];

export default function DashboardPage() {
  const { activity, settings } = useApp();
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data) => {
        setProjects(data.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalActions =
    activity.explanationsCount +
    activity.debugsCount +
    activity.hintsUsedCount +
    activity.exercisesAttemptedCount;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Student Learning Dashboard</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome to CodeMentor AI
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Pick an action below to understand a program, debug an error with Socratic hints, or
            practice core CS concepts.
          </p>
        </div>

        <Link
          href={`/workspace?lang=${settings.defaultLanguage}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500"
        >
          <PlusCircle className="h-4 w-4" />
          Start New Session
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/workspace?mode=explain"
          className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:border-brand-500 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500" />
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            Explain Code
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Paste any Python, JS, Java, C, or C++ snippet for a beginner-friendly line-by-line walkthrough.
          </p>
        </Link>

        <Link
          href="/workspace?mode=debug&template=buggy"
          className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:border-brand-500 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <Bug className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500" />
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            Debug My Code
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Find out why your code fails, get Socratic hints in Learning Mode, and compare before/after fixes.
          </p>
        </Link>

        <Link
          href="/practice"
          className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:border-brand-500 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500" />
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            Practice Mode
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Solve bite-sized exercises on variables, conditions, loops, functions, and arrays.
          </p>
        </Link>
      </div>

      {/* Real Recorded Activity & Language Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Your Recorded Learning Activity
            </h2>
            <span className="text-xs text-slate-500">
              Based strictly on real actions in this browser
            </span>
          </div>

          {totalActions === 0 && projects.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center space-y-2">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                No learning sessions recorded yet!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We only display real activity you complete—no fake scores or invented badges. Open
                the workspace and explain or debug your first snippet to start tracking progress.
              </p>
              <div className="pt-2">
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-500"
                >
                  Run Your First Code Analysis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {activity.explanationsCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Code Explanations
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {activity.debugsCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Debugging Analyses
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {activity.hintsUsedCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Socratic Hints Used
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {activity.exercisesAttemptedCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Practice Attempts
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recently Used Programming Languages */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="h-4 w-4 text-brand-500" />
            Programming Languages
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {activity.recentLanguages.length > 0
              ? "Your recently used languages:"
              : "Choose a language to launch in the workspace:"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(activity.recentLanguages.length > 0
              ? activity.recentLanguages.map((id) => getLanguageConfig(id))
              : LANGUAGE_LIST
            ).map((lang) => (
              <Link
                key={lang.id}
                href={`/workspace?lang=${lang.id}`}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${lang.badgeColor} hover:opacity-80`}
              >
                <span>{lang.name}</span>
                <span className="opacity-70">({lang.extension})</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Saved Projects / Sessions */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-brand-500" />
            Recent Saved Sessions
          </h2>
          <Link
            href="/projects"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View All Saved Sessions →
          </Link>
        </div>

        {loading ? (
          <p className="mt-4 text-xs text-slate-500">Loading saved sessions...</p>
        ) : projects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              You haven&apos;t saved any code sessions yet.
            </p>
            <p className="text-xs text-slate-500">
              In the Coding Workspace, click &ldquo;Save Session&rdquo; to bookmark your code,
              explanations, and debugging notes for exam revision.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((proj) => {
              const lang = getLanguageConfig(proj.language);
              return (
                <Link
                  key={proj.id}
                  href={`/workspace?projectId=${proj.id}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 hover:border-brand-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${lang.badgeColor}`}
                      >
                        {lang.name}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(proj.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {proj.title}
                    </h3>
                    <pre className="mt-2 line-clamp-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {proj.code}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Reopen Session →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Helpful Beginner Tips */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Helpful Beginner Debugging Tips
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {BEGINNER_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4"
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {tip.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
