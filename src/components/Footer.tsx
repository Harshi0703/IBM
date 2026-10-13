import React from "react";
import Link from "next/link";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 text-base font-bold text-slate-900 dark:text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
                <Code2 className="h-4 w-4" />
              </div>
              <span>CodeMentor AI</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
              &ldquo;Don&apos;t just fix the code. Teach the student how to fix it.&rdquo; Built for
              first-year computer science, BCA students, and self-taught programmers learning
              Python, JavaScript, Java, C, and C++.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/workspace" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Coding Workspace
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Learning Dashboard
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Practice Challenges
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Saved Sessions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Supported Languages
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Python 3</li>
              <li>JavaScript (Node.js)</li>
              <li>Java (OpenJDK)</li>
              <li>C &amp; C++ (GCC)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CodeMentor AI — AI Code Explainer &amp; Socratic Debugger.</p>
          <p>Prioritizing independent debugging skills over blind copy-pasting.</p>
        </div>
      </div>
    </footer>
  );
}
