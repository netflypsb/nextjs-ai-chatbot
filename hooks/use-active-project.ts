"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "solaris-active-project";

export type ProjectInfo = {
  id: string;
  name: string;
};

function loadActiveProject(): ProjectInfo | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (_) {
    // ignore
  }
  return null;
}

function saveActiveProject(project: ProjectInfo | null) {
  try {
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (_) {
    // ignore
  }
}

export function useActiveProject() {
  const [activeProject, setActiveProjectState] =
    useState<ProjectInfo | null>(null);

  useEffect(() => {
    setActiveProjectState(loadActiveProject());
  }, []);

  const setActiveProject = useCallback((project: ProjectInfo | null) => {
    setActiveProjectState(project);
    saveActiveProject(project);
  }, []);

  return { activeProject, setActiveProject };
}
