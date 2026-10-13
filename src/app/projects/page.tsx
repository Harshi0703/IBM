"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Trash2,
  Edit3,
  Copy,
  Download,
  ExternalLink,
  Plus,
  Clock,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { StoredProject } from "@/lib/db";
import { getLanguageConfig } from "@/lib/languages";

export default function ProjectsPage() {
  const { showToast } = useApp();
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [storageMode, setStorageMode] = useState<string>("sqlite");
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const fetchProjects = () => {
    setLoading(true);
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data) => {
        setProjects(data.projects || []);
        if (data.storageMode) setStorageMode(data.storageMode);
      })
      .catch(() => showToast("Failed to load saved projects.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRename = async (id: string) => {
    if (!editingTitle.trim()) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, title: editingTitle.trim() } : p))
        );
        setEditingId(null);
        showToast("Project renamed!", "success");
      }
    } catch {
      showToast("Could not rename project.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showToast("Deleted saved session.", "info");
      }
    } catch {
      showToast("Failed to delete session.", "error");
    }
  };

  const handleExportSession = (proj: StoredProject) => {
    const blob = new Blob([JSON.stringify(proj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${proj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.codementor.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported session JSON!", "success");
  };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Saved Projects &amp; Learning History
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Reopen your saved code sessions, review past explanations and debugging notes, or
            export your work ({storageMode === "sqlite" ? "SQLite Database" : "Local Persistence"}).
          </p>
        </div>

        <Link
          href="/workspace"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-500"
        >
          <Plus className="h-4 w-4" />
          New Coding Session
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500">
          Loading saved projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center space-y-3">
          <FolderKanban className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            No Saved Sessions Yet
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Whenever you write, explain, or debug code in the Workspace, click the &ldquo;Save&rdquo;
            button to keep a snapshot here.
          </p>
          <div className="pt-2">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
            >
              Open Coding Workspace
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const lang = getLanguageConfig(proj.language);
            const hasExplanation = Boolean(proj.lastExplanationJson);
            const hasDebug = Boolean(proj.lastDebugJson);

            return (
              <div
                key={proj.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded border px-2.5 py-0.5 text-xs font-semibold ${lang.badgeColor}`}
                    >
                      {lang.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(proj.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  {editingId === proj.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 rounded-lg border border-brand-500 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(proj.id)}
                        className="rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-500"
                        aria-label="Save new title"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {proj.title}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(proj.id);
                          setEditingTitle(proj.title);
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        aria-label="Rename project"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <pre className="max-h-32 overflow-hidden rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-300 border border-slate-800">
                    <code>{proj.code}</code>
                  </pre>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {hasExplanation && (
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-blue-600 dark:text-blue-400 font-medium">
                        ✓ Saved Explanation
                      </span>
                    )}
                    {hasDebug && (
                      <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-red-600 dark:text-red-400 font-medium">
                        ✓ Saved Debug Analysis
                      </span>
                    )}
                    {proj.hintsUsed > 0 && (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-amber-600 dark:text-amber-400 font-medium">
                        {proj.hintsUsed} Socratic Hint(s) Used
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <Link
                    href={`/workspace?projectId=${proj.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Reopen in Workspace
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(proj.code);
                        showToast("Code copied!", "success");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSession(proj)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(proj.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/20"
                      aria-label={`Delete ${proj.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
