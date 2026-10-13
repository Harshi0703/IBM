"use client";

import React from "react";
import {
  Settings,
  Sun,
  Moon,
  Sparkles,
  Server,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { LANGUAGE_LIST, SupportedLanguageId } from "@/lib/languages";

export default function SettingsPage() {
  const { settings, updateSettings, systemStatus, showToast } = useApp();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6">
        <div className="flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Workspace &amp; Learning Settings
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Customize your theme, default programming language, Socratic Learning Mode preference,
          and code editor appearance.
        </p>
      </div>

      {/* Preferences Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-6">
        {/* 1. Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Color Theme
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between a clean light interface and a low-glare dark coding theme.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                updateSettings({ theme: "light" });
                showToast("Switched to Light theme", "info");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold ${
                settings.theme === "light"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              type="button"
              onClick={() => {
                updateSettings({ theme: "dark" });
                showToast("Switched to Dark coding theme", "info");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold ${
                settings.theme === "dark"
                  ? "border-brand-500 bg-brand-500/20 text-brand-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </div>

        {/* 2. Default Programming Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <label
              htmlFor="default-lang-select"
              className="text-sm font-bold text-slate-900 dark:text-white block"
            >
              Default Programming Language
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pre-selected language when opening a new Coding Workspace or Practice session.
            </p>
          </div>

          <select
            id="default-lang-select"
            value={settings.defaultLanguage}
            onChange={(e) => {
              updateSettings({ defaultLanguage: e.target.value as SupportedLanguageId });
              showToast("Default language updated!", "success");
            }}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
          >
            {LANGUAGE_LIST.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.versionLabel})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Learning Mode Default */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-500" />
              Socratic Learning Mode by Default
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When enabled, CodeMentor AI guides you with progressive hints before showing full
              code solutions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !settings.learningModeDefault;
              updateSettings({ learningModeDefault: next });
              showToast(
                next ? "Learning Mode enabled by default" : "Direct Help enabled by default",
                "info"
              );
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              settings.learningModeDefault
                ? "bg-brand-600 text-white"
                : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {settings.learningModeDefault ? "Enabled (Recommended)" : "Disabled (Direct Help)"}
          </button>
        </div>

        {/* 4. Editor Font Size */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <label
              htmlFor="font-size-select"
              className="text-sm font-bold text-slate-900 dark:text-white block"
            >
              Monaco Editor Font Size
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust code editor text size for comfortable reading.
            </p>
          </div>

          <select
            id="font-size-select"
            value={settings.editorFontSize}
            onChange={(e) => updateSettings({ editorFontSize: Number(e.target.value) })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
          >
            {[12, 13, 14, 15, 16, 18, 20].map((sz) => (
              <option key={sz} value={sz}>
                {sz}px
              </option>
            ))}
          </select>
        </div>

        {/* 5. Workspace Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Workspace Panel Layout
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose side-by-side split view or vertical stacked panels on desktop.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ editorLayout: "split" })}
              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold ${
                settings.editorLayout === "split"
                  ? "border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              Side-by-Side Split
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ editorLayout: "stacked" })}
              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold ${
                settings.editorLayout === "stacked"
                  ? "border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              Stacked Vertical
            </button>
          </div>
        </div>
      </div>

      {/* Live Service & Environment Status */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="h-5 w-5 text-brand-500" />
          Backend Service &amp; Environment Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">AI Provider</span>
              {systemStatus.ai.configured ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" /> Demo Mode
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400">{systemStatus.ai.label}</p>
            {!systemStatus.ai.configured && (
              <p className="text-[11px] text-slate-500">
                To activate live Gemini AI inference, set <code className="font-mono">GEMINI_API_KEY</code> in{" "}
                <code className="font-mono">.env</code> and restart the server.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                Isolated Code Execution (Judge0)
              </span>
              {systemStatus.execution.configured ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" /> Unconfigured
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {systemStatus.execution.provider}
            </p>
            {!systemStatus.execution.configured && (
              <p className="text-[11px] text-slate-500">
                To enable live sandboxed code execution, set{" "}
                <code className="font-mono">JUDGE0_API_URL</code> and{" "}
                <code className="font-mono">JUDGE0_API_KEY</code> in <code className="font-mono">.env</code>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
