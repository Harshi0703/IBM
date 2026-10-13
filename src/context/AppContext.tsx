"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SupportedLanguageId } from "@/lib/languages";

export interface UserSettings {
  theme: "dark" | "light";
  defaultLanguage: SupportedLanguageId;
  learningModeDefault: boolean;
  editorFontSize: number;
  editorLayout: "split" | "stacked";
}

export interface ActivityStats {
  explanationsCount: number;
  debugsCount: number;
  hintsUsedCount: number;
  exercisesAttemptedCount: number;
  recentLanguages: SupportedLanguageId[];
}

export interface SystemStatus {
  ai: {
    configured: boolean;
    mode: "live_ai" | "demo";
    model: string;
    label: string;
  };
  execution: {
    configured: boolean;
    provider: string;
  };
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface AppContextValue {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  activity: ActivityStats;
  recordActivity: (
    type: "explain" | "debug" | "hint" | "exercise",
    language?: SupportedLanguageId
  ) => void;
  systemStatus: SystemStatus;
  toasts: ToastMessage[];
  showToast: (text: string, type?: "success" | "error" | "info") => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  defaultLanguage: "python",
  learningModeDefault: true,
  editorFontSize: 14,
  editorLayout: "split",
};

const DEFAULT_ACTIVITY: ActivityStats = {
  explanationsCount: 0,
  debugsCount: 0,
  hintsUsedCount: 0,
  exercisesAttemptedCount: 0,
  recentLanguages: [],
};

const DEFAULT_STATUS: SystemStatus = {
  ai: {
    configured: false,
    mode: "demo",
    model: "Static Educational Engine",
    label: "Educational Demo Mode",
  },
  execution: {
    configured: false,
    provider: "Not Configured",
  },
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [activity, setActivity] = useState<ActivityStats>(DEFAULT_ACTIVITY);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(DEFAULT_STATUS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("codementor_settings");
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
      const savedActivity = localStorage.getItem("codementor_activity");
      if (savedActivity) {
        setActivity({ ...DEFAULT_ACTIVITY, ...JSON.parse(savedActivity) });
      }
    } catch {
      // Ignore storage parse issues
    }
    setHydrated(true);

    fetch("/api/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ai) {
          setSystemStatus(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("codementor_settings", JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  }, [settings, hydrated]);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const recordActivity = (
    type: "explain" | "debug" | "hint" | "exercise",
    language?: SupportedLanguageId
  ) => {
    setActivity((prev) => {
      const recentLanguages = language
        ? [language, ...prev.recentLanguages.filter((l) => l !== language)].slice(0, 5)
        : prev.recentLanguages;
      const next: ActivityStats = {
        explanationsCount:
          type === "explain" ? prev.explanationsCount + 1 : prev.explanationsCount,
        debugsCount: type === "debug" ? prev.debugsCount + 1 : prev.debugsCount,
        hintsUsedCount: type === "hint" ? prev.hintsUsedCount + 1 : prev.hintsUsedCount,
        exercisesAttemptedCount:
          type === "exercise"
            ? prev.exercisesAttemptedCount + 1
            : prev.exercisesAttemptedCount,
        recentLanguages,
      };
      try {
        localStorage.setItem("codementor_activity", JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        activity,
        recordActivity,
        systemStatus,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
      {/* Accessible Toast Notification Region */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
              toast.type === "error"
                ? "bg-red-950/95 border-red-500/40 text-red-200"
                : toast.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/40 text-emerald-200"
                : "bg-slate-900/95 border-slate-700 text-slate-100"
            }`}
          >
            <span>{toast.text}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-xs opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
