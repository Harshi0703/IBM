"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  BookOpen,
  Bug,
  Play,
  Lightbulb,
  RotateCcw,
  Trash2,
  Copy,
  Save,
  Sparkles,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  LANGUAGE_LIST,
  SupportedLanguageId,
  getLanguageConfig,
  isSupportedLanguage,
} from "@/lib/languages";
import { ExplainResponse, DebugResponse, HintResponse } from "@/lib/validation";
import { ExecutionResult } from "@/lib/execution/service";
import { ExplainPanel } from "@/components/workspace/ExplainPanel";
import { DebugPanel } from "@/components/workspace/DebugPanel";
import { LearningModePanel } from "@/components/workspace/LearningModePanel";

type ActiveTab = "explain" | "debug" | "learning";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { settings, recordActivity, systemStatus, showToast } = useApp();

  const [language, setLanguage] = useState<SupportedLanguageId>(settings.defaultLanguage);
  const [code, setCode] = useState<string>(getLanguageConfig(settings.defaultLanguage).defaultCode);
  const [learningMode, setLearningMode] = useState<boolean>(settings.learningModeDefault);
  const [sessionTitle, setSessionTitle] = useState<string>("My Coding Session");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Bottom execution & error trace drawer
  const [consoleOpen, setConsoleOpen] = useState<boolean>(true);
  const [customErrorTrace, setCustomErrorTrace] = useState<string>("");
  const [stdinInput, setStdinInput] = useState<string>("");
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [runningCode, setRunningCode] = useState<boolean>(false);

  // Right panel AI Tutor results
  const [activeTab, setActiveTab] = useState<ActiveTab>("learning");
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [debugData, setDebugData] = useState<DebugResponse | null>(null);
  const [hints, setHints] = useState<HintResponse[]>([]);

  const [loadingExplain, setLoadingExplain] = useState<boolean>(false);
  const [loadingDebug, setLoadingDebug] = useState<boolean>(false);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [savingSession, setSavingSession] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Sync URL query params (?lang=..., ?projectId=..., ?mode=..., ?template=...)
  useEffect(() => {
    const langParam = searchParams.get("lang");
    const modeParam = searchParams.get("mode");
    const templateParam = searchParams.get("template");
    const projectIdParam = searchParams.get("projectId");

    if (projectIdParam) {
      fetch(`/api/projects/${projectIdParam}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.project) {
            const p = data.project;
            setCurrentProjectId(p.id);
            setSessionTitle(p.title);
            if (isSupportedLanguage(p.language)) {
              setLanguage(p.language);
            }
            setCode(p.code);
            setLearningMode(Boolean(p.learningMode));
            if (p.lastExplanationJson) {
              try {
                setExplainData(JSON.parse(p.lastExplanationJson));
                setActiveTab("explain");
              } catch {}
            }
            if (p.lastDebugJson) {
              try {
                setDebugData(JSON.parse(p.lastDebugJson));
                setActiveTab("debug");
              } catch {}
            }
          }
        })
        .catch(() => {});
      return;
    }

    const chosenLang =
      langParam && isSupportedLanguage(langParam) ? langParam : settings.defaultLanguage;
    setLanguage(chosenLang);
    const cfg = getLanguageConfig(chosenLang);

    if (templateParam === "buggy") {
      setCode(cfg.buggyCode);
      setSessionTitle(`${cfg.name} Debugging Practice`);
    } else {
      setCode(cfg.defaultCode);
      setSessionTitle(`${cfg.name} Learning Session`);
    }

    if (modeParam === "explain") {
      setActiveTab("explain");
    } else if (modeParam === "debug") {
      setActiveTab("debug");
    }
  }, [searchParams, settings.defaultLanguage]);

  const handleLanguageChange = (newLang: SupportedLanguageId) => {
    setLanguage(newLang);
    const cfg = getLanguageConfig(newLang);
    setCode(cfg.defaultCode);
    setSessionTitle(`${cfg.name} Session`);
    setExplainData(null);
    setDebugData(null);
    setHints([]);
    setExecutionResult(null);
    setApiError(null);
  };

  const handleSelectTemplate = (templateId: string) => {
    const cfg = getLanguageConfig(language);
    const found = cfg.templates.find((t) => t.id === templateId);
    if (found) {
      setCode(found.code);
      setSessionTitle(found.title);
      setExplainData(null);
      setDebugData(null);
      setHints([]);
      showToast(`Loaded template: ${found.title}`, "info");
    }
  };

  // 1. EXPLAIN CODE
  const handleExplainCode = async () => {
    if (!code.trim()) {
      showToast("Please enter some code in the editor first.", "error");
      return;
    }
    setActiveTab("explain");
    setLoadingExplain(true);
    setApiError(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          learningMode,
          executionOutput: executionResult?.stdout || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to explain code.");
      }
      setExplainData(data);
      recordActivity("explain", language);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to explain code.");
    } finally {
      setLoadingExplain(false);
    }
  };

  // 2. DEBUG CODE
  const handleDebugCode = async () => {
    if (!code.trim()) {
      showToast("Please enter some code to debug.", "error");
      return;
    }
    setActiveTab("debug");
    setLoadingDebug(true);
    setApiError(null);

    const combinedErrorTrace =
      customErrorTrace.trim() ||
      executionResult?.stderr ||
      executionResult?.compileOutput ||
      undefined;

    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          errorTrace: combinedErrorTrace,
          executionOutput: executionResult?.stdout || undefined,
          isExecutionConfirmed: Boolean(executionResult?.executed),
          learningMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to debug code.");
      }
      setDebugData(data);
      recordActivity("debug", language);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to debug code.");
    } finally {
      setLoadingDebug(false);
    }
  };

  // 3. REQUEST SOCRATIC HINT
  const handleRequestHint = async (level: number, studentHypothesis?: string) => {
    if (!code.trim()) {
      showToast("Please enter code in the editor before requesting a hint.", "error");
      return;
    }
    setActiveTab("learning");
    setLoadingHint(true);
    setApiError(null);

    const combinedErrorTrace =
      customErrorTrace.trim() ||
      executionResult?.stderr ||
      executionResult?.compileOutput ||
      undefined;

    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          hintLevel: level,
          errorTrace: combinedErrorTrace,
          studentHypothesis,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate hint.");
      }
      setHints((prev) => {
        const filtered = prev.filter((h) => h.hintLevel !== data.hintLevel);
        return [...filtered, data].sort((a, b) => a.hintLevel - b.hintLevel);
      });
      recordActivity("hint", language);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to generate hint.");
    } finally {
      setLoadingHint(false);
    }
  };

  // 4. RUN CODE IN SANDBOX
  const handleRunCode = async () => {
    if (!code.trim()) {
      showToast("Cannot execute empty code.", "error");
      return;
    }
    setConsoleOpen(true);
    setRunningCode(true);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          stdin: stdinInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Execution request failed.");
      }
      setExecutionResult(data);
      if (data.configured && data.executed) {
        showToast("Sandbox execution finished.", data.hasError ? "error" : "success");
      } else {
        showToast("Sandbox not configured — see setup note in console.", "info");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Sandbox execution failed.", "error");
    } finally {
      setRunningCode(false);
    }
  };

  // 5. SAVE SESSION
  const handleSaveSession = async () => {
    if (!code.trim()) {
      showToast("Cannot save an empty code session.", "error");
      return;
    }
    setSavingSession(true);
    try {
      const payload = {
        title: sessionTitle.trim() || `${getLanguageConfig(language).name} Session`,
        language,
        code,
        learningMode,
        lastExplanationJson: explainData ? JSON.stringify(explainData) : null,
        lastDebugJson: debugData ? JSON.stringify(debugData) : null,
        lastExecutionJson: executionResult ? JSON.stringify(executionResult) : null,
        hintsUsed: hints.length,
      };

      const url = currentProjectId ? `/api/projects/${currentProjectId}` : "/api/projects";
      const method = currentProjectId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save session.");
      }
      if (data.project?.id) {
        setCurrentProjectId(data.project.id);
      }
      showToast("Session saved to your history!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save session.", "error");
    } finally {
      setSavingSession(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("Code copied to clipboard!", "success");
    } catch {
      showToast("Could not copy code.", "error");
    }
  };

  const langConfig = getLanguageConfig(language);

  return (
    <div className="flex flex-1 flex-col">
      {/* Workspace Action Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Left: Session Title, Language Selector, Template Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              aria-label="Session Title"
              className="w-44 sm:w-52 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguageId)}
              aria-label="Select Programming Language"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {LANGUAGE_LIST.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.extension})
                </option>
              ))}
            </select>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectTemplate(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              aria-label="Load Sample Code Template"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="" disabled>
                Load Sample Template...
              </option>
              {langConfig.templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.category === "buggy" ? "🐞 " : "✅ "}
                  {tpl.title}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Learning Mode Toggle + Core AI & Execution Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Signature Learning Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !learningMode;
                setLearningMode(next);
                showToast(
                  next
                    ? "Learning Mode ON: Socratic hints & guided problem solving enabled."
                    : "Direct Help Mode ON: Full corrections shown immediately.",
                  "info"
                );
              }}
              aria-pressed={learningMode}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                learningMode
                  ? "border-brand-500 bg-brand-500/15 text-brand-700 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Learning Mode: {learningMode ? "ON" : "OFF"}
            </button>

            <button
              type="button"
              onClick={handleExplainCode}
              disabled={loadingExplain}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {loadingExplain ? "Explaining..." : "Explain Code"}
            </button>

            <button
              type="button"
              onClick={handleDebugCode}
              disabled={loadingDebug}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
            >
              <Bug className="h-3.5 w-3.5" />
              {loadingDebug ? "Analyzing..." : "Debug Code"}
            </button>

            <button
              type="button"
              onClick={() => handleRequestHint(Math.min(4, hints.length + 1))}
              disabled={loadingHint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {loadingHint ? "Thinking..." : "Get Hint"}
            </button>

            <button
              type="button"
              onClick={handleRunCode}
              disabled={runningCode}
              title={
                systemStatus.execution.configured
                  ? "Run code in isolated Judge0 sandbox"
                  : "Sandbox unconfigured (click to view setup details)"
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm ${
                systemStatus.execution.configured
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              {runningCode ? "Running..." : "Run Code"}
            </button>

            <button
              type="button"
              onClick={handleSaveSession}
              disabled={savingSession}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Save className="h-3.5 w-3.5" />
              {savingSession ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Workspace Layout */}
      <div
        className={`mx-auto flex w-full max-w-7xl flex-1 gap-4 p-4 ${
          settings.editorLayout === "stacked" ? "flex-col" : "flex-col lg:flex-row"
        }`}
      >
        {/* LEFT COLUMN: Area 1 (Monaco Code Editor) + Area 3 (Execution Output & Diagnostics) */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          {/* Code Editor Card */}
          <div
            ref={editorContainerRef}
            className="flex flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden min-h-[380px]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${langConfig.badgeColor}`}
                >
                  {langConfig.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  main{langConfig.extension}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCode(langConfig.buggyCode);
                    showToast("Loaded buggy practice snippet!", "info");
                  }}
                  className="rounded px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  Load Buggy Example
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCode(langConfig.defaultCode);
                    showToast("Reset to starter template.", "info");
                  }}
                  title="Reset to default template"
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setCode("")}
                  title="Clear editor"
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy code"
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
            </div>

            <div className="relative flex-1 min-h-[340px]">
              <Editor
                height="360px"
                language={langConfig.monacoLanguage}
                theme={settings.theme === "dark" ? "vs-dark" : "light"}
                value={code}
                onChange={(val) => setCode(val ?? "")}
                options={{
                  fontSize: settings.editorFontSize,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                }}
                loading={
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-label="Code Editor"
                    className="h-full w-full bg-slate-950 p-4 font-mono text-xs text-slate-100 focus:outline-none"
                  />
                }
              />
            </div>
          </div>

          {/* Area 3: Collapsible Execution Output, Stdin & Compiler Error Log Drawer */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <button
              type="button"
              onClick={() => setConsoleOpen(!consoleOpen)}
              className="flex w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-brand-500" />
                Execution Output &amp; Error Diagnostics
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    systemStatus.execution.configured
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {systemStatus.execution.provider}
                </span>
              </span>
              {consoleOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>

            {consoleOpen && (
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="custom-error-input"
                      className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Optional: Paste Compiler / Terminal Error Traceback
                    </label>
                    <textarea
                      id="custom-error-input"
                      rows={2}
                      value={customErrorTrace}
                      onChange={(e) => setCustomErrorTrace(e.target.value)}
                      placeholder="Paste any TypeError, SyntaxError, or compiler error message here for targeted debugging..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="stdin-input"
                      className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Optional: Standard Input (stdin) for Sandbox Execution
                    </label>
                    <textarea
                      id="stdin-input"
                      rows={2}
                      value={stdinInput}
                      onChange={(e) => setStdinInput(e.target.value)}
                      placeholder="Enter custom input lines if your program reads from input()/scanf/cin..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {executionResult && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span
                        className={`font-semibold ${
                          executionResult.hasError
                            ? "text-red-400"
                            : executionResult.executed
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        Status: {executionResult.statusDescription}
                      </span>
                      {executionResult.timeSeconds && (
                        <span className="text-slate-400">
                          Time: {executionResult.timeSeconds}s | Mem:{" "}
                          {executionResult.memoryKb ?? 0} KB
                        </span>
                      )}
                    </div>

                    {executionResult.setupNotice && (
                      <p className="text-amber-300 font-sans leading-relaxed">
                        {executionResult.setupNotice}
                      </p>
                    )}

                    {executionResult.stdout && (
                      <div>
                        <span className="text-slate-400 block">stdout:</span>
                        <pre className="text-emerald-300 whitespace-pre-wrap">
                          {executionResult.stdout}
                        </pre>
                      </div>
                    )}

                    {(executionResult.stderr || executionResult.compileOutput) && (
                      <div>
                        <span className="text-red-400 block">stderr / compiler output:</span>
                        <pre className="text-red-300 whitespace-pre-wrap">
                          {executionResult.stderr || executionResult.compileOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Area 2 (AI Tutor, Explanations, Debugging & Learning Mode) */}
        <div className="flex flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden min-w-0">
          {/* Result Mode Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("learning")}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === "learning"
                  ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400 bg-white dark:bg-slate-900 rounded-t-lg"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Learning Mode &amp; Tutor
              {hints.length > 0 && (
                <span className="ml-1 rounded-full bg-brand-500/20 px-1.5 py-0.2 text-[10px]">
                  {hints.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("explain")}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === "explain"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-t-lg"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Code Explanation
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("debug")}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === "debug"
                  ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400 bg-white dark:bg-slate-900 rounded-t-lg"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Bug className="h-3.5 w-3.5" />
              AI Debugger
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 max-h-[720px]">
            {/* Error Banner with Retry */}
            {apiError && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setApiError(null);
                    if (activeTab === "explain") handleExplainCode();
                    else if (activeTab === "debug") handleDebugCode();
                    else handleRequestHint(Math.max(1, hints.length));
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-500"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            )}

            {/* Tab 1: Learning Mode & Socratic Tutor */}
            {activeTab === "learning" && (
              <LearningModePanel
                language={language}
                code={code}
                errorTrace={
                  customErrorTrace.trim() ||
                  executionResult?.stderr ||
                  executionResult?.compileOutput
                }
                sessionId={currentProjectId || "workspace-guest-session"}
                hints={hints}
                loadingHint={loadingHint}
                onRequestHint={handleRequestHint}
                onFocusEditor={() => {
                  editorContainerRef.current?.scrollIntoView({ behavior: "smooth" });
                  showToast("Editor focused — try editing the suspicious line!", "info");
                }}
                onRevealCorrection={() => {
                  if (debugData) {
                    setActiveTab("debug");
                  } else {
                    handleDebugCode();
                  }
                }}
                onOpenSimilarExercise={() => {
                  router.push(`/practice?lang=${language}`);
                }}
              />
            )}

            {/* Tab 2: Code Explanation */}
            {activeTab === "explain" && (
              <>
                {loadingExplain ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Generating beginner-friendly explanation &amp; line-by-line walkthrough...
                    </p>
                  </div>
                ) : explainData ? (
                  <ExplainPanel data={explainData} />
                ) : (
                  <div className="py-16 text-center space-y-3">
                    <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Ready to Explain Your Code
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click &ldquo;Explain Code&rdquo; to see a plain-English overview, line-by-line
                      breakdown, real-world analogies, and a comprehension check quiz.
                    </p>
                    <button
                      type="button"
                      onClick={handleExplainCode}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Explain Current Code
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Tab 3: AI Debugging */}
            {activeTab === "debug" && (
              <>
                {loadingDebug ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Inspecting code for syntax, type, bounds, and logic errors...
                    </p>
                  </div>
                ) : debugData ? (
                  <DebugPanel
                    data={debugData}
                    originalCode={code}
                    learningMode={learningMode}
                    onApplyCorrection={(corrected) => {
                      setCode(corrected);
                      showToast(
                        "Applied suggested correction to editor. Test or review the changes!",
                        "success"
                      );
                    }}
                    onSwitchToLearningHints={() => {
                      setActiveTab("learning");
                      if (hints.length === 0) {
                        handleRequestHint(1);
                      }
                    }}
                  />
                ) : (
                  <div className="py-16 text-center space-y-3">
                    <Bug className="mx-auto h-10 w-10 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Ready to Debug Your Code
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click &ldquo;Debug Code&rdquo; above (or load a buggy template) to receive a
                      structured diagnosis, line number location, concept explanation, and
                      before/after comparison.
                    </p>
                    <button
                      type="button"
                      onClick={handleDebugCode}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
                    >
                      <Bug className="h-3.5 w-3.5" />
                      Analyze &amp; Debug Code
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Loading Coding Workspace...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
