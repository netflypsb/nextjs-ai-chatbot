"use client";

import { useCallback, useEffect, useState } from "react";

export type ToolCategory = {
  id: string;
  name: string;
  description: string;
  tools: string[];
  core?: boolean;
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
      "requestSuggestions",
    ],
    core: true,
  },
  {
    id: "plans",
    name: "Plan Management",
    description: "Create, read, and update plans for multi-step tasks",
    tools: ["createPlan", "updatePlan", "readPlan"],
    core: true,
  },
  {
    id: "discovery",
    name: "Discovery (Skills & Tools)",
    description: "Search and load skills and discover available tools",
    tools: ["readSkill", "searchSkills", "searchTools"],
    core: true,
  },
  {
    id: "agentBrowser",
    name: "Agent Browser",
    description:
      "AI-optimized browser with snapshot/ref system for web browsing and interaction",
    tools: [
      "agentBrowserNavigate",
      "agentBrowserInteract",
      "agentBrowserExtract",
      "agentBrowserClose",
    ],
  },
  {
    id: "browseWeb",
    name: "Browserbase",
    description:
      "Browse web pages and extract text content using Browserbase cloud browser",
    tools: ["browseWeb"],
  },
  {
    id: "codeExecution",
    name: "Code Execution",
    description:
      "Execute Python code in a sandboxed environment with file generation",
    tools: ["executeCode"],
  },
  {
    id: "other",
    name: "Utility",
    description: "Weather and other utility tools",
    tools: ["getWeather"],
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
      if (cat.core || categoryEnabled[cat.id] !== false) {
        active.push(...cat.tools);
      }
    }
    return active;
  }, [categoryEnabled]);

  return { categoryEnabled, toggleCategory, getActiveTools, TOOL_CATEGORIES };
}
