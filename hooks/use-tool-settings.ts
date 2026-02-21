"use client";

import { useCallback, useEffect, useState } from "react";

export type ToolCategory = {
  id: string;
  name: string;
  description: string;
  tools: string[];
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "documents",
    name: "Document Management",
    description: "Create, read, update, search, and list documents",
    tools: [
      "createDocument",
      "updateDocument",
      "readDocument",
      "listDocuments",
      "searchDocuments",
    ],
  },
  {
    id: "plans",
    name: "Plan Management",
    description: "Create, read, and update plans",
    tools: ["createPlan", "updatePlan", "readPlan"],
  },
  {
    id: "webSearch",
    name: "Web Search",
    description: "Search the internet using Brave Search / DuckDuckGo",
    tools: ["webSearch"],
  },
  {
    id: "browseWeb",
    name: "Web Browse (Browserbase)",
    description: "Browse web pages using Browserbase service",
    tools: ["browseWeb"],
  },
  {
    id: "agentBrowser",
    name: "Agent Browser (AI Browser)",
    description:
      "AI-optimized browser with snapshot/ref system for navigation, interaction, and extraction",
    tools: [
      "agentBrowserNavigate",
      "agentBrowserInteract",
      "agentBrowserExtract",
      "agentBrowserClose",
    ],
  },
  {
    id: "codeExecution",
    name: "Code Execution",
    description: "Execute code in a sandboxed environment",
    tools: ["executeCode"],
  },
  {
    id: "other",
    name: "Other Tools",
    description: "Weather, suggestions, and other utilities",
    tools: ["getWeather", "requestSuggestions"],
  },
];

const STORAGE_KEY = "solaris-tool-settings";

// All tools enabled by default
const DEFAULT_ENABLED: Record<string, boolean> = {};
for (const cat of TOOL_CATEGORIES) {
  DEFAULT_ENABLED[cat.id] = true;
}

function loadSettings(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return DEFAULT_ENABLED;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_ENABLED, ...JSON.parse(stored) };
    }
  } catch (_) {
    // ignore parse errors
  }
  return DEFAULT_ENABLED;
}

function saveSettings(settings: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {
    // ignore storage errors
  }
}

export function useToolSettings() {
  const [categoryEnabled, setCategoryEnabled] =
    useState<Record<string, boolean>>(DEFAULT_ENABLED);

  useEffect(() => {
    setCategoryEnabled(loadSettings());
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setCategoryEnabled((prev) => {
      const next = { ...prev, [categoryId]: !prev[categoryId] };
      saveSettings(next);
      return next;
    });
  }, []);

  const getActiveTools = useCallback((): string[] => {
    const active: string[] = [];
    for (const cat of TOOL_CATEGORIES) {
      if (categoryEnabled[cat.id] !== false) {
        active.push(...cat.tools);
      }
    }
    return active;
  }, [categoryEnabled]);

  return { categoryEnabled, toggleCategory, getActiveTools, TOOL_CATEGORIES };
}
